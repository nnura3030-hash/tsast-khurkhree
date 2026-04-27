import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/PageHero';
import api from '../services/api';

const ACCENT = [
  { text: 'text-blue-400',   color: '#60a5fa' },
  { text: 'text-amber-400',  color: '#fbbf24' },
  { text: 'text-purple-400', color: '#c084fc' },
  { text: 'text-emerald-400',color: '#34d399' },
  { text: 'text-red-400',    color: '#f87171' },
  { text: 'text-yellow-400', color: '#facc15' },
];

export default function Location() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.get('/api/settings').then(r => setSettings(r.data || {})).catch(() => {});
  }, []);

  const imgUrl = (key) =>
    settings[key] ? `${api.defaults.baseURL}/uploads/${settings[key]}` : null;

  const cards = [
    {
      icon:  settings.locationCard1Icon  || '📍',
      title: settings.locationCard1Title || 'Байршил',
      body:  settings.locationCard1Body  || 'Баян-Өлгий аймгийн Цэнгэл сумын нутагт, Бага Түргэний хүрхрээний дэргэд байрлана. Баян-Өлгийн төвөөс 150км.',
      img:   imgUrl('locationCard1Img'),
      type: 'text',
    },
    {
      icon:  settings.locationCard2Icon  || '🚗',
      title: settings.locationCard2Title || 'Авто замын удирдамж',
      body:  settings.locationCard2Body  || 'Улаанбаатараас: 1200км · 2–3 хоног\nБаян-Өлгийн төвөөс: 150км · 3–4 цаг\nЦэнгэл сумаас: 80км · 1.5–2 цаг\nЗам: зуны нөхцөл сайн, өвөл хэцүү',
      img:   imgUrl('locationCard2Img'),
      type: 'list',
    },
    {
      icon:  settings.locationCard3Icon  || '✈️',
      title: settings.locationCard3Title || 'Агаарын үйлчилгээ',
      body:  settings.locationCard3Body  || 'MIAT: Улаанбаатар → Баян-Өлгий · 2 цаг\nНислэг долоо хоног бүр байдаг\nБаян-Өлгийгоос такси/авто байна',
      img:   imgUrl('locationCard3Img'),
      type: 'list',
    },
    {
      icon:  settings.locationCard4Icon  || '🌡️',
      title: settings.locationCard4Title || 'Уур амьсгал',
      img:   imgUrl('locationCard4Img'),
      type: 'stats',
      stats: [
        { value: settings.locationStat1Value || '1800м', label: settings.locationStat1Label || 'Далайн түвшнээс' },
        { value: settings.locationStat2Value || '−20°',  label: settings.locationStat2Label || 'Өвлийн хүйтэн'  },
        { value: settings.locationStat3Value || '+25°',  label: settings.locationStat3Label || 'Зуны дулаан'    },
      ],
    },
    {
      icon:  settings.locationCard5Icon  || '🏥',
      title: settings.locationCard5Title || 'Ойрын үйлчилгээ',
      body:  settings.locationCard5Body  || 'Цэнгэл сумын эмнэлэг: 80км\nБаян-Өлгийн эмнэлэг: 150км\nДэлгүүр: сумын төвд байна\nХолбоо: 2G/3G сүлжээ',
      img:   imgUrl('locationCard5Img'),
      type: 'list',
    },
    {
      icon:  settings.locationCard6Icon  || '💡',
      title: settings.locationCard6Title || 'Зөвлөмж',
      body:  settings.locationCard6Body  || 'Хангамжаа Баян-Өлгийгоос бүрдүүлнэ\nАнхны тусламжийн хайрцаг авчирна\nУлирлын нөхцөлийн мэдээллийг авна\nДулаан хувцас заавал хэрэгтэй',
      img:   imgUrl('locationCard6Img'),
      type: 'list',
    },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Байршил мэдээлэл"
        title="Газрын"
        accent="тухай"
        subtitle="Баян-Өлгий аймаг · Цэнгэл сум · Монгол · 1800м өндөр"
        right={
          <Link to="/gers"
            className="inline-flex items-center gap-2 bg-yellow-400 text-black px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white transition-all duration-200 active:scale-95">
            Захиалга хийх
          </Link>
        }
      />

      <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-10 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card, i) => {
            const { text: accentText, color: accentColor } = ACCENT[i] || ACCENT[0];
            const items = card.body ? card.body.split('\n').filter(Boolean) : [];

            return (
              <div key={i}
                className="group relative overflow-hidden rounded-2xl border border-white/6 hover:border-white/15 transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 60}ms`, minHeight: '200px' }}>

                {/* Background image */}
                {card.img && (
                  <img src={card.img} alt={card.title} loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover brightness-[0.3] group-hover:brightness-[0.42] group-hover:scale-105 transition-all duration-700" />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0"
                  style={{
                    background: card.img
                      ? 'linear-gradient(160deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.75) 100%)'
                      : `radial-gradient(ellipse at 20% 20%, ${accentColor}0d, transparent 60%), #ffffff04`,
                  }} />

                {/* Accent top border */}
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, ${accentColor}50, transparent)` }} />

                {/* Content */}
                <div className="relative z-10 p-6">
                  <div className={`text-2xl mb-3 ${accentText}`}>{card.icon}</div>
                  <h3 className={`font-bold text-base uppercase tracking-tight mb-4 ${accentText}`}>
                    {card.title}
                  </h3>

                  {card.type === 'text' && (
                    <p className="text-white/50 text-sm leading-relaxed">{card.body}</p>
                  )}

                  {card.type === 'list' && (
                    <ul className="space-y-2">
                      {items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-white/45 text-sm leading-relaxed">
                          <span className={`shrink-0 mt-1 ${accentText}`}>·</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}

                  {card.type === 'stats' && (
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {card.stats.map((s, j) => (
                        <div key={j} className="text-center">
                          <p className={`text-xl font-black italic leading-none mb-1 ${accentText}`}>{s.value}</p>
                          <p className="text-[9px] font-semibold text-white/25 uppercase tracking-widest leading-tight">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Map placeholder */}
        <div className="mt-8 rounded-2xl border border-white/6 overflow-hidden bg-white/[0.02] aspect-video flex items-center justify-center">
          <div className="text-center">
            <p className="text-4xl mb-3">🗺️</p>
            <p className="text-white/25 text-sm font-semibold uppercase tracking-widest">Цэнгэл сум, Баян-Өлгий</p>
            <p className="text-white/15 text-xs mt-1">48.94°N, 88.13°E</p>
          </div>
        </div>
      </div>
    </div>
  );
}
