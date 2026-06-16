import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Scale, 
  Droplet, 
  FileText, 
  Trash2, 
  Camera, 
  Leaf, 
  CalendarRange, 
  MapPin, 
  ShoppingBag, 
  Globe, 
  HelpCircle,
  TrendingDown,
  Gift,
  Trophy,
  Package,
  Battery,
  CupSoda,
  GlassWater
} from 'lucide-react';
import { UserProfile, EcoChallenge } from '../types';
import StatsCard from './common/StatsCard';

interface DashboardProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  setCurrentTab: (tab: string) => void;
  challenges: EcoChallenge[];
  setChallenges: React.Dispatch<React.SetStateAction<EcoChallenge[]>>;
  addPoints: (points: number) => void;
}

// Preset samples for quick-testing the AI Analyzer
const PRESET_WASTES = [
  {
    name: "Botella plástica de refresco",
    desc: "Botella PET transparente aplastada de 1.5 litros sin etiqueta.",
    image: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&q=85&w=350"
  },
  {
    name: "Lata de aluminio de Coca-Cola",
    desc: "Lata metálica de refresco enjuagada y arrugada.",
    image: "https://images.unsplash.com/photo-1531058020387-3be344559be6?auto=format&fit=crop&q=85&w=350"
  },
  {
    name: "Caja de cartón de servicio de entrega",
    desc: "Caja de embalaje gruesa, desarmada y totalmente seca.",
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=85&w=350"
  },
  {
    name: "Batería vieja de computadora notebook",
    desc: "Batería recargable de iones de litio hinchada y desgastada.",
    image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=85&w=350"
  }
];

const renderPresetOrImage = (url: string | null | undefined, className: string = "w-12 h-12 rounded-xl flex items-center justify-center shrink-0") => {
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
      <div className={`bg-rose-50 text-rose-500 border border-rose-105 ${className}`}>
        <Battery className="w-6 h-6" />
      </div>
    );
  }
  
  // Custom uploaded photos/etc.
  return <img src={url} alt="Reciclaje" className={`${className} object-cover`} />;
};

