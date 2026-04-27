import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { formatCurrency } from '../utils/formatters.js';

const inp = 'w-full bg-white/5 border border-white/8 rounded-2xl py-3.5 px-5 text-white placeholder-gray-600 outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10 transition-all font-bold text-sm';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [added, setAdded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/products/${id}`).then(res => setProduct(res.data)).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (user) { setCustomerName(user.name || ''); setPhone(user.phone || ''); }
  }, [user]);

  const totalPrice = (product?.price || 0) * quantity;

  const handleAddToCart = (e) => {
    e.preventDefault();
    setError('');
    if (!token) { navigate('/login'); return; }
    if (!customerName || !phone) return setError('Мэдээллээ бүрэн бөглөнө үү.');
    addToCart({ type: 'product', id: product._id, name: product.name, image: product.image, quantity, totalPrice, customerName, phone, category: product.category });
    setAdded(true);
    setTimeout(() => navigate('/cart'), 800);
  };

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-28 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Image */}
          <div className="lg:sticky lg:top-28 h-fit">
            <div className="relative rounded-3xl overflow-hidden border border-white/6 shadow-2xl aspect-square">
              <img
                src={product.image ? `${api.defaults.baseURL}/uploads/${product.image}` : '/placeholder.jpg'}
                className="w-full h-full object-cover"
                alt={product.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="bg-black/60 backdrop-blur-sm border border-white/10 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                  {product.category}
                </span>
              </div>
            </div>
          </div>

          {/* Info + Form */}
          <div className="space-y-6">
            <div>
              <p className="text-yellow-400 font-black uppercase tracking-[0.4em] text-[9px] mb-2">{product.category}</p>
              <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter mb-3">{product.name}</h1>
              {product.description && <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>}
              <div className="flex items-center gap-3 mt-4">
                <span className="text-[9px] font-black text-gray-500 bg-white/4 border border-white/6 px-3 py-1.5 rounded-full uppercase tracking-widest">
                  Нөөц: {product.stock} ш
                </span>
              </div>
            </div>

            {/* Price + qty */}
            <div className="bg-white/3 border border-white/6 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">Нийт үнэ</p>
                <p className="text-3xl font-black text-yellow-400 italic tracking-tighter">{formatCurrency(totalPrice)}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{formatCurrency(product.price)} × {quantity}</p>
              </div>
              <div className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl px-4 py-2.5">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-xl bg-white/5 text-white font-black flex items-center justify-center hover:bg-white/10 transition-colors text-lg">−</button>
                <span className="font-black text-white text-lg w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-8 h-8 rounded-xl bg-white/5 text-white font-black flex items-center justify-center hover:bg-white/10 transition-colors text-lg">+</button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-4 py-3 rounded-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleAddToCart} className="space-y-4">
              <input type="text" placeholder="Захиалагчийн нэр" required className={inp} value={customerName} onChange={e => { setCustomerName(e.target.value); setError(''); }} />
              <input type="tel" placeholder="Утасны дугаар" required className={inp} value={phone} onChange={e => { setPhone(e.target.value); setError(''); }} />

              <button type="submit" disabled={added || product.stock === 0}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-300 active:scale-[0.97] ${
                  product.stock === 0
                    ? 'bg-white/5 border border-white/6 text-gray-600 cursor-not-allowed'
                    : added
                      ? 'bg-emerald-400 text-black'
                      : token
                        ? 'bg-yellow-400 text-black hover:bg-white'
                        : 'bg-white/5 border border-white/8 text-white hover:bg-yellow-400 hover:text-black hover:border-transparent'
                }`}>
                {product.stock === 0 ? 'Нөөц дууссан' : added ? '✓ Сагсанд нэмэгдлээ!' : token ? 'Сагсанд нэмэх →' : 'Нэвтэрч захиалах'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
