import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

export default function ForgotPasswordScreen() {
  const { setActiveScreen, resetPassword, authLoading, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [emailValidationError, setEmailValidationError] = useState('');

  const handleValidation = () => {
    if (!email.trim()) {
      setEmailValidationError('Introduce tu dirección de correo electrónico.');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailValidationError('Introduce un formato de correo electrónico válido.');
      return false;
    }
    setEmailValidationError('');
    return true;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleValidation()) return;
    
    const success = await resetPassword(email);
    if (success) {
      setSubmittedSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <button
          onClick={() => setActiveScreen('login')}
          className="absolute left-4 top-0 sm:-left-3 sm:-top-2 p-2 hover:bg-white rounded-xl border border-slate-100 bg-white/40 shadow-sm text-slate-500 hover:text-slate-700 transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Login
        </button>

        <h2 className="mt-8 text-center text-3xl font-extrabold font-display text-slate-900 tracking-tight">
          Recuperar contraseña
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Enviaremos un enlace para ingresar de nuevo a tu perfil ambiental
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-100 rounded-3xl sm:px-10">
          
          {submittedSuccess ? (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="text-center space-y-5"
            >
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-emerald-100 border-2 border-emerald-50 text-brand-green">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-905">Verifica tu bandeja de entrada</h3>
                <p className="text-sm text-slate-500 leading-normal">
                  Te enviamos un enlace para restablecer tu contraseña a <b>{email}</b>. Revisa spam si no lo ves en unos minutos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSubmittedSuccess(false);
                  setActiveScreen('login');
                }}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-semibold text-white bg-brand-green hover:bg-brand-green-dark transition-all cursor-pointer"
              >
                Volver al Inicio de Sesión
              </button>
            </motion.div>
          ) : (
            <form className="space-y-5" onSubmit={handleFormSubmit}>
              
              {authError && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-700 font-medium text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                  <p>{authError}</p>
                </div>
              )}

              <div>
                <label htmlFor="reset-email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                  Correo electrónico registrado
                </label>
                <div className="relative rounded-2xl shadow-subtle">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 h-5 text-slate-400" />
                  </div>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailValidationError) setEmailValidationError('');
                    }}
                    placeholder="ejemplo@correo.com"
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-brand-green/80 transition-all"
                  />
                </div>
                {emailValidationError && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{emailValidationError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-semibold text-white bg-brand-green hover:bg-brand-green-dark transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Enviando correo de recuperación...
                  </>
                ) : (
                  'Enviar link de recuperación'
                )}
              </button>

            </form>
          )}

        </div>
      </motion.div>
    </div>
  );
}
