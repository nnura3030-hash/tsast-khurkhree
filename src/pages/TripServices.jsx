import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import TripCard from '../components/TripCard';
import PageHero from '../components/PageHero';

export default function TripServices() {
  const [trips,   setTrips]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [sort,    setSort]    = useState('default');

  useEffect(() => {
    api.get('/api/trips/all')
      .then(r => { setTrips(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = [...trips];
    if (search.trim()) list = list.filter(t =>
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.location?.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === 'price-asc')  list.sort((a, b) => a.pricePerPerson - b.pricePerPerson);
    if (sort === 'price-desc') list.sort((a, b) => b.pricePerPerson - a.pricePerPerson);
    if (sort === 'duration')   list.sort((a, b) => (a.duration || 0) - (b.duration || 0));
    return list;
  }, [trips, search, sort]);

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Адал явдалт аялал"
        title="Аяллын"
        accent="Багцууд"
        subtitle="Алтайн уулс, хүрхрээ болон нутгийн онцлог газруудаар аялал"
        right={
          !loading && (
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/6 rounded-full px-4 py-2">
              <span className="text-sm font-black text-yellow-400">{trips.length}</span>
              <span className="text-white/40 text-[10px] font-medium">аялал</span>
            </div>
          )
        }
      />

      {/* ── Filters ── */}
      {!loading && trips.length > 0 && (
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-6 flex flex-wrap gap-3 items-center">
          <div className="relative">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Хайх..."
              className="h-9 pl-9 pr-4 w-40 bg-white/[0.04] border border-white/8 rounded-full text-sm text-white placeholder-white/25 outline-none focus:border-yellow-400/30 transition-all" />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>

          <select value={sort} onChange={e => setSort(e.target.value)}
            className="h-9 px-4 bg-white/[0.04] border border-white/8 rounded-full text-sm text-white/50 outline-none focus:border-yellow-400/30 cursor-pointer transition-all">
            <option value="default">Эрэмбэлэх</option>
            <option value="price-asc">Үнэ: багаас их</option>
            <option value="price-desc">Үнэ: ихээс бага</option>
            <option value="duration">Хугацаагаар</option>
          </select>

          <span className="text-white/20 text-xs ml-auto">{filtered.length} аялал</span>
        </div>
      )}

      {/* ── Grid ── */}
      <div className="max-w-screen-xl mx-auto px-6 md:px-10 pb-24">
        {loading ? (
          <div className="flex flex-col items-center py-32 gap-4">
            <div className="w-8 h-8 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
            <p className="text-white/20 text-xs font-semibold uppercase tracking-widest">Уншиж байна...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-5xl mb-4">🧭</p>
            <p className="text-white/20 font-semibold uppercase tracking-widest text-sm">Аялал олдсонгүй</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((trip, i) => (
              <div key={trip._id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}>
                <TripCard trip={trip} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
