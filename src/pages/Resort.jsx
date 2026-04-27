import React from 'react';
import { useNavigate } from 'react-router-dom';

const Resort = () => {
  const navigate = useNavigate();

  const facilities = [
    { icon: '🏡', title: 'Сайн байдлын Гэр', desc: 'Уламжлалт монгол гэр дизайнтай, орчин үеийн хог ясат' },
    { icon: '🍽️', title: 'Ресторан', desc: 'Монголын уламжлалт хоол, байлдан хоол, ба ELEC гадаад сонголт' },
    { icon: '🛁', title: 'Суванц & Сауна', desc: '24/7 ачиг цэвэрлэгдэн, эргүүлэлтэй голын ус' },
    { icon: '📚', title: 'Ажилтан Төв', desc: 'Чөлөвт компьютер, интернет, төсвийн үйлчилгээ' },
    { icon: '🎯', title: 'Үйл ажиллагаа', desc: 'Морины аялал, явган аялал, загас агнуулга, фото авалт' },
    { icon: '👨‍⚕️', title: 'Эмч', desc: '24/7 үл найдвартай эмч, түргэний тусламж бэлэн' },
  ];

  return (
    <div className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-widest mb-10 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
          Буцах
        </button>

        <div className="mb-12">
          <p className="text-yellow-400 font-black uppercase tracking-[0.4em] text-[9px] mb-4">Ресорт</p>
          <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">
            Ресортын <span className="animate-gradient-text">Тухай</span>
          </h1>
          <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mt-3">Цаст Хүрхрээ Ресорт · Боломж ба үйлчилгээ</p>
        </div>
        <div className="h-px bg-gradient-to-r from-yellow-400/30 via-white/5 to-transparent mb-12" />

        <div>

          <section className="mb-16">
            <h2 className="text-3xl font-black italic mb-8 text-white">📜 Түүх ба Сан</h2>
            <div className="bg-white/3 border border-white/6 rounded-2xl p-8">
              <p className="text-base text-gray-400 leading-relaxed mb-4">
                <strong>Цаст Хүрхрээ Ресорт</strong> нь 2010 оноос үйл ажиллагаа явуулж байна. 
                Монголын өмнөд баруун өлсөн дээр, байгалийн сайхан үзэмж дотор.
              </p>
              <p className="text-base text-gray-400 leading-relaxed">
                Бид Баян-Өлгийн байгалийн урт эдэлгээ ба эргүүлэх дэвлөпмэнт хийхээр үлэмжилж байна. 
                Аялагчдын найдварт үйлчилгээ болон байгалийн орчны хүлээн авч байна.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-black italic mb-8 text-white">🏢 Байршил & хашаа</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-6 text-center">
                <h4 className="text-4xl font-black text-blue-600 mb-2">25</h4>
                <p className="font-bold text-gray-400">Гэрүүд</p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-400/20 rounded-xl p-6 text-center">
                <h4 className="text-4xl font-black text-green-600 mb-2">100+</h4>
                <p className="font-bold text-gray-400">Хүмүүс/Нэг сарын</p>
              </div>
              <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-6 text-center">
                <h4 className="text-4xl font-black text-yellow-600 mb-2">50</h4>
                <p className="font-bold text-gray-400">Ажилтан</p>
              </div>
              <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-6 text-center">
                <h4 className="text-4xl font-black text-red-600 mb-2">16 км²</h4>
                <p className="font-bold text-gray-400">Нийт талбай</p>
              </div>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-black italic mb-8 text-white">✨ Байршил & үйлчилгээ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {facilities.map((facility, idx) => (
                <div key={idx} className="bg-white/3 border border-white/6 hover:border-yellow-400/20 rounded-2xl p-8 transition-all duration-300">
                  <div className="text-5xl mb-4">{facility.icon}</div>
                  <h3 className="text-lg font-black text-white mb-3">{facility.title}</h3>
                  <p className="text-gray-500 text-sm">{facility.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-black italic mb-8 text-white">🎯 Эргүүлэх үйл ажиллагаа</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-white/3 border border-white/6 p-6 rounded-xl">
                <span className="text-3xl">🐴</span>
                <div>
                  <h4 className="font-black text-white mb-2">Морины сургалт & аялал</h4>
                  <p className="text-gray-500">Эргүүлэлтийн салал, олон өндөр үзэмжийн аялал, сүмийн их хүрээлэх</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-white/3 border border-white/6 p-6 rounded-xl">
                <span className="text-3xl">🥾</span>
                <div>
                  <h4 className="font-black text-white mb-2">Явган аялал & үүргүүлэлт</h4>
                  <p className="text-gray-500">Нур, оройн өргүүлэлт, байгалийн урт аялал эргүүлэлтүүд</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-white/3 border border-white/6 p-6 rounded-xl">
                <span className="text-3xl">🎣</span>
                <div>
                  <h4 className="font-black text-white mb-2">Загас агнуулга & сийлж</h4>
                  <p className="text-gray-500">Байгалийн нуур, голын загас агнуулга, мөнгө үйлчилгээ</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-white/3 border border-white/6 p-6 rounded-xl">
                <span className="text-3xl">📸</span>
                <div>
                  <h4 className="font-black text-white mb-2">Фото авалтын тур</h4>
                  <p className="text-gray-500">Байгалийн сайхан үзэмжээр дүүргэлэх фото авалт</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-emerald-500/8 border border-emerald-400/15 rounded-2xl p-8">
            <h3 className="text-2xl font-black italic mb-4 text-white">🌱 Урт эдэлгээ</h3>
            <p className="text-base text-gray-400 leading-relaxed">
              Цаст Хүрхрээ Ресорт нь байгалийн орчны сохрож үл идэвхтэй байдлыг эргүүлэлт байгалийн үлэмжилж байна. 
              Эргүүлэлтийн хөгжилөг шинэ, байгалийн хөнгөлөлт эргүүлэлтүүдийн хүлээн авч буй юм.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Resort;
