import React from 'react';
import { useNavigate } from 'react-router-dom';

const Nature = () => {
  const navigate = useNavigate();

  const naturalFeatures = [
    {
      title: 'Бага Түргэн Усан Цахилгаан',
      description: 'Баян-Өлгий аймгийн хамгийн сайхан байгалийн үзэмж. Эргүүлэх хүнсүүлэх аад сүүлийн эхэн үе',
      icon: '💧'
    },
    {
      title: 'Алтайн Ууланы Аялал',
      description: '3000+ метрийн өндөрт бүхэлд нь нөмөрлөгдсөн ууланы оройн сүлдүүд',
      icon: '⛰️'
    },
    {
      title: 'Ойн Биом',
      description: 'Сэлэнгэ гавилын байгаль - сонгинод болон лиственничной ойн комбинаци',
      icon: '🌲'
    },
    {
      title: 'Хүний Үйл Ажиллагаа Үгүй Газар',
      description: 'Цөмөр салаа, өвгөн модон ба эмгэнэл байгалийн амираа хүлээн авна',
      icon: '🌿'
    },
    {
      title: 'Цаг Агаарын Өнцөг',
      description: 'Сарын хүч, нар шарлагаа болон сүүлийн үеийн эргүүлэх эмхэтгэл',
      icon: '🌤️'
    },
    {
      title: 'Нөмөрлөгдсөн Ус',
      description: 'Цэвэр ус, нөмөрлөгдсөн эргүүлэх болон сэлэнгэ хүн',
      icon: '🏞️'
    }
  ];

  return (
    <div className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-gray-600 hover:text-white text-[10px] font-black uppercase tracking-widest mb-10 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
          Буцах
        </button>

        <div className="mb-12">
          <p className="text-yellow-400 font-black uppercase tracking-[0.4em] text-[9px] mb-4">Байгалийн онцлог</p>
          <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">
            Байгалийн <span className="animate-gradient-text">Онцлог</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-3">Баян-Өлгий аймаг · Цэнгэл сум</p>
        </div>
        <div className="h-px bg-gradient-to-r from-yellow-400/30 via-white/5 to-transparent mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {naturalFeatures.map((feature, idx) => (
            <div key={idx} className="bg-white/3 border border-white/6 hover:border-emerald-400/20 rounded-3xl p-7 transition-all duration-300 group">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-base font-black text-white uppercase italic tracking-tight mb-3 group-hover:text-emerald-400 transition-colors">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-start gap-4 bg-yellow-400/8 border border-yellow-400/15 rounded-3xl p-7">
          <span className="text-2xl">🌱</span>
          <div>
            <h2 className="text-base font-black text-yellow-400 uppercase italic tracking-tight mb-2">Байгалийг хүндэтгэе</h2>
            <p className="text-gray-400 text-sm leading-relaxed">Цаст Хүрхрээ Ресорт нь байгалийн орчныг хамгаалах зарчмаар ажиллаж, урт тогтвортой аяллын соёлыг дэмжинэ.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nature;
