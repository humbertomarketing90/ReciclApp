import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Phone, MapPin, Eye, EyeOff, ArrowLeft, Loader2, Sparkles, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { motion } from 'motion/react';

export default function RegisterScreen() {
  const { setActiveScreen, registerUser, authLoading, authError } = useAuth();

  // Form input states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('regular');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  // Field validation and interactive states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Password requirements calculation
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  // Simple strength rating color
  let strengthScore = 0;
  if (hasMinLength) strengthScore += 1;
  if (hasUppercase) strengthScore += 1;
  if (hasLowercase) strengthScore += 1;
  if (hasNumber) strengthScore += 1;

  const strengthLabel = 
    strengthScore === 0 ? 'Muy Débil' :
    strengthScore === 1 ? 'Débil' :
    strengthScore === 2 || strengthScore === 3 ? 'Media' : 'Excelente (Segura)';

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = 'El nombre completo es obligatorio.';
    }

    if (!email.trim()) {
      errors.email = 'El correo electrónico es obligatorio.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Introduce un correo con formato válido.';
    }

    if (!phone.trim()) {
      errors.phone = 'El número de teléfono es obligatorio.';
    } else if (!/^\+?[0-9]{7,15}$/.test(phone.replace(/[\s-]/g, ''))) {
      errors.phone = 'Introduce un número de teléfono con formato válido.';
    }

    if (!password) {
      errors.password = 'La contraseña es obligatoria.';
    } else {
      if (!hasMinLength) errors.password = 'Mínimo de 8 caracteres requerido.';
      else if (!hasUppercase || !hasLowercase || !hasNumber) {
        errors.password = 'Debe incluir mayúsculas, minúsculas y al menos un número.';
      }
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Debes confirmar la contraseña.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden.';
    }

    if (!city.trim()) {
      errors.city = 'La ciudad es obligatoria.';
    }

    if (!district.trim()) {
      errors.district = 'El distrito es obligatorio.';
    }

    if (!acceptedTerms) {
      errors.acceptedTerms = 'Debes aceptar los términos y condiciones para continuar.';
    }

    if (!acceptedPrivacy) {
      errors.acceptedPrivacy = 'Debes aceptar la política de privacidad.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    await registerUser({
      fullName,
      email,
      phone,
      password,
      role: selectedRole,
      city,
      district,
      acceptedTerms,
      acceptedPrivacyPolicy: acceptedPrivacy,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <button
          onClick={() => setActiveScreen('welcome')}
          className="absolute left-4 top-0 sm:-left-3 sm:-top-2 p-2 hover:bg-white rounded-xl border border-slate-100 bg-white/40 shadow-sm text-slate-500 hover:text-slate-700 transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>

        <h2 className="mt-8 text-center text-3xl font-extrabold font-display text-slate-900 tracking-tight">
          Crea tu cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Únete y recibe un bono ambiental inmediato de <b>+40 Eco-puntos</b> 🌱
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl relative z-10"
      >
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-100 rounded-3xl sm:px-10">
          
          <form className="space-y-5" onSubmit={handleRegisterSubmit}>
            
            {authError && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-700 font-medium text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                <p>{authError}</p>
              </div>
            )}

            {/* Input name and email block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                  Nombre Completo
                </label>
                <div className="relative rounded-2xl shadow-subtle">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (fieldErrors.fullName) setFieldErrors(prev => ({ ...prev, fullName: '' }));
                    }}
                    placeholder="Ana Mendoza"
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-brand-green/80 transition-all"
                  />
                </div>
                {fieldErrors.fullName && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.fullName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                  Correo electrónico
                </label>
                <div className="relative rounded-2xl shadow-subtle">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
                    }}
                    placeholder="ana@email.com"
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-brand-green/80 transition-all"
                  />
                </div>
                {fieldErrors.email && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.email}</p>}
              </div>
            </div>

            {/* Input Phone & Role selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                  Teléfono Móvil
                </label>
                <div className="relative rounded-2xl shadow-subtle">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="h-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    placeholder="+51987654321"
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-brand-green/80 transition-all"
                  />
                </div>
                {fieldErrors.phone && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                  Tipo de Cuenta (Rol)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('regular')}
                    className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer text-center ${
                      selectedRole === 'regular'
                        ? 'bg-emerald-50 border-brand-green text-brand-green ring-2 ring-emerald-100/55'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Usuario / Socio
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('collector')}
                    className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer text-center ${
                      selectedRole === 'collector'
                        ? 'bg-blue-50 border-blue-500 text-blue-600 ring-2 ring-blue-100'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Recolector 🚚
                  </button>
                </div>
              </div>
            </div>

            {/* City and District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                  Ciudad
                </label>
                <div className="relative rounded-2xl shadow-subtle">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <MapPin className="h-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (fieldErrors.city) setFieldErrors(prev => ({ ...prev, city: '' }));
                    }}
                    placeholder="Lima"
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-brand-green/80 transition-all"
                  />
                </div>
                {fieldErrors.city && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.city}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                  Distrito
                </label>
                <div className="relative rounded-2xl shadow-subtle">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <MapPin className="h-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      if (fieldErrors.district) setFieldErrors(prev => ({ ...prev, district: '' }));
                    }}
                    placeholder="Surco"
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-brand-green/80 transition-all"
                  />
                </div>
                {fieldErrors.district && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.district}</p>}
              </div>
            </div>

            {/* Input Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                  Contraseña
                </label>
                <div className="relative rounded-2xl shadow-subtle">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
                    }}
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-11 py-3 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-brand-green/80 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-5 h-5" /> : <Eye className="h-5 h-5" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">
                  Confirmar Contraseña
                </label>
                <div className="relative rounded-2xl shadow-subtle">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }}
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-11 py-3 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-brand-green/80 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 h-5" /> : <Eye className="h-5 h-5" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-500 font-medium">{fieldErrors.confirmPassword}</p>}
              </div>
            </div>

            {/* Interactive Password Strength indicators */}
            {password.length > 0 && (
              <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Fortaleza de contraseña:</span>
                  <span className={`text-[10px] font-black uppercase font-mono ${
                    strengthScore <= 1 ? 'text-red-500' : strengthScore <= 3 ? 'text-amber-500' : 'text-brand-green'
                  }`}>
                    {strengthLabel}
                  </span>
                </div>
                
                {/* Visual bar meter */}
                <div className="h-1.5 w-full bg-slate-200 rounded-full flex gap-1 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${
                    strengthScore >= 1 ? (strengthScore === 1 ? 'bg-red-500 w-1/4' : strengthScore <= 3 ? 'bg-amber-400 w-1/2' : 'bg-brand-green w-full') : 'bg-transparent'
                  }`} style={{ width: `${strengthScore * 25}%` }} />
                </div>

                {/* Individual checkoff requirements feedback */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] font-medium text-slate-605">
                  <div className="flex items-center gap-1.5">
                    {hasMinLength ? <Check className="w-3.5 h-3.5 text-brand-green bg-emerald-50 rounded p-0.5" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-350" />}
                    <span className={hasMinLength ? 'text-brand-green' : 'text-slate-450'}>Min. 8 caracteres</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasUppercase ? <Check className="w-3.5 h-3.5 text-brand-green bg-emerald-50 rounded p-0.5" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-350" />}
                    <span className={hasUppercase ? 'text-brand-green' : 'text-slate-450'}>Incluye Mayúscula</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasLowercase ? <Check className="w-3.5 h-3.5 text-brand-green bg-emerald-50 rounded p-0.5" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-350" />}
                    <span className={hasLowercase ? 'text-brand-green' : 'text-slate-450'}>Incluye Minúscula</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasNumber ? <Check className="w-3.5 h-3.5 text-brand-green bg-emerald-50 rounded p-0.5" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-350" />}
                    <span className={hasNumber ? 'text-brand-green' : 'text-slate-450'}>Incluye Número</span>
                  </div>
                </div>
              </div>
            )}

            {/* Checkboxes Terms & Privacy */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms-checkbox"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked);
                      if (fieldErrors.acceptedTerms) setFieldErrors(prev => ({ ...prev, acceptedTerms: '' }));
                    }}
                    className="h-4.5 w-4.5 rounded text-brand-green border-slate-300 focus:ring-brand-green cursor-pointer"
                  />
                </div>
                <div className="ml-3 text-xs">
                  <label htmlFor="terms-checkbox" className="font-semibold text-slate-700 cursor-pointer">
                    Acepto los términos y condiciones de servicio del Guardián Eco
                  </label>
                  {fieldErrors.acceptedTerms && <p className="text-red-505 text-[11px] font-semibold text-red-500">{fieldErrors.acceptedTerms}</p>}
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="privacy-checkbox"
                    type="checkbox"
                    checked={acceptedPrivacy}
                    onChange={(e) => {
                      setAcceptedPrivacy(e.target.checked);
                      if (fieldErrors.acceptedPrivacy) setFieldErrors(prev => ({ ...prev, acceptedPrivacy: '' }));
                    }}
                    className="h-4.5 w-4.5 rounded text-brand-green border-slate-300 focus:ring-brand-green cursor-pointer"
                  />
                </div>
                <div className="ml-3 text-xs">
                  <label htmlFor="privacy-checkbox" className="font-semibold text-slate-700 cursor-pointer">
                    Acepto la política de protección y privacidad de datos de ReciclApp
                  </label>
                  {fieldErrors.acceptedPrivacy && <p className="text-red-505 text-[11px] font-semibold text-red-500">{fieldErrors.acceptedPrivacy}</p>}
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button
              id="register-submit-btn"
              type="submit"
              disabled={authLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-semibold text-white bg-brand-green hover:bg-brand-green-dark transition-all duration-200 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Creando cuenta y preparando bono...
                </>
              ) : (
                <>
                  Registrarme y Ganar Bono 🌱
                </>
              )}
            </button>

          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                onClick={() => setActiveScreen('login')}
                className="font-bold text-brand-green hover:text-brand-green-dark cursor-pointer transition-colors"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
