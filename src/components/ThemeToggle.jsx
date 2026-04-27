import React from 'react';
import { useTheme } from '../context/ThemeContext';

/* ─── Inline pill toggle (header-д ашиглана) ─── */
export function ThemePill({ className = '' }) {
  const { dark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Горим солих"
      className={`relative flex items-center h-8 rounded-full p-0.5 transition-all duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
        dark
          ? 'bg-[#1a1a1e] border border-white/10 focus-visible:ring-yellow-400'
          : 'bg-stone-100 border border-stone-200 focus-visible:ring-green-500'
      } ${className}`}
      style={{ width: '4.5rem' }}
    >
      {/* sliding knob */}
      <span
        className={`absolute top-0.5 bottom-0.5 w-[calc(50%-1px)] rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-sm ${
          dark
            ? 'left-[calc(50%+1px)] bg-yellow-400 shadow-yellow-400/20'
            : 'left-0.5 bg-white shadow-stone-200'
        }`}
      />

      {/* sun icon */}
      <span className={`relative z-10 flex-1 flex items-center justify-center transition-all duration-300 ${
        !dark ? 'text-green-600' : 'text-white/20'
      }`}>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <circle cx="12" cy="12" r="5" />
          <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </span>

      {/* moon icon */}
      <span className={`relative z-10 flex-1 flex items-center justify-center transition-all duration-300 ${
        dark ? 'text-[#080809]' : 'text-stone-400'
      }`}>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
        </svg>
      </span>
    </button>
  );
}

/* ─── Floating fixed button (bottom-right) ─── */
export function ThemeFloating() {
  const { dark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Горим солих"
      className={`fixed bottom-6 right-6 z-[100] group flex items-center gap-2.5 h-10 rounded-full px-4 text-[11px] font-bold uppercase tracking-widest transition-all duration-500 shadow-xl focus:outline-none active:scale-95 ${
        dark
          ? 'bg-yellow-400 text-black shadow-yellow-400/20 hover:bg-white hover:shadow-white/20'
          : 'bg-stone-900 text-white shadow-stone-900/20 hover:bg-green-600 hover:shadow-green-600/25'
      }`}
    >
      {/* animated icon */}
      <span className="relative w-4 h-4 shrink-0">
        {/* sun */}
        <svg className={`absolute inset-0 w-4 h-4 transition-all duration-500 ${dark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <circle cx="12" cy="12" r="5" />
          <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
        {/* moon */}
        <svg className={`absolute inset-0 w-4 h-4 transition-all duration-500 ${!dark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
        </svg>
      </span>

      <span className="transition-all duration-300">
        {dark ? 'Light mode' : 'Dark mode'}
      </span>
    </button>
  );
}
