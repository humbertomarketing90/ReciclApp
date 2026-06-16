import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  HelpCircle, 
  Compass, 
  MapPin, 
  ShoppingBag, 
  Award, 
  Crown, 
  Truck, 
  ShieldAlert, 
  Users, 
  FileText,
  Warehouse
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface TourStep {
  title: string;
  description: string;
  tab: string;
  icon: React.ReactNode;
  hint: string;
}

interface GuidedLearnTourProps {
  userProfile: UserProfile;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function GuidedLearnTour({
  userProfile,
  currentTab,
  setCurrentTab,
  forceOpen = false,
  onClose
}: GuidedLearnTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Storage key is user-specific: tracks if this specific user has finished the tour
  const userTourKey = `reciclapp_tour_v1_completed_${userProfile.id || 'guest'}_${userProfile.role}`;

  useEffect(() => {
    const isCompleted = localStorage.getItem(userTourKey);
    // If not completed and user logged in, auto open
    if (!isCompleted || forceOpen) {
      setIsOpen(true);
      setCurrentStep(0);
    }
  }, [userTourKey, forceOpen]);

  // Define steps according to user role
  const getTourSteps = (): TourStep[] => {
    if (userProfile.role === 'admin') {
      return [
        {
          title: "🔑 Consola de Gestión Global",
          description: "¡Bienvenido al centro de mando! Aquí puedes supervisar todos los indicadores del proyecto: solicitudes activas de vecinos, kilos recuperados y el estado del ecosistema.",
          tab: "admin-overview",
          icon: <Sparkles className="w-6 h-6 text-indigo-500" />,
          hint: "Ideal para tomar decisiones informadas sobre las rutas de recolección en curso."
        },
        {
          title: "⚠️ Gestión de Basura Crítica",
          description: "Monitorea, investiga y despacha personal para mitigar puntos críticos de residuos que los ciudadanos reporten en las calles de la ciudad.",
          tab: "admin-reports",
          icon: <ShieldAlert className="w-6 h-6 text-rose-500" />,
          hint: "Como administrador, eres el encargado de validar la limpieza y eliminar estos reportes una vez resueltos."
        },
        {
          title: "👑 Socios & Miembros Premium",
          description: "Consulta, aprueba y administra los estados de membresía de usuarios comunes y recolectores para asegurar una distribución equilibrada de incentivos.",
          tab: "admin-users",
          icon: <Users className="w-6 h-6 text-amber-500" />,
          hint: "Puedes otorgar temporalmente o revocar membresías premium con los nuevos controles."
        },
        {
          title: "🏬 Ecomarket y Catalogo Circular",
          description: "Ingresa directrices de inventario, edita o desactiva productos sostenibles para mantener la tienda activa y libre de publicaciones inapropiadas.",
          tab: "marketplace",
          icon: <ShoppingBag className="w-6 h-6 text-emerald-500" />,
          hint: "El ecomarket actúa como el incentivo principal para la red circular de reciclaje."
        },
        {
          title: "🏭 Estaciones Ecológicas Asociadas",
          description: "Registra, geolocaliza y supervisa las estaciones verdes o centros de acopio oficiales con multiplicadores premium de Eco-puntos.",
          tab: "admin-centers",
          icon: <Warehouse className="w-6 h-6 text-sky-500" />,
          hint: "Los usuarios consultan este mapa en tiempo real para deponer sus residuos."
        }
      ];
    }

    if (userProfile.role === 'collector') {
      return [
        {
          title: "🚛 Consola del Recolector Profesional",
          description: "Tu espacio de trabajo prioritario. Consulta todas las solicitudes de recojo, estados dinámicos, tipos de bolsas registradas y la ubicación del vecino.",
          tab: "collector-jobs",
          icon: <Truck className="w-6 h-6 text-emerald-500" />,
          hint: "Asegúrate de marcar los estados: asignado, en camino y cerrado según completes cada servicio."
        },
        {
          title: "👑 Socios y Membresía Colector",
          description: "La membresía premium te habilita para acceder a solicitudes especiales de recojo extendido, recibir mejores comisiones y ganar reputación.",
          tab: "profile",
          icon: <Crown className="w-6 h-6 text-amber-500" />,
          hint: "Consulta tu estado de membresía o adquiere planes premium desde este panel."
        },
        {
          title: "🏬 Ecomarket e Intercambio",
          description: "Interactúa en el mercado ofreciendo materiales reciclados crudos o adquiriendo implementos de protección y sacos de recolección.",
          tab: "marketplace",
          icon: <ShoppingBag className="w-6 h-6 text-indigo-500" />,
          hint: "Puedes chatear en tiempo real con compradores locales sin intermediarios."
        }
      ];
    }

    // Default: Regular User (Usuario común)
    return [
      {
        title: "🌱 ¡Tu Portal Eco-Ambiental!",
        description: "Este es tu Dashboard principal. Aquí verás tu Eco-Nivel, tus puntos disponibles para el mercado y tu avance de experiencia. Cada acción de reciclaje te depara Eco-puntos.",
        tab: "dashboard",
        icon: <Compass className="w-6 h-6 text-emerald-600" />,
        hint: "Cumple los desafíos activos diarios para acelerar tus ganancias de Eco-puntos."
      },
      {
        title: "🚚 Solicita Eco-Recojo a Domicilio",
        description: "¿Residuos listos en casa? Agenda un retiro indicando tamaño de bolsa y materiales. Un reciclador certificado irá hasta tu puerta a retirarlos gratis.",
        tab: "pickups",
        icon: <Truck className="w-6 h-6 text-indigo-500" />,
        hint: "Es ideal clasificar los materiales en bolsas limpias y secas antes del arribo."
      },
      {
        title: "📍 Centros Verdes & Alertas de Basura",
        description: "Encuentra la estación de reciclaje más cercana con multiplicador de puntos, o reporta focos de basura acumulada en tu vecindario usando la cámara integrada.",
        tab: "maps",
        icon: <MapPin className="w-6 h-6 text-sky-500" />,
        hint: "Ganarás eco-puntos extra por cada foco de limpieza reportado que sea validado por el admin."
      },
      {
        title: "🛒 Ecomarket: Economía Circular",
        description: "¡Tus puntos valen real! Úsalos para comprar de la tienda comunitaria, o sube tus propios productos upcycled, abonos u objetos reciclados para venderlos.",
        tab: "marketplace",
        icon: <ShoppingBag className="w-6 h-6 text-teal-500" />,
        hint: "Incluye chat integrado para pactar el intercambio directo con compradores."
      },
      {
        title: "📊 Tu Impacto Ecológico Mensurable",
        description: "Traduce tus entregas en resultados reales para el planeta: agua limpia ahorrada, kilogramos de CO2 evitados y árboles salvados. ¡Visualiza tus medallas y siéntete orgulloso!",
        tab: "impact",
        icon: <Award className="w-6 h-6 text-amber-500" />,
        hint: "Comparte tus logros para motivar a más vecinos de Ica a unirse."
      },
      {
        title: "👑 Beneficios Premium de Socio",
        description: "Súbete al plan premium para obtener un multiplicador fijo de 1.5x en todas tus actividades, asistencia preferencial y despacho inmediato las 24 horas del día.",
        tab: "profile",
        icon: <Crown className="w-6 h-6 text-amber-500" />,
        hint: "La compra y renovación premium se procesa instantáneamente simulada."
      }
    ];
  };

  const steps = getTourSteps();

  // Synchro actively with current tab on step change
  useEffect(() => {
    if (isOpen && steps[currentStep]) {
      const stepTab = steps[currentStep].tab;
      // Synthesize change if different
      if (currentTab !== stepTab) {
        setCurrentTab(stepTab);
      }
    }
  }, [currentStep, isOpen]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    localStorage.setItem(userTourKey, 'true');
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) {
    // Show a small beautiful trigger help button in corner for users to consult later
    return (
      <div className="fixed bottom-6 right-6 z-40 no-print">
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setCurrentStep(0);
          }}
          className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-full text-xs font-bold hover:bg-slate-800 shadow-lg tracking-wide transition-all border border-slate-700/80 hover:scale-105 cursor-pointer"
          title="Guía guiada del aplicativo"
        >
          <Compass className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Ver Tutorial</span>
        </button>
      </div>
    );
  }

  const activeStepData = steps[currentStep];

  return (
    <AnimatePresence>
      <div id="learning-tour-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 no-print">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="bg-white border border-slate-100 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative"
        >
          {/* Header Progress Header */}
          <div className="bg-slate-900 text-white p-5 relative">
            <div className="absolute top-4 right-4">
              <button
                type="button"
                onClick={handleClose}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                title="Cerrar Guía"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/20 rounded-xl">
                <Compass className="w-5 h-5 text-emerald-400 fill-emerald-500/10" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold font-mono">Tutorial Guía Activo</span>
                <h4 className="font-display font-extrabold text-sm text-slate-100">Explorando ReciclApp</h4>
              </div>
            </div>

            {/* Micro progress indicator */}
            <div className="mt-4 flex gap-1 items-center">
              {steps.map((_, index) => (
                <div 
                  key={index} 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentStep ? 'w-8 bg-emerald-400' : index < currentStep ? 'w-2 bg-emerald-600/80' : 'w-2 bg-slate-700'
                  }`}
                />
              ))}
              <span className="text-[10px] font-bold font-mono text-slate-400 ml-auto">Paso {currentStep + 1} de {steps.length}</span>
            </div>
          </div>

          {/* Step description Content */}
          <div className="p-6 md:p-8 space-y-5">
            <div className="flex gap-4 items-start bg-slate-50 border border-slate-100/50 p-4 rounded-2xl">
              <div className="p-3 bg-white border border-slate-200/50 rounded-2xl shadow-xs shrink-0">
                {activeStepData.icon}
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-black text-slate-900 text-sm">{activeStepData.title}</h3>
                <span className="inline-block px-2 py-0.5 bg-emerald-100/60 text-brand-green border border-emerald-200/30 font-bold rounded text-[9.5px] uppercase">
                  Pestaña Activa: {activeStepData.tab}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {activeStepData.description}
            </p>

            {/* Smart Advice Box */}
            <div className="bg-amber-50/80 border border-amber-100/50 rounded-xl p-3 text-[11px] text-amber-900 flex gap-2">
              <span className="text-sm select-none">💡</span>
              <div>
                <span className="font-bold block uppercase tracking-wider text-[9px] text-amber-800">Consejo Pro</span>
                <p className="mt-0.5 text-slate-700 font-normal leading-normal">{activeStepData.hint}</p>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="border-t border-slate-100 bg-slate-50 p-4 px-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handleClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Omitir tutorial
            </button>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Atrás</span>
                </button>
              )}
              
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 bg-brand-green hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
              >
                <span>{currentStep === steps.length - 1 ? '¡Listo, Empezar!' : 'Siguiente Paso'}</span>
                {currentStep < steps.length - 1 && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
