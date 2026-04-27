import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import Icon8, { TypeIcon } from '../components/Icon8';

/* ── type config ── */
const TYPE_CFG = {
  ger:     { label: 'Гэр',    path: '/ger/',     priceKey: 'pricePerNight',  priceSuf: '/ хоног',    icon: 'tent' },
  trip:    { label: 'Аялал',  path: '/trip/',    priceKey: 'pricePerPerson', priceSuf: '/ хүн',      icon: 'trekking' },
  food:    { label: 'Хоол',   path: '/foods',    priceKey: 'price',          priceSuf: '',            icon: 'restaurant' },
  product: { label: 'Бараа',  path: '/product/', priceKey: 'price',          priceSuf: '',            icon: 'shop' },
  sauna:   { label: 'Саун',   path: '/saunas',   priceKey: 'price',          priceSuf: '',            icon: 'sauna' },
};

const ALL_TYPES = [
  { key: 'all', label: 'Бүгд' },
  { key: 'ger',     label: 'Гэр' },
  { key: 'trip',    label: 'Аялал' },
  { key: 'food',    label: 'Хоол' },
  { key: 'product', label: 'Бараа' },
];

const SORT_OPTIONS = [
  { key: 'rel',        label: 'Хамааралтай' },
  { key: 'price-asc',  label: 'Үнэ ↑' },
  { key: 'price-desc', label: 'Үнэ ↓' },
];

