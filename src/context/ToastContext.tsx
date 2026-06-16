import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Info, Sparkles, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'reward';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType, duration = 4000) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Toast Render Overlay */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            let icon = <Info className="w-5 h-5 text-indigo-500" />;
            let bgClass = 'bg-white border-slate-100';
            let textClass = 'text-slate-800';
            
            if (toast.type === 'success') {
              icon = <CheckCircle2 className="w-5 h-5 text-brand-green" />;
              bgClass = 'bg-emerald-50/95 backdrop-blur-md border-emerald-100/80';
              textClass = 'text-neutral-850';
            } else if (toast.type === 'error') {
              icon = <XCircle className="w-5 h-5 text-red-500" />;
              bgClass = 'bg-red-50/95 backdrop-blur-md border-red-100/80';
              textClass = 'text-red-900';
            } else if (toast.type === 'reward') {
              icon = <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />;
              bgClass = 'bg-amber-50/95 backdrop-blur-md border-amber-200/80 shadow-md shadow-amber-100/30';
              textClass = 'text-amber-950 font-semibold';
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9, transition: { duration: 0.15 } }}
                layout
                className={`p-4 rounded-xl border shadow-lg flex items-start gap-3 pointer-events-auto ${bgClass} ${textClass}`}
              >
                <div className="flex-shrink-0 mt-0.5">{icon}</div>
                <div className="flex-1 text-sm font-medium leading-normal">
                  {toast.message}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 p-0.5 opacity-50 hover:opacity-100 transition-opacity rounded-lg hover:bg-black/5"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
