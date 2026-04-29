import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import { ThemePill } from './ThemeToggle';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import Icon8 from './Icon8';

const TYPE_META = {
  ger:     { label: 'Гэр',    icon: 'tent',       priceSuf: '/хоног' },
  trip:    { label: 'Аялал',  icon: 'trekking',   priceSuf: '/хүн'   },
  food:    { label: 'Хоол',   icon: 'restaurant', priceSuf: ''        },
  product: { label: 'Бараа',  icon: 'shop',       priceSuf: ''        },
};

const NAV_LINKS = [
  { to: '/gers',     label: 'Гэр'     },
  { to: '/trips',    label: 'Аялал'   },
  { to: '/foods',    label: 'Хоол'    },
  { to: '/products', label: 'Дэлгүүр' },
];

export default function Header() {
  const { user, logout }    = useAuth();
  const { cartItems }       = useCart();
  const { dark, toggle }    = useTheme();
  const settings            = useSettings();
  const location            = useLocation();
  const navigate            = useNavigate();
  const searchRef           = useRef(null);

  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQ,    setSearchQ]    = useState('');
  const [searchRes,  setSearchRes]  = useState([]);
  const [searching,  setSearching]  = useState(false);
  const [weather,    setWeather]    = useState(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=48.94&longitude=88.13&current=temperature_2m,weather_code')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        const icons = { 0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',51:'🌦️',61:'🌧️',71:'❄️',80:'⛈️',95:'⛈️' };
        setWeather({ temp: Math.round(d.current.temperature_2m), icon: icons[d.current.weather_code] || '🌡️' });
      }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!searchQ.trim()) { setSearchRes([]); setSearching(false); return; }
    setSearching(true);
    const t = setTimeout(() => {
      api.get(`/api/search?q=${encodeURIComponent(searchQ)}`)
        .then(r => setSearchRes(r.data)).catch(() => {})
        .finally(() => setSearching(false));
    }, 280);
    return () => clearTimeout(t);
  }, [searchQ]);

  useEffect(() => {
    const fn = e => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchRes([]); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    if (!searchQ.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
    setSearchQ(''); setSearchRes([]);
  };

  const isActive = to => location.pathname === to || location.pathname.startsWith(to + '/');
  const brand    = settings.brandName?.split('-') || ['Цаст', 'Хүрхрээ'];

  const SearchItem = ({ item }) => {
    const paths = { ger:'/ger/', trip:'/trip/', product:'/product/', food:'/foods' };
    const href  = `${paths[item.type] || '/product/'}${item._id}`;
    const img   = item.image ? `${api.defaults.baseURL}/uploads/${item.image}` : '/placeholder.jpg';
    const price = item.price || item.pricePerNight || item.pricePerPerson;
    const meta  = TYPE_META[item.type] || { label: 'Бараа', icon: 'shop', priceSuf: '' };
    const sub   = item.location || item.category || item.description;

    return (
      <Link to={href} onClick={() => { setSearchRes([]); setSearchQ(''); }}
        className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-stone-50 dark:hover:bg-white/[0.04] transition-all duration-150 group">
        <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-stone-200 dark:border-white/[0.06] shrink-0">
          <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Icon8 name={meta.icon} style="fluency" size={12} />
            <span className="text-[8px] font-semibold text-green-600 dark:text-yellow-400 uppercase tracking-widest">{meta.label}</span>
          </div>
          <p className="text-sm font-semibold text-stone-800 dark:text-white/85 truncate group-hover:text-green-600 dark:group-hover:text-yellow-400 transition-colors leading-tight">
            {item.title || item.name}
          </p>
          {sub && <p className="text-[10px] text-stone-400 dark:text-white/25 truncate mt-0.5">{sub}</p>}
        </div>
        {price && (
          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-amber-600 dark:text-yellow-400">{formatCurrency(price)}</p>
            {meta.priceSuf && <p className="text-[8px] text-stone-400 dark:text-white/20">{meta.priceSuf}</p>}
          </div>
        )}
      </Link>
    );
  };

  /* mobile theme row */
  const MobileThemeRow = () => (
    <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/8">
      <span className="text-xs font-semibold text-stone-500 dark:text-white/50 uppercase tracking-widest">
        {dark ? 'Харанхуй горим' : 'Гэгээлэг горим'}
      </span>
      <ThemePill />
    </div>
  );

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-[#080809]/95 backdrop-blur-2xl shadow-[0_1px_0_#E5E0D5,0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_0_rgba(255,255,255,0.05),0_8px_40px_rgba(0,0,0,0.7)]'
          : 'bg-white/80 dark:bg-transparent backdrop-blur-xl border-b border-stone-200/60 dark:border-transparent'
      }`}>
        {/* accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-green-400/30 dark:via-yellow-400 to-transparent opacity-40" />

        <div className="max-w-screen-xl mx-auto px-5 md:px-10 flex items-center h-[64px] gap-5">

          {/* LOGO */}
          <Link to="/" className="group flex items-center gap-2.5 shrink-0 mr-4">
            {settings.image ? (
              <img src={`${api.defaults.baseURL}/uploads/${settings.image}`} alt=""
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-stone-200 dark:ring-yellow-400/30 group-hover:ring-green-400 dark:group-hover:ring-yellow-400/60 transition-all duration-300" />
            ) : (
              <div className="w-8 h-8 bg-green-600 dark:bg-yellow-400 rounded-lg flex items-center justify-center text-white dark:text-black font-black text-sm group-hover:scale-105 transition-all duration-200">
                {settings.logoText || 'Ц'}
              </div>
            )}
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-[13px] font-black tracking-wide text-stone-900 dark:text-white uppercase">
                {brand[0]}
                <span className="text-stone-300 dark:text-white/20 mx-0.5">·</span>
                <span className="text-green-600 dark:text-yellow-400">{brand.slice(1).join('-') || 'Хүрхрээ'}</span>
              </span>
              <span className="text-[8px] tracking-[0.3em] text-stone-400 dark:text-white/25 uppercase font-medium">Resort · Bayan-Ölgii</span>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to}
                className={`relative px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] rounded-lg transition-all duration-200 ${
                  isActive(to)
                    ? 'text-green-600 dark:text-yellow-400 bg-green-50 dark:bg-yellow-400/10'
                    : 'text-stone-500 dark:text-white/50 hover:text-stone-900 dark:hover:text-white/90 hover:bg-stone-100 dark:hover:bg-white/[0.04]'
                }`}>
                {label}
                {isActive(to) && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-green-500 dark:bg-yellow-400" />
                )}
              </Link>
            ))}
          </nav>

          {/* SEARCH */}
          <div className="flex-1 lg:max-w-[240px] relative" ref={searchRef}>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Хайх..."
                  className="w-full h-9 bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/8 rounded-full pl-9 pr-4 text-[13px] text-stone-800 dark:text-white placeholder-stone-400 dark:placeholder-white/25 outline-none focus:bg-white dark:focus:bg-white/8 focus:border-green-400 dark:focus:border-yellow-400/30 transition-all duration-200"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400 dark:text-white/30 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </form>

            {(searching || searchRes.length > 0 || (searchQ.trim() && !searching)) && (
              <div className="absolute top-full mt-2 left-0 right-0 min-w-[320px] bg-white dark:bg-[#0f0f12]/98 border border-stone-200 dark:border-white/8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.7)] p-2 z-50 animate-fade-up max-h-[60vh] overflow-y-auto">
                {searching && !searchRes.length ? (
                  <div className="py-6 flex items-center justify-center gap-2 text-stone-400 dark:text-white/30">
                    <div className="w-4 h-4 border border-green-400/50 dark:border-yellow-400/30 border-t-green-500 dark:border-t-yellow-400 rounded-full animate-spin" />
                    <span className="text-xs">Хайж байна...</span>
                  </div>
                ) : searchRes.length ? (
                  <>
                    <div className="space-y-0.5">
                      {searchRes.slice(0, 6).map(i => <SearchItem key={`${i.type}-${i._id}`} item={i} />)}
                    </div>
                    <div className="mt-2 pt-2 border-t border-stone-100 dark:border-white/5">
                      <button
                        onClick={() => { navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`); setSearchQ(''); setSearchRes([]); }}
                        className="w-full py-2.5 text-[10px] font-semibold text-stone-400 dark:text-white/30 uppercase tracking-widest hover:text-green-600 dark:hover:text-yellow-400 transition-colors text-center">
                        Бүх үр дүн харах ({searchRes.length})
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="py-6 text-center text-xs text-stone-400 dark:text-white/25">Илэрц олдсонгүй</p>
                )}
              </div>
            )}
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-1 shrink-0">

            {/* weather */}
            {weather && (
              <Link to="/location"
                className="hidden xl:flex items-center gap-1.5 h-9 px-3 rounded-full border border-stone-200 dark:border-white/8 hover:border-green-300 dark:hover:border-yellow-400/25 hover:bg-green-50 dark:hover:bg-white/[0.04] transition-all text-sm text-stone-700 dark:text-white/80">
                <span>{weather.icon}</span>
                <span className="font-semibold">{weather.temp}°</span>
              </Link>
            )}

            {/* theme toggle */}
            <ThemePill />

            {/* cart */}
            <Link to="/cart" className="relative group p-2 text-stone-500 dark:text-white/45 hover:text-stone-900 dark:hover:text-white/90 transition-colors rounded-xl hover:bg-stone-100 dark:hover:bg-white/[0.04]">
              <svg className="h-[18px] w-[18px] group-hover:scale-105 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 dark:bg-yellow-400 text-white dark:text-black text-[9px] font-black rounded-full flex items-center justify-center">
                  {cartItems.length > 9 ? '9+' : cartItems.length}
                </span>
              )}
            </Link>

            {/* auth */}
            {user ? (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link to="/admin" className="p-2 text-stone-500 dark:text-white/45 hover:text-stone-900 dark:hover:text-white/90 transition-colors rounded-xl hover:bg-stone-100 dark:hover:bg-white/[0.04] group">
                  <svg className="h-[18px] w-[18px] group-hover:scale-105 transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                </Link>
                <button onClick={logout}
                  className="h-8 px-4 text-[10px] font-semibold text-stone-500 dark:text-white/35 uppercase tracking-widest rounded-full border border-stone-200 dark:border-white/8 hover:border-red-300 dark:hover:border-red-400/30 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-transparent transition-all duration-200">
                  Гарах
                </button>
              </div>
            ) : (
              <Link to="/login"
                className="hidden sm:flex items-center h-9 px-5 bg-green-600 dark:bg-yellow-400 text-white dark:text-black text-[11px] font-bold uppercase tracking-widest rounded-full hover:bg-green-700 dark:hover:bg-white transition-all duration-200 active:scale-95 shadow-sm">
                Нэвтрэх
              </Link>
            )}

            {/* hamburger */}
            <button onClick={() => setMobileOpen(v => !v)}
              className="lg:hidden flex flex-col items-end justify-center w-10 h-10 gap-[5px] rounded-xl hover:bg-stone-100 dark:hover:bg-white/5 transition-colors">
              <span className={`block h-[1.5px] rounded-full bg-stone-600 dark:bg-white/60 transition-all duration-300 origin-right ${mobileOpen ? 'w-5 rotate-[-45deg] translate-y-[3.5px]' : 'w-5'}`} />
              <span className={`block h-[1.5px] rounded-full bg-stone-600 dark:bg-white/60 transition-all duration-300 ${mobileOpen ? 'opacity-0 w-0' : 'w-3.5'}`} />
              <span className={`block h-[1.5px] rounded-full bg-stone-600 dark:bg-white/60 transition-all duration-300 origin-right ${mobileOpen ? 'w-5 rotate-[45deg] -translate-y-[3.5px]' : 'w-5'}`} />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/30 dark:bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-[#0a0a0d] border-l border-stone-200 dark:border-white/6 flex flex-col animate-slide-right shadow-2xl">
            <div className="flex items-center justify-between px-6 h-[64px] border-b border-stone-100 dark:border-white/6 shrink-0">
              <span className="text-sm font-semibold text-stone-500 dark:text-white/60 uppercase tracking-widest">Цэс</span>
              <button onClick={() => setMobileOpen(false)} className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-white/5 flex items-center justify-center text-stone-500 dark:text-white/50 hover:text-stone-900 dark:hover:text-white transition-colors text-lg font-light">×</button>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
              {NAV_LINKS.map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-4 py-4 rounded-2xl text-sm font-semibold uppercase tracking-widest transition-all ${
                    isActive(to)
                      ? 'bg-green-50 dark:bg-yellow-400/10 text-green-600 dark:text-yellow-400'
                      : 'text-stone-500 dark:text-white/50 hover:text-stone-900 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-white/[0.04]'
                  }`}>
                  {label}
                  {isActive(to) && <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-yellow-400" />}
                </Link>
              ))}
            </nav>

            <div className="px-4 pb-8 border-t border-stone-100 dark:border-white/6 pt-4 space-y-2">
              <MobileThemeRow />
              {user ? (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/admin" onClick={() => setMobileOpen(false)}
                    className="py-3.5 text-center text-xs font-semibold uppercase tracking-widest bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/8 rounded-2xl hover:bg-green-600 dark:hover:bg-yellow-400 hover:text-white dark:hover:text-black hover:border-transparent transition-all text-stone-700 dark:text-white">
                    Dashboard
                  </Link>
                  <button onClick={() => { logout(); setMobileOpen(false); }}
                    className="py-3.5 text-xs font-semibold uppercase tracking-widest bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/8 rounded-2xl hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-400/20 transition-all text-stone-500 dark:text-white/50">
                    Гарах
                  </button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  className="block py-4 text-center text-sm font-bold uppercase tracking-widest bg-green-600 dark:bg-yellow-400 text-white dark:text-black rounded-2xl hover:bg-green-700 dark:hover:bg-white transition-all active:scale-95">
                  Нэвтрэх
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
