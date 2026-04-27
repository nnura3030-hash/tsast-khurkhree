import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useIntersection } from '../hooks/useIntersection';
import { useCountUp } from '../hooks/useCountUp';
import { useTheme } from '../context/ThemeContext';

/* ─────────────────────────────── constants ─── */
const fallbackImg = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2070';

const STATS = [
  { raw: '1000+', value: '1000', suffix: '+', label: 'Нийт аялагч',   en: 'Happy Guests' },
  { raw: '20+',   value: '20',   suffix: '+', label: 'Монгол гэр',    en: 'Private Gers' },
  { raw: '5',     value: '5',    suffix: '+', label: 'Жил туршлага',  en: 'Years Open' },
  { raw: '4.9',   value: '4.9',  suffix: '★', label: 'Үнэлгээ',       en: 'Guest Rating' },
];

const MARQUEE = [
  'Монгол Гэр', 'Bayan-Ölgii', 'Алтайн Нуруу', 'Казах Соёл',
  'Бага Түргэн', 'Wild Altai', 'Тайван Амралт', 'Adventure',
  'Nomadic Luxury', 'Цаст Хүрхрээ', '1800м Өндөр', 'Pure Nature',
];

const STATIC_FEATURES = [
  { title: 'Газар зүй',        desc: 'Байршил, ирэх заавар болон газрын зургийн мэдээлэл',  link: '/location', icon: '🗺️', accent: '#3b82f6' },
  { title: 'Ресортын бүтэц',  desc: 'Амралтын газрын боломжууд болон үйлчилгээний танилцуулга', link: '/resort',   icon: '🏕️', accent: '#f59e0b' },
  { title: 'Байгалийн онцлог', desc: 'Онгон зэрлэг байгаль, уул ус, үзэсгэлэнт газруудын тухай',  link: '/nature',   icon: '🌿', accent: '#22c55e' },
  { title: 'Ан амьтад',        desc: 'Манай бус нутагт тааралдах зэрлэг ан амьтдын мэдээлэл',     link: '/wildlife', icon: '🦅', accent: '#a855f7' },
];

/* ─────────────────────────────── helpers ─── */
function getSeason() {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5)  return { name: 'Хавар', icon: '🌸', en: 'Spring' };
  if (m >= 6 && m <= 8)  return { name: 'Зун',   icon: '☀️', en: 'Summer' };
  if (m >= 9 && m <= 11) return { name: 'Намар', icon: '🍂', en: 'Autumn' };
  return { name: 'Өвөл', icon: '❄️', en: 'Winter' };
}

/* ─────────────────────────────── sub-components ─── */

/* Animated stat pill */
function Stat({ stat, visible }) {
  const val = useCountUp(stat.raw, 1800, visible);
  return (
    <div className="text-center px-6 py-4">
      <p className="font-black italic tracking-tighter leading-none text-green-600 dark:text-yellow-400" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
        {val}
      </p>
      <p className="text-sm font-semibold mt-1 text-stone-600 dark:text-white/60">{stat.label}</p>
      <p className="text-[10px] uppercase tracking-widest mt-0.5 text-stone-400 dark:text-white/20">{stat.en}</p>
    </div>
  );
}

