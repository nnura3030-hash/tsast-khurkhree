import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { formatCurrency } from '../utils/formatters.js';
import ReviewSection from '../components/ReviewSection';
import Breadcrumb from '../components/Breadcrumb';

const inp = 'w-full bg-white/5 border border-white/8 rounded-2xl py-3.5 px-5 text-white placeholder-gray-600 outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10 transition-all font-bold text-sm';

const GerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { addToCart } = useCart();

  const [ger, setGer] = useState(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [peopleCount, setPeopleCount] = useState(1);
  const [foodOption, setFoodOption] = useState('none');
  const [totalPrice, setTotalPrice] = useState(0);
  const [availableFoods, setAvailableFoods] = useState([]);
  const [formError, setFormError] = useState('');
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api.get(`/api/gers/${id}`).then(res => setGer(res.data)).catch(() => {});
    api.get('/api/foods/all').then(res => setAvailableFoods(res.data)).catch(() => {});
    const pre = sessionStorage.getItem('preSelectedFood');
    if (pre) { setFoodOption(pre); sessionStorage.removeItem('preSelectedFood'); }
  }, [id]);

  useEffect(() => {
    if (user) { setPhone(user.phone || ''); setCustomerName(user.name || user.phone || ''); }
  }, [user]);

  useEffect(() => {
    if (!ger || !checkIn || !checkOut) return setTotalPrice(0);
    const nights = Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000));
    const foodPrice = (availableFoods.find(f => f.name === foodOption)?.price || 0) * peopleCount * nights;
    setTotalPrice(ger.pricePerNight * nights + foodPrice);
  }, [checkIn, checkOut, ger, foodOption, peopleCount, availableFoods]);

  const today = new Date().toISOString().split('T')[0];

  const handleAddToCart = (e) => {
    e.preventDefault();
    setFormError('');
    if (!token) { navigate('/login'); return; }
    if (!ger) return;
    if (!customerName || !phone) return setFormError('Мэдээллээ бүрэн бөглөнө үү.');
    if (totalPrice <= 0) return setFormError('Гарах огноог зөв сонгоно уу!');

    addToCart({ type: 'ger', id: ger._id, title: ger.title, image: ger.image, customerName, phone, checkIn, checkOut, peopleCount, foodOption, totalPrice });
    setAdded(true);
    setTimeout(() => navigate('/cart'), 800);
  };

  if (!ger) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        <Breadcrumb overrides={{ [id]: ger?.title || 'Гэр' }} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Image */}
          <div className="lg:sticky lg:top-28 h-fit">
            <div className="relative rounded-3xl overflow-hidden border border-white/6 shadow-2xl aspect-[4/3]">
              <img
                src={ger.image ? `${api.defaults.baseURL}/uploads/${ger.image}` : '/placeholder.jpg'}
                className="w-full h-full object-cover"
                alt={ger.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-black text-yellow-400 uppercase tracking-widest">Гэр {ger.gerNumber}</p>
                    <p className="text-white font-black text-sm italic">{ger.title}</p>
                  </div>
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${ger.status === 'available' ? 'bg-emerald-400/20 text-emerald-400' : 'bg-red-400/20 text-red-400'}`}>
                    {ger.status === 'available' ? 'Сул' : 'Захиалсан'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <p className="text-yellow-400 font-black uppercase tracking-[0.4em] text-[9px] mb-2">Гэр захиалах</p>
              <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">{ger.title}</h1>
              {ger.location && <p className="text-gray-500 font-bold text-sm mt-1 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-yellow-400/60" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                {ger.location}
              </p>}
              <div className="flex gap-3 mt-3">
                <span className="text-[9px] font-black text-gray-500 bg-white/4 border border-white/6 px-3 py-1.5 rounded-full uppercase tracking-widest">
                  {ger.capacity || 4} хүн
                </span>
                <span className="text-[9px] font-black text-yellow-400 bg-yellow-400/8 border border-yellow-400/15 px-3 py-1.5 rounded-full uppercase tracking-widest">
                  {formatCurrency(ger.pricePerNight)} / хоног
                </span>
              </div>
            </div>

            {/* Price display */}
            <div className="bg-white/3 border border-white/6 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Нийт төлөх</p>
                <p className="text-3xl font-black text-yellow-400 italic tracking-tighter">{formatCurrency(totalPrice)}</p>
              </div>
              {checkIn && checkOut && (
                <p className="text-[10px] font-black text-gray-500 uppercase">
                  {Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000))} хоног
                </p>
              )}
            </div>

            {formError && (
              <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-4 py-3 rounded-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {formError}
              </div>
            )}

            <form onSubmit={handleAddToCart} className="space-y-4">
              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Орох огноо</label>
                  <input type="date" min={today} required className={inp} value={checkIn} onChange={e => { setCheckIn(e.target.value); setFormError(''); }} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Гарах огноо</label>
                  <input type="date" min={checkIn || today} required className={inp} value={checkOut} onChange={e => { setCheckOut(e.target.value); setFormError(''); }} />
                </div>
              </div>

              {/* People */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Хүний тоо</label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl px-5 py-3">
                  <button type="button" onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))} className="w-8 h-8 rounded-xl bg-white/5 border border-white/8 text-white font-black flex items-center justify-center hover:bg-white/10 transition-colors">−</button>
                  <span className="flex-1 text-center font-black text-white">{peopleCount}</span>
                  <button type="button" onClick={() => setPeopleCount(Math.min(ger.capacity || 4, peopleCount + 1))} className="w-8 h-8 rounded-xl bg-white/5 border border-white/8 text-white font-black flex items-center justify-center hover:bg-white/10 transition-colors">+</button>
                </div>
              </div>

              <input type="text" placeholder="Таны нэр" required className={inp} value={customerName} onChange={e => { setCustomerName(e.target.value); setFormError(''); }} />
              <input type="tel" placeholder="Утасны дугаар" required className={inp} value={phone} onChange={e => { setPhone(e.target.value); setFormError(''); }} />

              {/* Food */}
              {availableFoods.length > 0 && (
                <div className="bg-white/3 border border-white/6 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Хоолны сонголт</p>
                    {foodOption !== 'none' && (
                      <span className="text-[9px] font-black text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full">
                        +{formatCurrency((availableFoods.find(f => f.name === foodOption)?.price || 0) * peopleCount)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setFoodOption('none')}
                      className={`flex-1 min-w-[90px] py-3 rounded-xl font-black text-[10px] uppercase transition-all border ${foodOption === 'none' ? 'border-yellow-400/50 bg-yellow-400/10 text-yellow-400' : 'border-white/6 text-gray-500 hover:text-white hover:border-white/12'}`}>
                      Идэхгүй
                    </button>
                    {availableFoods.map(item => (
                      <button key={item._id} type="button" onClick={() => setFoodOption(item.name)}
                        className={`flex-1 min-w-[90px] py-3 rounded-xl font-black text-[10px] uppercase transition-all border ${foodOption === item.name ? 'border-yellow-400/50 bg-yellow-400/10 text-yellow-400' : 'border-white/6 text-gray-500 hover:text-white hover:border-white/12'}`}>
                        {item.name}
                        <span className="block text-[8px] opacity-60">{item.price / 1000}k₮</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button type="submit" disabled={added}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-300 active:scale-[0.97] ${
                  added
                    ? 'bg-emerald-400 text-black'
                    : token
                      ? 'bg-yellow-400 text-black hover:bg-white'
                      : 'bg-white/5 border border-white/8 text-white hover:bg-yellow-400 hover:text-black hover:border-transparent'
                }`}>
                {added ? '✓ Сагсанд нэмэгдлээ!' : token ? 'Сагсанд нэмэх →' : 'Нэвтэрч захиалах'}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16">
          <ReviewSection refId={id} refType="Ger" />
        </div>
      </div>
    </div>
  );
};

export default GerDetails;
