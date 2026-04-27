import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';

const STATUS_MAP = {
  pending:          { label: 'Хүлээгдэж байна', cls: 'bg-yellow-400/10 text-yellow-400',   dot: 'bg-yellow-400' },
  confirmed:        { label: 'Баталгаажсан',     cls: 'bg-emerald-400/10 text-emerald-400', dot: 'bg-emerald-400' },
  cancelled:        { label: 'Цуцлагдсан',       cls: 'bg-red-400/10 text-red-400',         dot: 'bg-red-400' },
  refund_requested: { label: 'Буцаалт хүссэн',   cls: 'bg-orange-400/10 text-orange-400',   dot: 'bg-orange-400' },
  refunded:         { label: 'Буцаалт болсон',    cls: 'bg-purple-400/10 text-purple-400',   dot: 'bg-purple-400' },
  refund_denied:    { label: 'Татгалзсан',        cls: 'bg-white/5 text-white/30',           dot: 'bg-white/30' },
};

const TYPE_META = {
  ger:     { label: 'Гэр',    icon: '🏕️', path: '/ger/' },
  trip:    { label: 'Аялал',  icon: '🧭', path: '/trip/' },
  product: { label: 'Бараа',  icon: '🛍️', path: '/product/' },
  food:    { label: 'Хоол',   icon: '🍽️', path: null },
};

const FILTER_TABS = [
  { id: 'all',       label: 'Бүгд' },
  { id: 'pending',   label: 'Хүлээж байна' },
  { id: 'confirmed', label: 'Баталгаажсан' },
  { id: 'cancelled', label: 'Цуцлагдсан' },
];

const API_ROUTES = { ger: 'bookings', trip: 'tripbookings', product: 'productbookings' };

