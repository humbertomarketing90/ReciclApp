import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, Loader2, Sparkles, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

export default function LoginScreen() {
  const { setActiveScreen, loginUser, authLoading, authError, loginWithSocial } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const handleValidation = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = 'El correo electrónico no puede estar vacío.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Por favor, introduce un formato de correo válido.';
    }
    if (!password) {
      errors.password = 'La contraseña no puede estar vacía.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleValidation()) return;
    await loginUser(email, password);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <button
          onClick={() => setActiveScreen('welcome')}
          className="absolute left-4 top-0 sm:-left-3 sm:-top-2 p-2 hover:bg-white rounded-xl border border-slate-100 bg-white/40 shadow-sm text-slate-500 hover:text-slate-700 transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>

        <h2 className="mt-8 text-center text-3xl font-extrabold font-display text-slate-900 tracking-tight">
          Iniciar sesión
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Clasifica y canjea tus residuos en segundos
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-100 rounded-3xl sm:px-10">
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Server authError message requested */}
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-100 text-red-700 font-medium text-xs rounded-xl flex items-start gap-2.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <p>{authError}</p>
              </motion.div>
            )}

            {/* Email input field */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                Correo electrónico
              </label>
              <div className="relative rounded-2xl shadow-subtle">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 h-5 text-slate-400" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  placeholder="ejemplo@correo.com"
                  className={`block w-full pl-11 pr-4 py-3 border rounded-2xl text-slate-800 placeholder-slate-400 leading-normal transition-all text-sm focus:outline-none focus:ring-2 ${
                    fieldErrors.email 
                      ? 'border-red-350 focus:ring-red-100 focus:border-red-400' 
                      : 'border-slate-200 focus:ring-emerald-100 focus:border-brand-green/80'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs text-red-500 font-medium">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password input field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="login-password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setActiveScreen('forgot-password')}
                  className="text-xs font-semibold text-brand-green hover:text-brand-green-dark cursor-pointer transition-colors"
                >
                  ¿Olvidé mi contraseña?
                </button>
              </div>
              <div className="relative rounded-2xl shadow-subtle">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 h-5 text-slate-400" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••"
                  className={`block w-full pl-11 pr-11 py-3 border rounded-2xl text-slate-800 placeholder-slate-400 leading-normal transition-all text-sm focus:outline-none focus:ring-2 ${
                    fieldErrors.password 
                      ? 'border-red-300 focus:ring-red-100 focus:border-red-400' 
                      : 'border-slate-200 focus:ring-emerald-100 focus:border-brand-green/80'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-5 h-5" /> : <Eye className="h-5 h-5" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-xs text-red-500 font-medium">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={authLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-semibold text-white bg-brand-green hover:bg-brand-green-dark transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Verificando credenciales...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>

          </form>

          {/* Social login buttons */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-150"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-slate-400 uppercase font-mono font-bold tracking-wider">O continuar con</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => loginWithSocial('google')}
                className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 border border-slate-200 hover:border-slate-350 rounded-2xl text-xs font-semibold text-slate-705 bg-white hover:bg-slate-50 transition-all cursor-pointer"
              >
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
                className="w-full inline-flex justify-center items-center gap-2 py-2.5 px-4 border border-slate-200 hover:border-slate-350 rounded-2xl text-xs font-semibold text-slate-705 bg-white hover:bg-slate-50 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 fill-slate-850" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.09 2.48-1.36.03-1.8-.8-3.36-.8-1.56 0-2.04.77-3.34.82-1.33.05-2.34-1.31-3.18-2.52-1.72-2.48-3.02-7-1.24-10.08.88-1.53 2.45-2.5 4.16-2.53 1.29-.02 2.51.87 3.3.87.78 0 2.24-.1 3.77.47 1.48.55 2.63 1.9 3.09 3.65-3.05 1.83-2.57 5.7.5 6.94-1.15 2.65-2.56 5.17-3.9 6.64zm-3.6-17.7a5.1 5.1 0 0 0-1.15 3.71c1.23.11 2.47-.58 3.12-1.35.66-.77 1.22-1.92.93-3.67-1.35.08-2.56.84-2.9 1.31z"/>
                </svg>
                Apple ID
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              ¿No tienes una cuenta?{' '}
              <button
                type="button"
                onClick={() => setActiveScreen('register')}
                className="font-bold text-brand-green hover:text-brand-green-dark cursor-pointer transition-colors"
              >
                Regístrate aquí
              </button>
            </p>
          </div>

          {/* Quick Pre-fill tip */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
            <KeyRound className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Tip: Puedes usar <b>humbertomarketing90@gmail.com</b> y clave <b>User12345!</b> para ingresar como Socio.
            </span>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
