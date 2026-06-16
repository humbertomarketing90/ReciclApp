import React, { useState } from 'react';
import { Camera, MapPin, Bell, Check, ArrowRight, Loader2, Info, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

export default function CompleteProfileScreen() {
  const { completeUserProfile, currentUserRecord, authLoading } = useAuth();

  // Avatar Options
  const avatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150"
  ];

  // Component state based on recommended users schema
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0]);
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [mainAddress, setMainAddress] = useState('');
  const [city, setCity] = useState(currentUserRecord?.city || 'Lima');
  const [district, setDistrict] = useState(currentUserRecord?.district || 'Surco');

  // Interactive waste categories
  const [recyclingPrefs, setRecyclingPrefs] = useState({
    plastic: true,
    paper: true,
    glass: true,
    metal: true,
    organic: false,
    electronic: false
  });

  // Opt-in notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    pickups: true,
    reports: true,
    rewards: true,
    marketplace: true
  });

  // Simulated Permissions Grant
  const [locationGranted, setLocationGranted] = useState(false);
  const [notificationsGranted, setNotificationsGranted] = useState(false);

  const toggleWastePref = (key: keyof typeof recyclingPrefs) => {
    setRecyclingPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await completeUserProfile({
      profileImageUrl: profileImageUrl || selectedAvatar,
      mainAddress,
      city,
      district,
      recyclingPreferences: recyclingPrefs,
      notificationPrefs,
      locationGranted,
      notificationsGranted
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10 text-center">
        <h2 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight">
          Completa tu Bio Ambiental
        </h2>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
          Ayúdanos a personalizar la experiencia ecológica según tus hábitos y geolocalización.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 sm:mx-auto sm:w-full sm:max-w-2xl relative z-10"
      >
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-100 rounded-3xl sm:px-10">
          <form onSubmit={handleCompleteSubmit} className="space-y-6">

            {/* Avatar & Photo selector section */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 font-mono">
                1. Foto de perfil
              </h3>
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <div className="relative">
                  <img
                    src={profileImageUrl || selectedAvatar}
                    alt="Current Avatar"
                    className="w-18 h-18 rounded-full object-cover border-2 border-brand-green p-0.5"
                  />
                  <div className="absolute bottom-0 right-0 p-1.5 bg-brand-green text-white rounded-full border-2 border-white">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex-1 w-full space-y-3">
                  <p className="text-xs text-slate-500 text-center sm:text-left">
                    Selecciona un avatar de la galería o ingresa la URL de tu foto:
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    {avatars.map((ava, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedAvatar(ava);
                          setProfileImageUrl('');
                        }}
                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                          selectedAvatar === ava && !profileImageUrl ? 'border-brand-green scale-110' : 'border-slate-200 hover:border-slate-350'
                        }`}
                      >
                        <img src={ava} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <input
                    type="url"
                    value={profileImageUrl}
                    onChange={(e) => {
                      setProfileImageUrl(e.target.value);
                      setSelectedAvatar('');
                    }}
                    placeholder="O inserta una URL (ej. https://...)"
                    className="block w-full py-2 px-3 border border-slate-200 rounded-xl text-xs text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-green/80"
                  />
                </div>
              </div>
            </div>

            {/* Address setup */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 font-mono">
                2. Ubicación y domicilio de recojo
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-505 mb-1.5">
                    Dirección principal (Calle, Avenida, Casa, Dpto)
                  </label>
                  <div className="relative rounded-2xl shadow-subtle">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <MapPin className="h-5 h-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={mainAddress}
                      onChange={(e) => setMainAddress(e.target.value)}
                      placeholder="Av. San Luis 2050, San Borja"
                      className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-brand-green/80"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-505 mb-1">Ciudad</label>
                    <input
                      type="text"
                      className="block w-full py-2.5 px-4 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-brand-green"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-505 mb-1">Distrito</label>
                    <input
                      type="text"
                      className="block w-full py-2.5 px-4 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:ring-2 focus:ring-emerald-100 focus:border-brand-green"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recycling preferences */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 font-mono">
                3. Preferencias de Clasificación de Residuos
              </h3>
              <p className="text-xs text-slate-450 leading-normal mb-3">
                Selecciona las categorías que sueles generar u organizar en tu hogar para el plan de recojo:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { key: 'plastic', label: 'Plástico 🥤' },
                  { key: 'paper', label: 'Papel y Cartón 📦' },
                  { key: 'glass', label: 'Vidrio/Cristal 🍾' },
                  { key: 'metal', label: 'Latas y Metal 🥫' },
                  { key: 'organic', label: 'Orgánicos 🍎' },
                  { key: 'electronic', label: 'Electrónicos 💻' }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleWastePref(item.key as keyof typeof recyclingPrefs)}
                    className={`py-3 px-3 rounded-2xl border transition-all text-xs font-semibold cursor-pointer text-center relative ${
                      recyclingPrefs[item.key as keyof typeof recyclingPrefs]
                        ? 'bg-emerald-50 border-brand-green text-brand-green ring-1 ring-emerald-500/20'
                        : 'bg-white border-slate-150 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                    {recyclingPrefs[item.key as keyof typeof recyclingPrefs] && (
                      <span className="absolute top-1 right-1 p-0.5 bg-brand-green text-white rounded-full">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Permissions request dialogue simulators */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 font-mono">
                4. Permisos de la aplicación
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center p-4 border border-slate-205 rounded-2xl text-center space-y-2 bg-slate-50/60 hover:bg-white transition-all">
                  <MapPin className={`w-7 h-7 ${locationGranted ? 'text-brand-green fill-emerald-100' : 'text-slate-400'}`} />
                  <div>
                    <h4 className="text-xs font-bold text-slate-850">Geolocalización en Vivo</h4>
                    <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Ubica contenedores y sigue al recolector en tiempo real.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocationGranted(!locationGranted)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                      locationGranted ? 'bg-brand-green text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-650'
                    }`}
                  >
                    {locationGranted ? 'Otorgado' : 'Habilitar'}
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center p-4 border border-slate-205 rounded-2xl text-center space-y-2 bg-slate-50/60 hover:bg-white transition-all">
                  <Bell className={`w-7 h-7 ${notificationsGranted ? 'text-brand-green fill-emerald-100 animate-swing' : 'text-slate-400'}`} />
                  <div>
                    <h4 className="text-xs font-bold text-slate-850 font-sans">Notificaciones Push</h4>
                    <p className="text-[10px] text-slate-400 leading-normal mt-0.5 font-sans">Recibe alertas sobre tu recolector y ofertas del trueque.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotificationsGranted(!notificationsGranted)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                      notificationsGranted ? 'bg-brand-green text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-650'
                    }`}
                  >
                    {notificationsGranted ? 'Otorgado' : 'Habilitar'}
                  </button>
                </div>
              </div>
            </div>

            {/* Finish profile completion */}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-semibold text-white bg-brand-green hover:bg-brand-green-dark transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Almacenando datos en Firestore...
                </>
              ) : (
                <>
                  Finalizar Configuración de Guardián Eco
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>

          </form>
        </div>
      </motion.div>
    </div>
  );
}