/* Scroll-reveal wrapper */
function Reveal({ children, className = '', delay = 0, from = 'bottom' }) {
  const [ref, visible] = useIntersection({ threshold: 0.07 });
  const fromMap = {
    bottom: 'translate-y-10',
    left:   '-translate-x-10',
    right:  'translate-x-10',
    scale:  'scale-95',
  };
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out will-change-transform ${className} ${
        visible ? 'opacity-100 translate-y-0 translate-x-0 scale-100' : `opacity-0 ${fromMap[from] || 'translate-y-10'}`
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────── MAIN ─── */
export default function Home() {
  const { dark } = useTheme();
  const [settings, setSettings] = useState({});
  const [reviews,  setReviews]  = useState([]);
  const [weather,  setWeather]  = useState(null);
  const [statsRef, statsVisible] = useIntersection({ threshold: 0.15 });
  const season = getSeason();

  useEffect(() => {
    api.get('/api/settings').then(r => setSettings(r.data || {})).catch(() => {});
    api.get('/api/reviews/all').then(r => setReviews((r.data || []).filter(v => v.rating >= 4).slice(0, 6))).catch(() => {});
    fetch('https://api.open-meteo.com/v1/forecast?latitude=48.94&longitude=88.13&current=temperature_2m,weather_code')
      .then(r => r.json())
      .then(d => {
        const icons = { 0:'☀️', 1:'🌤️', 2:'⛅', 3:'☁️', 45:'🌫️', 51:'🌦️', 61:'🌧️', 71:'❄️', 80:'⛈️' };
        setWeather({ temp: Math.round(d.current.temperature_2m), icon: icons[d.current.weather_code] || '🌡️' });
      }).catch(() => {});
  }, []);

  const imgUrl = useCallback((key, fb) =>
    settings[key] ? `${api.defaults.baseURL}/uploads/${settings[key]}` : fb,
    [settings]);

  const services = useMemo(() => {
    const out = [];
    for (let i = 1; i <= 5; i++) {
      if (settings[`serviceTitle${i}`]) out.push({
        title: settings[`serviceTitle${i}`],
        desc:  settings[`serviceDesc${i}`] || '',
        link:  settings[`serviceLink${i}`] || '/',
        img:   imgUrl(`serviceImg${i}`, fallbackImg),
      });
    }
    return out;
  }, [settings, imgUrl]);

  const features = useMemo(() =>
    STATIC_FEATURES.map((f, i) => {
      const n = i + 1;
      return { ...f,
        title: settings[`featureTitle${n}`] || f.title,
        desc:  settings[`featureDesc${n}`]  || f.desc,
        link:  settings[`featureLink${n}`]  || f.link,
        img:   settings[`featureImg${n}`]   ? `${api.defaults.baseURL}/uploads/${settings[`featureImg${n}`]}` : null,
      };
    }), [settings]);

  const steps = useMemo(() => {
    const out = [];
    for (let i = 1; i <= 3; i++) {
      if (settings[`stepTitle${i}`]) out.push({
        num: i, title: settings[`stepTitle${i}`], desc: settings[`stepDesc${i}`] || '',
        img: settings[`stepImg${i}`] ? `${api.defaults.baseURL}/uploads/${settings[`stepImg${i}`]}` : null,
      });
    }
    return out;
  }, [settings]);

  const heroImg  = imgUrl('heroImage', '/hero.jpg');
  const destImg  = imgUrl('destinationImage', '/destination.jpg');
  const marquee  = [...MARQUEE, ...MARQUEE];

  return (
    <div className="bg-[#F8F5EF] dark:bg-[#080809] text-[#1A1714] dark:text-white overflow-x-hidden transition-colors duration-300">

      {/* ══════════════════════════════════════
          HERO — Cinematic Ken Burns
      ══════════════════════════════════════ */}
      <section className="relative h-screen min-h-[600px] max-h-[1100px] flex flex-col items-center justify-center overflow-hidden">

        {/* Ken Burns image */}
        <div className="absolute inset-0 overflow-hidden">
          <img src={heroImg} alt="Resort"
            className="absolute inset-0 w-full h-full object-cover brightness-[0.80]"
            style={{ animation: 'kenBurns 20s ease-in-out infinite alternate' }}
          />
        </div>

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#080809]" />

        {/* Top badges */}
        <div className="absolute top-24 left-6 md:left-10 flex flex-col gap-2 z-10 animate-fade-up">
          {/* Season pill */}
          <div className="glass rounded-full px-4 py-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-white/60">
            <span>{season.icon}</span>
            {season.name} · {season.en}
          </div>
          {/* Weather */}
          {weather && (
            <div className="glass rounded-full px-4 py-2 flex items-center gap-2 text-[10px] font-semibold text-white/50">
              <span>{weather.icon}</span>
              Цэнгэл сум: <span className="text-white/80 font-bold">{weather.temp}°C</span>
            </div>
          )}
        </div>

        {/* Ger count live pill */}
        <div className="absolute top-24 right-6 md:right-10 z-10 animate-fade-up">
          <div className="glass rounded-full px-4 py-2 flex items-center gap-2 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/60 uppercase tracking-widest">Сул гэр байна</span>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 text-center px-6 max-w-6xl w-full">
          {/* Location badge */}
          <div className="inline-flex items-center gap-3 mb-10 animate-fade-up">
            <div className="h-px w-12 bg-yellow-400/35" />
            <span className="text-yellow-400/65 text-[9px] font-semibold tracking-[0.8em] uppercase">
              {settings.destinationBadge || 'Баян-Өлгий · Монгол · 1800м'}
            </span>
            <div className="h-px w-12 bg-yellow-400/35" />
          </div>

          {/* Hero headline */}
          <h1
            className="font-black uppercase italic tracking-tighter text-white leading-[0.83] mb-6 animate-fade-up-delay-1 text-balance"
            style={{ fontSize: 'clamp(3.2rem, 13vw, 10rem)' }}
          >
            {settings.heroTitle ? (
              <>
                <span className="block">{settings.heroTitle.split(' ')[0]}</span>
                <span className="block animate-gradient-text">{settings.heroTitle.split(' ').slice(1).join(' ')}</span>
              </>
            ) : (
              <>
                <span className="block">Цаст</span>
                <span className="block animate-gradient-text">Хүрхрээ</span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-white/35 text-sm md:text-base max-w-md mx-auto leading-relaxed mb-14 animate-fade-up-delay-2 font-light tracking-wide">
            {settings.heroSubtitle || 'Алтайн уулсын зүрхэнд — байгалийн онгон цэнгэг, дулаан гэр, мартагдашгүй аялал'}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-up-delay-3">
            <Link to="/gers"
              className="group inline-flex items-center gap-3 bg-yellow-400 text-black px-10 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white transition-all duration-200 active:scale-[0.97]">
              Гэр захиалах
              <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link to="/trips"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full text-sm font-medium text-white/45 uppercase tracking-widest border border-white/10 hover:border-white/30 hover:text-white/75 transition-all duration-300 active:scale-[0.97] backdrop-blur-sm">
              Аялал харах
            </Link>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 animate-scroll-bounce">
          <div className="text-[8px] font-semibold text-white/15 tracking-[0.6em] uppercase">Scroll</div>
          <div className="w-px h-16 bg-gradient-to-b from-yellow-400/35 via-yellow-400/15 to-transparent" />
        </div>

        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#F8F5EF] dark:from-[#080809] to-transparent" />
      </section>

      {/* Ken Burns keyframes */}
      <style>{`
        @keyframes kenBurns {
          from { transform: scale(1.0) translate(0%, 0%); }
          to   { transform: scale(1.12) translate(-2%, -1%); }
        }
      `}</style>

      {/* ══════════════════════════════════════
          TICKER / MARQUEE
      ══════════════════════════════════════ */}
      <div className="border-y border-stone-200 dark:border-white/[0.03] py-4 overflow-hidden select-none bg-stone-50 dark:bg-white/[0.008]">
        <div className="animate-marquee">
          {marquee.map((t, i) => (
            <span key={i} className="inline-flex items-center gap-5 mx-7 text-[9px] font-semibold text-stone-400 dark:text-white/15 uppercase tracking-[0.45em]">
              {t}<span className="text-green-400/50 dark:text-yellow-400/20">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          STATS — full-width editorial band
      ══════════════════════════════════════ */}
      <div ref={statsRef} className="border-b border-stone-200 dark:border-white/[0.03] bg-white dark:bg-transparent">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-stone-100 dark:divide-white/[0.04]">
            {STATS.map((s, i) => (
              <Stat key={i} stat={s} visible={statsVisible} />
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          STORY — editorial 2-col
      ══════════════════════════════════════ */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-10 py-28 md:py-36">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-16 lg:gap-24 items-center">

          {/* Text */}
          <div className="space-y-8">
            <Reveal>
              <div className="inline-flex items-center gap-2 border border-green-200 dark:border-yellow-400/20 bg-green-50 dark:bg-transparent rounded-full px-4 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-yellow-400 animate-pulse" />
                <span className="text-green-700 dark:text-yellow-400/70 text-[9px] font-semibold tracking-[0.5em] uppercase">
                  {settings.destinationBadge || 'Байршил'}
                </span>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <h2 className="font-black text-stone-900 dark:text-white uppercase italic tracking-tighter leading-[0.93] text-balance"
                style={{ fontSize: 'clamp(2.2rem,5vw,4.5rem)' }}>
                {settings.destinationTitle || 'Бага Түргэний\nХүрхрээ'}
              </h2>
            </Reveal>

            <Reveal delay={140}>
              <p className="text-stone-500 dark:text-white/40 text-base leading-relaxed max-w-md">
                {settings.destinationDescription || 'Цаст Хүрхрээ ресорт нь Бага Түргэний хүрхрээний онцлог байгалийн ойролцоо байрлаж, Баруун Монголын тайван амралтыг санал болгоно.'}
              </p>
            </Reveal>

            {/* Mini stats row */}
            <Reveal delay={200}>
              <div className="flex gap-8 pt-6 border-t border-stone-200 dark:border-white/5">
                {[
                  { v: '1800м', l: 'Өндөр' },
                  { v: '4 улирал', l: 'Жилийн турш' },
                  { v: '150км', l: 'Баян-Өлгийгоос' },
                ].map((s, i) => (
                  <div key={i}>
                    <p className="text-2xl font-black text-green-600 dark:text-yellow-400 italic tracking-tighter leading-none">{s.v}</p>
                    <p className="text-[10px] text-stone-400 dark:text-white/25 uppercase tracking-widest font-medium mt-1.5">{s.l}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={260}>
              <div className="flex flex-wrap gap-3">
                <Link to="/about"
                  className="group inline-flex items-center gap-2 bg-stone-900 dark:bg-white text-white dark:text-black px-7 py-3.5 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-green-600 dark:hover:bg-yellow-400 transition-all duration-300 active:scale-95">
                  Дэлгэрэнгүй
                  <svg className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </Link>
                <Link to="/location"
                  className="inline-flex items-center px-7 py-3.5 rounded-full text-[11px] font-semibold text-stone-500 dark:text-white/40 uppercase tracking-widest border border-stone-200 dark:border-white/10 hover:border-stone-400 dark:hover:border-white/25 hover:text-stone-800 dark:hover:text-white/70 transition-all active:scale-95">
                  Газрын зураг
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Image */}
          <Reveal delay={100} from="right" className="relative">
            <div className="relative rounded-3xl overflow-hidden border border-white/6 aspect-[4/3]">
              <img src={destImg} alt="Destination" className="absolute inset-0 w-full h-full object-cover img-zoom" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="glass rounded-2xl px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-yellow-400/70 text-[9px] font-semibold tracking-widest uppercase mb-0.5">Байршил</p>
                    <p className="text-white font-bold text-sm">Цэнгэл сум, Баян-Өлгий</p>
                  </div>
                  <Link to="/location"
                    className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center hover:bg-white transition-colors shrink-0">
                    <svg className="h-4 w-4 text-black" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SERVICES — bento grid
      ══════════════════════════════════════ */}
      {services.length > 0 && (
        <section className="pb-28 md:pb-36">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10 mb-14 flex items-end justify-between gap-4">
            <Reveal>
              <div>
                <p className="text-green-600 dark:text-yellow-400/65 text-[10px] font-semibold tracking-[0.5em] uppercase mb-3">Үйлчилгээ</p>
                <h2 className="font-black text-stone-900 dark:text-white uppercase italic tracking-tighter"
                  style={{ fontSize: 'clamp(2rem,4.5vw,4rem)' }}>
                  Бүх үйлчилгээ
                </h2>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <Link to="/gers" className="hidden md:flex items-center gap-2 text-[10px] font-semibold text-stone-400 dark:text-white/30 uppercase tracking-widest hover:text-green-600 dark:hover:text-yellow-400 transition-colors group">
                Бүгдийг харах
                <svg className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </Link>
            </Reveal>
          </div>

          {/* Bento grid */}
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">
            {services.length === 1 ? (
              <ServiceCard s={services[0]} tall />
            ) : services.length >= 2 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[280px] lg:auto-rows-[300px]">
                {/* Featured — spans 2 cols + 2 rows */}
                <Reveal className="col-span-2 row-span-2">
                  <ServiceCard s={services[0]} full />
                </Reveal>
                {services.slice(1, 5).map((s, i) => (
                  <Reveal key={i} delay={(i + 1) * 70}>
                    <ServiceCard s={s} />
                  </Reveal>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          FEATURES — magazine grid (always shown)
      ══════════════════════════════════════ */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-10 pb-28 md:pb-36">
        <Reveal className="mb-14">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <p className="text-green-600 dark:text-yellow-400/65 text-[10px] font-semibold tracking-[0.5em] uppercase mb-3">Онцлогууд</p>
              <h2 className="font-black text-stone-900 dark:text-white uppercase italic tracking-tighter"
                style={{ fontSize: 'clamp(2rem,4.5vw,4rem)' }}>
                {settings.featureSectionTitle || 'Дэлгэрэнгүй танилцуулга'}
              </h2>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-green-400/50 dark:from-yellow-400/40 via-green-400/10 dark:via-yellow-400/10 to-transparent w-72" />
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {features.map((f, i) => (
            <Reveal key={i} delay={i * 90}>
              <Link to={f.link}
                className="group relative flex flex-col rounded-3xl overflow-hidden border border-stone-200 dark:border-white/6 hover:border-green-400/30 dark:hover:border-yellow-400/20 transition-all duration-500 cursor-pointer"
                style={{ minHeight: '380px' }}>

                {/* Background: image or gradient */}
                {f.img ? (
                  <img src={f.img} alt={f.title} loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover brightness-[0.38] group-hover:brightness-[0.55] group-hover:scale-105 transition-all duration-700" />
                ) : (
                  <div className="absolute inset-0"
                    style={{ background: dark
                      ? `radial-gradient(ellipse at 35% 25%, ${f.accent}20, transparent 65%), linear-gradient(160deg, #0e0e10 0%, #121315 100%)`
                      : `radial-gradient(ellipse at 35% 25%, ${f.accent}15, transparent 65%), linear-gradient(160deg, #ffffff 0%, #f4f1eb 100%)` }} />
                )}

                {/* Bottom gradient overlay — only needed when content overlays image or dark card */}
                <div className={`absolute inset-0 transition-opacity duration-300 ${f.img ? 'bg-gradient-to-t from-black via-black/5 to-transparent' : dark ? 'bg-gradient-to-t from-black/60 via-black/5 to-transparent' : 'bg-gradient-to-t from-stone-100/60 via-transparent to-transparent'}`} />

                {/* Watermark number */}
                <div
                  className="absolute top-3 right-4 font-black italic text-stone-900/[0.04] dark:text-white/[0.04] group-hover:text-stone-900/[0.08] dark:group-hover:text-white/[0.09] transition-colors duration-500 select-none leading-none"
                  style={{ fontSize: 'clamp(4.5rem,8vw,7rem)' }}>
                  0{i + 1}
                </div>

                {/* Large background emoji (only when no image) */}
                {!f.img && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[120px] opacity-[0.05] group-hover:opacity-[0.09] group-hover:scale-110 transition-all duration-700 select-none">
                      {f.icon}
                    </span>
                  </div>
                )}

                {/* Top: icon badge */}
                <div className="relative z-10 p-6 pt-7">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-xl"
                    style={{ background: `${f.accent}18`, border: `1px solid ${f.accent}38` }}>
                    {f.icon}
                  </div>
                </div>

                <div className="flex-1" />

                {/* Bottom: content */}
                <div className="relative z-10 p-6">
                  {/* Expanding accent line */}
                  <div className="h-px mb-5 w-10 group-hover:w-20 transition-all duration-500"
                    style={{ background: `linear-gradient(90deg, ${f.accent}, transparent)` }} />

                  <h3 className={`font-bold text-base uppercase italic tracking-tight mb-2 transition-colors duration-300 ${f.img || dark ? 'text-white group-hover:text-yellow-400' : 'text-stone-900 group-hover:text-green-600'}`}>
                    {f.title}
                  </h3>
                  <p className={`text-[11px] leading-relaxed line-clamp-2 transition-colors duration-300 ${f.img || dark ? 'text-white/30 group-hover:text-white/55' : 'text-stone-400 group-hover:text-stone-600'}`}>
                    {f.desc}
                  </p>

                  {/* CTA — slides up on hover */}
                  <div className="mt-5 flex items-center gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${dark ? 'text-yellow-400' : f.img ? 'text-yellow-400' : 'text-green-600'}`}>Дэлгэрэнгүй</span>
                    <svg className={`h-3 w-3 ${dark ? 'text-yellow-400' : f.img ? 'text-yellow-400' : 'text-green-600'}`} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW TO BOOK — process
      ══════════════════════════════════════ */}
      {steps.length > 0 && (
        <section className="py-28 md:py-36">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10">
            <Reveal className="text-center mb-20">
              <p className="text-green-600 dark:text-yellow-400/65 text-[10px] font-semibold tracking-[0.5em] uppercase mb-4">Захиалгын процесс</p>
              <h2 className="font-black text-stone-900 dark:text-white uppercase italic tracking-tighter"
                style={{ fontSize: 'clamp(2rem,4.5vw,4rem)' }}>
                Хэрхэн захиалах вэ?
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((s, i) => (
                <Reveal key={s.num} delay={i * 120} className="group card-dark rounded-3xl p-8 relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-green-600 dark:bg-yellow-400 rounded-2xl flex items-center justify-center text-3xl font-black text-white dark:text-black italic shrink-0 group-hover:scale-105 transition-transform">
                      {s.num}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="hidden md:block flex-1 h-px border-t-2 border-dashed border-white/6" />
                    )}
                  </div>
                  {s.img && (
                    <div className="h-40 rounded-2xl overflow-hidden mb-6 border border-white/5">
                      <img src={s.img} alt={s.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <h3 className="text-stone-900 dark:text-white font-bold text-base uppercase italic tracking-tight mb-3 group-hover:text-green-600 dark:group-hover:text-yellow-400 transition-colors">{s.title}</h3>
                  <p className="text-stone-500 dark:text-white/30 text-sm leading-relaxed">{s.desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          REVIEWS — real API data
      ══════════════════════════════════════ */}
      {reviews.length > 0 && (
        <section className="max-w-screen-xl mx-auto px-6 md:px-10 pb-28 md:pb-36">
          <Reveal className="mb-14 flex items-end justify-between gap-4">
            <div>
              <p className="text-green-600 dark:text-yellow-400/65 text-[10px] font-semibold tracking-[0.5em] uppercase mb-3">Сэтгэгдэл</p>
              <h2 className="font-black text-stone-900 dark:text-white uppercase italic tracking-tighter"
                style={{ fontSize: 'clamp(2rem,4.5vw,4rem)' }}>
                Зочдын дүгнэлт
              </h2>
            </div>
            <Link to="/gers" className="hidden md:flex items-center gap-2 text-[10px] font-semibold text-stone-400 uppercase tracking-widest hover:text-green-600 transition-colors group">
              Бүгдийг харах
              <svg className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </Link>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.slice(0, 6).map((r, i) => (
              <Reveal key={r._id} delay={i * 60} className="group card-dark rounded-3xl p-7 relative overflow-hidden hover:border-yellow-400/15 transition-colors duration-300">
                <div className="absolute top-5 right-6 text-4xl font-serif text-green-400/15 dark:text-yellow-400/8 pointer-events-none">"</div>
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map(s => (
                    <span key={s} className={`text-sm ${s <= Math.round(r.rating) ? 'text-amber-400 dark:text-yellow-400' : 'text-stone-200 dark:text-white/10'}`}>★</span>
                  ))}
                  <span className="text-stone-400 dark:text-white/20 text-xs ml-2 self-center">{r.rating}</span>
                </div>
                <p className="text-stone-500 dark:text-white/55 text-sm leading-relaxed mb-6 italic">
                  "{r.comment || r.message}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-600 dark:bg-yellow-400 rounded-xl flex items-center justify-center text-white dark:text-black font-black text-sm shrink-0">
                    {(r.userName || r.customerName || 'З').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-stone-800 dark:text-white font-semibold text-sm">{r.userName || r.customerName || 'Зочин'}</p>
                    <p className="text-stone-400 dark:text-white/25 text-[9px] uppercase tracking-widest">{r.refType || 'Resort'}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          CTA — full-width editorial
      ══════════════════════════════════════ */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-10 pb-28 md:pb-36">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem]">
            <div className="absolute inset-0 bg-white dark:bg-white/[0.025] border border-stone-200 dark:border-white/6 rounded-[2rem] md:rounded-[2.5rem] shadow-sm dark:shadow-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Left text */}
              <div className="p-10 md:p-16 lg:p-20">
                <p className="text-green-600 dark:text-yellow-400/55 text-[9px] font-semibold tracking-[0.6em] uppercase mb-6">Онцгой санал</p>
                <h2 className="font-black text-stone-900 dark:text-white uppercase italic tracking-tighter leading-[0.88] mb-6"
                  style={{ fontSize: 'clamp(2.5rem,6vw,5.5rem)' }}>
                  Аяллаа<br /><span className="text-green-600 dark:animate-gradient-text">эхлүүл.</span>
                </h2>
                <p className="text-stone-500 dark:text-white/30 text-base leading-relaxed max-w-sm mb-10">
                  Байгалийн гоо сайхныг мэдрэх, тайван амралт авах боломж таны хүлээж байна.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/gers"
                    className="group inline-flex items-center gap-3 bg-green-600 dark:bg-yellow-400 text-white dark:text-black px-9 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-green-700 dark:hover:bg-white transition-all duration-200 active:scale-[0.97] shadow-sm">
                    Гэр захиалах
                    <svg className="h-4 w-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </Link>
                  <Link to="/trips"
                    className="inline-flex items-center px-9 py-4 rounded-full text-sm font-medium text-stone-500 dark:text-white/40 uppercase tracking-widest border border-stone-200 dark:border-white/10 hover:border-stone-400 dark:hover:border-white/25 hover:text-stone-800 dark:hover:text-white/70 transition-all active:scale-[0.97]">
                    Аялал харах
                  </Link>
                </div>
              </div>

              {/* Right — contact info */}
              <div className="border-t lg:border-t-0 lg:border-l border-stone-100 dark:border-white/[0.05] p-10 md:p-16 lg:p-20 flex flex-col justify-center space-y-4">
                {[
                  { icon: '📞', label: 'Утас', value: settings.phone || '+976 8888 8888' },
                  { icon: '📧', label: 'Имэйл', value: settings.email || 'info@tsastkhurkhree.mn' },
                  { icon: '📍', label: 'Хаяг', value: settings.address || 'Баян-Өлгий, Цэнгэл сум' },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-4 bg-stone-50 dark:glass border border-stone-100 dark:border-white/8 rounded-2xl px-5 py-4 hover:border-green-200 dark:hover:border-yellow-400/15 transition-colors">
                    <span className="text-xl">{c.icon}</span>
                    <div>
                      <p className="text-[9px] font-semibold text-stone-400 dark:text-white/25 uppercase tracking-widest mb-0.5">{c.label}</p>
                      <p className="text-stone-700 dark:text-white/70 font-semibold text-sm">{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

    </div>
  );
}

/* ─── Service Card ─── */
function ServiceCard({ s, full = false, tall = false }) {
  return (
    <Link to={s.link} className="group relative rounded-3xl overflow-hidden block h-full cursor-pointer border border-stone-200/50 dark:border-white/5 hover:border-green-400/30 dark:hover:border-yellow-400/20 transition-colors duration-400">
      <img src={s.img} alt={s.title} loading="lazy"
        className={`absolute inset-0 w-full h-full object-cover brightness-[0.55] group-hover:brightness-75 group-hover:scale-110 transition-all duration-700 ${full ? 'duration-[900ms]' : ''}`} />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className={`text-white font-bold uppercase italic tracking-tight leading-tight mb-2 group-hover:text-yellow-400 transition-colors ${full ? 'text-2xl md:text-3xl' : 'text-base'}`}>
          {s.title}
        </h3>
        {s.desc && <p className={`text-white/30 leading-relaxed mb-4 ${full ? 'text-sm max-w-xs' : 'text-[10px] line-clamp-2'}`}>{s.desc}</p>}
        <div className="flex items-center gap-1.5 text-[9px] font-semibold text-yellow-400/50 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Үзэх
          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
        </div>
      </div>
    </Link>
  );
}
