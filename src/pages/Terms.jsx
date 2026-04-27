import React from 'react';
import { useNavigate } from 'react-router-dom';

const TERMS = [
  {
    num: '01', title: 'Үйлчилгээний үндсэн нөхцөл',
    items: ['Захиалга хийхдээ 18-аас дээш насны хүн байх ёстой', 'Бүтэн нэр, утасны дугаараа үнэн зөв оруулна', 'Захиалгын баталгаажуулалт SMS-ээр ирнэ', 'Нэг хэрэглэгч олон захиалга хийж болно'],
  },
  {
    num: '02', title: 'Үнэ ба төлбөр',
    items: ['Үнэ нийтлэгдсэн тарифаар тооцогдоно', 'Бүх төлбөр byl.mn системээр хийгдэнэ', 'Буцаан олговор 5–7 ажлын өдөрт хийгдэнэ', 'Нэмэлт үйлчилгээний үнэ тусдаа тооцогдоно'],
  },
  {
    num: '03', title: 'Цуцлах бодлого',
    items: ['7 хоногоос өмнө: 90% буцаан өгнө', '3 хоногоос өмнө: 50% буцаан өгнө', '3 хоногоос хойш: буцаан өгөхгүй', 'Цаг агаарын онцгой байдал: 100% буцаана'],
  },
  {
    num: '04', title: 'Үйлчилгээний хамрах хүрээ',
    items: ['Гэрүүд 24/7 халаалт, цэвэрлэгдэн байна', 'Хоол хүнс тусдаа захиална', 'Аялалын хөтч нэмэлт үйлчилгээ юм', 'WiFi байж болохгүй — сүлжээ хязгаарлагдмал'],
  },
  {
    num: '05', title: 'Нууцлалын бодлого',
    items: ['Хувийн мэдээллийг гуравдагч этгээдэд өгөхгүй', 'Зөвхөн захиалга баталгаажуулахад ашиглана', 'Хэрэглэгч мэдээллээ устгуулах хүсэлт гаргаж болно'],
  },
];

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-28 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-gray-600 hover:text-white text-[10px] font-black uppercase tracking-widest mb-10 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
          Буцах
        </button>

        <div className="mb-12">
          <p className="text-yellow-400 font-black uppercase tracking-[0.4em] text-[9px] mb-4">Цаст Хүрхрээ Ресорт</p>
          <h1 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter">
            Гэрээ & <span className="animate-gradient-text">Нөхцөл</span>
          </h1>
        </div>

        <div className="h-px bg-gradient-to-r from-yellow-400/30 via-white/5 to-transparent mb-12" />

        <div className="space-y-5">
          {TERMS.map((term) => (
            <div key={term.num} className="bg-white/3 border border-white/6 hover:border-yellow-400/15 rounded-3xl p-7 transition-all duration-300 group">
              <div className="flex items-center gap-4 mb-5">
                <span className="text-yellow-400 font-black text-sm italic opacity-50">{term.num}</span>
                <h2 className="text-lg font-black text-white uppercase italic tracking-tight group-hover:text-yellow-400 transition-colors">{term.title}</h2>
              </div>
              <ul className="space-y-2.5">
                {term.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-400 text-sm leading-relaxed">
                    <span className="text-yellow-400/50 shrink-0 mt-1">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="flex items-center gap-3 bg-yellow-400/8 border border-yellow-400/15 rounded-2xl px-5 py-4">
            <span className="text-yellow-400">⚠️</span>
            <p className="text-yellow-400/80 text-xs font-bold">Сүүлийн шинэчлэл: 2026-04-25</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
