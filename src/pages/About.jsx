import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const STATS = [
  { value: '2019', label: 'Үүсгэн байгуулагдсан', sub: 'Founded' },
  { value: '15k+', label: 'Нийт зочид',            sub: 'Total Guests' },
  { value: '20+',  label: 'Монгол гэр',             sub: 'Private Gers' },
  { value: '4.9★', label: 'Дундаж үнэлгээ',         sub: 'Avg. Rating' },
];

const VALUES = [
  {
    icon: '✦',
    title: 'Байгаль хамгаалал',
    desc: 'Орчны хамгаалал, хариуцлагатай аяллын соёлыг дэмжин, байгалийн өвлийг ирэх үеийн хүмүүст хадгалан үлдээх.',
    color: 'text-emerald-400',
    glow: 'bg-emerald-400/5',
  },
  {
    icon: '✦',
    title: 'Казах уламжлал',
    desc: 'Орон нутгийн Казах соёл, уламжлалт гар урлал, хоол хүнсийг зочдод бодитоор мэдрүүлж, хадгалан дамжуулна.',
    color: 'text-yellow-400',
    glow: 'bg-yellow-400/5',
  },
  {
    icon: '✦',
    title: 'Тав тух',
    desc: 'Уламжлалт гэрийн дотор орчин үеийн тав тухыг бүрдүүлж, зочид дулаан дотно орчинд амрах боломжийг олгоно.',
    color: 'text-blue-400',
    glow: 'bg-blue-400/5',
  },
];

const TIMELINE = [
  { year: '2019', title: 'Үүсгэн байгуулагдсан', desc: '5 гэрээс эхлэн Цэнгэл сумын нутагт байгаль ааш, Казах соёлыг хослуулсан амралтын газар нээлтээ хийлээ.' },
  { year: '2021', title: 'Өргөтгөл', desc: 'Шинэ гэрүүд нэмэгдэж, аяллын үйлчилгээ болон хоолны цэс нэвтрэгдлээ. Зочдын тоо 3 дахин өслөө.' },
  { year: '2023', title: 'Цахим шинэчлэл', desc: 'Онлайн захиалгын систем, хиймэл оюун ухааны туслах бот нэвтрэгдэж, үйлчилгээний чанар эрс дээшиллээ.' },
  { year: '2024', title: 'Олон улсад танигдав', desc: 'Олон улсын аяллын сэтгүүл, платформ дээр тэмдэглэгдэж, гадаадын зочдын тоо 40% нэмэгдлээ.' },
];

