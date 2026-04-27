import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import GerCard from '../components/GerCard';
import ResortMap from '../components/ResortMap';
import PageHero from '../components/PageHero';

const STATUS_OPTS = [
  { value: 'all',         label: 'Бүгд' },
  { value: 'available',   label: 'Сул' },
  { value: 'booked',      label: 'Захиалсан' },
  { value: 'maintenance', label: 'Засвартай' },
];

export default function GerServices() {
  const [gers,     setGers]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [viewMode, setViewMode] = useState('map');
  const [status,   setStatus]   = useState('all');
  const [sortBy,   setSortBy]   = useState('default');
  const [search,   setSearch]   = useState('');

  useEffect(() => {
    api.get('/api/gers/all')
      .then(r => { setGers(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...gers];
    if (status !== 'all')   list = list.filter(g => g.status === status);
    if (search.trim())      list = list.filter(g =>
      g.title?.toLowerCase().includes(search.toLowerCase()) ||
      String(g.gerNumber).includes(search)
    );
    if (sortBy === 'price-asc')  list.sort((a, b) => a.pricePerNight - b.pricePerNight);
    if (sortBy === 'price-desc') list.sort((a, b) => b.pricePerNight - a.pricePerNight);
    if (sortBy === 'number')     list.sort((a, b) => String(a.gerNumber).localeCompare(String(b.gerNumber)));
    return list;
  }, [gers, status, sortBy, search]);

  const counts = useMemo(() => ({
    all:         gers.length,
    available:   gers.filter(g => g.status === 'available').length,
    booked:      gers.filter(g => g.status === 'booked').length,
    maintenance: gers.filter(g => g.status === 'maintenance').length,
  }), [gers]);

  const StatPill = ({ value, label, color = 'text-stone-700 dark:text-white' }) => (
    <div className="flex items-center gap-2 bg-stone-100 dark:bg-white/[0.04] border border-stone-200 dark:border-white/6 rounded-full px-4 py-2">
      <span className={`text-sm font-black ${color}`}>{value}</span>
      <span className="text-stone-500 dark:text-white/40 text-[10px] font-medium">{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Ая тухтай орчин"
        title="Монгол"
        accent="Гэрүүд"
        subtitle="Уламжлалт монгол гэрт байгалийн тайвшралыг мэдэрч амарцгаая"
        right={
          !loading && (
            <div className="flex flex-wrap gap-2">
              <StatPill value={counts.available} label="сул"      color="text-emerald-400" />
              <StatPill value={counts.booked}    label="захиалсан" color="text-yellow-400" />
              <StatPill value={counts.all}       label="нийт" />
            </div>
          )
        }
      />

      {/* ── Controls ── */}
      <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-6 flex flex-wrap items-center gap-3">

        {/* View toggle */}
        <div className="flex items-center bg-white/[0.04] border border-white/8 rounded-xl p-1 gap-1">
          {[
            { mode: 'map',  label: 'Газрын зураг' },
            { mode: 'grid', label: 'Жагсаалт' },
          ].map(({ mode, label }) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-200 ${
                viewMode === mode ? 'bg-yellow-400 text-black' : 'text-white/40 hover:text-white/70'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {viewMode === 'grid' && (
          <>
            {/* Search */}
            <div className="relative">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Хайх..."
                className="h-9 pl-9 pr-4 w-40 bg-white/[0.04] border border-white/8 rounded-full text-sm text-white placeholder-white/25 outline-none focus:border-yellow-400/30 transition-all" />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>

            {/* Status filter */}
            <div className="flex items-center bg-white/[0.04] border border-white/8 rounded-full p-1 gap-1">
              {STATUS_OPTS.map(o => (
                <button key={o.value} onClick={() => setStatus(o.value)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-widest transition-all duration-200 ${
                    status === o.value ? 'bg-yellow-400 text-black' : 'text-white/40 hover:text-white/70'
                  }`}>
                  {o.label}
                  {o.value !== 'all' && <span className="ml-1 opacity-60">({counts[o.value]})</span>}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="h-9 px-4 bg-white/[0.04] border border-white/8 rounded-full text-sm text-white/50 outline-none focus:border-yellow-400/30 transition-all cursor-pointer">
              <option value="default">Эрэмбэлэх</option>
              <option value="price-asc">Үнэ: багаас их</option>
              <option value="price-desc">Үнэ: ихээс бага</option>
              <option value="number">Дугаараар</option>
            </select>

            <span className="text-white/20 text-xs ml-auto">{filtered.length} гэр</span>
          </>
        )}
      </div>

      {/* ── Content ── */}
      <div className="max-w-screen-xl mx-auto px-6 md:px-10 pb-24">
        {loading ? (
          <div className="flex flex-col items-center py-32 gap-4">
            <div className="w-8 h-8 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
            <p className="text-white/20 text-xs font-semibold uppercase tracking-widest">Уншиж байна...</p>
          </div>
        ) : (
          <div className="animate-fade-up">
            {viewMode === 'map' ? (
              <ResortMap gers={gers} />
            ) : filtered.length === 0 ? (
              <div className="text-center py-32">
                <p className="text-5xl mb-4">🏠</p>
                <p className="text-white/20 font-semibold uppercase tracking-widest text-sm">Гэр олдсонгүй</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((ger, i) => (
                  <div key={ger._id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
                    <GerCard ger={ger} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