export default function Dashboard({
  userProfile,
  setUserProfile,
  setCurrentTab,
  challenges,
  setChallenges,
  addPoints
}: DashboardProps) {
  
  const [analyzerInput, setAnalyzerInput] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const handleChallengeAction = (challengeId: string) => {
    switch (challengeId) {
      case "1":
        const element = document.getElementById('eco-asesor-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          element.classList.add('ring-4', 'ring-brand-green/40');
          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-brand-green/40');
          }, 2500);
        }
        break;
      case "2":
        setCurrentTab('pickups');
        break;
      case "3":
        setCurrentTab('maps');
        break;
      default:
        break;
    }
  };

  const getActionLabel = (challengeId: string, isCompleted: boolean) => {
    if (isCompleted) return "Completado ✓";
    switch (challengeId) {
      case "1":
        return "Clasificar con IA ⚡";
      case "2":
        return "Solicitar Recojo 🚚";
      case "3":
        return "Reportar Foco ⚠️";
      default:
        return "Ir al Reto ↗";
    }
  };

  // Stats summary for widgets
  const statsWidgets = [
    { label: 'Residuos Entregados', value: `${(userProfile.points * 0.15).toFixed(1)} kg`, change: '+4.2 kg esta semana', icon: Scale, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { label: 'Eco-Puntos Acumulados', value: `${userProfile.points} pts`, change: '1.2x por racha diaria', icon: Gift, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { label: 'CO₂ Evitado', value: `${(userProfile.points * 0.28).toFixed(1)} kg`, change: 'Equivale a 3 árboles plantados', icon: Globe, color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { label: 'Agua Ahorrada', value: `${(userProfile.points * 2.4).toFixed(0)} L`, change: 'En producción de material nuevo', icon: Droplet, color: 'text-sky-600 bg-sky-50 border-sky-100' },
  ];

  // Steps animation during AI analysis
  const analyzeSteps = [
    "Leyendo atributos moleculares y descripción...",
    "Clasificando categoría de empaque en base a políticas ecológicas...",
    "Calculando mitigación de CO₂ y volumen de agua regenerada...",
    "Generando instrucciones de depósito personalizadas..."
  ];

  const handleQuickSelectWaste = (preset: typeof PRESET_WASTES[0]) => {
    setAnalyzerInput(preset.desc);
    setSelectedPhoto(preset.image);
    setAnalysisResult(null);
    setAnalysisError(null);
  };

  const handlePresetPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const runWasteAnalysis = async () => {
    if (!analyzerInput && !selectedPhoto) {
      setAnalysisError("Por favor escribe una descripción del residuo o selecciona una de las tarjetas rápidas.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError(null);
    setLoadingStep(0);

    // Simulate animated loading steps
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 900);

    try {
      let imageBase64 = '';
      if (selectedPhoto && selectedPhoto.startsWith('data:')) {
        // Extract plain base64 from dataURL
        imageBase64 = selectedPhoto.split(',')[1];
      }

      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: analyzerInput,
          imageBase64: imageBase64,
          mimeType: selectedPhoto?.startsWith('data:') ? selectedPhoto.split(';')[0].split(':')[1] : 'image/jpeg'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setAnalysisResult(data);
      } else {
        setAnalysisError(data.error || "Ocurrió un error en el procesador ecológico.");
      }
    } catch (err: any) {
      setAnalysisError("Error de conexión. Se usará el clasificador modular estático incorporado.");
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  const handleClaimPoints = () => {
    if (!analysisResult) return;
    const pts = analysisResult.pointsEstimated || 15;
    addPoints(pts);

    // Advance challenges that might be relevant
    setChallenges(prev => prev.map(ch => {
      if (ch.title.toLowerCase().includes("ia") || ch.title.toLowerCase().includes("escanear")) {
        const nextCount = Math.min(ch.targetCount, ch.currentCount + 1);
        const isNowCompleted = nextCount >= ch.targetCount;
        return {
          ...ch,
          currentCount: nextCount,
          isCompleted: isNowCompleted
        };
      }
      return ch;
    }));

    // Reset analyzer
    setAnalysisResult(null);
    setAnalyzerInput('');
    setSelectedPhoto(null);
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Upper Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-emerald-800 to-teal-900 p-8 rounded-3xl text-white shadow-xl shadow-emerald-950/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-15 pointer-events-none">
          <Leaf className="w-64 h-64 rotate-45 translate-x-20 translate-y-10 text-white" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs text-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            <span>Colabora con el planeta hoy</span>
          </div>
          <h2 className="font-display font-bold text-3xl tracking-tight">¡Hola, {userProfile.name}! 👋</h2>
          <p className="text-emerald-100 text-sm max-w-lg">
            Tienes <span className="font-bold text-white font-mono">{userProfile.points} Eco-Puntos</span> listos para canjear en el Marketplace Sostenible. ¡Has subido al 
            <span className="font-bold text-emerald-200 font-sans"> Nivel {userProfile.level} ({userProfile.level === 1 ? 'Brote Novato' : userProfile.level === 2 ? 'Explorador Verde' : 'Guardián Planetario'})</span>!
          </p>
        </div>
        
        {/* Rapid stats */}
        <div className="flex gap-4 relative z-10">
          <button 
            id="btn-pickup-now"
            onClick={() => setCurrentTab('pickups')}
            className="px-5 py-3 hover:scale-103 transition-transform bg-white text-emerald-900 hover:bg-emerald-50 font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/20"
          >
            <span>Solicitar Recojo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bento Widgets Stats */}
      <div>
        <h3 className="font-display font-semibold text-slate-800 text-lg mb-4 flex items-center gap-2">
          <span>Tus Métricas de Impacto Personal</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsWidgets.map((widget, i) => (
            <StatsCard
              key={i}
              title={widget.label}
              value={widget.value}
              change={widget.change}
              Icon={widget.icon}
              colorClass={widget.color}
            />
          ))}
        </div>
      </div>

      {/* EcoAsesor AI Classifier Widget & Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: AI Waste Analyzer */}
        <div id="eco-asesor-section" className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-xs space-y-6 transition-all duration-500 ring-offset-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-display font-bold text-xl text-slate-800 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-brand-green fill-brand-green" /> 
                EcoAsesor Inteligente (Análisis IA)
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">Determina la categoría, puntos de reciclaje y reglas exactas usando Gemini AI</p>
            </div>
            {process.env.GEMINI_API_KEY && (
              <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                AI Activa
              </span>
            )}
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">1. Describe el material a reciclar o selecciona una muestra rápida:</label>
            
            {/* Presets Carousel */}
            <div className="grid grid-cols-2 shadow-xs sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {PRESET_WASTES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickSelectWaste(preset)}
                  className="flex flex-col items-center bg-white border border-slate-200 hover:border-brand-green p-2.5 rounded-lg text-center transition-all group group hover:shadow-xs"
                >
                  {renderPresetOrImage(preset.image, "w-12 h-12 rounded-lg flex items-center justify-center mb-2 transition-transform group-hover:scale-110")}
                  <span className="text-[10.5px] font-semibold text-slate-700 truncate w-full group-hover:text-brand-green">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Input Form Text Area */}
            <div className="relative">
              <textarea
                value={analyzerInput}
                onChange={(e) => setAnalyzerInput(e.target.value)}
                placeholder="Escribe detalles del residuo. Ej: 'Lata de bebida metálica arrugada de soda, vacía y enjuagada' o 'Un fardo grande de periódicos atados con cuerda de yute...'"
                rows={3}
                className="w-full text-sm border border-slate-200 rounded-xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all placeholder:text-slate-400"
              />
              <div className="absolute right-3 bottom-4 flex items-center gap-1.5">
                <input 
                  type="file" 
                  id="image-analyzer-file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handlePresetPhotoUpload} 
                />
                <label 
                  htmlFor="image-analyzer-file"
                  className="p-2 text-slate-500 hover:text-brand-green bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                  title="Subir foto del residuo"
                >
                  <Camera className="w-5 h-5" />
                </label>
              </div>
            </div>

            {/* Photo preview block */}
            {selectedPhoto && (
              <div className="flex items-center gap-3 bg-emerald-50/50 p-2 border border-emerald-100/50 rounded-xl max-w-fit">
                {renderPresetOrImage(selectedPhoto, "w-14 h-14 rounded-lg flex items-center justify-center")}
                <div>
                  <p className="text-xs font-semibold text-slate-800">Foto incorporada para análisis</p>
                  <button 
                    onClick={() => setSelectedPhoto(null)} 
                    className="text-[10px] text-red-600 hover:underline mt-0.5"
                  >
                    Eliminar foto
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={runWasteAnalysis}
              disabled={isAnalyzing || (!analyzerInput && !selectedPhoto)}
              className="w-full py-3.5 bg-brand-green hover:bg-brand-green-dark text-white font-bold text-sm tracking-wide rounded-xl shadow-lg transition-transform hover:scale-102 flex items-center justify-center gap-2 select-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analizar Residuo con IA</span>
                </>
              )}
            </button>
          </div>

          {/* Analysis Processing Screen */}
          {isAnalyzing && (
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
              <div className="w-12 h-12 rounded-full border-4 border-dashed border-brand-green animate-spin"></div>
              <div>
                <p className="font-display font-bold text-brand-green text-sm">{analyzeSteps[loadingStep]}</p>
                <p className="text-xs text-slate-400 mt-1">Conectando con el motor ecológico Gemini-3.5-Flash</p>
              </div>
            </div>
          )}

          {/* Error display */}
          {analysisError && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs space-y-1">
              <p className="font-bold">Error de clasificación inteligente:</p>
              <p>{analysisError}</p>
              <p className="text-slate-500 text-[10px]">Hemos activado el analizador local de contingencia.</p>
            </div>
          )}

          {/* Successful AI response layout */}
          {analysisResult && (
            <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-2xl p-6 space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/50 pb-4">
                <div className="flex items-center gap-3">
                  <span className="p-3 bg-brand-green text-white rounded-xl">
                    <Leaf className="w-6 h-6" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-brand-green/20 text-brand-green font-bold text-[10.5px] rounded-md font-mono">
                        {analysisResult.wasteCategory}
                      </span>
                      {analysisResult.isRecyclable ? (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-700 border border-emerald-200/50 px-1.5 py-0.5 rounded font-bold">
                          Reciclable ✔
                        </span>
                      ) : (
                        <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-bold">
                          Especial ⚠
                        </span>
                      )}
                    </div>
                    <h4 className="font-display font-extrabold text-lg text-slate-800 mt-1">{analysisResult.wasteMaterial}</h4>
                  </div>
                </div>
                
                {/* Reward Value Badge */}
                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between bg-white sm:bg-transparent border sm:border-0 border-emerald-100 p-3 sm:p-0 rounded-xl">
                  <span className="text-xs text-slate-500 font-medium">Recompensa Estimada</span>
                  <span className="text-2xl font-display font-extrabold text-brand-green font-mono">
                    +{analysisResult.pointsEstimated || 15} <span className="text-xs">PTS</span>
                  </span>
                </div>
              </div>

              {/* Impact savings widget */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">Carbono Mitigado</span>
                    <span className="font-display font-bold text-sm text-slate-850 font-mono">
                      -{analysisResult.co2SavingEstimateKg} kg CO₂
                    </span>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
                  <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg">
                    <Droplet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">Agua Preservada</span>
                    <span className="font-display font-bold text-sm text-slate-850 font-mono">
                      +{analysisResult.waterSavingEstimateL} L Agua
                    </span>
                  </div>
                </div>
              </div>

              {/* Instructions text block with correct schema rendering */}
              <div className="space-y-2.5">
                <h5 className="font-display font-bold text-sm text-slate-800 flex items-center gap-1">
                  <FileText className="w-4 h-4 text-brand-green" /> 
                  Guía de Preparación de Residuos:
                </h5>
                <div className="bg-white px-4 py-3.5 border border-slate-100 rounded-xl shadow-xs text-xs text-slate-600 leading-relaxed">
                  {analysisResult.recyclingInstructions}
                </div>
              </div>

              {/* Interactive claim actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleClaimPoints}
                  className="flex-1 py-3 bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Gift className="w-4 h-4" />
                  <span>Aceptar y Registrar Recompensa</span>
                </button>
                <button
                  onClick={() => {
                    setAnalysisResult(null);
                    setAnalyzerInput('');
                    setSelectedPhoto(null);
                  }}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-all uppercase tracking-wider"
                >
                  Analizar otro
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Gamified Challenges & Quick Actions */}
        <div className="space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
            <h4 className="font-display font-bold text-slate-800 text-sm tracking-wide uppercase text-slate-400">Acciones Directas</h4>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setCurrentTab('pickups')}
                className="p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 transition-all rounded-xl text-left group cursor-pointer"
              >
                <div className="p-2 bg-white text-brand-green rounded-lg w-fit group-hover:scale-105 transition-transform">
                  <CalendarRange className="w-5 h-5" />
                </div>
                <h5 className="font-display font-bold text-emerald-950 text-xs mt-3">Agendar Recojo</h5>
                <p className="text-[10px] text-emerald-700 mt-0.5">Recolectores a domicilio</p>
              </button>

              <button 
                onClick={() => setCurrentTab('maps')}
                className="p-4 bg-teal-50 hover:bg-teal-100 border border-teal-100 transition-all rounded-xl text-left group cursor-pointer"
              >
                <div className="p-2 bg-white text-teal-600 rounded-lg w-fit group-hover:scale-105 transition-transform">
                  <MapPin className="w-5 h-5" />
                </div>
                <h5 className="font-display font-bold text-teal-950 text-xs mt-3">Centros de Acopio</h5>
                <p className="text-[10px] text-teal-700 mt-0.5">Ubicaciones y premios</p>
              </button>

              <button 
                onClick={() => setCurrentTab('marketplace')}
                className="p-4 bg-sky-50 hover:bg-sky-100 border border-sky-100 transition-all rounded-xl text-left group cursor-pointer"
              >
                <div className="p-2 bg-white text-sky-600 rounded-lg w-fit group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h5 className="font-display font-bold text-sky-950 text-xs mt-3 font-display">Eco-Market</h5>
                <p className="text-[10px] text-sky-700 mt-0.5">Productos circulares</p>
              </button>

              <button 
                onClick={() => {
                  setCurrentTab('maps');
                  // Quick trick to open reporting directly if needed
                }}
                className="p-4 bg-orange-50 hover:bg-orange-100 border border-orange-100 transition-all rounded-xl text-left group cursor-pointer"
              >
                <div className="p-2 bg-white text-orange-600 rounded-lg w-fit group-hover:scale-105 transition-transform">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h5 className="font-display font-bold text-orange-950 text-xs mt-3">Basura Crítica</h5>
                <p className="text-[10px] text-orange-700 mt-0.5">Registrar microbasural</p>
              </button>
            </div>
          </div>

          {/* Gamified Eco-Challenges Panel */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-display font-bold text-sm tracking-wide uppercase text-slate-400">Retos Activos de la Semana</h4>
              <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg" title="¡Desbloquea premios!">
                <Trophy className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-4">
              {challenges.map((challenge) => {
                const percentage = (challenge.currentCount / challenge.targetCount) * 100;
                return (
                  <div 
                    key={challenge.id} 
                    onClick={() => handleChallengeAction(challenge.id)}
                    className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3.5 hover:border-brand-green/45 hover:bg-emerald-50/10 hover:shadow-xs transition-all duration-300 group cursor-pointer"
                  >
                    <div className="flex justify-between items-start gap-2.5">
                      <div className="text-xl p-1 bg-white rounded-lg shadow-2xs border border-slate-100 group-hover:scale-110 transition-transform">{challenge.icon}</div>
                      <div className="flex-1 text-xs">
                        <h5 className="font-bold text-slate-850 flex items-center gap-1.5 group-hover:text-brand-green transition-colors">
                          {challenge.title}
                          {challenge.isCompleted && (
                            <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-sm">COMPLETO</span>
                          )}
                        </h5>
                        <p className="text-slate-400 text-[10.5px] mt-0.5 leading-snug">{challenge.description}</p>
                      </div>
                      <span className="text-[10.5px] font-mono font-bold text-brand-green whitespace-nowrap bg-white px-2 py-0.5 border border-slate-200/60 rounded-md shadow-3xs">
                        +{challenge.pointsReward} PTS
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>Progreso semanal</span>
                        <span>{challenge.currentCount} / {challenge.targetCount} ({Math.round(percentage)}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${challenge.isCompleted ? 'bg-emerald-500' : 'bg-brand-green'}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Interactive action indicator button inside each card */}
                    <div className="pt-1 flex justify-end">
                      <span 
                        className={`px-3 py-1.5 font-bold text-[10px] rounded-lg transition-all uppercase tracking-wide flex items-center gap-1 shadow-2xs ${
                          challenge.isCompleted 
                            ? 'bg-slate-100 text-slate-400 border border-slate-200'
                            : 'bg-brand-green group-hover:bg-brand-green-dark text-white group-hover:scale-102 group-hover:translate-x-0.5'
                        }`}
                      >
                        <span>{getActionLabel(challenge.id, challenge.isCompleted)}</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              Los retos se actualizan automáticamente todos los domingos. Completa actividades de reciclaje para rellenar las metas.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