export default function About() {
  const lineRef = useRef(null);

  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) el.style.height = '100%'; },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="bg-[#F8F5EF] dark:bg-[#080809] overflow-x-hidden transition-colors duration-300">

      {/* ── HERO ── */}
      <section className="min-h-[70vh] flex items-center">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 pt-32 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 mb-8 animate-fade-up">
              <div className="h-px w-8 bg-yellow-400/50" />
              <span className="text-yellow-400/70 text-[9px] font-semibold tracking-[0.55em] uppercase">Манай түүх</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-[0.9] mb-6 animate-fade-up-delay-1">
              Байгаль &<br />
              <span className="animate-gradient-text">Соёл</span>
            </h1>
            <p className="text-white/40 text-base leading-relaxed max-w-md mb-10 animate-fade-up-delay-2">
              "Цаст Хүрхрээ" ресорт нь Баян-Өлгий аймгийн Цэнгэл сумын нутагт, Бага Түргэний хүрхрээний дэргэд байрлах аялал жуулчлалын цогцолбор юм.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-up-delay-3">
              <Link to="/gers"
                className="inline-flex items-center gap-2 bg-yellow-400 text-black px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white transition-all duration-200 active:scale-95">
                Гэр захиалах
              </Link>
              <Link to="/location"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold text-white/50 uppercase tracking-widest border border-white/10 hover:border-white/25 hover:text-white/80 transition-all active:scale-95">
                Байршил харах
              </Link>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((s, i) => (
              <div key={i} className="glass rounded-3xl p-6 hover:border-yellow-400/20 transition-all duration-300 group">
                <p className="text-4xl font-black text-yellow-400 italic tracking-tighter leading-none mb-2">{s.value}</p>
                <p className="text-white/70 text-sm font-semibold">{s.label}</p>
                <p className="text-white/25 text-[10px] uppercase tracking-widest mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-10 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative order-2 lg:order-1">
            <div className="relative rounded-3xl overflow-hidden border border-white/6">
              <img src="/destination.jpg" alt="Resort" className="w-full h-[480px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <div className="glass rounded-2xl px-5 py-4">
                  <p className="text-[9px] font-semibold text-yellow-400/70 uppercase tracking-widest mb-1">Байршил</p>
                  <p className="text-white font-bold text-sm">Цэнгэл сум, Баян-Өлгий · 1800м өндөр</p>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2 space-y-8">
            <div>
              <p className="text-yellow-400/70 text-[9px] font-semibold tracking-[0.5em] uppercase mb-4">Бидний зорилго</p>
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-tight mb-6">
                Байгалийн онгон<br />төрхийг хадгалах
              </h2>
              <p className="text-white/45 text-base leading-relaxed">
                Аялагч бүрт байгалийн онгон төрх, Казах түмний соёл уламжлалыг ая тухтай орчинд мэдрүүлэх нь бидний эрхэм зорилго юм.
                Алтайн уулсын зүрхэнд байрлах бидний ресорт нь тайван дотно орчноо санал болгоно.
              </p>
            </div>

            <div className="space-y-4">
              {VALUES.map((v, i) => (
                <div key={i} className={`group flex items-start gap-4 p-5 rounded-2xl ${v.glow} border border-white/5 hover:border-white/10 transition-all duration-300`}>
                  <span className={`text-xl ${v.color} shrink-0 mt-0.5`}>{v.icon}</span>
                  <div>
                    <h3 className={`font-bold text-sm uppercase tracking-wide mb-1 ${v.color}`}>{v.title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="py-24 md:py-32">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
          <div className="text-center mb-20">
            <p className="text-yellow-400/70 text-[9px] font-semibold tracking-[0.5em] uppercase mb-4">Хөгжлийн замнал</p>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter">Бидний түүх</h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-white/5 hidden md:block">
              <div
                ref={lineRef}
                className="w-full bg-gradient-to-b from-yellow-400/50 to-transparent"
                style={{ height: '0%', transition: 'height 2s ease' }}
              />
            </div>

            <div className="space-y-12 md:space-y-0">
              {TIMELINE.map((t, i) => (
                <div key={i} className={`relative md:grid md:grid-cols-2 md:gap-12 md:items-center ${i % 2 === 0 ? '' : 'md:direction-rtl'}`}>
                  {/* Content */}
                  <div className={`${i % 2 === 0 ? 'md:text-right md:pr-12' : 'md:col-start-2 md:pl-12'} mb-6 md:mb-16`}>
                    <div className={`inline-flex items-center gap-2 mb-3 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                      <span className="text-yellow-400 font-black text-2xl italic">{t.year}</span>
                      <div className="h-px w-8 bg-yellow-400/40" />
                    </div>
                    <h3 className="text-white font-black text-lg uppercase italic tracking-tight mb-2">{t.title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed max-w-sm">{t.desc}</p>
                  </div>

                  {/* Center dot */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-3 w-3 h-3 bg-yellow-400 rounded-full hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT CTA ── */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-10 pb-28 md:pb-36">
        <div className="rounded-[2rem] border border-white/6 bg-white/[0.02]">
          <div className="p-10 md:p-16 lg:p-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-yellow-400/60 text-[9px] font-semibold tracking-[0.5em] uppercase mb-5">Холбоо барих</p>
                <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-[0.95] mb-6">
                  Аяллаа<br /><span className="animate-gradient-text">эхлүүл</span>
                </h2>
                <p className="text-white/40 text-base leading-relaxed max-w-md">
                  Захиалга эсвэл асуулт байвал бидэнтэй холбогдоорой. Бид 24 цагийн дотор хариу өгнө.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: '📞', label: 'Утас', value: '+976 8888 8888' },
                  { icon: '📧', label: 'Имэйл', value: 'info@tsastkhurkhree.mn' },
                  { icon: '📍', label: 'Хаяг', value: 'Баян-Өлгий, Цэнгэл сум, Монгол' },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-4 glass rounded-2xl px-5 py-4">
                    <span className="text-2xl">{c.icon}</span>
                    <div>
                      <p className="text-white/30 text-[9px] uppercase tracking-widest font-semibold">{c.label}</p>
                      <p className="text-white font-semibold text-sm">{c.value}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <Link to="/gers" className="flex-1 py-4 bg-yellow-400 text-black rounded-2xl font-bold text-sm uppercase tracking-widest text-center hover:bg-white transition-all active:scale-95">
                    Захиалах
                  </Link>
                  <Link to="/location" className="flex-1 py-4 border border-white/10 text-white/60 rounded-2xl font-semibold text-sm uppercase tracking-widest text-center hover:border-white/25 hover:text-white/80 transition-all">
                    Байршил
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