export default function Profile() {
  const { user, updateUser, token } = useAuth();
  const navigate = useNavigate();

  const [name,           setName]           = useState('');
  const [saving,         setSaving]         = useState(false);
  const [saveErr,        setSaveErr]        = useState('');
  const [saved,          setSaved]          = useState(false);
  const [bookings,       setBookings]       = useState([]);
  const [loadingB,       setLoadingB]       = useState(true);
  const [filter,         setFilter]         = useState('all');
  const [activeTab,      setActiveTab]      = useState('bookings');
  const [cancellingId,   setCancellingId]   = useState(null);

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

  const filtered = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

  const stats = {
    total:     bookings.length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    spent:     bookings.filter(b => b.status === 'confirmed')
                       .reduce((s, b) => s + (b.totalPrice || 0), 0),
  };

  if (!token) return null;

  return (
    <div className="min-h-screen pt-28 pb-24">
      <div className="max-w-4xl mx-auto px-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-6 mb-10">
          <div>
            <p className="text-yellow-400/70 text-[9px] font-semibold tracking-[0.5em] uppercase mb-2">Хэрэглэгч</p>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
              {user?.name || 'Профайл'}
            </h1>
            <p className="text-white/30 text-sm mt-2">{user?.phone || user?.email}</p>
          </div>
          <Link to="/admin"
            className="hidden sm:flex items-center h-9 px-5 text-[10px] font-semibold text-white/35 uppercase tracking-widest border border-white/8 rounded-full hover:border-yellow-400/30 hover:text-yellow-400 transition-all shrink-0">
            Dashboard
          </Link>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { label: 'Нийт захиалга',      value: stats.total,              color: 'text-white' },
            { label: 'Хүлээгдэж байна',    value: stats.pending,            color: 'text-yellow-400' },
            { label: 'Баталгаажсан',        value: stats.confirmed,          color: 'text-emerald-400' },
            { label: 'Нийт зарцуулсан',     value: formatCurrency(stats.spent), color: 'text-yellow-400', small: true },
          ].map((s, i) => (
            <div key={i} className="bg-white/[0.025] border border-white/6 rounded-2xl px-5 py-4">
              <p className={`font-black italic leading-none mb-1.5 ${s.color} ${s.small ? 'text-lg' : 'text-3xl'}`}>
                {s.value}
              </p>
              <p className="text-white/25 text-[9px] font-semibold uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-0 border-b border-white/6 mb-8">
          {[
            { id: 'bookings',  label: 'Захиалгууд' },
            { id: 'settings',  label: 'Тохиргоо' },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-5 py-3 text-[11px] font-semibold uppercase tracking-widest border-b-2 -mb-px transition-all duration-150 ${
                activeTab === t.id
                  ? 'border-yellow-400 text-yellow-400'
                  : 'border-transparent text-white/30 hover:text-white/55'
              }`}>
              {t.label}
              {t.id === 'bookings' && bookings.length > 0 && (
                <span className="ml-2 text-[8px] bg-yellow-400/15 text-yellow-400 px-1.5 py-0.5 rounded-full">
                  {bookings.length}
                </span>
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
                        : 'bg-white/5 border border-white/8 text-white/40 hover:text-white/65'
                    }`}>
                    {f.label}
                    <span className={`text-[8px] font-black ${filter === f.id ? 'text-black/60' : 'text-white/25'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* List */}
            {loadingB ? (
              <div className="flex items-center justify-center py-24 gap-3 text-white/20">
                <div className="w-5 h-5 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
                <span className="text-xs font-semibold uppercase tracking-widest">Уншиж байна...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-24 text-center border border-white/5 rounded-3xl">
                <p className="text-5xl mb-4">📋</p>
                <p className="text-white/20 font-semibold uppercase tracking-widest text-sm mb-6">
                  {filter === 'all' ? 'Захиалга байхгүй' : 'Энэ төлөвт захиалга байхгүй'}
                </p>
                {filter === 'all' && (
                  <Link to="/gers"
                    className="inline-flex items-center gap-2 bg-yellow-400 text-black px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white transition-all">
                    Захиалга хийх
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(b => {
                  const st   = STATUS_MAP[b.status] || STATUS_MAP.pending;
                  const meta = TYPE_META[b._type] || { label: '', icon: '📋', path: null };
                  const title = b.title || b.name || (b._type === 'ger' ? `Гэр ${b.gerNumber || ''}` : 'Захиалга');
                  const date  = b.checkIn
                    ? `${b.checkIn}${b.checkOut ? ` → ${b.checkOut}` : ''}`
                    : b.travelDate
                    ? b.travelDate
                    : new Date(b.createdAt).toLocaleDateString('mn-MN');
                  const canCancel = b.status === 'pending' || b.status === 'confirmed';

                  return (
                    <div key={`${b._type}-${b._id}`}
                      className="group bg-white/[0.025] border border-white/6 hover:border-white/10 rounded-2xl px-5 py-4 flex items-center gap-4 transition-all duration-200">
                      {/* Type icon */}
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg shrink-0">
                        {meta.icon}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[8px] font-semibold text-white/25 uppercase tracking-widest">{meta.label}</span>
                        </div>
                        <p className="text-white font-semibold text-sm truncate">{title}</p>
                        <p className="text-white/20 text-[10px] mt-0.5">{date}</p>
                      </div>

                      {/* Price + status */}
                      <div className="text-right shrink-0 space-y-1.5">
                        <p className="text-yellow-400 font-black text-sm">{formatCurrency(b.totalPrice)}</p>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-semibold ${st.cls}`}>
                          <span className={`w-1 h-1 rounded-full shrink-0 ${st.dot}`} />
                          {st.label}
                        </span>
                      </div>

                      {/* Cancel */}
                      {canCancel && (
                        <button
                          onClick={() => handleCancel(b._id, b._type)}
                          disabled={cancellingId === b._id}
                          className="shrink-0 ml-1 px-3 py-1.5 text-[9px] font-semibold text-red-400/50 hover:text-red-400 uppercase tracking-widest border border-transparent hover:border-red-400/20 rounded-full transition-all disabled:opacity-30">
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
          <div className="max-w-sm">
            <form onSubmit={handleSave} className="space-y-5">
              {saveErr && (
                <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-4 py-3 rounded-2xl">
                  {saveErr}
                </div>
              )}
              {saved && (
                <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-4 py-3 rounded-2xl">
                  ✓ Амжилттай хадгалагдлаа
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[9px] font-semibold text-white/25 uppercase tracking-widest">
                  Утас / Имэйл
                </label>
                <div className="w-full bg-white/3 border border-white/5 rounded-2xl py-3.5 px-5 text-white/30 font-medium text-sm flex items-center justify-between">
                  {user?.phone || user?.email || '—'}
                  <span className="text-[8px] text-white/15 uppercase tracking-widest">өөрчлөх боломжгүй</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-semibold text-white/25 uppercase tracking-widest">Нэр</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setSaveErr(''); }}
                  placeholder="Таны нэр"
                  className="w-full bg-white/5 border border-white/8 rounded-2xl py-3.5 px-5 text-white placeholder-white/20 outline-none focus:border-yellow-400/40 transition-all font-medium text-sm"
                />
              </div>

              <button type="submit" disabled={saving}
                className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white transition-all duration-200 disabled:opacity-40 active:scale-[0.97]">
                {saving ? 'Хадгалж байна...' : 'Хадгалах'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