/* ── Result card ── */
function ResultCard({ item }) {
  const cfg = TYPE_CFG[item.type] || TYPE_CFG.product;
  const href  = `${cfg.path}${item._id}`;
  const img   = item.image ? `${api.defaults.baseURL}/uploads/${item.image}` : '/placeholder.jpg';
  const price = item[cfg.priceKey] || item.price || item.pricePerNight || item.pricePerPerson;

  return (
    <Link to={href}
      className="group flex gap-0 rounded-2xl overflow-hidden border border-white/6 hover:border-yellow-400/20 transition-all duration-300 bg-white/2 hover:bg-white/3">

      {/* Image */}
      <div className="w-[140px] md:w-[200px] shrink-0 relative overflow-hidden">
        <img src={img} alt={item.title || item.name}
          className="w-full h-full object-cover brightness-75 group-hover:brightness-90 group-hover:scale-105 transition-all duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#080809]/30" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 p-5 md:p-6 flex flex-col justify-between">
        <div>
          {/* Type + status */}
          <div className="flex items-center gap-2 mb-2">
            <Icon8 name={cfg.icon} style="fluency" size={16} />
            <span className="text-[9px] font-semibold text-yellow-400/80 uppercase tracking-widest">{cfg.label}</span>
            {item.status === 'available' && (
              <span className="ml-auto inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-400 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Сул
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-white font-bold text-base md:text-lg italic uppercase tracking-tighter leading-tight line-clamp-1 group-hover:text-yellow-400 transition-colors duration-200 mb-1">
            {item.title || item.name}
          </h3>

          {/* Meta info */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {item.location && (
              <span className="flex items-center gap-1 text-[11px] text-white/35 font-medium">
                <svg className="w-3 h-3 text-yellow-400/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {item.location}
              </span>
            )}
            {item.capacity && (
              <span className="flex items-center gap-1 text-[11px] text-white/35 font-medium">
                <svg className="w-3 h-3 text-white/25 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {item.capacity} хүн
              </span>
            )}
            {item.duration && (
              <span className="flex items-center gap-1 text-[11px] text-white/35 font-medium">
                <svg className="w-3 h-3 text-white/25 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {item.duration} цаг
              </span>
            )}
            {item.category && (
              <span className="flex items-center gap-1 text-[11px] text-white/35 font-medium">
                <svg className="w-3 h-3 text-white/25 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {item.category}
              </span>
            )}
            {item.stock !== undefined && (
              <span className={`flex items-center gap-1 text-[11px] font-medium ${item.stock > 5 ? 'text-white/35' : item.stock > 0 ? 'text-orange-400' : 'text-red-400'}`}>
                Нөөц: {item.stock}ш
              </span>
            )}
          </div>

          {/* Description */}
          {(item.description) && (
            <p className="text-white/25 text-xs leading-relaxed line-clamp-2 mt-2">
              {item.description}
            </p>
          )}
        </div>

        {/* Bottom: price + CTA */}
        <div className="flex items-end justify-between mt-4 pt-4 border-t border-white/5">
          <div>
            {price ? (
              <>
                <p className="text-[9px] text-white/25 uppercase tracking-widest font-semibold mb-0.5">{cfg.priceSuf || 'Үнэ'}</p>
                <p className="text-yellow-400 font-black text-lg italic tracking-tighter leading-none">{formatCurrency(price)}</p>
              </>
            ) : (
              <p className="text-white/20 text-xs">Үнэ тодорхойгүй</p>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px] font-semibold text-white/30 group-hover:text-yellow-400 uppercase tracking-widest transition-colors duration-200">
            Дэлгэрэнгүй
            <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Skeleton ── */
function Skeleton() {
  return (
    <div className="flex gap-0 rounded-2xl overflow-hidden border border-white/5 bg-white/2 animate-pulse">
      <div className="w-[140px] md:w-[200px] h-[140px] bg-white/4 shrink-0" />
      <div className="flex-1 p-6 space-y-3">
        <div className="h-3 bg-white/5 rounded-full w-1/4" />
        <div className="h-5 bg-white/8 rounded-full w-3/4" />
        <div className="h-3 bg-white/4 rounded-full w-1/2" />
        <div className="h-3 bg-white/3 rounded-full w-2/3 mt-2" />
        <div className="h-px bg-white/4 mt-4" />
        <div className="flex justify-between mt-2">
          <div className="h-5 bg-white/6 rounded-full w-1/4" />
          <div className="h-3 bg-white/4 rounded-full w-1/5" />
        </div>
      </div>
    </div>
  );
}

/* ── MAIN ── */
export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [results,  setResults]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [localQ,   setLocalQ]   = useState(searchParams.get('q') || '');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sort, setSort] = useState('rel');

  const query = searchParams.get('q') || '';

  useEffect(() => {
    setLocalQ(query);
    if (!query) { setResults([]); setLoading(false); return; }
    setLoading(true);
    api.get(`/api/search?q=${encodeURIComponent(query)}`)
      .then(r => setResults(r.data || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [query]);

  const filtered = useMemo(() => {
    let list = typeFilter === 'all' ? results : results.filter(r => r.type === typeFilter);
    if (sort === 'price-asc')  list = [...list].sort((a, b) => (a.price || a.pricePerNight || a.pricePerPerson || 0) - (b.price || b.pricePerNight || b.pricePerPerson || 0));
    if (sort === 'price-desc') list = [...list].sort((a, b) => (b.price || b.pricePerNight || b.pricePerPerson || 0) - (a.price || a.pricePerNight || a.pricePerPerson || 0));
    return list;
  }, [results, typeFilter, sort]);

  /* type counts */
  const counts = useMemo(() => {
    const c = { all: results.length };
    results.forEach(r => { c[r.type] = (c[r.type] || 0) + 1; });
    return c;
  }, [results]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (localQ.trim()) setSearchParams({ q: localQ.trim() });
  };

  return (
    <div className="min-h-screen bg-[#F8F5EF] dark:bg-[#080809] pt-24 pb-24">
      <div className="max-w-4xl mx-auto px-6">

        {/* ── Search bar ── */}
        <div className="pt-8 pb-10">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                value={localQ}
                onChange={e => setLocalQ(e.target.value)}
                placeholder="Гэр, аялал, хоол, бараа..."
                autoFocus
                className="w-full h-12 bg-white/4 border border-white/8 rounded-2xl pl-11 pr-4 text-white placeholder-white/20 outline-none focus:border-yellow-400/35 focus:bg-white/6 transition-all text-sm font-medium"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {localQ && (
                <button type="button" onClick={() => { setLocalQ(''); setSearchParams({}); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white/25 hover:text-white hover:bg-white/10 transition-all text-lg leading-none">
                  ×
                </button>
              )}
            </div>
            <button type="submit"
              className="h-12 px-6 bg-yellow-400 text-black rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-white transition-all duration-200 active:scale-95 shrink-0">
              Хайх
            </button>
          </form>
        </div>

        {/* ── Filters ── */}
        {query && !loading && results.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {/* Type tabs */}
            <div className="flex items-center gap-1 bg-white/3 border border-white/6 rounded-2xl p-1">
              {ALL_TYPES.map(t => (
                counts[t.key] > 0 || t.key === 'all' ? (
                  <button key={t.key} onClick={() => setTypeFilter(t.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest transition-all duration-200 ${
                      typeFilter === t.key ? 'bg-yellow-400 text-black' : 'text-white/40 hover:text-white/70'
                    }`}>
                    {t.key !== 'all' && <Icon8 name={TYPE_CFG[t.key]?.icon || 'info'} style="fluency" size={14} />}
                    {t.label}
                    {counts[t.key] > 0 && <span className={`ml-0.5 ${typeFilter === t.key ? 'text-black/50' : 'text-white/20'}`}>({counts[t.key]})</span>}
                  </button>
                ) : null
              ))}
            </div>

            {/* Sort */}
            <div className="ml-auto flex items-center gap-1 bg-white/3 border border-white/6 rounded-2xl p-1">
              {SORT_OPTIONS.map(o => (
                <button key={o.key} onClick={() => setSort(o.key)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold tracking-widest transition-all ${
                    sort === o.key ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'
                  }`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Result header ── */}
        {query && (
          <div className="mb-6">
            {loading ? (
              <div className="h-5 bg-white/5 rounded-full w-48 animate-pulse" />
            ) : (
              <p className="text-white/30 text-sm">
                <span className="text-white font-semibold">"{query}"</span> гэсэн хайлтаар{' '}
                <span className="text-yellow-400 font-semibold">{filtered.length}</span> илэрц олдлоо
              </p>
            )}
          </div>
        )}

        {/* ── Results ── */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} />)}
          </div>
        ) : !query ? (
          /* Empty — no query */
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 mb-6">
              <Icon8 name="search" style="fluency" size={64} />
            </div>
            <h2 className="text-white/40 font-bold text-lg uppercase tracking-widest mb-2">Юу хайх вэ?</h2>
            <p className="text-white/20 text-sm">Гэр, аялал, хоол, бараа хайна уу</p>
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              {['Монгол гэр', 'Аялал', 'Хоол', 'Бараа'].map(s => (
                <button key={s} onClick={() => { setLocalQ(s); setSearchParams({ q: s }); }}
                  className="px-4 py-2 glass rounded-full text-xs font-semibold text-white/50 hover:text-yellow-400 hover:border-yellow-400/20 transition-all uppercase tracking-widest">
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3 animate-fade-in">
            {filtered.map(item => (
              <ResultCard key={`${item.type}-${item._id}`} item={item} />
            ))}
          </div>
        ) : (
          /* No results */
          <div className="flex flex-col items-center py-28 text-center">
            <div className="w-16 h-16 mb-6 opacity-50">
              <Icon8 name="nothing-found" style="fluency" size={64} />
            </div>
            <h2 className="text-white/40 font-bold text-lg uppercase tracking-widest mb-2">Илэрц олдсонгүй</h2>
            <p className="text-white/20 text-sm mb-8">"{query}" гэсэн хайлтаар юм олдсонгүй</p>
            <div className="flex flex-wrap justify-center gap-2">
              <button onClick={() => { setLocalQ(''); setSearchParams({}); }}
                className="px-5 py-2.5 glass rounded-full text-xs font-semibold text-white/50 hover:text-white/80 uppercase tracking-widest transition-all">
                Цэвэрлэх
              </button>
              <Link to="/gers" className="px-5 py-2.5 bg-yellow-400/10 border border-yellow-400/20 rounded-full text-xs font-semibold text-yellow-400 uppercase tracking-widest hover:bg-yellow-400/15 transition-all">
                Бүх гэрүүд
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
