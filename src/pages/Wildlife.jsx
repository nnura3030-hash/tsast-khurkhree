import React from 'react';
import { useNavigate } from 'react-router-dom';

const Wildlife = () => {
  const navigate = useNavigate();

  const animals = [
    { name: 'Сүүлийн Ноён', desc: 'Сэлэнгэ ойд оршиж буй том гавуй. Ихэнх цаг шөнө идэвхтэй.', icon: '🐻' },
    { name: 'Сүүлийн Иргэнүүд', desc: 'Олон төрлийн дусан яргуй, улаан лиcтвээнцик.', icon: '🦌' },
    { name: 'Нэмүүд', desc: 'Баян-Өлгийн орлон. Нарнаас оргилтай амьтан. Нялигм иргэнцэг', icon: '🐺' },
    { name: 'Сүүлийн Сэргэ', desc: 'Байгалийн баялагийн хүнс идэвхтэй байдаг. Ихэнх ноён амьтан.', icon: '🦅' },
    { name: 'Уяа & Нохойн Төл', desc: 'Төрөл бүрийн саруулсан амьтан. Ихэнх нэгдэлтэй үйл ажиллагаатай', icon: '🐦' },
    { name: 'Өлгий Өлсөлцөд', desc: 'Нарлаг эргүүлэх соруулж байдаг. Цэвэр агаарын шиг үнэлэлтэй', icon: '🦝' }
  ];

  return (
    <div className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-gray-600 hover:text-white text-[10px] font-black uppercase tracking-widest mb-10 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
          Буцах
        </button>

        <div className="mb-12">
          <p className="text-yellow-400 font-black uppercase tracking-[0.4em] text-[9px] mb-4">Ан амьтад</p>
          <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">
            Зэрлэг <span className="animate-gradient-text">Амьтад</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-3">Алтайн нуруу · Баян-Өлгий</p>
        </div>
        <div className="h-px bg-gradient-to-r from-yellow-400/30 via-white/5 to-transparent mb-12" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {animals.map((animal, idx) => (
            <div key={idx} className="bg-white/3 border border-white/6 hover:border-purple-400/20 rounded-3xl p-7 transition-all duration-300 group">
              <div className="text-4xl mb-4">{animal.icon}</div>
              <h3 className="text-base font-black text-white uppercase italic tracking-tight mb-3 group-hover:text-purple-400 transition-colors">{animal.name}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{animal.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-start gap-4 bg-red-500/8 border border-red-400/15 rounded-3xl p-7">
          <span className="text-2xl">⚠️</span>
          <div>
            <h2 className="text-base font-black text-red-400 uppercase italic tracking-tight mb-2">Анхааруулга</h2>
            <p className="text-gray-400 text-sm leading-relaxed">Зэрлэг амьтанд ойртохдоо болгоомжилно уу. Фото авахдаа хол зайнаас авна. Амьтан хамгаалах дүрмийг заавал баримтална.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wildlife;
