import React from 'react';
import { useNavigate } from 'react-router-dom';

const RULES = [
  {
    num: '01', title: 'Аялагчдын нийтийн дүрэм',
    items: ['Бүх аялагчид байгаль орчныг хамгаалах зарчмыг баримтална', 'Ресортын ажилтан болон бусад аялагчдыг хүндэтгэнэ', 'Нийтийн эзэмшлийн зүйлсийг хэвийн нөхцөлд буцаана', 'Гэрийн дотор тамхи татахгүй'],
  },
  {
    num: '02', title: 'Байгаль орчны хамгаалал',
    items: ['Хог хаягдлаа зааврын дагуу ангилан хаяна', 'Ой мод, цэцэг ургамлыг гэмтээхгүй', 'Гал асаахдаа тусгайлан заасан газар ашиглана', 'Буцаж явахдаа газрыг цэвэрхэн үлдээнэ'],
  },
  {
    num: '03', title: 'Аюулгүй байдал',
    items: ['Аялалын үед хөтчийн зааврыг дагана', 'Хилийн бүсэд заавал зөвшөөрөлтэй явна', 'Анхны тусламжийн хайрцаг авчирна', 'Гадаргуугийн аюул болон цаг агаарын мэдээллийг авна'],
  },
  {
    num: '04', title: 'Тоног төхөөрөмж ашиглалт',
    items: ['Цахилгааны тоног төхөөрөмжийг зөв ашиглана', 'Гэр дотор гал аваа авахгүй', 'Гэрийн эд хогшлыг гэмтээхгүй байна', 'Асуулт гарвал ажилтанд хандана'],
  },
  {
    num: '05', title: 'Харилцааны дүрэм',
    items: ['Чимээ шуугиан 22:00-08:00 цагийн хооронд бууруулна', 'Бусад аялагчдын нууцлалыг хүндэтгэнэ', 'Ресортын үйлчилгээний талаар санал хүсэлтийг шууд мэдэгдэнэ'],
  },
];

const CompanyRules = () => {
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
            Компани <span className="animate-gradient-text">Дүрэм</span>
          </h1>
        </div>

        <div className="h-px bg-gradient-to-r from-yellow-400/30 via-white/5 to-transparent mb-12" />

        <div className="space-y-5">
          {RULES.map((rule) => (
            <div key={rule.num} className="bg-white/3 border border-white/6 hover:border-yellow-400/15 rounded-3xl p-7 transition-all duration-300 group">
              <div className="flex items-center gap-4 mb-5">
                <span className="text-yellow-400 font-black text-sm italic opacity-50">{rule.num}</span>
                <h2 className="text-lg font-black text-white uppercase italic tracking-tight group-hover:text-yellow-400 transition-colors">{rule.title}</h2>
              </div>
              <ul className="space-y-2.5">
                {rule.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-400 text-sm leading-relaxed">
                    <span className="text-yellow-400/50 shrink-0 mt-1">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanyRules;
