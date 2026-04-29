import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

const STATUS_MAP = {
  pending:          { label: 'Хүлээгдэж байна', cls: 'bg-yellow-400/12 text-yellow-400 border-yellow-400/20',   dot: 'bg-yellow-400' },
  confirmed:        { label: 'Баталгаажсан',     cls: 'bg-emerald-400/12 text-emerald-400 border-emerald-400/20', dot: 'bg-emerald-400' },
  cancelled:        { label: 'Цуцлагдсан',       cls: 'bg-red-400/12 text-red-400 border-red-400/20',            dot: 'bg-red-400' },
  refund_requested: { label: 'Буцаалт хүссэн',   cls: 'bg-orange-400/12 text-orange-400 border-orange-400/20',   dot: 'bg-orange-400' },
  refunded:         { label: 'Буцаалт болсон',    cls: 'bg-purple-400/12 text-purple-400 border-purple-400/20',   dot: 'bg-purple-400' },
  refund_denied:    { label: 'Татгалзсан',        cls: 'bg-white/5 text-white/30 border-white/10',                dot: 'bg-white/20' },
};

const TYPE_META = {
  ger:     { label: 'Гэр',    color: 'text-sky-400',      bg: 'bg-sky-400/10',     icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  trip:    { label: 'Аялал',  color: 'text-violet-400',   bg: 'bg-violet-400/10',  icon: 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z' },
  product: { label: 'Бараа',  color: 'text-amber-400',    bg: 'bg-amber-400/10',   icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
  food:    { label: 'Хоол',   color: 'text-rose-400',     bg: 'bg-rose-400/10',    icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17' },
};

const FILTER_TABS = [
  { id: 'all',       label: 'Бүгд' },
  { id: 'pending',   label: 'Хүлээж байна' },
  { id: 'confirmed', label: 'Баталгаажсан' },
  { id: 'cancelled', label: 'Цуцлагдсан' },
];

const API_ROUTES = { ger: 'bookings', trip: 'tripbookings', product: 'productbookings' };

/* ── avatar color by initial ── */
const AVATAR_COLORS = [
  'from-violet-500 to-purple-600',
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
];
function avatarGradient(str = '') {
  const code = (str.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[code];
}

export default function Profile() {
  const { user, updateUser, token, logout } = useAuth();
  const navigate = useNavigate();

  const [name,         setName]         = useState('');
  const [saving,       setSaving]       = useState(false);
  const [saveErr,      setSaveErr]      = useState('');
  const [saved,        setSaved]        = useState(false);
  const [bookings,     setBookings]     = useState([]);
  const [loadingB,     setLoadingB]     = useState(true);
  const [filter,       setFilter]       = useState('all');
  const [activeTab,    setActiveTab]    = useState('bookings');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    if (user) setName(user.name || '');
    fetchAllBookings();
  }, [user, token]);

  const fetchAllBookings = async () => {
    if (!token) return;
    setLoadingB(true);
    const h = { Authorization: `Bearer ${token}` };
    try {
      const [g, t, p] = await Promise.allSettled([
        api.get('/api/bookings/all',        { headers: h }),
        api.get('/api/tripbookings/all',    { headers: h }),
        api.get('/api/productbookings/all', { headers: h }),
      ]);
      const phone = user?.phone;
      const merge = (arr, type) =>
        (arr.status === 'fulfilled' ? arr.value.data : [])
          .map(b => ({ ...b, _type: type }))
          .filter(b => !phone || b.phone === phone);

      const all = [
        ...merge(g, 'ger'),
        ...merge(t, 'trip'),
        ...merge(p, 'product'),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setBookings(all);
    } catch {}
    finally { setLoadingB(false); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveErr('');
    if (!name.trim()) return setSaveErr('Нэр хоосон байж болохгүй.');
    setSaving(true);
    try {
      const res = await api.patch('/api/auth/profile', { name }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (updateUser) updateUser(res.data.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveErr(err.response?.data?.message || 'Алдаа гарлаа.');
    } finally { setSaving(false); }
  };

  const handleCancel = async (id, type) => {
    const route = API_ROUTES[type];
    if (!route) return;
    setCancellingId(id);
    try {
      await api.patch(`/api/${route}/${id}`,
        { status: 'refund_requested', cancellationReason: 'Хэрэглэгч цуцалсан' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAllBookings();
    } catch {}
    finally { setCancellingId(null); }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const stats = {
    total:     bookings.length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    spent:     bookings.filter(b => b.status === 'confirmed').reduce((s, b) => s + (b.totalPrice || 0), 0),
  };

  const initial = (user?.name || user?.phone || 'Х').charAt(0).toUpperCase();
  const gradient = avatarGradient(initial);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-[#080809] text-white">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a10] via-[#080809] to-[#080809]" />
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(250,204,21,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(99,102,241,0.06) 0%, transparent 50%)' }} />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

        <div className="relative max-w-4xl mx-auto px-6 pt-16 pb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">

            {/* Avatar */}
            <div className="relative shrink-0">
              <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black text-3xl shadow-2xl`}>
                {initial}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-[#080809]" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <p className="text-yellow-400/60 text-[9px] font-semibold tracking-[0.5em] uppercase">Хэрэглэгч</p>
              </div>
              <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white leading-none mb-1.5">
                {user?.name || 'Профайл'}
              </h1>
              <p className="text-white/35 text-sm">{user?.phone || user?.email}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Link to="/admin"
                className="flex items-center gap-2 h-9 px-4 text-[10px] font-semibold text-white/40 uppercase tracking-widest border border-white/8 rounded-full hover:border-yellow-400/30 hover:text-yellow-400 transition-all">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                </svg>
                Dashboard
              </Link>
              <button onClick={logout}
                className="flex items-center gap-2 h-9 px-4 text-[10px] font-semibold text-red-400/50 uppercase tracking-widest border border-white/8 rounded-full hover:border-red-400/30 hover:text-red-400 transition-all">
                Гарах
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-24">

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 -mt-2 mb-10">
          {[
            { label: 'Нийт захиалга',    value: stats.total,                 color: 'text-white',       icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', accent: 'border-white/8' },
            { label: 'Хүлээгдэж байна',  value: stats.pending,               color: 'text-yellow-400',  icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', accent: 'border-yellow-400/20' },
            { label: 'Баталгаажсан',      value: stats.confirmed,             color: 'text-emerald-400', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', accent: 'border-emerald-400/20' },
            { label: 'Нийт зарцуулсан',  value: formatCurrency(stats.spent), color: 'text-yellow-400',  icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 10v1', accent: 'border-yellow-400/20', small: true },
          ].map((s, i) => (
            <div key={i} className={`bg-white/[0.03] border ${s.accent} rounded-2xl px-5 py-4 hover:bg-white/[0.05] transition-all`}>
              <div className={`w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center mb-3 ${s.color}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.icon} />
                </svg>
              </div>
              <p className={`font-black italic leading-none mb-1.5 ${s.color} ${s.small ? 'text-base' : 'text-3xl'}`}>
                {s.value}
              </p>
              <p className="text-white/25 text-[9px] font-semibold uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-0 border-b border-white/6 mb-8">
          {[
            { id: 'bookings', label: 'Захиалгууд', count: bookings.length },
            { id: 'settings', label: 'Тохиргоо',   count: null },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 text-[11px] font-semibold uppercase tracking-widest border-b-2 -mb-px transition-all duration-150 ${
                activeTab === t.id
                  ? 'border-yellow-400 text-yellow-400'
                  : 'border-transparent text-white/30 hover:text-white/55'
              }`}>
              {t.label}
              {t.count != null && t.count > 0 && (
                <span className="text-[8px] bg-yellow-400/15 text-yellow-400 px-1.5 py-0.5 rounded-full font-bold">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ══ BOOKINGS TAB ══ */}
        {activeTab === 'bookings' && (
          <>
            {/* Filter chips */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              {FILTER_TABS.map(f => {
                const count = f.id === 'all' ? bookings.length : bookings.filter(b => b.status === f.id).length;
                return (
                  <button key={f.id} onClick={() => setFilter(f.id)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-widest transition-all ${
                      filter === f.id
                        ? 'bg-yellow-400 text-black'
                        : 'bg-white/5 border border-white/8 text-white/40 hover:text-white/65 hover:border-white/15'
                    }`}>
                    {f.label}
                    <span className={`text-[8px] font-black ${filter === f.id ? 'text-black/60' : 'text-white/25'}`}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Booking list */}
            {loadingB ? (
              <div className="flex items-center justify-center py-24 gap-3 text-white/20">
                <div className="w-5 h-5 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
                <span className="text-xs font-semibold uppercase tracking-widest">Уншиж байна...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center border border-white/5 rounded-3xl">
                <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-white/20 font-semibold uppercase tracking-widest text-sm mb-6">
                  {filter === 'all' ? 'Захиалга байхгүй' : 'Энэ төлөвт захиалга байхгүй'}
                </p>
                {filter === 'all' && (
                  <Link to="/gers"
                    className="inline-flex items-center gap-2 bg-yellow-400 text-black px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white transition-all active:scale-95">
                    Захиалга хийх
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(b => {
                  const st   = STATUS_MAP[b.status] || STATUS_MAP.pending;
                  const meta = TYPE_META[b._type] || TYPE_META.food;
                  const title = b.title || b.name || (b._type === 'ger' ? `Гэр ${b.gerNumber || ''}` : 'Захиалга');
                  const img   = (b.ger || b.trip || b.productId)?.image || b.image;
                  const date  = b.checkIn
                    ? `${b.checkIn}${b.checkOut ? ` → ${b.checkOut}` : ''}`
                    : b.travelDate || new Date(b.createdAt).toLocaleDateString('mn-MN');
                  const canCancel = b.status === 'pending' || b.status === 'confirmed';

                  return (
                    <div key={`${b._type}-${b._id}`}
                      className="group bg-white/[0.025] border border-white/6 hover:border-white/12 rounded-2xl p-4 flex items-center gap-4 transition-all duration-200">

                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/8 shrink-0 bg-white/5">
                        {img ? (
                          <img
                            src={`${api.defaults.baseURL}/uploads/${img}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            alt=""
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${meta.bg}`}>
                            <svg className={`w-5 h-5 ${meta.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                              <path strokeLinecap="round" strokeLinejoin="round" d={meta.icon} />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[8px] font-bold uppercase tracking-widest ${meta.color}`}>{meta.label}</span>
                          <span className="text-white/10">·</span>
                          <span className="text-white/20 text-[9px]">{date}</span>
                        </div>
                        <p className="text-white font-semibold text-sm truncate leading-tight">{title}</p>
                        {b.cancellationReason && (
                          <p className="text-orange-400/60 text-[10px] mt-0.5 truncate">↩ {b.cancellationReason}</p>
                        )}
                      </div>

                      {/* Price + status */}
                      <div className="text-right shrink-0 space-y-1.5">
                        <p className="text-yellow-400 font-black text-sm leading-none">{formatCurrency(b.totalPrice)}</p>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-semibold border ${st.cls}`}>
                          <span className={`w-1 h-1 rounded-full shrink-0 ${st.dot}`} />
                          {st.label}
                        </span>
                      </div>

                      {/* Cancel */}
                      {canCancel && (
                        <button
                          onClick={() => handleCancel(b._id, b._type)}
                          disabled={cancellingId === b._id}
                          className="shrink-0 px-3 py-1.5 text-[9px] font-semibold text-red-400/50 hover:text-red-400 uppercase tracking-widest border border-transparent hover:border-red-400/20 rounded-full transition-all disabled:opacity-30">
                          {cancellingId === b._id ? '...' : 'Цуцлах'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ══ SETTINGS TAB ══ */}
        {activeTab === 'settings' && (
          <div className="max-w-sm space-y-6">

            {/* Account card */}
            <div className="bg-white/[0.03] border border-white/6 rounded-2xl p-5">
              <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest mb-4">Дансны мэдээлэл</p>

              {/* Read-only identity */}
              <div className="space-y-2 mb-5">
                <label className="text-[9px] font-semibold text-white/25 uppercase tracking-widest block">Утас / Имэйл</label>
                <div className="flex items-center justify-between w-full bg-white/3 border border-white/5 rounded-2xl py-3 px-5 text-white/40 font-medium text-sm">
                  {user?.phone || user?.email || '—'}
                  <span className="text-[8px] text-white/15 uppercase tracking-widest ml-2">Өөрчлөх боломжгүй</span>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {saveErr && (
                  <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-4 py-3 rounded-xl">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {saveErr}
                  </div>
                )}
                {saved && (
                  <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-4 py-3 rounded-xl">
                    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Амжилттай хадгалагдлаа
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[9px] font-semibold text-white/25 uppercase tracking-widest block">Нэр</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => { setName(e.target.value); setSaveErr(''); }}
                    placeholder="Таны нэр"
                    className="w-full bg-white/5 border border-white/8 rounded-2xl py-3.5 px-5 text-white placeholder-white/20 outline-none focus:border-yellow-400/40 focus:ring-2 focus:ring-yellow-400/8 transition-all font-medium text-sm"
                  />
                </div>

                <button type="submit" disabled={saving}
                  className="w-full bg-yellow-400 text-black py-3.5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white transition-all duration-200 disabled:opacity-40 active:scale-[0.97] flex items-center justify-center gap-2">
                  {saving ? (
                    <><span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> Хадгалж байна...</>
                  ) : 'Хадгалах'}
                </button>
              </form>
            </div>

            {/* Danger zone */}
            <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-5">
              <p className="text-[9px] font-bold text-red-400/60 uppercase tracking-widest mb-3">Аюулгүй байдал</p>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/20 text-red-400/70 text-sm font-semibold hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Системээс гарах
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
