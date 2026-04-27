import React from 'react';

export default function PageHero({ eyebrow, title, accent, subtitle, right, children }) {
  return (
    <div className="pt-28 pb-10 border-b border-stone-200 dark:border-white/[0.04] transition-colors duration-300">
      <div className="max-w-screen-xl mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            {eyebrow && (
              <div className="inline-flex items-center gap-3 mb-5 animate-fade-up">
                <div className="h-px w-7 bg-green-500/40 dark:bg-yellow-400/40" />
                <span className="text-green-600 dark:text-yellow-400/70 font-semibold uppercase tracking-[0.45em] text-[9px]">{eyebrow}</span>
              </div>
            )}
            <h1
              className="font-black text-stone-900 dark:text-white uppercase italic tracking-tighter leading-none animate-fade-up-delay-1"
              style={{ fontSize: 'clamp(2.8rem, 8vw, 6rem)' }}
            >
              {title}
              {accent && <span className="text-green-600 dark:text-yellow-400"> {accent}</span>}
            </h1>
            {subtitle && (
              <p className="text-stone-500 dark:text-white/35 text-sm leading-relaxed mt-4 max-w-md animate-fade-up-delay-2">
                {subtitle}
              </p>
            )}
          </div>
          {right && (
            <div className="shrink-0 animate-fade-up-delay-2">{right}</div>
          )}
        </div>
        {children && (
          <div className="mt-8 animate-fade-up-delay-2">{children}</div>
        )}
      </div>
    </div>
  );
}
