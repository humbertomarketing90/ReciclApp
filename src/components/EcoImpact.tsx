import React, { useRef, useState } from 'react';
import { 
  Trophy, 
  Leaf, 
  Calendar, 
  ChevronRight, 
  Award, 
  Download, 
  CheckCircle, 
  Sparkles,
  TreePine,
  ShieldAlert,
  Printer,
  Compass,
  X,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { UserProfile, EcoAchievement } from '../types';
import { useToast } from '../context/ToastContext';

interface EcoImpactProps {
  userProfile: UserProfile;
  achievements: EcoAchievement[];
}

export default function EcoImpact({
  userProfile,
  achievements
}: EcoImpactProps) {
  
  const { addToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Calculate dynamic ecological stats based on user points
  const pointsCoeff = userProfile.points;
  const co2SavedKg = (pointsCoeff * 0.28).toFixed(1);
  const waterSavedL = (pointsCoeff * 2.4).toFixed(0);
  const electricityKwh = (pointsCoeff * 0.14).toFixed(1);
  const treesSavedCount = (pointsCoeff * 0.008).toFixed(2);

  const handlePrintCertificate = () => {
    addToast("Abriendo cuadro de diálogo de impresión para tu certificado...", "success");
    setTimeout(() => {
      window.print();
    }, 350);
  };

  const generateCertificateCanvas = (format: 'png' | 'jpeg'): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1130;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Premium background: soft parchment green-cream tint
    ctx.fillStyle = '#fbfdfb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dynamic gradient decorative glow elements
    const gradGlow = ctx.createRadialGradient(canvas.width, 0, 100, canvas.width, 0, 500);
    gradGlow.addColorStop(0, '#e6f4ea');
    gradGlow.addColorStop(1, '#fbfdfb');
    ctx.fillStyle = gradGlow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Elegant emerald frame borders
    ctx.strokeStyle = '#059669'; // brand-green (emerald-600)
    ctx.lineWidth = 14;
    ctx.strokeRect(35, 35, canvas.width - 70, canvas.height - 70);

    ctx.strokeStyle = '#10b981'; // emerald-500
    ctx.lineWidth = 2;
    ctx.strokeRect(52, 52, canvas.width - 104, canvas.height - 104);

    // Decorative corner geometries
    ctx.fillStyle = '#047857'; // emerald-700
    // Left-Top
    ctx.beginPath();
    ctx.moveTo(35, 35);
    ctx.lineTo(130, 35);
    ctx.lineTo(35, 130);
    ctx.closePath();
    ctx.fill();

    // Right-Top
    ctx.beginPath();
    ctx.moveTo(canvas.width - 35, 35);
    ctx.lineTo(canvas.width - 130, 35);
    ctx.lineTo(canvas.width - 35, 130);
    ctx.closePath();
    ctx.fill();

    // Left-Bottom
    ctx.beginPath();
    ctx.moveTo(35, canvas.height - 35);
    ctx.lineTo(130, canvas.height - 35);
    ctx.lineTo(35, canvas.height - 130);
    ctx.closePath();
    ctx.fill();

    // Right-Bottom
    ctx.beginPath();
    ctx.moveTo(canvas.width - 35, canvas.height - 35);
    ctx.lineTo(canvas.width - 130, canvas.height - 35);
    ctx.lineTo(canvas.width - 35, canvas.height - 130);
    ctx.closePath();
    ctx.fill();

    // Decorative gold seal ribbons & circle at the top center
    const sealX = canvas.width / 2;
    const sealY = 250;

    // ribbons
    ctx.fillStyle = '#d97706'; // amber-600
    ctx.beginPath();
    ctx.moveTo(sealX - 25, sealY);
    ctx.lineTo(sealX - 45, sealY + 110);
    ctx.lineTo(sealX - 10, sealY + 95);
    ctx.lineTo(sealX + 15, sealY + 110);
    ctx.lineTo(sealX - 5, sealY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#b45309'; // amber-700
    ctx.beginPath();
    ctx.moveTo(sealX + 5, sealY);
    ctx.lineTo(sealX + 25, sealY + 110);
    ctx.lineTo(sealX - 10, sealY + 95);
    ctx.lineTo(sealX - 25, sealY + 110);
    ctx.lineTo(sealX + 5, sealY);
    ctx.closePath();
    ctx.fill();

    // Golden seal circle
    ctx.beginPath();
    ctx.arc(sealX, sealY, 65, 0, 2 * Math.PI);
    ctx.fillStyle = '#fbbf24'; // amber-400
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#d97706'; // amber-600
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(sealX, sealY, 52, 0, 2 * Math.PI);
    ctx.strokeStyle = '#f59e0b'; // amber-500
    ctx.lineWidth = 2;
    ctx.stroke();

    // Text inside seal
    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = '#78350f'; // amber-900
    ctx.textAlign = 'center';
    ctx.fillText('HÉROE', sealX, sealY - 12);
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('ECOLÓGICO', sealX, sealY + 10);
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('★ ★ ★', sealX, sealY + 30);

    // Main header title
    ctx.fillStyle = '#065f46'; // emerald 800
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('CERTIFICADO DE IMPACTO AMBIENTAL', canvas.width / 2, 420);

    ctx.font = 'italic 20px sans-serif';
    ctx.fillStyle = '#52525b'; // zinc-600
    ctx.fillText('En reconocimiento a la ciudadanía y el compromiso ecológico sostenible', canvas.width / 2, 465);

    // Name label
    ctx.font = 'italic 22px sans-serif';
    ctx.fillStyle = '#71717a'; // zinc-500
    ctx.fillText('Se otorga el presente mérito honorario con distinción a:', canvas.width / 2, 540);

    // Recipient Name
    ctx.font = 'bold 58px sans-serif';
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillText(userProfile.name.toUpperCase(), canvas.width / 2, 620);

    // Name underline
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 320, 642);
    ctx.lineTo(canvas.width / 2 + 320, 642);
    ctx.stroke();

    // Body descriptive text
    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#374151'; // grey-700
    const textDesc1 = 'Por su destacada labor voluntaria en el programa oficial de segregación selectiva de ReciclApp,';
    const textDesc2 = 'reducción activa de gases de invernadero y valorización responsable de residuos sólidos con ReciclApp.';
    ctx.fillText(textDesc1, canvas.width / 2, 715);
    ctx.fillText(textDesc2, canvas.width / 2, 755);

    // KPI layout box
    const boxY = 820;
    const boxWidth = 1100;
    const boxHeight = 140;
    const boxX = (canvas.width - boxWidth) / 2;

    // white card for KPIs
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#e4e4e7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 16);
    } else {
      ctx.rect(boxX, boxY, boxWidth, boxHeight);
    }
    ctx.fill();
    ctx.stroke();

    // Divide box into 3 columns
    const colWidth = boxWidth / 3;
    
    // Col 1: CO2
    ctx.textAlign = 'center';
    ctx.fillStyle = '#71717a';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('DIÓXIDO DE CARBONO (CO2) EVITADO', boxX + colWidth / 2, boxY + 45);
    ctx.fillStyle = '#047857';
    ctx.font = 'bold 28px monospace';
    ctx.fillText(`-${co2SavedKg} kg`, boxX + colWidth / 2, boxY + 95);

    // Line 1
    ctx.strokeStyle = '#f4f4f5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(boxX + colWidth, boxY + 25);
    ctx.lineTo(boxX + colWidth, boxY + 115);
    ctx.stroke();

    // Col 2: Water saved
    ctx.fillStyle = '#71717a';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('AGUA VITAL PRESERVADA', boxX + colWidth + colWidth / 2, boxY + 45);
    ctx.fillStyle = '#1d4ed8'; // blue 700
    ctx.font = 'bold 28px monospace';
    ctx.fillText(`+${waterSavedL} Litros`, boxX + colWidth + colWidth / 2, boxY + 95);

    // Line 2
    ctx.beginPath();
    ctx.moveTo(boxX + colWidth * 2, boxY + 25);
    ctx.lineTo(boxX + colWidth * 2, boxY + 115);
    ctx.stroke();

    // Col 3: Points
    ctx.fillStyle = '#71717a';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('ECO-PUNTOS CONSEGUIDOS', boxX + colWidth * 2 + colWidth / 2, boxY + 45);
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 28px monospace';
    ctx.fillText(`${userProfile.points} PTS`, boxX + colWidth * 2 + colWidth / 2, boxY + 95);

    // Footer signatures and dates
    const footerY = 1040;
    
    // Left footer - Issuer Date
    ctx.textAlign = 'left';
    ctx.fillStyle = '#71717a';
    ctx.font = '14px sans-serif';
    ctx.fillText('FECHA DE EMISIÓN', 90, footerY - 25);
    ctx.fillStyle = '#18181b';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText(new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }), 90, footerY);

    // Center footer - Signature
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#d4d4d8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 120, footerY - 20);
    ctx.lineTo(canvas.width / 2 + 120, footerY - 20);
    ctx.stroke();
    ctx.fillStyle = '#52525b';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('Consorcio Ciudadano ReciclApp', canvas.width / 2, footerY);

    // Right footer - Level
    ctx.textAlign = 'right';
    ctx.fillStyle = '#71717a';
    ctx.font = '14px sans-serif';
    ctx.fillText('EVALUACIÓN DE DESEMPEÑO', canvas.width - 90, footerY - 25);
    ctx.fillStyle = '#059669';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText(`Nivel ${userProfile.level} Elite`, canvas.width - 90, footerY);

    return canvas.toDataURL(format === 'png' ? 'image/png' : 'image/jpeg', format === 'png' ? undefined : 0.95);
  };

  const handleDownload = (format: 'png' | 'jpg') => {
    setIsDownloading(true);
    setDownloadProgress(0);
    addToast(`Generando certificado en formato ${format.toUpperCase()}...`, "success");
    
    // Simulate generation progress
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsDownloading(false);
            addToast(`¡Certificado ${format.toUpperCase()} descargado con éxito!`, "success");
            
            const mimeType = format === 'png' ? 'png' : 'jpeg';
            const dataUrl = generateCertificateCanvas(mimeType);
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = `Certificado_EcoImpacto_${userProfile.name.replace(/\s+/g, "_")}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }, 350);
          return 100;
        }
        return prev + 25;
      });
    }, 120);
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      
      {/* Title */}
      <div className="no-print">
        <h2 className="font-display font-bold text-2xl text-slate-800">Logros e Impacto Ambiental</h2>
        <p className="text-xs text-slate-500 mt-0.5 font-sans">Revisa tus medallas ecológicas desbloqueadas y exporta tu certificado de impacto oficial.</p>
      </div>

      {/* Bento Grid Analytics widgets */}
      <div className="no-print grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Atmósfera Limpia</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Leaf className="w-5 h-5" />
            </span>
          </div>
          <div>
            <h5 className="font-display font-extrabold text-2xl text-slate-900 font-mono">-{co2SavedKg} kg</h5>
            <p className="text-xs text-slate-400 mt-1">Dióxido de carbono (CO2) neto disminuido en la atmósfera.</p>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Agua Preservada</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </span>
          </div>
          <div>
            <h5 className="font-display font-extrabold text-2xl text-slate-900 font-mono">+{waterSavedL} Litros</h5>
            <p className="text-xs text-slate-400 mt-1">Líquido vital ahorrado frente a la producción de materia virgen.</p>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Bosques y Flora</span>
            <span className="p-2 bg-green-50 text-green-600 rounded-xl">
              <TreePine className="w-5 h-5" />
            </span>
          </div>
          <div>
            <h5 className="font-display font-extrabold text-2xl text-slate-900 font-mono">{treesSavedCount} Árboles</h5>
            <p className="text-xs text-slate-400 mt-1">Pulmones verdes preservados gracias a la reutilización y reciclaje.</p>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Energía Eléctrica</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Award className="w-5 h-5" />
            </span>
          </div>
          <div>
            <h5 className="font-display font-extrabold text-2xl text-slate-900 font-mono">{electricityKwh} kWh</h5>
            <p className="text-xs text-slate-400 mt-1">Ahorro eléctrico, equivalente a mantener un bombillo encendido 200 días.</p>
          </div>
        </div>

      </div>

      {/* Unlocked Achievements medallas layout */}
      <div className="no-print bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-xs space-y-5">
        <h3 className="font-display font-bold text-slate-800 text-lg flex items-center gap-1.5 border-b border-slate-100 pb-3">
          <Trophy className="w-6 h-6 text-brand-green" /> 
          Tus Insignias y Logros Desbloqueados
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => {
            const isUnlocked = userProfile.points >= (ach.title.includes("Guardián") ? 400 : ach.title.includes("Econanocientífico") ? 200 : 50);
            return (
              <div 
                key={ach.id} 
                className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all ${
                  isUnlocked 
                    ? 'bg-emerald-50/25 border-emerald-200/50 hover:shadow-xs' 
                    : 'bg-slate-50 border-slate-150/60 opacity-60'
                }`}
              >
                <div className={`p-3 rounded-xl text-2xl font-mono shrink-0 select-none ${
                  isUnlocked 
                    ? 'bg-brand-green text-white shadow-sm' 
                    : 'bg-slate-200 text-slate-400'
                }`}>
                  {ach.icon}
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className={`font-bold ${isUnlocked ? 'text-slate-850' : 'text-slate-400 line-through'}`}>{ach.title}</h4>
                    {isUnlocked ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[8px] font-bold px-1.5 rounded-sm uppercase tracking-wider font-mono">Desbloqueado</span>
                    ) : (
                      <span className="bg-slate-200 text-slate-500 text-[8px] font-bold px-1.5 rounded-sm uppercase tracking-wider font-mono">Bloqueado</span>
                    )}
                  </div>
                  <p className="text-slate-450 text-[10.5px] mt-1 leading-snug">{ach.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* High-Fidelity Printable Eco-Impact Certificate Screen */}
      <div className="print-certificate-container bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl relative max-w-3xl mx-auto overflow-hidden">
        
        {/* Certificate borders decor design background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/40 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-100/40 rounded-full blur-2xl pointer-events-none"></div>

        {/* Framing border decorative */}
        <div className="border border-emerald-700/20 p-6 sm:p-8 rounded-2xl relative z-10 space-y-8 flex flex-col justify-between h-full">
          
          {/* Top layout */}
          <div className="text-center space-y-4">
            
            <div className="w-16 h-16 bg-brand-green text-white mx-auto rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-250/20">
              <Award className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-green font-mono">Certificado de Ciudadano Sostenible</span>
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">HÉROE DEL MEDIO AMBIENTE</h3>
              <div className="w-12 h-0.5 bg-brand-green mx-auto mt-2 rounded"></div>
            </div>

          </div>

          {/* Credential recipient panel */}
          <div className="text-center space-y-2">
            <span className="text-slate-400 text-xs italic">De parte de ReciclApp se otorga el presente mérito a:</span>
            <p className="text-xl sm:text-2xl font-display font-black text-slate-950 underline decoration-brand-green-light decoration-2 uppercase tracking-wide">
              {userProfile.name}
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed mt-2.5">
              Por su destacada participación en el programa de reciclaje domiciliario y valorización de residuos, demostrando un compromiso excepcional con la preservación del ecosistema y la huella ecológica terrestre.
            </p>
          </div>

          {/* Quantifiable savings indicators */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">CO2 Evitado</span>
              <span className="font-display font-extrabold text-slate-800 text-sm mt-0.5 block font-mono">-{co2SavedKg} kg</span>
            </div>
            <div className="border-x border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Agua Salvada</span>
              <span className="font-display font-extrabold text-slate-800 text-sm mt-0.5 block font-mono">+{waterSavedL} L</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Eco-Puntos</span>
              <span className="font-display font-extrabold text-brand-green text-sm mt-0.5 block font-mono">{userProfile.points} PTS</span>
            </div>
          </div>

          {/* Sponsoring signatures and localized dates */}
          <div className="flex justify-between items-end border-t border-slate-100 pt-5 text-[10px] text-slate-400">
            <div className="space-y-1 text-left">
              <p className="font-mono">Fecha de Emisión</p>
              <p className="font-bold text-slate-700 font-sans">{new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <div className="text-center space-y-1">
              <div className="w-20 h-px bg-slate-300 mx-auto"></div>
              <p className="font-semibold text-slate-500 font-sans">Comunidad ReciclApp</p>
            </div>

            <div className="text-right space-y-1">
              <p className="font-mono">Puntos Verdes</p>
              <p className="font-bold text-brand-green font-sans">Nivel {userProfile.level} Elite</p>
            </div>
          </div>

        </div>

      </div>

      {/* Print / Download Trigger toolbar */}
      <div className="no-print flex justify-center pt-2">
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm tracking-wide rounded-2xl shadow-lg flex items-center gap-2 transition-transform hover:scale-103 cursor-pointer"
        >
          <Printer className="w-5 h-5 animate-pulse" />
          <span>Imprimir o Guardar como PDF</span>
        </button>
      </div>

      {/* Backdrop-Blur Modal Popup */}
      {showModal && (
        <div className="no-print fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-slate-950/70 overflow-y-auto font-sans animate-fade-in">
          <div className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden border border-slate-100 shadow-2xl flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-green" />
                <h3 className="font-display font-bold text-slate-800 text-[11px] tracking-wide uppercase">Previsualización de Certificado</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with Gaussian background display */}
            <div className="p-6 overflow-y-auto bg-slate-100/80 flex justify-center items-center">
              <div className="w-full">
                
                {/* Embedded Certificate container representing print content */}
                <div className="print-certificate-container bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 relative max-w-xl mx-auto overflow-hidden shadow-sm">
                  {/* Background curves */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/30 rounded-full blur-xl pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-100/30 rounded-full blur-xl pointer-events-none"></div>

                  <div className="border border-emerald-700/10 p-5 rounded-xl relative z-10 space-y-6 flex flex-col justify-between h-full bg-white/50">
                    
                    {/* Header */}
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-brand-green text-white mx-auto rounded-xl flex items-center justify-center shadow-md">
                        <Award className="w-7 h-7" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-brand-green">Certificado Oficial</span>
                        <h4 className="font-display font-black text-lg text-slate-900 tracking-tight leading-none">HÉROE DEL MEDIO AMBIENTE</h4>
                        <div className="w-8 h-0.5 bg-brand-green mx-auto mt-1 rounded"></div>
                      </div>
                    </div>

                    {/* Recipient */}
                    <div className="text-center space-y-2">
                      <span className="text-slate-400 text-[10px] italic">Otorgado con distinción a:</span>
                      <p className="text-base sm:text-lg font-display font-black text-slate-950 underline decoration-brand-green-light decoration-2 uppercase tracking-wide">
                        {userProfile.name}
                      </p>
                      <p className="text-[10px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                        Por su destacada participación en el programa de segregación domiciliaria y valorización de residuos de ReciclApp.
                      </p>
                    </div>

                    {/* KPIs stats bar */}
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg grid grid-cols-3 gap-1.5 text-center text-[10px]">
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase font-bold">CO2 Evitado</span>
                        <span className="font-display font-bold text-slate-800 font-mono mt-0.5 block">-{co2SavedKg} kg</span>
                      </div>
                      <div className="border-x border-slate-200">
                        <span className="text-[8px] text-slate-400 block uppercase font-bold font-sans">Agua Salvada</span>
                        <span className="font-display font-bold text-slate-800 font-mono mt-0.5 block">+{waterSavedL} L</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 block uppercase font-bold">Eco-Puntos</span>
                        <span className="font-display font-bold text-brand-green font-mono mt-0.5 block">{userProfile.points} pts</span>
                      </div>
                    </div>

                    {/* Footer values */}
                    <div className="flex justify-between items-end border-t border-slate-100 pt-3 text-[9px] text-slate-400">
                      <div>
                        <span className="block text-[8px] font-mono text-slate-400">EMISIÓN</span>
                        <span className="font-bold text-slate-600">{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-8 h-px bg-slate-300 mx-auto mb-1"></div>
                        <span className="font-semibold text-slate-50 relative top-[-1px]">Comunidad</span>
                      </div>

                      <div className="text-right">
                        <span className="block text-[8px] font-mono text-slate-400">PROGRESO</span>
                        <span className="font-bold text-brand-green text-[9.5px]">Nivel {userProfile.level} Elite</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>

            {/* Generated Progress panel */}
            {isDownloading && (
              <div className="bg-emerald-50 border-y border-emerald-100 px-6 py-2.5 flex items-center justify-between gap-4 animate-fade-in text-xs">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-brand-green animate-spin" />
                  <span className="font-bold text-emerald-800 text-[10.5px]">Generando documento certificado de ReciclApp...</span>
                </div>
                <div className="flex items-center gap-2.5 flex-1 max-w-sm">
                  <div className="w-full h-1.5 bg-emerald-150 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-green rounded-full transition-all duration-150" style={{ width: `${downloadProgress}%` }}></div>
                  </div>
                  <span className="text-[10.5px] font-mono font-bold text-emerald-800 shrink-0">{downloadProgress}%</span>
                </div>
              </div>
            )}

            {/* Modal Bottom control row */}
            <div className="px-6 py-4 bg-slate-50 border-t flex flex-col md:flex-row justify-between items-center gap-3">
              <span className="text-[9.5px] text-slate-400 leading-tight text-center md:text-left">
                Emisión oficial respaldada por la comunidad y el programa oficial de ReciclApp.
              </span>
              <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center">
                <button
                  type="button"
                  onClick={() => handleDownload('png')}
                  disabled={isDownloading}
                  className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs disabled:opacity-50"
                  title="Descargar certificado en formato de imagen de alta calidad PNG"
                >
                  <Download className="w-4 h-4 text-brand-green" />
                  <span>Descargar PNG</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload('jpg')}
                  disabled={isDownloading}
                  className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs disabled:opacity-50"
                  title="Descargar certificado en formato comprimido JPG"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Descargar JPG</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintCertificate}
                  disabled={isDownloading}
                  className="px-4 py-2.5 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
