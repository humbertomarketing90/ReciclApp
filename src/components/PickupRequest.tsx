import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  MapPin, 
  Scale, 
  AlertCircle, 
  Truck, 
  Clock, 
  Send, 
  User, 
  CheckCircle,
  FileText,
  ChevronRight,
  ArrowLeft,
  X,
  Package,
  Battery,
  CupSoda,
  GlassWater,
  Compass,
  ShieldCheck
} from 'lucide-react';
import { PickupRequest, UserProfile } from '../types';
import { useToast } from '../context/ToastContext';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== '' && API_KEY !== 'YOUR_API_KEY';

interface PickupRequestProps {
  userProfile: UserProfile;
  pickupRequests: PickupRequest[];
  setPickupRequests: React.Dispatch<React.SetStateAction<PickupRequest[]>>;
  addPoints: (points: number) => void;
}

// Simulated active collector replies dictionary
const COLLECTOR_REPLIES: Record<string, string> = {
  "hola": "¡Hola! Estoy terminando un reporte en tu zona. Llego en aprox. 15 minutos.",
  "listo": "Excelente, agradezco que esté acumulado en la puerta externa para acelerar la carga. ¡Gracias por reciclar!",
  "ayuda": "Por supuesto, no te preocupes. Llevo un carrito manual para bultos pesados. Te asisto al llegar.",
  "direccion": "Tengo la dirección cargada en mi GPS. Voy por la avenida principal.",
  "default": "Recibido. Me encuentro operando la ruta de reciclaje establecida, estaré allí lo antes posible."
};

const renderPresetOrImage = (url: string | null | undefined, className: string = "w-14 h-14 rounded-xl flex items-center justify-center shrink-0") => {
  if (!url) return null;
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes("photo-1618477388954")) { // GlassWater / Bottle
    return (
      <div className={`bg-blue-50 text-blue-500 border border-blue-105 ${className}`}>
        <GlassWater className="w-6 h-6" />
      </div>
    );
  }
  if (lowerUrl.includes("photo-1531058020")) { // CupSoda / Lata
    return (
      <div className={`bg-red-50 text-red-500 border border-red-105 ${className}`}>
        <CupSoda className="w-6 h-6" />
      </div>
    );
  }
  if (lowerUrl.includes("photo-1513151233")) { // Package / Carton
    return (
      <div className={`bg-amber-50 text-amber-600 border border-amber-105 ${className}`}>
        <Package className="w-6 h-6" />
      </div>
    );
  }
  if (lowerUrl.includes("photo-1612817288484")) { // Battery / Batería
    return (
      <div className={`bg-rose-50 text-rose-550 border border-rose-105 ${className}`}>
        <Battery className="w-6 h-6" />
      </div>
    );
  }
  
  return <img src={url} alt="Reciclaje" className={`${className} object-cover`} />;
};

