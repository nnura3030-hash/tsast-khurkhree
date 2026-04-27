import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const LABELS = {
  '':         'Нүүр',
  gers:       'Гэрүүд',
  ger:        'Гэр',
  trips:      'Аяллууд',
  trip:       'Аялал',
  foods:      'Хоолнууд',
  products:   'Дэлгүүр',
  product:    'Бараа',
  about:      'Бидний тухай',
  location:   'Байршил',
  nature:     'Байгаль',
  wildlife:   'Амьтад',
  resort:     'Ресорт',
  cart:       'Сагс',
  search:     'Хайлт',
  'company-rules': 'Дүрэм',
  terms:      'Нөхцөл',
};

export default function Breadcrumb({ overrides = {} }) {
  const { pathname } = useLocation();
  const parts = pathname.split('/').filter(Boolean);

  if (parts.length === 0) return null;

  const crumbs = [
    { label: 'Нүүр', to: '/' },
    ...parts.map((seg, i) => ({
      label: overrides[seg] || LABELS[seg] || seg,
      to: '/' + parts.slice(0, i + 1).join('/'),
    })),
  ];

  return (
    <nav className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-6">
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          {i < crumbs.length - 1 ? (
            <>
              <Link to={c.to} className="hover:text-yellow-400 transition-colors duration-150">{c.label}</Link>
              <svg className="w-2.5 h-2.5 text-white/15 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </>
          ) : (
            <span className="text-white/50">{c.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
