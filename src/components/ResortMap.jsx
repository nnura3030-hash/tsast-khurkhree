import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';

const ResortMap = ({ gers }) => {
  const navigate = useNavigate();
  const [hoveredGer, setHoveredGer] = useState(null);

  const gerPositions = {
    '1-1': { x: 150, y: 350 }, '1-2': { x: 280, y: 360 }, '1-3': { x: 410, y: 370 },
    '1-4': { x: 540, y: 360 }, '1-5': { x: 670, y: 350 },
    '2-1': { x: 180, y: 240 }, '2-2': { x: 300, y: 250 }, '2-3': { x: 420, y: 260 },
    '2-4': { x: 540, y: 250 }, '2-5': { x: 660, y: 240 },
    '3-1': { x: 210, y: 130 }, '3-2': { x: 320, y: 140 }, '3-3': { x: 430, y: 150 },
    '3-4': { x: 540, y: 140 }, '3-5': { x: 650, y: 130 },
  };

  const STATUS = {
    available:    { color: '#4ade80', glow: 'rgba(74,222,128,0.5)',  label: 'Сул' },
    booked:       { color: '#f87171', glow: 'rgba(248,113,113,0.5)', label: 'Захиалсан' },
    maintenance:  { color: '#facc15', glow: 'rgba(250,204,21,0.5)',  label: 'Засвартай' },
  };

  const getStatus = (s) => STATUS[s] || STATUS.available;

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Outer glow */}
      <div className="absolute -inset-4 bg-yellow-400/4 rounded-[3rem] blur-3xl pointer-events-none" />

      <div className="relative bg-[#0d0d14] border border-white/6 rounded-[2.5rem] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.8)]">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-400 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-black" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-white font-black text-sm uppercase italic tracking-tight">Ресортын зураглал</p>
              <p className="text-gray-600 text-[9px] font-bold uppercase tracking-widest">Цэнгэл сум · Баян-Өлгий</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5">
            {Object.values(STATUS).map((s) => (
              <div key={s.label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color, boxShadow: `0 0 6px ${s.glow}` }} />
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── SVG Map ── */}
        <div className="relative p-4 md:p-6">
          <svg viewBox="0 0 800 500" className="w-full h-auto" style={{ filter: 'drop-shadow(0 0 40px rgba(0,0,0,0.5))' }}>
            <defs>
              {/* Sky gradient */}
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0a0a18" />
                <stop offset="100%" stopColor="#0f0f1e" />
              </linearGradient>
              {/* River gradient */}
              <linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#1a4a7a" stopOpacity="1" />
                <stop offset="100%" stopColor="#1e3a5f" stopOpacity="0.9" />
              </linearGradient>
              {/* Mountain gradient */}
              <linearGradient id="mtGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1c1c2e" />
                <stop offset="100%" stopColor="#14141f" />
              </linearGradient>
              {/* Ground gradient */}
              <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#111118" />
                <stop offset="100%" stopColor="#0d0d14" />
              </linearGradient>
              {/* Glow filters */}
              <filter id="greenGlow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              <filter id="redGlow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              <filter id="hoverGlow"><feGaussianBlur stdDeviation="8" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>

            {/* Background */}
            <rect width="800" height="500" fill="url(#groundGrad)" />

            {/* Subtle grid lines */}
            {[100, 200, 300, 400, 500, 600, 700].map(x => (
              <line key={`vl${x}`} x1={x} y1="0" x2={x} y2="500" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
            ))}
            {[100, 200, 300, 400].map(y => (
              <line key={`hl${y}`} x1="0" y1={y} x2="800" y2={y} stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
            ))}

            {/* Mountains (background) */}
            <path d="M0 160 L80 60 L160 130 L250 40 L340 110 L430 30 L520 120 L620 50 L720 100 L800 60 L800 180 L0 180 Z"
              fill="url(#mtGrad)" />
            {/* Mountain snow caps */}
            <path d="M80 60 L60 90 L100 90 Z" fill="rgba(255,255,255,0.06)" />
            <path d="M250 40 L225 75 L275 75 Z" fill="rgba(255,255,255,0.06)" />
            <path d="M430 30 L405 68 L455 68 Z" fill="rgba(255,255,255,0.07)" />
            <path d="M620 50 L598 82 L642 82 Z" fill="rgba(255,255,255,0.06)" />

            {/* Mountain label */}
            <text x="400" y="170" textAnchor="middle" fontSize="8" fontWeight="900" fill="rgba(255,255,255,0.08)" fontFamily="sans-serif" letterSpacing="6">АЛТАЙН НУРУУ</text>

            {/* Path / Road */}
            <path d="M400 180 Q 400 270 400 380" stroke="rgba(250,204,21,0.12)" strokeWidth="2.5" strokeDasharray="8,8" fill="none" />
            <path d="M150 350 Q 400 340 670 350" stroke="rgba(250,204,21,0.08)" strokeWidth="2" strokeDasharray="6,10" fill="none" />

            {/* River */}
            <path d="M0 450 Q 200 420 400 458 T 800 440 L 800 500 L 0 500 Z"
              fill="url(#riverGrad)" />
            {/* River shimmer */}
            <path d="M100 455 Q 200 445 300 460" stroke="rgba(100,180,255,0.2)" strokeWidth="2" fill="none" />
            <path d="M450 448 Q 580 438 700 452" stroke="rgba(100,180,255,0.15)" strokeWidth="1.5" fill="none" />
            <text x="400" y="484" textAnchor="middle" fontSize="8" fontWeight="900" fill="rgba(100,160,255,0.35)" fontFamily="sans-serif" letterSpacing="4">БАГА ТҮРГЭНИЙ ГОЛ</text>

            {/* Trees (decorative) */}
            {[[100, 200], [720, 210], [90, 300], [730, 310], [105, 180], [710, 185]].map(([tx, ty], i) => (
              <g key={i} transform={`translate(${tx},${ty})`}>
                <polygon points="0,-14 -8,0 8,0" fill="rgba(30,80,40,0.5)" />
                <polygon points="0,-22 -6,-8 6,-8" fill="rgba(30,80,40,0.4)" />
                <rect x="-1.5" y="0" width="3" height="6" fill="rgba(20,40,20,0.4)" />
              </g>
            ))}

            {/* Ger markers */}
            {gers.map((ger) => {
              const pos = gerPositions[ger.gerNumber] || { x: 0, y: 0 };
              const st = getStatus(ger.status);
              const isHov = hoveredGer?._id === ger._id;

              return (
                <g
                  key={ger._id}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredGer(ger)}
                  onMouseLeave={() => setHoveredGer(null)}
                  onClick={() => navigate(`/ger/${ger._id}`)}
                  style={{ transition: 'all 0.25s ease' }}
                >
                  {/* Outer glow ring */}
                  {isHov && (
                    <circle cx={pos.x} cy={pos.y} r="28" fill="none" stroke={st.color} strokeWidth="1.5" strokeOpacity="0.4">
                      <animate attributeName="r" values="22;30;22" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="stroke-opacity" values="0.4;0;0.4" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Shadow */}
                  <circle cx={pos.x + 2} cy={pos.y + 2} r={isHov ? 20 : 16} fill="rgba(0,0,0,0.5)" />

                  {/* Main circle */}
                  <circle cx={pos.x} cy={pos.y} r={isHov ? 20 : 16}
                    fill="#16161f"
                    stroke={st.color}
                    strokeWidth={isHov ? 2 : 1.5}
                    strokeOpacity={isHov ? 1 : 0.7}
                    style={{ filter: isHov ? `drop-shadow(0 0 8px ${st.glow})` : 'none', transition: 'all 0.25s ease' }}
                  />

                  {/* Inner dot */}
                  <circle cx={pos.x} cy={pos.y} r={isHov ? 6 : 4.5} fill={st.color}
                    style={{ filter: `drop-shadow(0 0 4px ${st.glow})`, transition: 'all 0.25s ease' }}
                  />

                  {/* Ger number */}
                  <text
                    x={pos.x} y={pos.y + (isHov ? 34 : 30)}
                    textAnchor="middle"
                    fontSize={isHov ? 10 : 9}
                    fontWeight="900"
                    fontFamily="sans-serif"
                    fill={isHov ? st.color : 'rgba(255,255,255,0.35)'}
                    letterSpacing="1"
                    style={{ transition: 'all 0.25s ease' }}
                  >
                    {ger.gerNumber}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Mobile hint */}
        <div className="md:hidden border-t border-white/5 py-4 text-center">
          <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest">
            Гэрийн дугаар дээр дарж дэлгэрэнгүй мэдээлэл харна уу
          </p>
        </div>

        {/* ── Hover Tooltip ── */}
        {hoveredGer && (
          <div className="absolute bottom-8 right-8 pointer-events-none z-20 animate-scale-in">
            <div className="bg-[#111118]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 w-64 shadow-[0_24px_60px_rgba(0,0,0,0.8)]">
              {/* Top line */}
              <div className="h-px bg-gradient-to-r from-yellow-400/60 via-yellow-400/20 to-transparent mb-5" />

              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Гэр</p>
                  <h4 className="text-2xl font-black italic text-yellow-400 tracking-tighter">
                    № {hoveredGer.gerNumber}
                  </h4>
                </div>
                <div
                  className="px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest"
                  style={{
                    backgroundColor: getStatus(hoveredGer.status).color + '20',
                    color: getStatus(hoveredGer.status).color,
                    border: `1px solid ${getStatus(hoveredGer.status).color}40`,
                  }}
                >
                  {getStatus(hoveredGer.status).label}
                </div>
              </div>

              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-5 line-clamp-1">
                {hoveredGer.title}
              </p>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-0.5">Хоногийн үнэ</p>
                  <p className="text-white font-black text-lg tracking-tighter">
                    {formatCurrency(hoveredGer.pricePerNight)}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-yellow-400 font-black text-[9px] uppercase tracking-widest">
                  <span>Дэлгэрэнгүй</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResortMap;
