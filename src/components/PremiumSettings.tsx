import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Crown, 
  CreditCard, 
  CheckCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle,
  ExternalLink,
  Shield,
  Clock,
  LogOut,
  Camera,
  Upload,
  X,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

interface PremiumSettingsProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export default function PremiumSettings({
  userProfile,
  setUserProfile
}: PremiumSettingsProps) {
  
  const { updateUserProfile } = useAuth();
  
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Camera stream and upload states
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  const startCamera = async () => {
    setCameraError(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 400, height: 400 } 
      });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("No se pudo acceder a la cámara. Revisa los permisos de tu navegador.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 300;
      canvas.height = video.videoHeight || 300;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        
        setUserProfile(prev => ({
          ...prev,
          avatar: dataUrl
        }));
        updateUserProfile({
          avatar: dataUrl
        });
      }
      stopCamera();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setUserProfile(prev => ({
          ...prev,
          avatar: dataUrl
        }));
        updateUserProfile({
          avatar: dataUrl
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Payment modal visibility
  const [showStripeModal, setShowStripeModal] = useState(false);
  
  // Card input states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  // Accordion faq state triggers
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const handlePurchaseSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentDone(true);

      setTimeout(() => {
        const pStartDate = new Date().toISOString();
        const pEndDate = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
        
        // Grant Premium badge
        setUserProfile(prev => ({
          ...prev,
          isPremium: true,
          premiumStartDate: pStartDate,
          premiumEndDate: pEndDate,
          premiumDaysRemaining: 30,
          premiumStatus: 'active'
        }));
        
        updateUserProfile({
          isPremium: true,
          premiumStartDate: pStartDate,
          premiumEndDate: pEndDate,
          premiumStatus: 'active'
        });
        
        // Close modal
        setPaymentDone(false);
        setShowStripeModal(false);
        setCardNumber('');
        setCardExpiry('');
        setCardCvv('');
      }, 1500);

    }, 2000);
  };

  const faqs = [
    { id: 1, q: "¿Cómo se transforman mis residuos en Eco-Puntos?", a: "Cuando un recolector oficial retira tus residuos o los dejas en un centro de acopio socio, se pesa el empaque. Nuestro baremo liquida puntos por kilogramo de material (ej: de 5 a 14 pts/kg). Esos puntos se cargan inmediatamente a tu cuenta." },
    { id: 2, q: "¿Qué beneficios otorga la suscripción Premium?", a: "La suscripción Premium de ReciclApp otorga programaciones de recogida ilimitadas, atención prioritaria de conductores dentro de las 2 horas de agendamiento, soporte dedicado 24/7 y un bono permanente multiplicador de 1.5x en todos los puntos acumulados por residuos entregados." },
    { id: 3, q: "¿Son reales los productos del ecomarket?", a: "Sí, todos los productos son de origen sostenible, abonos orgánicos tamizados, bolsas impermeables de yute, o jabones biodegradables listados por emprendimientos socio-ambientales de la ciudad." },
    { id: 4, q: "¿Qué ocurre tras reportar un Punto Crítico de basura?", a: "El reporte se geolocaliza automáticamente en el mapa de ReciclApp. El equipo de limpieza urbana o cuadrillas de recicladores asociadas programan desvíos para limpiar el punto crítico. Al resolverse el incidente, el ciudadano informante recibe +15 Eco-puntos automáticos." }
  ];

  return (
    <div className="space-y-8 font-sans pb-12">
      
      {/* Title */}
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-800">Mi Cuenta y Configuraciones</h2>
        <p className="text-xs text-slate-500 mt-0.5">Administra tu perfil, suscríbete al servicio Premium o resuelve inquietudes de soporte.</p>
      </div>

      {showStripeModal && (
        /* High-fidelity custom Stripe Payment checkout panel */
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative animate-scale-up border-slate-100">
            
            <button 
              onClick={() => setShowStripeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 font-bold"
            >
              ×
            </button>

            {paymentDone ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-brand-green mx-auto animate-bounce border border-emerald-200">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-black text-slate-900 text-lg uppercase">¡Suscripción Activada!</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">Felicidades, te has convertido en un Miembro Ecológico Premium. Los beneficios de racha 1.5x ya fueron desbloqueados.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePurchaseSubscription} className="space-y-5 text-xs">
                
                <div className="text-center space-y-2 pb-2">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-full w-fit mx-auto border border-amber-100">
                    <Crown className="w-8 h-8 fill-amber-500 animate-pulse" />
                  </div>
                  <h3 className="font-display font-extrabold text-slate-850 text-base uppercase">Adquirir Beneficios Premium</h3>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">Únete por solo **$4.99 USD / mes** para recolecciones infinitas y multiplicador de puntos.</p>
                </div>

                {/* Simulated Credit Card Input Form */}
                <div className="bg-slate-50 border rounded-2xl p-4 space-y-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 block uppercase text-[10px] tracking-wide">Número de tarjeta</label>
                    <div className="relative">
                      <CreditCard className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="4111 2222 3333 4444"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                        className="w-full bg-white border rounded-xl pl-10 pr-3 py-2.5"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block uppercase text-[10px]">Vencimiento</label>
                      <input
                        type="text"
                        placeholder="MM / AA"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value.slice(0, 5))}
                        className="w-full bg-white border rounded-xl p-2.5"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 block uppercase text-[10px]">CVC / CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                        className="w-full bg-white border rounded-xl p-2.5"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 text-blue-800 rounded-xl leading-relaxed flex gap-2">
                  <Shield className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>Nuestra pasarela utiliza cifrado simulado Stripe de alta fidelidad. Ninguna transacción de dinero real se llevará a cabo.</span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 bg-slate-900 border border-slate-900 text-white font-bold rounded-xl tracking-wider uppercase transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isProcessingPayment ? (
                    <>
                      <div className="w-4.5 h-4.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                      <span>Procesando pago...</span>
                    </>
                  ) : (
                    <span>Pagar $4.99 USD Moneda</span>
                  )}
                </button>

              </form>
            )}

          </div>
        </div>
      )}

      {/* Profile and Premium banner grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile general options left */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
          <h3 className="font-display font-bold text-slate-800 text-base uppercase tracking-tight flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-brand-green" /> Información del Ciudadano
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-6 pb-2">
            <div className="relative group shrink-0">
              <img 
                src={userProfile.avatar} 
                alt={userProfile.name} 
                className="w-24 h-24 rounded-full border-4 border-emerald-50 bg-slate-150 object-cover shadow-xs" 
              />
              <div 
                onClick={triggerFileSelect}
                className="absolute -bottom-1 -right-1 bg-brand-green text-white p-2 rounded-full shadow-md border-2 border-white hover:bg-brand-green-dark transition-all cursor-pointer"
                title="Cambiar foto de perfil"
              >
                <Camera className="w-4 h-4" />
              </div>
            </div>

            <div className="text-center sm:text-left space-y-3 flex-1 w-full">
              <div>
                <h4 className="font-display font-extrabold text-xl text-slate-900 flex items-center justify-center sm:justify-start gap-2">
                  {userProfile.name}
                  {userProfile.isPremium && <Crown className="w-5 h-5 text-yellow-500 fill-current" />}
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{userProfile.email}</p>
                <p className="text-xs text-slate-500 mt-1">Miembro desde el {userProfile.joinedDate}</p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                <button
                  type="button"
                  onClick={triggerFileSelect}
                  className="px-3.5 py-2 bg-slate-105 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-150 cursor-pointer border border-slate-150 active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Subir de Galería o Archivo</span>
                </button>

                {!cameraActive ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3.5 py-2 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-150 cursor-pointer border border-brand-green/15 active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Tomar Foto en Vivo</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-150 cursor-pointer border border-red-100 active:scale-95"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Desactivar Cámara</span>
                  </button>
                )}
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          </div>

          {/* Active Camera Streaming Capture Panel */}
          {cameraActive && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center gap-4 animate-scale-up max-w-sm mx-auto sm:mx-0">
              <div className="relative w-full max-w-[260px] aspect-square rounded-xl overflow-hidden bg-black border border-slate-750">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover transform scale-x-[-1]" 
                />
              </div>
              <div className="flex gap-2.5 w-full">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="flex-1 py-2.5 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-xl text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capturar Foto</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2.5 bg-slate-805 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer active:scale-95"
                >
                  <span>Muted / Cerrar</span>
                </button>
              </div>
            </div>
          )}

          {cameraError && (
            <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-xl leading-relaxed border border-red-100 max-w-sm">
              <span className="font-semibold block">Error de Dispositivo:</span>
              <p className="mt-0.5">{cameraError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-500 block">Nombre de Usuario</label>
              <input
                type="text"
                value={userProfile.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setUserProfile(prev => ({ ...prev, name: val }));
                }}
                className="w-full border rounded-lg p-2.5 bg-slate-50 border-slate-200"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500 block">Correo Electrónico</label>
              <input
                type="text"
                value={userProfile.email}
                disabled
                className="w-full border rounded-lg p-2.5 bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

        </div>

        {/* Premium Upgrade prompt panel */}
        <div className="bg-linear-to-b from-slate-900 to-slate-950 text-white rounded-2xl border border-slate-800 p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="p-2.5 bg-amber-500/20 text-yellow-400 rounded-xl border border-yellow-500/20">
                <Crown className="w-6 h-6 fill-amber-500" />
              </span>
              <span className="text-[9px] font-mono bg-yellow-500/10 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-500/20">Elite Plan</span>
            </div>
            
            <h4 className="font-display font-extrabold text-white text-base">Plan ReciclApp Premium</h4>
            <p className="text-[11.5px] text-slate-400 leading-relaxed">Conviértete en Guardián de Elite para desbloquear el máximo poder de ecología.</p>
            
            {/* List benefits */}
            <div className="space-y-2 text-xs pt-1">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span className="text-slate-300">Recolecciones a domicilio ilimitadas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span className="text-slate-300">Atención prioritaria y despacho en 2h</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span className="text-slate-300"><strong>Incremento de 1.5x Eco-Puntos</strong></span>
              </div>
            </div>
          </div>

          {userProfile.isPremium ? (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
              <span className="text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Suscripción Premium Activa
              </span>
            </div>
          ) : (
            <button
              onClick={() => setShowStripeModal(true)}
              className="w-full py-3.5 bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs tracking-wider uppercase rounded-xl shadow-lg cursor-pointer block text-center"
            >
              Suscribirse — $4.99 USD
            </button>
          )}

        </div>

      </div>

      {/* Factory Reset Section */}
      <div id="factory-reset-section" className="bg-white border border-rose-100 rounded-2xl p-6 md:p-8 shadow-xs space-y-4">
        <h3 className="font-display font-bold text-rose-800 text-sm uppercase tracking-wide flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-rose-600" />
          Mantenimiento de Sistema: Restablecer de Fábrica
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Esta función limpia toda la base de datos simulada en <strong>localStorage</strong>. Se eliminarán permanentemente todas las solicitudes de recojo, puntos críticos reportados, productos de Ecomarket y cambios en las cuentas de usuario, regresando la aplicación a su estado de fábrica completamente limpio.
        </p>

        {showResetConfirm ? (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-3 animate-fade-in">
            <div className="flex gap-2.5 text-xs text-rose-950 font-semibold items-start">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold uppercase tracking-wider text-[11px] text-rose-800">¡Advertencia de Acción Irreversible!</p>
                <p className="mt-1 text-slate-600 font-normal leading-relaxed">¿Seguro de que deseas restablecer la aplicación? Toda tu información local se perderá instantáneamente y la página se recargará.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Sí, Restablecer Todo
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-700 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restablecer ReciclApp de Fábrica</span>
          </button>
        )}
      </div>

      {/* Accordion FAQ sector support help */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
        <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-1.5 border-b pb-3 border-slate-100">
          <HelpCircle className="w-5 h-5 text-brand-green" /> Centro de Consulta y Preguntas Frecuentes
        </h3>

        <div className="space-y-3.5">
          {faqs.map(faq => {
            const isOpen = openFaqId === faq.id;
            return (
              <div key={faq.id} className="border border-slate-150 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100/50 flex justify-between items-center transition-colors text-xs font-bold text-slate-750"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="p-4 bg-white border-t border-slate-100 text-xs text-slate-550 leading-relaxed animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* WhatsApp direct support desk */}
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
              <MessageCircle className="w-6 h-6 fill-current text-white" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-950 font-display">Asistencia Directa por WhatsApp</h4>
              <p className="text-emerald-700 text-[11px] leading-snug mt-0.5">Comunícate directamente con nuestro soporte y resuelve dudas ecológicas en tiempo real.</p>
            </div>
          </div>
          <a
            href="https://wa.me/51984225114"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 shrink-0 uppercase tracking-wide cursor-pointer shadow-md shadow-emerald-750/10"
          >
            <span>Escribir por WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>

    </div>
  );
}
