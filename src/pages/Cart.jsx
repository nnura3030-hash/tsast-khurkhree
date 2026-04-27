import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';
import api from '../services/api';

const REVIEWS = [
  { name: 'Бат-Эрдэнэ', letter: 'Б', text: 'Гэрүүд нь маш цэвэрхэн, хоол нь үнэхээр амттай байсан. Дараа заавал дахиж ирнэ!' },
  { name: 'Анударь', letter: 'А', text: 'Аяллын хөтөч нар маш мэргэжлийн байсан. Мориор аялсан нь хамгийн гоё хэсэг байлаа.' },
  { name: 'Тэмүүлэн', letter: 'Т', text: 'Системээр захиалахад маш хялбар байлаа. QPay-ээр төлөөд шууд баталгаажсан.' },
];

const Cart = () => {
  const { user } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalCartPrice } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const paymentMethod = 'byl';
  const [showSuccess, setShowSuccess] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setError('');
    const finalPhone = user?.phone || cartItems[0]?.phone || '';
    if (!finalPhone || finalPhone.length < 8) {
      setError('Утасны дугаараа зөв оруулна уу.');
      return;
    }
    setLoading(true);
    const payload = {
      items: cartItems,
      customerName: user?.name || cartItems[0]?.customerName || 'Зочин',
      phone: finalPhone,
      totalPrice: totalCartPrice,
      paymentMethod,
      invoiceId: `bulk_${Date.now()}`,
      returnUrl: `${window.location.origin}/admin?payment=success`,
    };
    try {
      const res = await api.post('/api/bookings/bulk-checkout', payload);
      const redirectUrl = res.data?.paymentUrl;
      if ((paymentMethod === 'byl' || paymentMethod === 'qpay') && redirectUrl) {
        setIsPreparing(true);
        clearCart();
        window.location.href = redirectUrl;
      } else {
        setShowSuccess(true);
        clearCart();
      }
    } catch (err) {
      const status = err.response?.status;
      setError(status === 503
        ? 'Төлбөрийн систем рүү хандаж чадсангүй. Дахин оролдоно уу.'
        : err.response?.data?.message || 'Захиалга хийхэд алдаа гарлаа.'
      );
    } finally {
      setLoading(false);
      setIsPreparing(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="mb-10">
          <p className="text-yellow-400 font-black uppercase tracking-[0.4em] text-[9px] mb-3">Захиалгын сагс</p>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter">
            Миний <span className="text-yellow-400">Сагс</span>
          </h1>
        </div>

        <div className="h-px bg-gradient-to-r from-yellow-400/30 via-white/5 to-transparent mb-10" />

        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold px-5 py-3.5 rounded-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-3">
            {cartItems.length === 0 ? (
              <div className="py-24 text-center border border-white/5 rounded-3xl bg-white/2">
                <p className="text-5xl mb-4">🛒</p>
                <p className="text-gray-500 font-black italic uppercase tracking-widest text-sm mb-6">Сагс хоосон байна</p>
                <Link to="/gers" className="inline-block bg-yellow-400 text-black px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white transition-all">
                  Захиалга хийх
                </Link>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.cartId} className="group bg-white/3 border border-white/6 hover:border-yellow-400/20 rounded-2xl p-5 flex gap-4 items-center transition-all duration-300">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                    <img
                      src={item.image ? `${api.defaults.baseURL}/uploads/${item.image}` : '/placeholder.jpg'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      alt=""
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-black text-yellow-400 uppercase tracking-widest">{item.type}</span>
                    <h3 className="font-black text-white text-base italic uppercase tracking-tight truncate">{item.title || item.name}</h3>
                    <p className="text-xs text-gray-600 font-bold truncate">
                      {item.checkIn ? `${item.checkIn} → ${item.checkOut}` : item.travelDate || item.category}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <button onClick={() => updateQuantity(item.cartId, -1)} className="w-7 h-7 rounded-lg bg-white/5 border border-white/8 text-white font-black flex items-center justify-center hover:bg-white/10 transition-colors text-sm">−</button>
                      <span className="font-black text-white text-sm w-6 text-center">{item.quantity || item.peopleCount}</span>
                      <button onClick={() => updateQuantity(item.cartId, 1)} className="w-7 h-7 rounded-lg bg-white/5 border border-white/8 text-white font-black flex items-center justify-center hover:bg-white/10 transition-colors text-sm">+</button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-yellow-400 text-lg">{formatCurrency(item.totalPrice)}</p>
                    <button onClick={() => removeFromCart(item.cartId)} className="text-[9px] font-black text-red-400 hover:text-red-300 uppercase mt-2 transition-colors">Устгах</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          <div className="h-fit sticky top-28">
            <div className="bg-white/3 border border-white/8 rounded-3xl p-7 space-y-6">
              {/* Total */}
              <div>
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Нийт төлөх дүн</p>
                <p className="text-4xl font-black text-yellow-400 italic tracking-tighter">{formatCurrency(totalCartPrice)}</p>
                <p className="text-xs text-gray-600 mt-1">{cartItems.length} захиалга</p>
              </div>

              <div className="h-px bg-white/5" />

              {/* Payment info */}
              <div className="flex items-center gap-3 bg-yellow-400/8 border border-yellow-400/20 rounded-2xl px-4 py-3">
                <span className="text-xl">💳</span>
                <div>
                  <p className="text-yellow-400 font-black text-sm uppercase tracking-widest">Byl Wallet</p>
                  <p className="text-gray-500 text-[10px] font-bold">byl.mn төлбөрийн систем</p>
                </div>
                <span className="ml-auto w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              </div>

              <button
                disabled={cartItems.length === 0 || loading}
                onClick={handleCheckout}
                className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Уншиж байна...
                  </span>
                ) : 'Захиалга өгөх →'}
              </button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-24">
          <div className="h-px bg-white/5 mb-16" />
          <div className="text-center mb-10">
            <p className="text-yellow-400 font-black uppercase tracking-[0.4em] text-[9px] mb-3">Бидний баталгаа</p>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">
              Аялагчдын сэтгэгдэл
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {REVIEWS.map((r, i) => (
              <div key={i} className="bg-white/3 border border-white/6 rounded-3xl p-7 relative">
                <span className="text-5xl text-yellow-400/15 absolute top-4 left-5 font-serif leading-none">"</span>
                <p className="relative text-gray-400 text-sm leading-relaxed mb-6 italic">{r.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center font-black text-black text-sm">{r.letter}</div>
                  <p className="font-black text-white text-xs uppercase tracking-widest">{r.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-[#0d0d14] border border-stone-200 dark:border-white/8 rounded-3xl p-10 max-w-sm w-full text-center shadow-xl dark:shadow-2xl animate-scale-in">
            <div className="w-20 h-20 bg-emerald-400/15 border border-emerald-400/25 rounded-full flex items-center justify-center mx-auto mb-7">
              <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-3">Амжилттай!</h3>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest leading-relaxed mb-8">
              Таны захиалга баталгаажлаа.<br />Бид тантай удахгүй холбогдох болно.
            </p>
            <button onClick={() => navigate('/admin')} className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white transition-all active:scale-95">
              Захиалга харах
            </button>
          </div>
        </div>
      )}

      {/* Preparing overlay */}
      {isPreparing && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin mb-8" />
          <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Шилжиж байна...</h3>
          <p className="text-gray-600 text-xs font-black uppercase tracking-widest animate-pulse">Түр хүлээнэ үү</p>
        </div>
      )}
    </div>
  );
};

export default Cart;
