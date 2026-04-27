import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastCtx = createContext(null);

let id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((msg, type = 'info', duration = 3000) => {
    const key = ++id;
    setToasts(p => [...p, { key, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.key !== key)), duration);
  }, []);

  const toast = {
    success: (m, d) => push(m, 'success', d),
    error:   (m, d) => push(m, 'error',   d),
    info:    (m, d) => push(m, 'info',    d),
    warn:    (m, d) => push(m, 'warn',    d),
  };

  const icons = {
    success: <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />,
    error:   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />,
    warn:    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />,
    info:    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />,
  };
  const colors = {
    success: 'border-emerald-400/25 text-emerald-400',
    error:   'border-red-400/25     text-red-400',
    warn:    'border-yellow-400/25  text-yellow-400',
    info:    'border-white/15       text-white/70',
  };

  return (
    <ToastCtx.Provider value={toast}>
      {children}

      {/* Toasts container */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.key}
            className={`flex items-center gap-3 bg-[#0f0f14]/95 backdrop-blur-xl border ${colors[t.type]} px-5 py-3.5 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.7)] pointer-events-auto animate-scale-in min-w-[240px] max-w-sm`}>
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">{icons[t.type]}</svg>
            <span className="text-sm font-medium text-white/90">{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
};
