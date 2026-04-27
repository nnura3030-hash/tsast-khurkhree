import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const SocialLink = ({ href, children }) => {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className="w-9 h-9 rounded-full border border-stone-200 dark:border-white/8 flex items-center justify-center text-stone-400 dark:text-white/30 hover:text-green-600 dark:hover:text-yellow-400 hover:border-green-300 dark:hover:border-yellow-400/30 hover:bg-green-50 dark:hover:bg-transparent transition-all duration-200">
      {children}
    </a>
  );
};

export default function Footer() {
  const [settings, setSettings] = useState({});
  useEffect(() => {
    api.get('/api/settings').then(r => setSettings(r.data || {})).catch(() => {});
  }, []);

  const brand = settings.brandName?.split('-') || ['Цаст', 'Хүрхрээ'];
  const year  = new Date().getFullYear();

  const SERVICES = [
    { to: '/gers',     label: 'Гэр захиалга' },
    { to: '/trips',    label: 'Аяллууд'       },
    { to: '/foods',    label: 'Хоол'          },
    { to: '/products', label: 'Дэлгүүр'       },
  ];
  const COMPANY = [
    { to: '/about',         label: 'Бидний тухай' },
    { to: '/nature',        label: 'Байгаль'       },
    { to: '/wildlife',      label: 'Амьтад'        },
    { to: '/company-rules', label: 'Дүрэм'         },
    { to: '/terms',         label: 'Нөхцөл'        },
  ];

  return (
    <footer className="bg-white dark:bg-[#060607] border-t border-stone-200 dark:border-white/[0.04] text-stone-500 dark:text-white/40 transition-colors duration-300">
      <div className="h-px bg-gradient-to-r from-transparent via-green-400/30 dark:via-white/8 to-transparent" />

      <div className="max-w-screen-xl mx-auto px-6 md:px-10 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

          {/* brand */}
          <div className="md:col-span-4 space-y-6">
            <Link to="/" className="inline-block">
              <p className="text-2xl font-black text-stone-900 dark:text-white uppercase italic tracking-tighter">
                {brand[0]}<span className="text-stone-300 dark:text-white/15 mx-1">·</span>
                <span className="text-green-600 dark:text-yellow-400">{brand.slice(1).join('-') || 'Хүрхрээ'}</span>
              </p>
              <p className="text-[9px] text-stone-400 dark:text-white/20 tracking-[0.35em] uppercase font-medium mt-0.5">Resort · Bayan-Ölgii · Mongolia</p>
            </Link>

            <p className="text-sm text-stone-500 dark:text-white/30 leading-relaxed max-w-xs">
              Алтайн уулсын зүрхэнд, байгалийн онгон төрхтэй таниулах таны адал явдал эндээс эхэлнэ.
            </p>

            <div className="flex items-center gap-2">
              <SocialLink href={settings.facebook}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
              </SocialLink>
              <SocialLink href={settings.instagram}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" /></svg>
              </SocialLink>
              <SocialLink href={settings.twitter}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </SocialLink>
            </div>
          </div>

          {/* services */}
          <div className="md:col-span-2 space-y-5">
            <h4 className="text-stone-900 dark:text-white/60 text-[10px] font-bold uppercase tracking-[0.3em]">Үйлчилгээ</h4>
            <ul className="space-y-3">
              {SERVICES.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-stone-500 dark:text-white/40 hover:text-green-600 dark:hover:text-yellow-400 transition-colors duration-150 hover:translate-x-0.5 inline-block">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* company */}
          <div className="md:col-span-2 space-y-5">
            <h4 className="text-stone-900 dark:text-white/60 text-[10px] font-bold uppercase tracking-[0.3em]">Компани</h4>
            <ul className="space-y-3">
              {COMPANY.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-stone-500 dark:text-white/40 hover:text-green-600 dark:hover:text-yellow-400 transition-colors duration-150 hover:translate-x-0.5 inline-block">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* contact */}
          <div className="md:col-span-4 space-y-5">
            <h4 className="text-stone-900 dark:text-white/60 text-[10px] font-bold uppercase tracking-[0.3em]">Холбоо барих</h4>
            <ul className="space-y-4 text-sm">
              {[
                { icon: <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />, val: settings.phone || '+976 8888 8888' },
                { icon: <><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></>, val: settings.email || 'info@tsastkhurkhree.mn' },
                { icon: <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />, val: settings.address || 'Баян-Өлгий, Цэнгэл сум, Монгол' },
              ].map((c, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="h-4 w-4 text-green-500 dark:text-yellow-400/50 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">{c.icon}</svg>
                  <span className="text-stone-600 dark:text-white/40">{c.val}</span>
                </li>
              ))}
            </ul>
            <Link to="/location"
              className="inline-flex items-center gap-2 text-[10px] font-semibold text-green-600 dark:text-yellow-400/70 hover:text-green-700 dark:hover:text-yellow-400 uppercase tracking-widest transition-colors group">
              Газрын зураг харах
              <svg className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>

        {/* bottom bar */}
        <div className="border-t border-stone-100 dark:border-white/[0.04] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400 dark:text-white/20">
          <p>&copy; {year} {settings.brandName || 'Цаст-Хүрхрээ'} Resort. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/terms"         className="hover:text-stone-600 dark:hover:text-white/50 transition-colors">Үйлчилгээний нөхцөл</Link>
            <Link to="/company-rules" className="hover:text-stone-600 dark:hover:text-white/50 transition-colors">Дүрэм</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
