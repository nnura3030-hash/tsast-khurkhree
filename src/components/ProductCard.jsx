import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';

export default function ProductCard({ product }) {
  const [imgErr, setImgErr] = useState(false);
  const src = !imgErr && product.image ? `${api.defaults.baseURL}/uploads/${product.image}` : '/placeholder.jpg';
  const lowStock = product.stock <= 5 && product.stock > 0;
  const outStock = product.stock === 0;

  return (
    <Link
      to={`/product/${product._id}`}
      className="group relative aspect-square rounded-3xl overflow-hidden block select-none"
    >
      {/* Image */}
      <img
        src={src}
        alt={product.name}
        onError={() => setImgErr(true)}
        className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-[800ms] ease-out brightness-75 group-hover:brightness-90"
      />

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-transparent" />
      <div className="absolute inset-0 bg-yellow-400/4 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* ── TOP ── */}
      <div className="absolute top-3 left-3 right-3 flex justify-between z-10">
        {lowStock && !outStock && (
          <span className="bg-orange-500/80 backdrop-blur-sm text-white text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
            Дуусаж байна
          </span>
        )}
        {outStock && (
          <span className="bg-red-500/80 backdrop-blur-sm text-white text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
            Дууссан
          </span>
        )}
        {!lowStock && !outStock && <span />}

        <span className="glass text-white/60 text-[8px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
          {product.category}
        </span>
      </div>

      {/* ── BOTTOM ── */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <h3 className="text-sm font-black text-white uppercase italic tracking-tight leading-tight mb-2 line-clamp-2 group-hover:text-yellow-400 transition-colors duration-300">
          {product.name}
        </h3>

        <div className="flex items-center justify-between">
          <p className="text-yellow-400 font-black text-base leading-none">{formatCurrency(product.price)}</p>
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/35 uppercase tracking-widest group-hover:text-yellow-400 transition-colors duration-300">
            Харах
            <svg className="h-3 w-3 group-hover:translate-x-0.5 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Border glow */}
      <div className="absolute inset-0 rounded-3xl border border-transparent group-hover:border-yellow-400/20 transition-colors duration-500 pointer-events-none" />
    </Link>
  );
}
