import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { formatCurrency } from '../utils/formatters.js';

export default function GerCard({ ger }) {
  const navigate = useNavigate();
  const [imgErr, setImgErr] = useState(false);

  const isNew       = ger.createdAt && (new Date() - new Date(ger.createdAt)) < 7 * 24 * 60 * 60 * 1000;
  const isAvailable = ger.status === 'available';
  const src         = !imgErr && ger.image ? `${api.defaults.baseURL}/uploads/${ger.image}` : '/placeholder.jpg';

  return (
    <div
      onClick={() => ger?._id && navigate(`/ger/${ger._id}`)}
      className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer select-none border border-white/5 hover:border-yellow-400/20 transition-colors duration-500"
    >
      {/* Image */}
      <img
        src={src}
        alt={ger.title}
        onError={() => setImgErr(true)}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out brightness-75 group-hover:brightness-85"
      />

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

      {/* ── TOP badges ── */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
        <div className="flex flex-col gap-1.5">
          {isNew && (
            <span className="inline-block bg-yellow-400 text-black text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
              Шинэ
            </span>
          )}
          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm border ${
            isAvailable
              ? 'bg-emerald-400/15 border-emerald-400/25 text-emerald-300'
              : 'bg-red-500/15 border-red-500/20 text-red-300'
          }`}>
            <span className={`w-1 h-1 rounded-full ${isAvailable ? 'bg-emerald-400' : 'bg-red-400'}`} />
            {isAvailable ? 'Сул' : ger.status === 'booked' ? 'Захиалсан' : 'Засвартай'}
          </span>
        </div>

        {/* Price */}
        <div className="bg-black/50 backdrop-blur-xl border border-white/8 rounded-xl px-3 py-2 text-right">
          <p className="text-[8px] text-white/35 uppercase tracking-widest font-medium">/ хоног</p>
          <p className="text-yellow-400 font-black text-sm leading-none">{formatCurrency(ger.pricePerNight)}</p>
        </div>
      </div>

      {/* ── BOTTOM info ── */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[9px] font-semibold text-yellow-400/60 uppercase tracking-widest">Гэр {ger.gerNumber}</span>
          <span className="text-white/15">·</span>
          <span className="text-[9px] font-semibold text-white/35 uppercase tracking-widest">{ger.capacity} хүн</span>
        </div>

        <h2 className="text-lg font-black text-white uppercase italic tracking-tight leading-tight mb-3 group-hover:text-yellow-400 transition-colors duration-300 line-clamp-2">
          {ger.title}
        </h2>

        {ger.description && (
          <p className="text-white/30 text-xs leading-relaxed mb-3 line-clamp-2">{ger.description}</p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-white/8">
          <div className="flex items-center gap-3 text-[9px] text-white/25">
            {ger.location && (
              <span className="flex items-center gap-1">
                <svg className="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {ger.location}
              </span>
            )}
          </div>
          <span className="text-[9px] font-semibold text-white/35 group-hover:text-yellow-400 uppercase tracking-widest transition-colors">
            Дэлгэрэнгүй →
          </span>
        </div>
      </div>
    </div>
  );
}
