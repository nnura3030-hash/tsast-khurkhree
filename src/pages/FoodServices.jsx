import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import FoodCard from '../components/FoodCard';
import PageHero from '../components/PageHero';

export default function FoodServices() {
  const [foods,    setFoods]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    api.get('/api/foods/all')
      .then(r => { setFoods(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = useMemo(() => [...new Set(foods.map(f => f.category).filter(Boolean))], [foods]);

  const filtered = useMemo(() => {
    let list = [...foods];
    if (category !== 'all') list = list.filter(f => f.category === category);
    if (search.trim())      list = list.filter(f =>
      f.name?.toLowerCase().includes(search.toLowerCase()) ||
      f.category?.toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [foods, category, search]);

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Амтат зоог"
        title="Манай"
        accent="Хоолнууд"
        subtitle="Казах уламжлалт хоол болон ресортын тусгай цэс"
        right={
          !loading && (
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/6 rounded-full px-4 py-2">
              <span className="text-sm font-black text-yellow-400">{foods.length}</span>
              <span className="text-white/40 text-[10px] font-medium">хоол</span>
            </div>
          )
        }
      />

      {/* ── Filters ── */}
      {!loading && foods.length > 0 && (
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-6 flex flex-wrap gap-3 items-center">
          <div className="relative">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Хайх..."
              className="h-9 pl-9 pr-4 w-40 bg-white/[0.04] border border-white/8 rounded-full text-sm text-white placeholder-white/25 outline-none focus:border-yellow-400/30 transition-all" />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>

          {categories.length > 0 && (
            <div className="flex items-center bg-white/[0.04] border border-white/8 rounded-full p-1 gap-1 flex-wrap">
              <button onClick={() => setCategory('all')}
                className={`px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-widest transition-all ${category === 'all' ? 'bg-yellow-400 text-black' : 'text-white/40 hover:text-white/70'}`}>
                Бүгд
              </button>
              {categories.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-widest transition-all ${category === cat ? 'bg-yellow-400 text-black' : 'text-white/40 hover:text-white/70'}`}>
                  {cat}
                </button>
              ))}
            </div>
          )}

          <span className="text-white/20 text-xs ml-auto">{filtered.length} хоол</span>
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
            <p className="text-4xl mb-4">🍽️</p>
            <p className="text-white/20 font-semibold uppercase tracking-widest text-sm">Хоол олдсонгүй</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((food, i) => (
              <div key={food._id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 7) * 50}ms` }}>
                <FoodCard food={food} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
