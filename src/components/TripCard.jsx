import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { formatCurrency } from '../utils/formatters.js';

export default function TripCard({ trip }) {
  const navigate = useNavigate();
  const [imgErr, setImgErr] = useState(false);

  const isNew = trip.createdAt && (new Date() - new Date(trip.createdAt)) < 7 * 24 * 60 * 60 * 1000;
  const src   = !imgErr && trip.image ? `${api.defaults.baseURL}/uploads/${trip.image}` : '/placeholder.jpg';

  return (
    <div
      onClick={() => trip?._id && navigate(`/trip/${trip._id}`)}
      className="group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer select-none border border-white/5 hover:border-yellow-400/20 transition-colors duration-500"
    >
      {/* Image */}
      <img
        src={src}
        alt={trip.title}
        onError={() => setImgErr(true)}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out brightness-70 group-hover:brightness-85"
      />

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent" />

      {/* ── TOP ── */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
        <div className="bg-black/50 backdrop-blur-xl border border-white/8 rounded-full px-3 py-1.5 flex items-center gap-1.5">
          <svg className="h-2.5 w-2.5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">
            {trip.duration ? `${trip.duration} цаг` : '1 өдөр'}
          </span>
        </div>

        {isNew && (
          <span className="bg-yellow-400 text-black text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
            Шинэ
          </span>
        )}
      </div>

      {/* ── BOTTOM ── */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        {trip.location && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <svg className="h-2.5 w-2.5 text-yellow-400/50 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-[9px] font-semibold text-white/35 uppercase tracking-widest truncate">{trip.location}</span>
          </div>
        )}

        <h2 className="text-lg font-black text-white uppercase italic tracking-tight leading-tight mb-3 group-hover:text-yellow-400 transition-colors duration-300 line-clamp-2">
          {trip.title}
        </h2>

        {trip.description && (
          <p className="text-white/25 text-xs leading-relaxed mb-3 line-clamp-2">{trip.description}</p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-white/8">
          <div>
            <p className="text-[8px] text-white/25 uppercase tracking-widest font-medium mb-0.5">Нэг хүний</p>
            <p className="text-white font-black text-base leading-none">{formatCurrency(trip.pricePerPerson)}</p>
          </div>
          <span className="text-[9px] font-semibold text-white/35 group-hover:text-yellow-400 uppercase tracking-widest transition-colors">
            Захиалах →
          </span>
        </div>
      </div>
    </div>
  );
}
