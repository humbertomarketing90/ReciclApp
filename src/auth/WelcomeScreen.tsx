import React from 'react';
import { Leaf, ArrowRight, ShieldCheck, Trophy, Landmark, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

export default function WelcomeScreen() {
  const { setActiveScreen, loginWithSocial, loginUser } = useAuth();

  // Test accounts list for reviewer ease of testing
  const demoAccounts = [
    { label: 'Socio / Regular', email: 'humbertomarketing90@gmail.com', pass: 'User12345!', icon: '🌱', color: 'hover:border-emerald-500/50 hover:bg-emerald-50/20' },
    { label: 'Recolector 🚚', email: 'collector@email.com', pass: 'Collector12345!', icon: '🚛', color: 'hover:border-blue-500/50 hover:bg-blue-50/20' },
    { label: 'Administrador ⚙️', email: 'admin@email.com', pass: 'Admin12345!', icon: '👑', color: 'hover:border-amber-500/50 hover:bg-amber-50/20' }
  ];

  const handleDemoSignIn = async (email: string, pass: string) => {
    await loginUser(email, pass);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background organic blurred accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-250 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-25 pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-16 h-16 rounded-2xl bg-brand-green flex items-center justify-center shadow-lg shadow-emerald-700/20"
          >
            <Leaf className="w-9 h-9 text-white fill-white" />
          </motion.div>
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 text-center text-3xl font-extrabold font-display text-slate-900 tracking-tight"
        >
          Bienvenido a <span className="text-brand-green">ReciclApp</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-2 text-center text-sm text-slate-500 max-w-xs mx-auto"
        >
          Recicla, gana puntos e impacta positivamente al planeta
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-100/80 rounded-3xl sm:px-10">
          
          {/* Main CTAs */}
          <div className="space-y-4">
            <button
              id="welcome-login-btn"
              onClick={() => setActiveScreen('login')}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-semibold text-white bg-brand-green hover:bg-brand-green-dark transition-all duration-200 cursor-pointer"
            >
              Iniciar sesión
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="welcome-register-btn"
              onClick={() => setActiveScreen('register')}
              className="w-full flex justify-center items-center py-3 px-4 border border-slate-200 hover:border-slate-300 rounded-2xl text-sm font-semibold text-slate-705 bg-white hover:bg-slate-50 transition-all duration-200 cursor-pointer"
            >
              Crear una cuenta nueva
            </button>
          </div>

          {/* Social divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-slate-400 uppercase font-bold tracking-wider font-mono">Conexión Rápida</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => loginWithSocial('google')}
                className="w-full inline-flex justify-center items-center gap-2 py-3 px-4 border border-slate-200 hover:border-slate-300 rounded-2xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer transition-all"
              >
                {/* Simulated Google Logo / SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.65 1.58 14.97 1 12 1 7.24 1 3.19 3.73 1.24 7.72l3.87 3a7.03 7.03 0 0 1 6.89-5.68z"/>
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.44a5.5 5.5 0 0 1-2.39 3.61l3.71 2.88c2.17-2 3.73-4.94 3.73-8.65z"/>
                  <path fill="#FBBC05" d="M5.11 14.73A7 7 0 0 1 12 17c1.66 0 3.2-.57 4.38-1.69l3.27 3.27A11.94 11.94 0 0 1 12 23c-4.76 0-8.81-2.73-10.76-6.72l3.87-3z"/>
                  <path fill="#34A853" d="M1.24 7.72l3.87 3a7 7 0 0 1 0 5.46l-3.87 3C-.4 15.69-1 13.91-1 12c0-1.91.6-3.69 2.24-5.28z"/>
                </svg>
                Google
              </button>

              <button
                onClick={() => loginWithSocial('apple')}
                className="w-full inline-flex justify-center items-center gap-2 py-3 px-4 border border-slate-200 hover:border-slate-300 rounded-2xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer transition-all"
              >
                {/* Simulated Apple Icon */}
                <svg className="w-4 h-4 fill-slate-800" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.09 2.48-1.36.03-1.8-.8-3.36-.8-1.56 0-2.04.77-3.34.82-1.33.05-2.34-1.31-3.18-2.52-1.72-2.48-3.02-7-1.24-10.08.88-1.53 2.45-2.5 4.16-2.53 1.29-.02 2.51.87 3.3.87.78 0 2.24-.1 3.77.47 1.48.55 2.63 1.9 3.09 3.65-3.05 1.83-2.57 5.7.5 6.94-1.15 2.65-2.56 5.17-3.9 6.64zm-3.6-17.7a5.1 5.1 0 0 0-1.15 3.71c1.23.11 2.47-.58 3.12-1.35.66-.77 1.22-1.92.93-3.67-1.35.08-2.56.84-2.9 1.31z"/>
                </svg>
                Apple ID
              </button>
            </div>
          </div>

          {/* Quick Reviewer Tool Sandbox Panel */}
          <div className="mt-8 pt-6 border-t border-slate-100 bg-slate-50/60 -mx-4 px-4 sm:-mx-10 sm:px-10 rounded-b-3xl">
            <h4 className="text-xs font-bold text-slate-500 uppercase font-mono tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-green animate-bounce" /> Acceso Rápido de Prueba (Demo)
            </h4>
            <p className="text-[11px] text-slate-500 leading-normal mb-4">
              Para reviewers o demo, pulsa una cuenta pre-configurada para testear el flujo de inmediato sin llenar formularios:
            </p>
            <div className="space-y-2">
              {demoAccounts.map((account, i) => (
                <button
                  key={i}
                  id={`demo-login-${account.label.toLowerCase().replace(/[^a-z]/g, '')}`}
                  onClick={() => handleDemoSignIn(account.email, account.pass)}
                  className={`w-full flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-white text-left transition-all ${account.color} cursor-pointer shadow-subtle`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{account.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{account.label}</p>
                      <p className="text-[10px] font-mono text-slate-400">{account.email}</p>
                    </div>
                  </div>
                  <div className="text-[10px] bg-slate-150 font-semibold px-2 py-1 rounded text-slate-500 uppercase font-mono">
                    Entrar
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </motion.div>

      {/* Feature Badges below container */}
      <div className="mt-8 text-center max-w-sm mx-auto grid grid-cols-3 gap-2 px-4">
        <div className="flex flex-col items-center p-3 bg-white/70 backdrop-blur rounded-2xl border border-slate-100/50">
          <ShieldCheck className="w-5 h-5 text-brand-green mb-1" />
          <span className="text-[10px] font-semibold text-slate-600">Eco-Seguro</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-white/70 backdrop-blur rounded-2xl border border-slate-100/50">
          <Trophy className="w-5 h-5 text-amber-505 text-brand-green mb-1" />
          <span className="text-[10px] font-semibold text-slate-600">Premios</span>
        </div>
        <div className="flex flex-col items-center p-3 bg-white/70 backdrop-blur rounded-2xl border border-slate-100/50">
          <Landmark className="w-5 h-5 text-brand-green mb-1" />
          <span className="text-[10px] font-semibold text-slate-600">Impacto 0</span>
        </div>
      </div>
    </div>
  );
}
