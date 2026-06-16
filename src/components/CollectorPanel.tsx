import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Play,
  Navigation,
  ExternalLink,
  Crown,
  Lock,
  Sparkles,
  Trophy,
  CreditCard,
  ShieldCheck,
  X
} from 'lucide-react';
import { PickupRequest } from '../types';
import { useAuth } from '../context/AuthContext';

interface CollectorPanelProps {
  pickupRequests: PickupRequest[];
  setPickupRequests: React.Dispatch<React.SetStateAction<PickupRequest[]>>;
  addPoints: (points: number) => void;
}

export default function CollectorPanel({
  pickupRequests,
  setPickupRequests,
  addPoints
}: CollectorPanelProps) {
  
  const { user, updateUserProfile } = useAuth();
  
  // Simulated Modal States for purchasing Premium right here:
  const [showCheckout, setShowCheckout] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  // Let's identify pending and completed
  // To make sure there are premium orders available for testing, we dynamically tag orders with > 12kg as premium if they are not already flagged.
  const processedRequests = pickupRequests.map(req => {
    // If the category is electronic, metal or weight is high, default to premium request for preview purposes.
    const isPrem = req.isPremium || req.weightEstimate >= 10 || req.category === 'Metal';
    return { ...req, isPremium: isPrem };
  });

  const pendingRequests = processedRequests.filter(r => r.status !== 'cerrado' && r.status !== 'cancelado');
  const completedRequests = processedRequests.filter(r => r.status === 'cerrado');

  const totalWeightCollected = completedRequests.reduce((sum, r) => sum + r.weightEstimate, 0);

  // Collector achievements matching user's requests:
  const COLLECTOR_ACHIEVEMENTS = [
    {
      id: "coll-1",
      title: "Iniciación Rápida 🚚",
      description: "Completa tu primer pedido asignado.",
      currentCount: completedRequests.length,
      requiredCount: 1,
      isCompleted: completedRequests.length >= 1,
      icon: "🌱"
    },
    {
      id: "coll-2",
      title: "Titán de la Ecología 🏋️‍♂️",
      description: "Llega a recolectar al menos 50 kg de material reciclable.",
      currentCount: Math.round(totalWeightCollected),
      requiredCount: 50,
      isCompleted: totalWeightCollected >= 50,
      icon: "⚡"
    },
    {
      id: "coll-3",
      title: "EcoSocio Premium ⭐",
      description: "Activa tu membresía Premium de Recolector.",
      currentCount: user?.isPremium ? 1 : 0,
      requiredCount: 1,
      isCompleted: !!user?.isPremium,
      icon: "👑"
    },
    {
      id: "coll-4",
      title: "As de las Rutas 🎯",
      description: "Completa un total de 5 recogidas asignadas.",
      currentCount: completedRequests.length,
      requiredCount: 5,
      isCompleted: completedRequests.length >= 5,
      icon: "🏔️"
    }
  ];

  const updateRequestStatus = (id: string, status: typeof pendingRequests[0]['status'], points: number) => {
    setPickupRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status
        };
      }
      return req;
    }));

    if (status === 'cerrado') {
      addPoints(points);
    }
  };

  const handlePurchaseSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvv) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentDone(true);
      
      setTimeout(() => {
        const pStartDate = new Date().toISOString();
        const pEndDate = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
        
        // Grant Premium badge in DB
        updateUserProfile({
          isPremium: true,
          premiumStartDate: pStartDate,
          premiumEndDate: pEndDate,
          premiumStatus: 'active'
        });
        
        setPaymentDone(false);
        setShowCheckout(false);
        setCardNumber('');
        setCardExpiry('');
        setCardCvv('');
      }, 1500);
    }, 2000);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Title block */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-slate-950/20">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-green text-white rounded-xl">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
              Consola de Recolector Autorizado
              {user?.isPremium && (
                <span className="flex items-center gap-0.5 px-2 py-0.5 bg-amber-400 text-slate-950 font-sans font-bold text-[10px] rounded-full uppercase tracking-wider">
                  <Crown className="w-3 h-3 fill-slate-950 text-slate-950" /> Premium
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-1">Revisa y despacha las rutas asignadas para hoy. Mantén al día tu ubicación de camino.</p>
          </div>
        </div>
        
        {/* Dynamic Premium countdown or upsell button */}
        {user?.isPremium ? (
          <div className="bg-emerald-950/40 border border-emerald-800/40 px-4 py-2.5 rounded-xl text-right sm:max-w-xs shrink-0">
            <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1 justify-end">
              <Sparkles className="w-3.5 h-3.5" /> Recolector Premium
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Vence: {user.premiumEndDate ? new Date(user.premiumEndDate).toLocaleDateString() : 'En 30 días'}</p>
            <span className="inline-block mt-1 text-[11px] font-mono bg-emerald-500/10 text-emerald-300 font-bold px-2 py-0.5 rounded">
              {user.premiumDaysRemaining ?? 30} días restantes
            </span>
          </div>
        ) : (
          <button
            onClick={() => setShowCheckout(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold text-xs tracking-wide uppercase rounded-xl shadow-md cursor-pointer shrink-0 transition-all flex items-center gap-1.5"
          >
            <Crown className="w-4 h-4 fill-slate-950" />
            <span>Adquirir Premium ($4.99)</span>
          </button>
        )}
      </div>

      {/* Collector Achievements section */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-display font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-emerald-600" /> Logros e Impacto de Recolector
        </h3>
        
        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Rutas Realizadas</p>
            <p className="text-xl font-display font-black text-slate-800 mt-0.5">{completedRequests.length}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Peso Entregado</p>
            <p className="text-xl font-display font-black text-slate-800 mt-0.5">{Math.round(totalWeightCollected)} kg</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center col-span-2 sm:col-span-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Multiplicador Premium</p>
            <p className="text-xl font-display font-black text-amber-600 mt-0.5">{user?.isPremium ? "2.0x ⚡" : "1.0x"}</p>
          </div>
        </div>

        {/* Achievement cards list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
          {COLLECTOR_ACHIEVEMENTS.map(ach => (
            <div 
              key={ach.id} 
              className={`p-3.5 border rounded-xl relative overflow-hidden flex flex-col justify-between ${
                ach.isCompleted 
                  ? 'bg-emerald-50/45 border-emerald-150/80' 
                  : 'bg-white border-slate-150'
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-xl">{ach.icon}</span>
                  {ach.isCompleted ? (
                    <span className="bg-emerald-500 text-white rounded-full p-0.5 text-[10px] uppercase font-bold" title="Completado">
                      ✓
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Pendiente
                    </span>
                  )}
                </div>
                <h4 className="font-display font-bold text-slate-800 text-xs mt-2.5">{ach.title}</h4>
                <p className="text-[10.5px] text-slate-500 mt-1 leading-snug">{ach.description}</p>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-[9px] text-slate-400 font-mono font-bold mb-1">
                  <span>Progreso</span>
                  <span>{ach.currentCount} / {ach.requiredCount}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${ach.isCompleted ? 'bg-emerald-500' : 'bg-slate-400'}`}
                    style={{ width: `${Math.min(100, (ach.currentCount / ach.requiredCount) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="text-center p-12 bg-white border border-slate-100 rounded-2xl">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h4 className="font-display font-semibold text-slate-800">¡Ruta Completada!</h4>
          <p className="text-xs text-slate-400 mt-1">No tienes solicitudes pendientes de recogida en tu distrito. ¡Buen trabajo ecológico!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-display font-semibold text-slate-800 text-sm tracking-wide uppercase">Visitas para Hoy ({pendingRequests.length})</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => {
              const isLockedPremium = req.isPremium && !user?.isPremium;
              
              return (
                <div 
                  key={req.id}
                  className={`bg-white border rounded-2xl p-5 shadow-xs space-y-4 relative overflow-hidden transition-all duration-300 ${
                    req.status === 'en_camino' ? 'border-orange-300 ring-1 ring-orange-150' : 'border-slate-150/70'
                  } ${isLockedPremium ? 'border-rose-100 opacity-90' : ''}`}
                >
                  
                  {/* Premium overlay if the collector is not premium */}
                  {isLockedPremium && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 p-5 flex flex-col justify-between" id="premium-locked-overlay">
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-xs font-bold text-slate-400">{req.id}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-indigo-500 text-white flex items-center gap-1">
                          <Crown className="w-3 h-3 fill-indigo-200" /> Premium Exclusivo
                        </span>
                      </div>
                      
                      <div className="my-auto text-center py-4 space-y-2">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                          <Lock className="w-5 h-5" />
                        </div>
                        <h4 className="font-display font-bold text-slate-850 text-xs">Pedido Premium de Alta Ganancia</h4>
                        <p className="text-[11px] text-slate-600 max-w-xs mx-auto leading-relaxed">
                          Este es un pedido Premium. Activa tu membresía para acceder a pedidos prioritarios.
                        </p>
                      </div>

                      <button
                        onClick={() => setShowCheckout(true)}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wide rounded-xl shadow-md cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Crown className="w-4 h-4 fill-white" />
                        <span>Adquirir Premium</span>
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-400">{req.id}</span>
                      <h4 className="font-display font-extrabold text-slate-800 text-sm mt-1 flex items-center gap-1.5">
                        Recojo de {req.category}
                        {req.isPremium && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5">
                            ★ Prioritario
                          </span>
                        )}
                      </h4>
                    </div>
                    {(() => {
                      let style: string = 'bg-slate-100 text-slate-700';
                      let label: string = req.status;
                      if (req.status === 'recibido') { style = 'bg-slate-100 text-slate-700'; label = 'Recibido'; }
                      else if (req.status === 'en_revision') { style = 'bg-yellow-50 text-yellow-700 border border-yellow-200'; label = 'En Revisión'; }
                      else if (req.status === 'asignado') { style = 'bg-blue-50 text-blue-700 border border-blue-200'; label = 'Por Iniciar'; }
                      else if (req.status === 'en_camino') { style = 'bg-orange-50 text-orange-700 animate-pulse'; label = 'En Camino 🚚'; }
                      else if (req.status === 'recolectado') { style = 'bg-teal-50 text-teal-700'; label = 'Recolectado'; }
                      else if (req.status === 'llevado_a_centro_de_acopio') { style = 'bg-purple-50 text-purple-700'; label = 'Centro de Acopio'; }
                      return (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${style}`}>
                          {label}
                        </span>
                      );
                    })()}
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600">
                    <p className="flex items-center gap-1.5 font-semibold">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" /> {req.userAddress}
                    </p>
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5 shrink-0" /> {req.scheduledDate} ({req.scheduledTime})
                      </div>
                      <span className="font-bold text-slate-600 text-[11px] bg-slate-200/50 px-2 py-0.5 rounded">
                        ~{req.weightEstimate} kg
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-md border border-slate-100/60 font-medium">
                      <span className="font-bold text-slate-500 block text-[10px] uppercase">Nota del Vecino:</span>
                      {req.notes || "No provistas especificaciones."}
                    </div>
                  </div>

                  {/* Submitting dispatches */}
                  <div className="border-t border-slate-150/50 pt-4 flex gap-3">
                    {(() => {
                      if (req.status === 'recibido' || req.status === 'en_revision') {
                        return (
                          <button
                            onClick={() => updateRequestStatus(req.id, 'asignado', req.pointsAwarded)}
                            className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 uppercase tracking-wide cursor-pointer"
                          >
                            <span>Asignar Ruta Chofer</span>
                          </button>
                        );
                      } else if (req.status === 'asignado') {
                        return (
                          <button
                            onClick={() => updateRequestStatus(req.id, 'en_camino', req.pointsAwarded)}
                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 uppercase tracking-wide cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Iniciar Ruta (En Camino)</span>
                          </button>
                        );
                      } else if (req.status === 'en_camino') {
                        return (
                          <button
                            onClick={() => updateRequestStatus(req.id, 'recolectado', req.pointsAwarded)}
                            className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 uppercase tracking-wide cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Marcar Recolectado</span>
                          </button>
                        );
                      } else if (req.status === 'recolectado') {
                        return (
                          <button
                            onClick={() => updateRequestStatus(req.id, 'llevado_a_centro_de_acopio', req.pointsAwarded)}
                            className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 uppercase tracking-wide cursor-pointer"
                          >
                            <span>Llevar a Acopio Ica</span>
                          </button>
                        );
                      } else {
                        return (
                          <button
                            onClick={() => updateRequestStatus(req.id, 'cerrado', req.pointsAwarded)}
                            className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 uppercase tracking-wide cursor-pointer"
                          >
                            <span>Cerrar Ticket (Completado)</span>
                          </button>
                        );
                      }
                    })()}
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(req.userAddress)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                      title="Navegar con GPS"
                    >
                      <Navigation className="w-4 h-4" />
                    </a>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Historic completed orders */}
      {completedRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display font-semibold text-slate-400 text-xs tracking-wide uppercase">Historial Completado ({completedRequests.length})</h3>
          <div className="bg-white border rounded-xl overflow-hidden divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
            {completedRequests.map(req => (
              <div key={req.id} className="p-4 flex justify-between items-center text-xs text-slate-600">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-brand-green flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Recojo {req.id} ({req.category})</p>
                    <p className="text-slate-400 text-[10.5px] mt-0.5">{req.userAddress.split(',')[0]} • Entregó ~{req.weightEstimate} kg</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-emerald-600">+{req.pointsAwarded} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stripe payment simulated overlay modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 animate-scale-up">
            
            <div className="bg-brand-green text-white p-6 relative">
              <button 
                onClick={() => setShowCheckout(false)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-400 text-slate-950 rounded-xl">
                  <Crown className="w-5 h-5 fill-slate-950" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm tracking-wide uppercase">Adquirir Premium de Recolector</h3>
                  <p className="text-white/80 text-[11px] mt-0.5">Suscripción autorizada - Vigencia de 30 días</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {paymentDone ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 bg-emerald-50 text-brand-green rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h4 className="font-display font-bold text-slate-800 text-sm">¡Comprobando Transacción!</h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                    Tu pago ha sido procesado mediante la pasarela segura. Se ha concedido el acceso premium a pedidos prioritarios.
                  </p>
                </div>
              ) : (
                <form onSubmit={handlePurchaseSubscription} className="space-y-4">
                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
                    <p className="text-[11px] text-indigo-900 leading-snug">
                      <strong>Privilegios Premium:</strong> Mayor prioridad en la asignación de rutas, acceso a pedidos de reciclaje pesado y doble xp ganada.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1 uppercase tracking-wide text-[9.5px]">Detalle de Tarjeta</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="4111 2222 3333 4444"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/[^0-9 ]/g, ''))}
                          className="w-full px-3.5 py-2.5 border border-slate-150 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-green text-xs font-mono"
                        />
                        <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 font-bold mb-1 uppercase tracking-wide text-[9.5px]">Vencimiento</label>
                        <input
                          type="text"
                          required
                          placeholder="MM/AA"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-slate-150 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-green text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold mb-1 uppercase tracking-wide text-[9.5px]">CVV / CVC</label>
                        <input
                          type="password"
                          required
                          placeholder="***"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-full px-3.5 py-2.5 border border-slate-150 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-green text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3 bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg cursor-pointer transition-colors block text-center mt-6 disabled:opacity-50"
                  >
                    {isProcessing ? "Procesando..." : "Proceder con la Compra — $4.99 USD"}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