export default function PickupRequestView({
  userProfile,
  pickupRequests,
  setPickupRequests,
  addPoints
}: PickupRequestProps) {
  const { addToast } = useToast();
  
  // Tab within this module: 'new' (Request form) or 'list' (My active schedules & tracker)
  const [activeSubTab, setActiveSubTab] = useState<'new' | 'list'>('new');
  
  // Selected request for tracker detail
  const [trackingRequest, setTrackingRequest] = useState<PickupRequest | null>(null);

  // Form states
  const [category, setCategory] = useState('Plásticos');
  const [weight, setWeight] = useState(5);
  const [date, setDate] = useState('2026-06-08');
  const [time, setTime] = useState('09:00 - 11:00');
  const [address, setAddress] = useState('Av. Sostenibilidad 425, Miraflores');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulated Chat states inside tracker
  const [chatInput, setChatInput] = useState('');
  const [chats, setChats] = useState<{sender: 'user'|'collector', text: string, time: string}[]>([
    { sender: 'collector', text: "¡Buen día! Soy Carlos, tu recolector asignado. Empecé mi ruta.", time: "Hace 5 min" }
  ]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Animated truck track variables
  const [truckProgress, setTruckProgress] = useState(15); // Percentage (0 - 100) along the route

  // Geolocation security standard states
  const [locationConsent, setLocationConsent] = useState(false);
  const [isCapturingCoords, setIsCapturingCoords] = useState(false);
  const [capturedCoords, setCapturedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [explainLocationModal, setExplainLocationModal] = useState(false);

  // Status order map for the 8-state tracing
  const STATUS_ORDER: ('recibido' | 'en_revision' | 'asignado' | 'en_camino' | 'recolectado' | 'llevado_a_centro_de_acopio' | 'cerrado' | 'cancelado')[] = [
    'recibido',
    'en_revision',
    'asignado',
    'en_camino',
    'recolectado',
    'llevado_a_centro_de_acopio',
    'cerrado'
  ];

  // Advance status manually inside tracker for demo and real-time visualization of all 8 states
  const advanceTrackingStatus = (customStatus?: typeof STATUS_ORDER[number]) => {
    if (!trackingRequest) return;
    
    setPickupRequests(list => list.map(req => {
      if (req.id === trackingRequest.id) {
        let currentStatus = req.status;
        
        // Map legacy English statuses on the fly to avoid issues with old localStorage data
        if ((currentStatus as string) === 'completed') {
          currentStatus = 'cerrado';
        } else if ((currentStatus as string) === 'in_transit') {
          currentStatus = 'en_camino';
        } else if ((currentStatus as string) === 'assigned') {
          currentStatus = 'asignado';
        }

        let nextStatus = currentStatus;
        if (customStatus) {
          nextStatus = customStatus;
        } else {
          const currentIndex = STATUS_ORDER.indexOf(currentStatus);
          if (currentIndex !== -1 && currentIndex < STATUS_ORDER.length - 1) {
            nextStatus = STATUS_ORDER[currentIndex + 1];
          } else {
            nextStatus = 'recibido';
          }
        }

        // Status specific feedback toast & side-actions
        if (nextStatus === 'en_revision') {
          addToast("Tu solicitud está siendo evaluada en la mesa logística de Ica. 📋", "info");
        } else if (nextStatus === 'asignado') {
          addToast("¡Asignado! El recolector Carlos Gómez se dispone a iniciar su recorrido. 🧑‍✈️", "info");
        } else if (nextStatus === 'en_camino') {
          setTruckProgress(15);
          addToast("¡En Camino! Carlos Gómez partió hacia tu domicilio con el camión recolector. 🚚", "info");
        } else if (nextStatus === 'recolectado') {
          addToast(`¡Materiales recolectados! Se registraron ${req.weightEstimate}kg de residuos. +${req.pointsAwarded} Eco-Pts acreditados! 🎉`, "success");
        } else if (nextStatus === 'llevado_a_centro_de_acopio') {
          addToast("¡Disposición Segura! Los materiales ingresaron a la Planta de Valorización Ica. 🏭", "info");
        } else if (nextStatus === 'cerrado') {
          addToast("¡Ticket Cerrado! Los residuos completaron exitosamente su ciclo de economía circular. ♻️", "success");
        } else if (nextStatus === 'cancelado') {
          addToast("La solicitud de recolección fue cancelada.", "info");
        }

        const updated = { ...req, status: nextStatus };
        setTimeout(() => setTrackingRequest(updated), 50);
        return updated;
      }
      return req;
    }));
  };

  // Auto-advance truck animation for realistic feeling when viewing tracking detail
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (trackingRequest && trackingRequest.status === 'en_camino') {
      interval = setInterval(() => {
        setTruckProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            advanceTrackingStatus('recolectado');
            return 100;
          }
          return prev + 10;
        });
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [trackingRequest]);

  // Handle auto scrolling for driver chat box
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  const handlePresetPhoto = (url: string) => {
    setPhoto(url);
  };

  // Simulate on-demand GPS coordinates capture securely
  const captureGpsPosition = () => {
    if (!locationConsent) {
      setExplainLocationModal(true);
      return;
    }
    setIsCapturingCoords(true);
    addToast("Buscando señal GPS de tu dispositivo... 🛰️", "info");
    setTimeout(() => {
      const mockGps = {
        lat: Number((-14.0620 + (Math.random() - 0.5) * 0.02).toFixed(6)),
        lng: Number((-75.7290 + (Math.random() - 0.5) * 0.02).toFixed(6))
      };
      setCapturedCoords(mockGps);
      setIsCapturingCoords(false);
      addToast(`Coordenadas capturadas con éxito: [${mockGps.lat}, ${mockGps.lng}] 📍`, "success");
    }, 1500);
  };

  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const generatedPoints = Math.round(weight * 12 + 10);
      const newReq: PickupRequest = {
        id: `REC-${Math.floor(1000 + Math.random() * 9000)}`,
        userId: userProfile.id,
        userName: userProfile.name,
        userAddress: address,
        userCoordinates: capturedCoords || { lat: -14.0620, lng: -75.7290 },
        category,
        weightEstimate: Number(weight),
        scheduledDate: date,
        scheduledTime: time,
        notes: notes + (locationConsent ? " [Ubicación compartida con consentimiento]" : " [Ubicación manual sin GPS]"),
        photoUrl: photo || "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&q=85&w=150",
        isPremium: userProfile.isPremium,
        status: 'recibido', // Starts precisely as Received to allow full tracing
        pointsAwarded: generatedPoints,
        createdAt: new Date().toISOString()
      };

      setPickupRequests(prev => [newReq, ...prev]);
      setIsSubmitting(false);
      
      // Auto open tracker for this fresh order!
      setTruckProgress(0);
      setChats([
        { sender: 'collector', text: "¡Hola! He recibido tu solicitud de recojo. La logística de ReciclApp está asignando mi ruta.", time: "Hace 1 min" }
      ]);
      setTrackingRequest(newReq);
      setActiveSubTab('list');
      
      // Award the points instantly to the user and animate the dashboard level progress
      addPoints(generatedPoints);
      addToast(`¡Recojo Solicitado Exitosamente! Estado inicial: Recibido. Has ganado +${generatedPoints} Eco-puntos. 🚚`, 'success');
      
      // Clean up form
      setNotes('');
      setPhoto(null);
      setCapturedCoords(null);
    }, 1200);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChats(prev => [...prev, { sender: 'user', text: userMsg, time: nowStr }]);
    setChatInput('');

    // Program trigger automatic replies
    setTimeout(() => {
      let replyText = COLLECTOR_REPLIES.default;
      const cleanMsg = userMsg.toLowerCase();
      if (cleanMsg.includes("hola") || cleanMsg.includes("buen")) {
        replyText = COLLECTOR_REPLIES.hola;
      } else if (cleanMsg.includes("listo") || cleanMsg.includes("ya esta") || cleanMsg.includes("puerta")) {
        replyText = COLLECTOR_REPLIES.listo;
      } else if (cleanMsg.includes("ayuda") || cleanMsg.includes("peso") || cleanMsg.includes("bulto")) {
        replyText = COLLECTOR_REPLIES.ayuda;
      } else if (cleanMsg.includes("donde") || cleanMsg.includes("camino") || cleanMsg.includes("comor")) {
        replyText = COLLECTOR_REPLIES.direccion;
      }

      setChats(prev => [...prev, { sender: 'collector', text: replyText, time: nowStr }]);
    }, 1500);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title & Tabs control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-800">Solicitud de Recolección Ecológica</h2>
          <p className="text-xs text-slate-500 mt-0.5">Programa la recogida de tus reciclables directo en la comodidad de tu hogar.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => { setActiveSubTab('new'); setTrackingRequest(null); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'new' && !trackingRequest
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Nuevo Recojo
          </button>
          <button
            onClick={() => setActiveSubTab('list')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'list' || trackingRequest
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Mis Recojos</span>
            {pickupRequests.filter(r => r.status !== 'cerrado' && r.status !== 'cancelado').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            )}
          </button>
        </div>
      </div>

      {trackingRequest ? (
        /* Real-Time Tracker Work-stage Overlay */
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xs p-6 space-y-6 animate-fade-in">
          
          {/* Header toolbar */}
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
            <button
              onClick={() => setTrackingRequest(null)}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la lista</span>
            </button>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">ID Ticket</span>
              <span className="text-xs font-mono font-bold text-slate-800">{trackingRequest.id}</span>
            </div>
          </div>

          {/* Tracker body grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Cols: Animated Route and Process Pipeline */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Animated Map Route Widget */}
              <div className="relative border border-slate-250 bg-slate-100 rounded-2xl h-80 overflow-hidden flex flex-col justify-between">
                
                {hasValidKey ? (
                  // Real live Google Map with dynamically changing truck location and user target
                  <div className="absolute inset-0 z-0">
                    <APIProvider apiKey={API_KEY}>
                      <Map
                        defaultCenter={{ lat: -12.1132, lng: -77.0302 }}
                        defaultZoom={15}
                        mapId="DEMO_MAP_ID"
                        disableDefaultUI={true}
                        style={{ width: '100%', height: '100%' }}
                      >
                        {/* Start base marker / origin */}
                        <AdvancedMarker position={{ lat: -12.112, lng: -77.029 }}>
                          <Pin background="#10b981" glyphColor="#fff" borderColor="#047857" />
                        </AdvancedMarker>

                        {/* Customer destination marker */}
                        <AdvancedMarker position={trackingRequest.userCoordinates || { lat: -12.1145, lng: -77.0315 }}>
                          <Pin background="#ef4444" glyphColor="#fff" borderColor="#7f1d1d" />
                        </AdvancedMarker>

                        {/* Animated Truck/Collector driver marker navigating in real-time coordinates */}
                        <AdvancedMarker
                          position={{
                            lat: -12.112 + ((trackingRequest.userCoordinates?.lat ?? -12.1145) - (-12.112)) * (truckProgress / 100),
                            lng: -77.029 + ((trackingRequest.userCoordinates?.lng ?? -77.0315) - (-77.029)) * (truckProgress / 100)
                          }}
                        >
                          <div className="p-2.5 bg-brand-green border-2 border-white shadow-xl rounded-full text-white animate-bounce">
                            <Truck className="w-5 h-5" />
                          </div>
                        </AdvancedMarker>
                      </Map>
                    </APIProvider>
                  </div>
                ) : (
                  // SVG Mock styled map road layers background
                  <>
                    <div className="absolute inset-0 pointer-events-none opacity-45">
                      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="1.5"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                        
                        {/* Simulated winding road */}
                        <path 
                          id="track-road"
                          d="M 50,180 C 150,180 180,80 280,80 C 380,80 430,200 580,200 L 650,200" 
                          fill="none" 
                          stroke="#cbd5e1" 
                          strokeWidth="12" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                        />
                        <path 
                          d="M 50,180 C 150,180 180,80 280,80 C 380,80 430,200 580,200 L 650,200" 
                          fill="none" 
                          stroke="#22c55e" 
                          strokeWidth="4" 
                          strokeDasharray="6" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                        />
                      </svg>
                    </div>

                    {/* Animated truck symbol along path coordinates */}
                    <div 
                      className="absolute z-20 transition-all duration-1000 ease-in-out"
                      style={{
                        // Math positioning vectors approximating our SVG road
                        left: `${Math.min(90, 8 + (truckProgress * 0.8))}%`,
                        bottom: `${Math.max(15, Math.min(85, 30 + Math.sin(truckProgress * 0.06) * 40))}%`,
                        transform: 'translate(-50%, 50%)'
                      }}
                    >
                      <div className="p-3 bg-brand-green text-white rounded-full shadow-lg shadow-emerald-950/40 relative">
                        <Truck className="w-6 h-6 animate-bounce" />
                        <span className="absolute -top-1 -right-1 bg-yellow-400 text-slate-900 font-bold text-[8px] font-mono px-2 rounded">Vea</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Pins and Labels */}
                <div className="relative flex justify-between items-center w-full z-10 p-4">
                  <div className="bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600 shadow-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Base Recolector
                  </div>
                  <div className="bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600 shadow-xs flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500 fill-red-100" />
                    Destino: {trackingRequest.userAddress.split(',')[0]}
                  </div>
                </div>

                {/* Progress metadata bar */}
                <div className="relative bg-white/95 backdrop-blur-xs p-3.5 rounded-b-2xl border-t border-slate-200 shadow-xs z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Canal GPS / Google Maps</span>
                    <span className="text-xs font-extrabold text-brand-green capitalize">
                      {hasValidKey ? "● Conectado a Satélite" : "Modo Simulado Activo"}
                    </span>
                  </div>
                  
                  {/* Interactive Status Simulation controller for demo */}
                  <div className="flex gap-2 w-full sm:w-auto">
                    {trackingRequest.status !== 'cerrado' && trackingRequest.status !== 'cancelado' && (
                      <button 
                        type="button"
                        onClick={() => advanceTrackingStatus()}
                        className="w-full sm:w-auto text-[10px] bg-brand-green text-white px-3 py-1.5 rounded-lg font-bold hover:bg-brand-green-dark transition-all uppercase tracking-wider shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Siguiente Paso</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button 
                      type="button"
                      onClick={() => advanceTrackingStatus('cancelado')}
                      disabled={['recolectado', 'llevado_a_centro_de_acopio', 'cerrado', 'cancelado'].includes(trackingRequest.status)}
                      className="text-[10px] bg-rose-550 hover:bg-rose-600 text-white disabled:opacity-30 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
                    >
                      Anular
                    </button>
                  </div>
                </div>

              </div>

              {/* Enhanced 8-Step Timeline with detailed descriptions of the recycling path */}
              <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs space-y-4">
                <h4 className="font-display font-bold text-xs text-slate-700 uppercase tracking-wider">Trazabilidad del Servicio (8 Estados Operativos)</h4>
                
                <div className="relative pl-6 border-l border-slate-100 space-y-5">
                  {[
                    { key: 'recibido', label: '1. Recibido', text: 'Tu solicitud de recojo de material reciclable ha sido registrada en ReciclApp.' },
                    { key: 'en_revision', label: '2. En Revisión', text: 'Los sistemas de ReciclApp analizan y aprueban la logística de tu ruta.' },
                    { key: 'asignado', label: '3. Asignado', text: 'Se deriva la orden al recolector certificado Carlos Gómez.' },
                    { key: 'en_camino', label: '4. En Camino', text: 'Eco-recolector estrella en ruta hacia tu domicilio de recolección en vehículo autorizado.' },
                    { key: 'recolectado', label: '5. Recolectado', text: 'Residuos recolectados y pesados bajo validación física.' },
                    { key: 'llevado_a_centro_de_acopio', label: '6. Llegado a Planta', text: 'Material dispuesto de manera segura para selección en Planta de Valorización.' },
                    { key: 'cerrado', label: '7. Completado', text: 'Proceso de reciclaje integrado en economía circular. Eco-Pts acreditados!' }
                  ].map((step, idx) => {
                    const isPassed = STATUS_ORDER.indexOf(trackingRequest.status) >= STATUS_ORDER.indexOf(step.key as any);
                    const isCurrent = trackingRequest.status === step.key;
                    
                    return (
                      <div key={idx} className="relative text-xs">
                        {/* Bullet bubble */}
                        <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                          isCurrent 
                            ? 'bg-brand-green border-brand-green scale-110 shadow-xs ring-4 ring-brand-green/20' 
                            : isPassed 
                              ? 'bg-brand-green/20 border-brand-green' 
                              : 'bg-white border-slate-200'
                        }`}>
                          {isPassed && !isCurrent && (
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-green"></span>
                          )}
                        </div>

                        <div className="space-y-0.5">
                          <span className={`font-bold transition-colors ${isCurrent ? 'text-brand-green text-sm' : isPassed ? 'text-slate-800' : 'text-slate-400'}`}>
                            {step.label}
                            {isCurrent && <span className="ml-2 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase tracking-wider animate-pulse">activo</span>}
                          </span>
                          <p className={`text-[11px] leading-relaxed transition-colors ${isCurrent ? 'text-slate-700 font-medium' : isPassed ? 'text-slate-600' : 'text-slate-400'}`}>
                            {step.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {trackingRequest.status === 'cancelado' && (
                    <div className="relative text-xs text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100">
                      <span className="font-bold">Anulación Aplicada</span>
                      <p className="text-[11px] mt-0.5">Esta solicitud ha sido cancelada por el usuario o administrador.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order specifications card */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 font-bold block">Categoría</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{trackingRequest.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Estimado</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{trackingRequest.weightEstimate} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Programación</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{trackingRequest.scheduledTime}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Recompensa Estimada</span>
                  <span className="font-bold text-brand-green text-sm mt-0.5 block font-mono">+{trackingRequest.pointsAwarded} Eco-Pts</span>
                </div>
              </div>

            </div>

            {/* Right 1 Col: Direct intelligent Collector Chat Module */}
            <div className="flex flex-col bg-slate-50 border border-slate-200 rounded-2xl h-96 sm:h-[450px]">
              
              {/* Chat Header details */}
              <div className="p-4 bg-white border-b border-slate-200 rounded-t-2xl flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-brand-green font-bold text-sm">
                    CG
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute right-0 bottom-0"></span>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">{trackingRequest.collectorName || 'Carlos Gómez'}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Recolector Oficial ReciclApp</p>
                </div>
              </div>

              {/* Message scroll viewport */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {chats.map((chat, idx) => (
                  <div 
                    key={idx} 
                    className={`flex flex-col max-w-[80%] ${chat.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <div className={`px-3 py-2 text-xs rounded-2xl ${
                      chat.sender === 'user'
                        ? 'bg-brand-green text-white rounded-tr-none'
                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                    }`}>
                      {chat.text}
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono mt-1 px-1">{chat.time}</span>
                  </div>
                ))}
                <div ref={chatBottomRef}></div>
              </div>

              {/* Quick suggestions block */}
              <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto">
                <button 
                  onClick={() => setChatInput("¡Hola! Ya tengo todo listo para retirar.")}
                  className="text-[10px] bg-slate-50 border border-slate-200 hover:border-brand-green px-2.5 py-1 rounded-full text-slate-600 transition-all font-semibold shrink-0 cursor-pointer"
                >
                  Ya está listo 👍
                </button>
                <button 
                  onClick={() => setChatInput("Hola, ¿necesitas ayuda para cargarlo?")}
                  className="text-[10px] bg-slate-50 border border-slate-200 hover:border-brand-green px-2.5 py-1 rounded-full text-slate-600 transition-all font-semibold shrink-0 cursor-pointer"
                >
                  ¿Necesitas ayuda? 🤝
                </button>
              </div>

              {/* Chat Input form */}
              <div className="p-3 bg-white border-t border-slate-200 rounded-b-2xl flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Escribe un mensaje al chofer..."
                  className="flex-1 text-xs border border-slate-200 rounded-lg px-3 focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                />
                <button
                  onClick={handleSendChat}
                  disabled={!chatInput.trim()}
                  className="p-2.5 bg-brand-green text-white rounded-lg hover:bg-brand-green-dark transition-colors disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

        </div>
      ) : activeSubTab === 'list' ? (
        
        /* List active or past pickup schedules */
        <div className="space-y-4 animate-fade-in">
          {pickupRequests.length === 0 ? (
            <div className="text-center p-12 bg-white border border-slate-100 rounded-2xl">
              <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-display font-bold text-slate-700">No tienes agendamientos</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Comienza agendando un recojo con el formulario de solicitud de recogida para iniciar el proceso.</p>
              <button
                onClick={() => setActiveSubTab('new')}
                className="mt-4 px-4 py-2 bg-brand-green text-white font-bold text-xs rounded-lg uppercase"
              >
                Crear Primera Solicitud
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pickupRequests.map((req) => (
                <div 
                  key={req.id} 
                  className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-xs font-bold text-slate-400">{req.id}</span>
                      {(() => {
                        const statusStyle = (() => {
                          switch(req.status) {
                            case 'recibido': return 'bg-slate-100 text-slate-700 border border-slate-200';
                            case 'en_revision': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
                            case 'asignado': return 'bg-blue-50 text-blue-700 border border-blue-150';
                            case 'en_camino': return 'bg-orange-50 text-orange-700 border border-orange-200 animate-pulse';
                            case 'recolectado': return 'bg-teal-50 text-teal-700 border border-teal-200';
                            case 'llevado_a_centro_de_acopio': return 'bg-purple-50 text-purple-700 border border-purple-200';
                            case 'cerrado': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
                            case 'cancelado': return 'bg-rose-50 text-rose-700 border border-rose-200';
                            default: return 'bg-slate-105 text-slate-700';
                          }
                        })();
                        const statusLabel = (() => {
                          switch(req.status) {
                            case 'recibido': return 'Recibido';
                            case 'en_revision': return 'En Revisión';
                            case 'asignado': return 'Asignado';
                            case 'en_camino': return 'En Ruta 🚚';
                            case 'recolectado': return 'Recolectado';
                            case 'llevado_a_centro_de_acopio': return 'Acopio Ica 🏭';
                            case 'cerrado': return 'Completado ✔';
                            case 'cancelado': return 'Anulado';
                            default: return req.status;
                          }
                        })();
                        return (
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyle}`}>
                            {statusLabel}
                          </span>
                        );
                      })()}
                    </div>

                    <div className="flex gap-3">
                      {renderPresetOrImage(req.photoUrl, "w-16 h-16 rounded-xl border border-slate-100 flex items-center justify-center shrink-0")}
                      <div>
                        <h4 className="font-display font-bold text-slate-800 text-sm">Recojo de {req.category}</h4>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {req.userAddress.split(',')[0]}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 font-mono">
                          <Calendar className="w-3.5 h-3.5" /> {req.scheduledDate} {req.scheduledTime}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-4 flex items-center justify-between">
                    <span className="text-[11.5px] font-mono text-brand-green font-bold">
                      +{req.pointsAwarded} Eco-Puntos
                    </span>
                    {req.status !== 'cerrado' && req.status !== 'cancelado' ? (
                      <button
                        onClick={() => {
                          setTrackingRequest(req);
                          setTruckProgress(req.status === 'en_camino' ? 65 : 15);
                        }}
                        className="px-3.5 py-1.5 bg-brand-green text-white font-bold text-xs rounded-lg hover:bg-brand-green-dark tracking-wide uppercase transition-transform hover:scale-103 cursor-pointer"
                      >
                        Ver Seguimiento
                      </button>
                    ) : req.status === 'cancelado' ? (
                      <span className="text-xs text-rose-600 font-semibold flex items-center gap-1.5">
                        <X className="w-4 h-4" /> Solicitud Anulada
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4" /> Eco-Impacto Sumado
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      ) : (

        /* New Pickup Form Panel */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          
          {/* Main Form Fields */}
          <form onSubmit={handleAddRequest} className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
            
            <h3 className="font-display font-bold text-slate-800 text-lg border-b border-slate-100 pb-3 flex items-center gap-2">
              <Clock className="w-6 h-6 text-brand-green" /> Detalles de la Orden de Recogida
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Category selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block uppercase tracking-wide">Categoría del Residuo</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                >
                  <option value="Plásticos">Plásticos / Envases PET</option>
                  <option value="Papel/Cartón">Papel y Cartón Limpio</option>
                  <option value="Vidrio">Vidrio (Botellas/Frascos)</option>
                  <option value="Metal">Metales (Aluminio/Acero)</option>
                  <option value="Orgánico">Orgánicos para Compost</option>
                  <option value="E-Waste">Electrónicos y Pilas especiales</option>
                </select>
              </div>

              {/* Weight selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block uppercase tracking-wide">Peso Estimado (kg)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="flex-1 accent-brand-green cursor-pointer"
                  />
                  <span className="font-mono font-bold text-slate-800 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs shrink-0 select-none">
                    {weight} kg
                  </span>
                </div>
              </div>

              {/* Date selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block uppercase tracking-wide">Fecha de Recojo</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                />
              </div>

              {/* Time selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block uppercase tracking-wide">Rango Horario</label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                >
                  <option value="09:00 - 11:00">Mañana (09:00 - 11:00)</option>
                  <option value="11:00 - 13:00">Mediodía (11:00 - 13:00)</option>
                  <option value="14:00 - 17:00">Tarde (14:00 - 17:00)</option>
                </select>
              </div>

              {/* Address input */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-bold text-slate-600 block uppercase tracking-wide font-sans font-sans">Dirección de Pick-up</label>
                <div className="relative">
                  <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Calle, Número, Distrito"
                    className="w-full text-xs pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                    required
                  />
                </div>

                {/* Secure Geolocation Switch and Capturer Panel (Ley N° 29733 - Perú) */}
                <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        id="location-consent-cb"
                        checked={locationConsent}
                        onChange={(e) => {
                          setLocationConsent(e.target.checked);
                          if(!e.target.checked) setCapturedCoords(null);
                        }}
                        className="w-4 h-4 rounded text-brand-green focus:ring-brand-green accent-brand-green cursor-pointer"
                      />
                      <label htmlFor="location-consent-cb" className="text-[11px] font-bold text-slate-700 cursor-pointer select-none">
                        Autorizo compartir geolocalización (L.P.D.P. Perú)
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExplainLocationModal(true)}
                      className="text-[10px] text-brand-green font-bold hover:underline"
                    >
                      Ver Política
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    ReciclApp requiere acceso temporal vía GPS para orientar la ruta del camión recolector oficial de Ica de manera segura y precisa.
                  </p>

                  {locationConsent && (
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={captureGpsPosition}
                        disabled={isCapturingCoords}
                        className="text-[11px] bg-white border border-slate-200 hover:border-brand-green px-3 py-1.5 rounded-lg text-slate-700 font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        {isCapturingCoords ? (
                          <>
                            <div className="w-3 h-3 border border-slate-300 border-t-brand-green rounded-full animate-spin"></div>
                            <span>Buscando señal satelital...</span>
                          </>
                        ) : (
                          <>
                            <Compass className="w-3.5 h-3.5 text-brand-green animate-pulse" />
                            <span>Capturar coordenadas vía GPS</span>
                          </>
                        )}
                      </button>
                      
                      {capturedCoords && (
                        <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded font-bold">
                          📍 GPS Fijado: {capturedCoords.lat}, {capturedCoords.lng}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Special notes */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-xs font-bold text-slate-600 block uppercase tracking-wide">Instrucciones Especiales</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detalles útiles (ej: 'El portón es negro', 'Conserje tiene el material', 'Tocar timbre 301')"
                  rows={2}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                />
              </div>

            </div>

            {/* Photo upload Simulator */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-600 block uppercase tracking-wide">Foto referencial (Simulada)</label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => handlePresetPhoto('https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&q=85&w=150')}
                    className={`p-2.5 border rounded-xl hover:border-brand-green transition-all flex flex-col items-center justify-center gap-1 min-w-[72px] ${
                      photo?.includes('photo-1618477388954')
                        ? 'border-brand-green bg-emerald-50/50 ring-1 ring-brand-green/20'
                        : 'border-slate-200 bg-white'
                    }`}
                    title="Plásticos"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500 border border-blue-100">
                      <GlassWater className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 mt-1">Plásticos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetPhoto('https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=85&w=150')}
                    className={`p-2.5 border rounded-xl hover:border-brand-green transition-all flex flex-col items-center justify-center gap-1 min-w-[72px] ${
                      photo?.includes('photo-1513151233')
                        ? 'border-brand-green bg-emerald-50/50 ring-1 ring-brand-green/20'
                        : 'border-slate-200 bg-white'
                    }`}
                    title="Cartón"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600 border border-amber-100">
                      <Package className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 mt-1">Cartón</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetPhoto('https://images.unsplash.com/photo-1531058020387-3be344559be6?auto=format&fit=crop&q=85&w=150')}
                    className={`p-2.5 border rounded-xl hover:border-brand-green transition-all flex flex-col items-center justify-center gap-1 min-w-[72px] ${
                      photo?.includes('photo-1531058020')
                        ? 'border-brand-green bg-emerald-50/50 ring-1 ring-brand-green/20'
                        : 'border-slate-200 bg-white'
                    }`}
                    title="Metal"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-50 text-red-500 border border-red-100">
                      <CupSoda className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 mt-1">Metal</span>
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  {photo ? (
                    <div className="p-1 px-3 bg-brand-green/10 text-brand-green border border-brand-green/20 rounded-lg text-xs font-semibold flex items-center gap-1">
                      <span>✓ Seleccionada</span>
                      <button 
                        type="button" 
                        onClick={() => setPhoto(null)} 
                        className="text-slate-400 hover:text-red-500 font-bold ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">Haz clic en un preset para simular fotografía rápida.</span>
                  )}
                </div>
              </div>

            </div>

            {/* Form Submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-brand-green hover:bg-brand-green-dark text-white font-bold text-sm tracking-wide rounded-xl shadow-lg transition-transform hover:scale-102 flex items-center justify-center gap-2 select-none cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Reservando Ruta...</span>
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  <span>Programar Visita de Reciclaje</span>
                </>
              )}
            </button>

          </form>

          {/* Right 1 Col: Explanator sidebar instruction tips */}
          <div className="space-y-6">
            
            {/* Gamification point scale card list */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
              <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-1.5 uppercase tracking-wide">
                <Scale className="w-5 h-5 text-brand-green" /> Tabla de Recompensas
              </h4>
              <p className="text-slate-500 text-xs leading-relaxed">Ganarás Eco-Puntos automáticos dependiendo de la categoría y pesos entregados:</p>
              
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="font-semibold text-slate-700">Metal (Aluminio/Acero)</span>
                  <span className="font-mono font-bold text-brand-green">14 Pts / kg</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="font-semibold text-slate-700">Vidrio</span>
                  <span className="font-mono font-bold text-brand-green">12 Pts / kg</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="font-semibold text-slate-700">Plásticos</span>
                  <span className="font-mono font-bold text-brand-green">10 Pts / kg</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="font-semibold text-slate-700">Papel y Cartón</span>
                  <span className="font-mono font-bold text-brand-green">8 Pts / kg</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg">
                  <span className="font-semibold text-slate-700">Orgánicos</span>
                  <span className="font-mono font-bold text-brand-green">5 Pts / kg</span>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-xl flex gap-2.5 items-start">
                <AlertCircle className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-800 leading-snug">
                  <span className="font-bold block">Sorteos de Limpieza Especial:</span>
                  El desecho electrónico (E-waste) se liquida a una tasa fija especial de <strong>+50 Puntos</strong> por recogida, debido a su tratamiento logístico de residuos peligrosos.
                </p>
              </div>
            </div>

          </div>

        </div>

      )}

      {/* Geolocation Legal / Camera Policy Modal */}
      {explainLocationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4 animate-fade-in text-left">
            <h4 className="font-display font-extrabold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-wide">
              <ShieldCheck className="w-5 h-5 text-brand-green" /> Ley de Protección de Datos Personales (Perú)
            </h4>
            
            <div className="space-y-2.5 text-xs text-slate-600 max-h-60 overflow-y-auto pr-1">
              <p>
                De conformidad con la <strong>Ley de Protección de Datos Personales N° 29733 de la República del Perú</strong>, le informamos sobre el tratamiento de su información sensible:
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <p className="font-bold text-slate-700">📍 Geolocalización Satelital:</p>
                <p className="text-[11px] leading-relaxed">
                  Las coordenadas GPS capturadas se tratan de manera exclusivamente transitoria para trazar georutas optimizadas hacia tu domicilio, facilitando el trabajo del recolector. Se eliminan automáticamente una vez que el ticket es procesado y cerrado.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <p className="font-bold text-slate-700">📸 Registro Fotográfico y Cámara:</p>
                <p className="text-[11px] leading-relaxed">
                  Las imágenes de referencia o preseteadas se asocian de manera anónima con el fin de certificar la pureza de los materiales plásticos, metales, papeles o vidrios, y evitar falsos reportes. No se accede a bibliotecas externas sin permiso expreso.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-150 flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <input 
                  type="checkbox"
                  id="modal-consent-checkbox"
                  checked={locationConsent}
                  onChange={(e) => {
                    setLocationConsent(e.target.checked);
                    if(!e.target.checked) setCapturedCoords(null);
                  }}
                  className="w-4 h-4 text-brand-green accent-brand-green cursor-pointer"
                />
                <label htmlFor="modal-consent-checkbox" className="text-[11px] font-bold text-slate-700 cursor-pointer select-none">
                  Acepto los términos
                </label>
              </div>
              <button 
                type="button"
                onClick={() => setExplainLocationModal(false)}
                className="px-4 py-2 bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs rounded-xl transition-all"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
