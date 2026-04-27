import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { formatCurrency } from '../utils/formatters.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useNavigate } from 'react-router-dom';

const inp = 'w-full bg-white/5 border border-white/8 rounded-2xl py-3 px-4 text-white placeholder-gray-600 outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10 transition-all font-bold text-sm';

const FoodCard = ({ food }) => {
  const { token, user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [orderDate, setOrderDate] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');
  const paymentMethod = 'byl';

  const totalPrice = food.price * quantity;
  const today = new Date().toISOString().split('T')[0];
  const isPopular = food.price > 50000;
  const isTraditional = food.category?.toLowerCase().includes('үндэсний');

  useEffect(() => {
    if (user) { setCustomerName(user.name || ''); setPhone(user.phone || ''); }
  }, [user]);

  const handleOrderClick = () => {
    if (!token) { navigate('/login'); return; }
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!orderDate) return setFormError('Огноогоо сонгоно уу!');
    if (!customerName || !phone) return setFormError('Холбоо барих мэдээлэл дутуу байна.');

    addToCart({ type: 'food', id: food._id, title: food.name, foodName: food.name, name: food.name, image: food.image, quantity, totalPrice, customerName, phone, orderDate });
    setShowModal(false);
    navigate('/cart');
  };

  return (
    <>
      {/* ── Card — full-bleed image ── */}
      <div className="group relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer select-none" onClick={handleOrderClick}>
        {/* Image */}
        <img
          src={food.image ? `${api.defaults.baseURL}/uploads/${food.image}` : '/placeholder.jpg'}
          alt={food.name}
          className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-[800ms] ease-out brightness-70 group-hover:brightness-85"
        />

        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 to-transparent" />
        <div className="absolute inset-0 bg-yellow-400/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* ── TOP badges ── */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-start justify-between z-10">
          <div className="flex flex-col gap-1.5">
            <span className="glass text-white/70 text-[8px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
              {food.category || 'Menu'}
            </span>
            {isTraditional && (
              <span className="bg-orange-500/80 backdrop-blur-sm text-white text-[8px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest">
                Уламжлалт
              </span>
            )}
          </div>

          {isPopular && (
            <span className="bg-yellow-400 text-black text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg">
              🔥 Popular
            </span>
          )}
        </div>

        {/* ── BOTTOM ── */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <h3 className="text-lg font-black text-white uppercase italic tracking-tighter leading-tight mb-1 group-hover:text-yellow-400 transition-colors duration-300 line-clamp-2">
            {food.name}
          </h3>
          {food.description && (
            <p className="text-white/30 text-[10px] leading-relaxed line-clamp-1 mb-3">{food.description}</p>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <p className="text-yellow-400 font-black text-lg leading-none">{formatCurrency(food.price)}</p>
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/40 uppercase tracking-widest group-hover:text-yellow-400 transition-all duration-300">
              Захиалах
              <svg className="h-3 w-3 group-hover:translate-x-0.5 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Border glow */}
        <div className="absolute inset-0 rounded-3xl border border-transparent group-hover:border-yellow-400/20 transition-colors duration-500 pointer-events-none" />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0d14] border border-white/8 w-full max-w-md rounded-3xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.8)] animate-scale-in">

            {/* Header */}
            <div className="relative px-7 pt-7 pb-6 border-b border-white/6 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/8 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="h-px bg-gradient-to-r from-yellow-400/60 via-yellow-400/20 to-transparent mb-5" />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-yellow-400 font-black uppercase tracking-[0.4em] text-[9px] mb-1">Захиалах</p>
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">{food.name}</h2>
                </div>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all flex items-center justify-center font-black text-lg">×</button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="px-7 py-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-4 py-3 rounded-2xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {formError}
                </div>
              )}

              {/* Qty + Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Тоо ширхэг</label>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-2xl px-3 py-2.5">
                    <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-7 h-7 rounded-lg bg-white/5 text-white font-black flex items-center justify-center hover:bg-white/10 transition-colors">−</button>
                    <span className="flex-1 text-center font-black text-white text-sm">{quantity}</span>
                    <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-7 h-7 rounded-lg bg-white/5 text-white font-black flex items-center justify-center hover:bg-white/10 transition-colors">+</button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Огноо</label>
                  <input type="date" min={today} required className={inp} value={orderDate} onChange={e => { setOrderDate(e.target.value); setFormError(''); }} />
                </div>
              </div>

              <input type="text" placeholder="Таны нэр" required className={inp} value={customerName} onChange={e => { setCustomerName(e.target.value); setFormError(''); }} />
              <input type="tel" placeholder="Утасны дугаар" required className={inp} value={phone} onChange={e => { setPhone(e.target.value); setFormError(''); }} />

              {/* Total */}
              <div className="bg-white/3 border border-white/6 rounded-2xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-0.5">Нийт төлөх</p>
                  <p className="text-2xl font-black text-yellow-400 italic">{formatCurrency(totalPrice)}</p>
                </div>
                <p className="text-[10px] text-gray-600 font-bold">{formatCurrency(food.price)} × {quantity}</p>
              </div>

              <button type="submit" className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white transition-all shadow-[0_0_20px_rgba(250,204,21,0.25)] active:scale-[0.97]">
                Сагсанд нэмэх →
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FoodCard;
