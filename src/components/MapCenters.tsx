import React, { useState } from 'react';
import { 
  MapPin, 
  Search, 
  SlidersHorizontal, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  Phone, 
  Plus, 
  CheckCircle,
  FileText
} from 'lucide-react';
import { RecyclingCenter, TrashReport, UserProfile } from '../types';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== '' && API_KEY !== 'YOUR_API_KEY';

interface MapCentersProps {
  userProfile: UserProfile;
  trashReports: TrashReport[];
  setTrashReports: React.Dispatch<React.SetStateAction<TrashReport[]>>;
  recyclingCenters: RecyclingCenter[];
  addPoints: (points: number) => void;
}

export default function MapCenters({
  userProfile,
  trashReports,
  setTrashReports,
  recyclingCenters,
  addPoints
}: MapCentersProps) {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedCenter, setSelectedCenter] = useState<RecyclingCenter | null>(recyclingCenters[0]);
  
  // Custom interactive map visual coordinate select
  const [selectedMapCoords, setSelectedMapCoords] = useState<{lat: number, lng: number} | null>(null);

  // Form state for reporting critical garbage pile
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isReporting, setIsReporting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Map click triggers coordinates pinpoint
  const handleMapGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert pixel coordinates roughly to mock city GPS range
    const mockLat = -12.110 - (y / 5000);
    const mockLng = -77.030 + (x / 5000);
    
    setSelectedMapCoords({
      lat: Number(mockLat.toFixed(4)),
      lng: Number(mockLng.toFixed(4))
    });
  };

  const fileReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    setIsReporting(true);
    
    setTimeout(() => {
      const coords = selectedMapCoords || { lat: -12.1124, lng: -77.0284 };
      const newReport: TrashReport = {
        id: `REP-${Math.floor(100 + Math.random() * 900)}`,
        userId: userProfile.id,
        userName: userProfile.name,
        title,
        description,
        latitude: coords.lat,
        longitude: coords.lng,
        severity,
        status: 'open',
        photoUrl: photoUrl || "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=85&w=150",
        createdAt: new Date().toISOString()
      };

      setTrashReports(prev => [newReport, ...prev]);
      setIsReporting(false);
      setShowSuccessToast(true);
      
      // Clear form
      setTitle('');
      setDescription('');
      setSeverity('medium');
      setSelectedMapCoords(null);
      setPhotoUrl(null);

      // Award dynamic points for active reporting!
      addPoints(15);

      setTimeout(() => setShowSuccessToast(false), 3500);
    }, 1000);
  };

  // Filter recycling centers based on selections
  const filteredCenters = recyclingCenters.filter(center => {
    const matchesSearch = center.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          center.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategoryFilter === 'all' || 
                            center.categories.some(c => c.toLowerCase().includes(selectedCategoryFilter.toLowerCase()));
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title block */}
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-800">Mapa Inteligente y Localización</h2>
        <p className="text-xs text-slate-500 mt-0.5">Ubica centros de depósito oficiales con multiplicadores de puntos, o reporta basurales en vía pública.</p>
      </div>

      {showSuccessToast && (
        <div className="bg-emerald-500 text-white p-4 rounded-xl shadow-lg flex items-center justify-between animate-slide-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-white" />
            <div>
              <p className="text-xs font-bold">¡Reporte Enviado Satisfactoriamente!</p>
              <p className="text-[10px] text-emerald-100">Registrado en la red ReciclApp. Ganaste +15 Eco-puntos por ciudadanía activa.</p>
            </div>
          </div>
          <button onClick={() => setShowSuccessToast(false)} className="text-xs underline font-bold opacity-80 hover:opacity-100">OK</button>
        </div>
      )}

      {/* Main Map Splitter Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: List of Centers & filters */}
        <div className="space-y-4">
          
          {/* Filtering panels */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Buscar por dirección o nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green"
              />
            </div>

            {/* Scrolling buttons for center category filtering */}
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'plastic', label: 'Plásticos' },
                { id: 'glass', label: 'Vidrio' },
                { id: 'metal', label: 'Metales' },
                { id: 'paper', label: 'Cartón' },
                { id: 'ewaste', label: 'E-Waste' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 text-[10.5px] rounded-lg border font-semibold shrink-0 transition-all ${
                    selectedCategoryFilter === cat.id
                      ? 'bg-brand-green text-white border-brand-green-light shadow-xs'
                      : 'bg-slate-50 text-slate-500 border-slate-250/60 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* List of matching locations */}
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {filteredCenters.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8 bg-slate-50 rounded-xl">No se encontraron centros de acopio.</p>
            ) : filteredCenters.map(center => (
              <button
                key={center.id}
                onClick={() => setSelectedCenter(center)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between gap-3 ${
                  selectedCenter?.id === center.id
                    ? 'bg-emerald-50/50 border-brand-green-light ring-1 ring-brand-green/20'
                    : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-slate-800 text-xs">{center.name}</h4>
                  <p className="text-[10.5px] text-slate-400 truncate max-w-[190px]">{center.address}</p>
                  
                  {/* Category mini badges */}
                  <div className="flex gap-1 flex-wrap mt-2">
                    {center.categories.slice(0, 3).map((cat, idx) => (
                      <span key={idx} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[9px] uppercase font-bold text-emerald-700 bg-emerald-100 p-1 px-1.5 rounded-md font-mono">
                    {center.pointsMultiplier}x pts
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Highlight detail card of selected center */}
          {selectedCenter && (
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-4">
              <h4 className="font-display font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <MapPin className="w-5 h-5 text-red-500 fill-red-100" />
                <span>{selectedCenter.name}</span>
              </h4>
              <p className="text-[11.5px] text-slate-600 leading-relaxed">{selectedCenter.address}</p>
              
              <div className="grid grid-cols-2 gap-3 text-[10.5px] text-slate-500 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{selectedCenter.hours}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{selectedCenter.phone}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Center/Right column: 2 Cols combining visual vector Map & filing point report form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Grid visual vector interactive Map simulation */}
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-2">
              <div>
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${hasValidKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
                  <span>{hasValidKey ? "Centro Geográfico - Google Maps Activo" : "Mapa de ReciclApp Interactivo - Simulación"}</span>
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {hasValidKey 
                    ? "Para reportar basurales, haz clic en cualquier lugar del mapa para capturar las coordenadas exactas."
                    : "Haz clic en el mapa para simular la captura de coordenadas exactas en Ica."}
                </p>
              </div>
              <span className="text-[9.5px] font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold uppercase shrink-0">
                {hasValidKey ? "Modo Satelital" : "Modo Local"}
              </span>
            </div>

            {hasValidKey ? (
              <div className="relative h-80 rounded-xl overflow-hidden border border-slate-200">
                <APIProvider apiKey={API_KEY} version="weekly">
                  <Map
                    defaultCenter={{ lat: -12.112, lng: -77.029 }}
                    defaultZoom={14}
                    mapId="DEMO_MAP_ID"
                    onClick={(e) => {
                      if (e.detail.latLng) {
                        setSelectedMapCoords({
                          lat: Number(e.detail.latLng.lat.toFixed(6)),
                          lng: Number(e.detail.latLng.lng.toFixed(6))
                        });
                      }
                    }}
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{ width: '100%', height: '100%' }}
                  >
                    {/* Active Recycling point markers with details */}
                    {recyclingCenters.map(center => (
                      <AdvancedMarker
                        key={center.id}
                        position={{ lat: center.lat, lng: center.lng }}
                        onClick={() => {
                          setSelectedCenter(center);
                        }}
                        title={center.name}
                      >
                        <Pin 
                          background={selectedCenter?.id === center.id ? "#059669" : "#10b981"} 
                          glyphColor="#fff" 
                          borderColor="#047857" 
                          scale={selectedCenter?.id === center.id ? 1.25 : 1.0}
                        />
                      </AdvancedMarker>
                    ))}

                    {/* Pending community environmental issues */}
                    {trashReports.filter(rep => rep.status !== 'resolved').map(report => (
                      <AdvancedMarker
                        key={report.id}
                        position={{ lat: report.latitude, lng: report.longitude }}
                        title={`Problema de Basura: ${report.title}`}
                      >
                        <Pin 
                          background={report.severity === 'high' ? "#ef4444" : "#f97316"} 
                          glyphColor="#fff" 
                          borderColor="#7f1d1d" 
                        />
                      </AdvancedMarker>
                    ))}

                    {/* Clicked report coordinate indicator */}
                    {selectedMapCoords && (
                      <AdvancedMarker position={selectedMapCoords}>
                        <Pin background="#3b82f6" glyphColor="#fff" borderColor="#1e40af" />
                      </AdvancedMarker>
                    )}
                  </Map>
                </APIProvider>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Visual setup informative banner */}
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-[11px] text-slate-600 space-y-1.5 font-sans">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>¿Quieres ver el mapa real con Google Maps en tiempo real?</span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-slate-500">
                    Para activar el mapa satelital de Google Maps, solo necesitas añadir tu API Key. Abre el panel de <strong>Ajustes</strong> (icono de engranaje ⚙️, esquina superior derecha) y añade un Secreto llamado <code className="bg-slate-250/60 px-1 py-0.5 rounded text-slate-800 font-mono">GOOGLE_MAPS_PLATFORM_KEY</code> con tu llave de Google Cloud. El mapa se activará automáticamente sin recargar.
                  </p>
                </div>

                <div 
                  onClick={handleMapGridClick}
                  className="relative h-72 rounded-xl border border-slate-200 select-none overflow-hidden cursor-crosshair bg-slate-100"
                >
                  {/* Stylized vector map blocks background */}
                  <div className="absolute inset-0 opacity-80 bg-slate-100 grid grid-cols-5 grid-rows-4 p-1 gap-4">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`rounded-lg border border-slate-200/50 flex items-center justify-center text-[10px] font-mono text-slate-350 ${
                          i % 4 === 0 
                            ? 'bg-emerald-50/40 border-emerald-100/50' 
                            : i % 3 === 0 
                              ? 'bg-slate-200/50' 
                              : 'bg-white'
                        }`}
                      >
                        {i % 4 === 0 && <span className="text-emerald-700/40 font-semibold font-sans">EcoParque</span>}
                      </div>
                    ))}
                  </div>

                  {/* Grid Lines Overlay representing street blocks */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8">
                    <div className="h-px bg-slate-300 w-full"></div>
                    <div className="h-px bg-slate-300 w-full"></div>
                    <div className="h-px bg-slate-300 w-full text-right"><span className="text-[8px] bg-slate-200 text-slate-500 p-0.5 rounded px-1 font-mono">Jr. Reciclaje</span></div>
                  </div>

                  <div className="absolute inset-0 pointer-events-none flex justify-between p-12">
                    <div className="w-px bg-slate-300 h-full"></div>
                    <div className="w-px bg-slate-300 h-full text-bottom"><span className="text-[8px] bg-slate-200 text-slate-500 p-0.5 rounded px-1 font-mono">Av. Miraflores</span></div>
                  </div>

                  {/* Plotted Centers markers pinpointed */}
                  {recyclingCenters.map(center => {
                    const isSelected = selectedCenter?.id === center.id;
                    // Calculate pseudo position indexes relative to map container
                    const leftPos = (center.lng + 77.034) * 15000;
                    const topPos = (-center.lat - 12.106) * 15000;
                    
                    return (
                      <button
                        key={center.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCenter(center);
                        }}
                        className="absolute font-sans transition-transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-35 group animate-zoom-in"
                        style={{
                          left: `${Math.max(10, Math.min(90, leftPos))}%`,
                          top: `${Math.max(15, Math.min(85, topPos))}%`
                        }}
                      >
                        <div className={`p-2 rounded-full border shadow-md transition-all ${
                          isSelected 
                            ? 'bg-brand-green border-brand-green-light text-white scale-110 z-40' 
                            : 'bg-white border-slate-300 text-brand-green hover:scale-105'
                        }`}>
                          <MapPin className="w-4 h-4 fill-current" />
                        </div>
                        
                        {/* Tooltip on hover */}
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded text-[9px] px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-md">
                          {center.name} ({center.pointsMultiplier}x)
                        </span>
                      </button>
                    );
                  })}

                  {/* Active Critical garbage piled reports flagged */}
                  {trashReports.filter(rep => rep.status !== 'resolved').map(report => {
                    const isNew = report.id.startsWith("REP-");
                    return (
                      <div
                        key={report.id}
                        className="absolute -translate-x-1/12 -translate-y-1/12 z-30"
                        style={{
                          // Place randomly but structured based on ID seed
                          left: `${30 + (Number(report.id.replace(/\D/g, "")) % 50)}%`,
                          top: `${20 + (Number(report.id.replace(/\D/g, "")) % 60)}%`
                        }}
                      >
                        <div className={`p-1.5 rounded-lg border flex items-center justify-center font-bold text-xs shadow-md animate-pulse ${
                          report.severity === 'high' 
                            ? 'bg-red-150 border-red-300 text-red-600' 
                            : 'bg-orange-100 border-orange-300 text-orange-600'
                        }`}>
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      </div>
                    );
                  })}

                  {/* User custom clicked coordinate selector pin */}
                  {selectedMapCoords && (
                    <div
                      className="absolute pointer-events-none transition-transform -translate-x-1/2 -translate-y-1/2 z-45"
                      style={{
                        left: `${Math.min(95, Math.max(5, (selectedMapCoords.lng + 77.030) * 12000))}%`,
                        top: `${Math.min(95, Math.max(5, (-selectedMapCoords.lat - 12.110) * 12000))}%`
                      }}
                    >
                      <div className="absolute -top-7 -left-10 bg-slate-950 text-white px-2 py-1 rounded text-[8px] whitespace-nowrap">
                        Punto de Reporte
                      </div>
                      <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-white shadow-xl animate-ping opacity-60"></div>
                      <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-white absolute top-1 left-1 shadow-lg"></div>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>

          {/* neighborhood Garbage Point reporting Form */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
            
            <h4 className="font-display font-extrabold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-wide">
              <Trash2 className="w-5 h-5 text-orange-500" /> Reportar Microbasural / Contaminación Crítica
            </h4>
            <p className="text-slate-500 text-xs">Ayuda a mantener la comunidad limpia. Genera un ticket geolocalizado adjuntando una descripción.</p>

            <form onSubmit={fileReport} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-600">Título Breve</label>
                <input
                  type="text"
                  placeholder="Ej: Acumulación de chatarra metálica, Basural en esquina de parque"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5"
                  required
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-slate-600">Descripción detallada</label>
                <textarea
                  placeholder="Explica qué tipo de escombros/basura hay y si bloquean el tráfico de vecinos o veredas."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5"
                  rows={2}
                  required
                />
              </div>

              {/* Severity select selection option */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 block">Nivel de Gravedad</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full border border-slate-200 rounded-lg p-2.5"
                >
                  <option value="low">Bajo (Orgánico simple / Ramas)</option>
                  <option value="medium">Medio (Bolsas apiladas / Mal olor)</option>
                  <option value="high">Alto (Químicos / Escombros / E-Waste)</option>
                </select>
              </div>

              {/* Geolocation metadata indicator */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 block">Punto GPS Seleccionado</label>
                {selectedMapCoords ? (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[10.5px] text-slate-700 flex justify-between items-center">
                    <span>{selectedMapCoords.lat}, {selectedMapCoords.lng}</span>
                    <button 
                      type="button" 
                      onClick={() => setSelectedMapCoords(null)} 
                      className="text-red-500 hover:scale-105"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <div className="p-2.5 bg-orange-50 border border-orange-100/50 text-orange-850 rounded-lg text-[10.5px] italic">
                    Haz clic en el mapa de arriba para capturar coordenadas exactas del foco de contaminación.
                  </div>
                )}
              </div>

              {/* Photo attachment simulation */}
              <div className="sm:col-span-2 pt-2 flex items-center justify-between border-t border-slate-100 bg-slate-50 p-3 rounded-lg">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPhotoUrl("https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=85&w=150")}
                    className={`p-1 border rounded bg-white hover:border-brand-green ${
                      photoUrl ? 'border-brand-green' : 'border-slate-200'
                    }`}
                  >
                    <img src="https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=85&w=150" alt="Preset dump" className="w-10 h-10 rounded object-cover" />
                  </button>
                  <div className="flex flex-col justify-center">
                    <span className="font-bold text-[10.5px] text-slate-700 leading-snug">Adjuntar Foto Evidencial</span>
                    <span className="text-[9.5px] text-slate-400">Presiona mini miniatura para simular el disparo táctil de cámara</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isReporting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition-all shrink-0 cursor-pointer"
                >
                  {isReporting ? "Clasificando..." : "Levantar Reporte Público"}
                </button>
              </div>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}
