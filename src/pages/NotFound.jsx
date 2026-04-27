import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-lg">
        <p className="text-[140px] md:text-[200px] font-black text-white/[0.04] leading-none tracking-tighter select-none">
          404
        </p>
        <div className="-mt-10 md:-mt-14">
          <p className="text-yellow-400/60 text-[9px] font-semibold tracking-[0.5em] uppercase mb-4 animate-fade-up">
            Хуудас олдсонгүй
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-5 animate-fade-up-delay-1">
            Энэ хуудас<br />байхгүй байна
          </h1>
          <p className="text-white/30 text-sm leading-relaxed mb-10 max-w-sm mx-auto animate-fade-up-delay-2">
            Та хайж буй хуудас нүүлгэгдсэн, устгагдсан эсвэл хаяг буруу бичигдсэн байж болзошгүй.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-up-delay-3">
            <Link to="/"
              className="inline-flex items-center gap-2 bg-yellow-400 text-black px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white transition-all duration-200 active:scale-95">
              Нүүр хуудас
            </Link>
            <button onClick={() => navigate(-1)}
              className="px-8 py-4 rounded-full text-sm font-semibold text-white/35 uppercase tracking-widest border border-white/10 hover:border-white/25 hover:text-white/65 transition-all active:scale-95">
              Буцах
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
