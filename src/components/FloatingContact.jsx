import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';

export default function FloatingContact() {
  const settings = useSettings();
  const [open, setOpen] = useState(false);

  const phone   = settings.phone;
  const email   = settings.email;
  const whatsapp = settings.whatsapp || phone;

  if (!phone && !email) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col-reverse items-start gap-2">
      {/* Expanded options */}
      {open && (
        <div className="flex flex-col gap-2 mb-2 animate-fade-up">
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#25D366] text-white pl-3 pr-5 py-2.5 rounded-2xl shadow-lg text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </a>
          )}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-3 bg-white dark:bg-[#0f0f12] border border-stone-200 dark:border-white/10 text-stone-700 dark:text-white pl-3 pr-5 py-2.5 rounded-2xl shadow-lg text-sm font-semibold hover:border-green-400 dark:hover:border-yellow-400/40 transition-colors whitespace-nowrap"
            >
              <span className="w-8 h-8 bg-green-100 dark:bg-yellow-400/15 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-green-600 dark:text-yellow-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" />
                </svg>
              </span>
              {phone}
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-3 bg-white dark:bg-[#0f0f12] border border-stone-200 dark:border-white/10 text-stone-700 dark:text-white pl-3 pr-5 py-2.5 rounded-2xl shadow-lg text-sm font-semibold hover:border-green-400 dark:hover:border-yellow-400/40 transition-colors whitespace-nowrap"
            >
              <span className="w-8 h-8 bg-green-100 dark:bg-yellow-400/15 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-green-600 dark:text-yellow-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              {email}
            </a>
          )}
        </div>
      )}

      {/* Toggle button */}
      <div className="relative">
        {!open && (
          <span className="absolute inset-0 rounded-full bg-green-500 dark:bg-yellow-400 animate-ping opacity-30 pointer-events-none" />
        )}
        <button
          onClick={() => setOpen(v => !v)}
          aria-label="Холбоо барих"
          className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
            open
              ? 'bg-stone-200 dark:bg-white/10 rotate-45'
              : 'bg-green-600 dark:bg-yellow-400 hover:scale-110 active:scale-95'
          }`}
        >
          {open ? (
            <svg className="w-5 h-5 text-stone-700 dark:text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white dark:text-black" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
