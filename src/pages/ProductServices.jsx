import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import PageHero from '../components/PageHero';

export default function ProductServices() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('all');
  const [sort,     setSort]     = useState('default');

  useEffect(() => {
    api.get('/api/products/all')
      .then(r => { setProducts(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))], [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (category !== 'all') list = list.filter(p => p.category === category);
    if (search.trim()) list = list.filter(p =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === 'price-asc')  list.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (sort === 'stock')      list.sort((a, b) => b.stock - a.stock);
    return list;
  }, [products, category, search, sort]);

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Дурсгалын зүйлс"
        title="Манай"
        accent="Дэлгүүр"
        subtitle="Казах гар урлал, байгалийн бүтээгдэхүүн болон дурсгалын зүйлс"
        right={
          !loading && (
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/6 rounded-full px-4 py-2">
              <span className="text-sm font-black text-yellow-400">{products.length}</span>
              <span className="text-white/40 text-[10px] font-medium">бараа</span>
            </div>
          )
        }
      />

      {/* ── Filters ── */}
      {!loading && products.length > 0 && (
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

          <select value={sort} onChange={e => setSort(e.target.value)}
            className="h-9 px-4 bg-white/[0.04] border border-white/8 rounded-full text-sm text-white/50 outline-none focus:border-yellow-400/30 cursor-pointer transition-all">
            <option value="default">Эрэмбэлэх</option>
            <option value="price-asc">Үнэ: багаас их</option>
            <option value="price-desc">Үнэ: ихээс бага</option>
            <option value="stock">Нөөцөөр</option>
          </select>

          <span className="text-white/20 text-xs ml-auto">{filtered.length} бараа</span>
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
            <p className="text-4xl mb-4">🛍️</p>
            <p className="text-white/20 font-semibold uppercase tracking-widest text-sm">Бараа олдсонгүй</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((product, i) => (
              <div key={product._id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
