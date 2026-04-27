import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';

const Signup = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState('phone');
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Нэрээ оруулна уу');
    if (method === 'phone' && !/^\d{8}$/.test(identifier)) return setError('8 оронтой утасны дугаар оруулна уу');
    if (method === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) return setError('Зөв имэйл хаяг оруулна уу');

    setLoading(true);
    try {
      await api.post('/api/auth/register', { identifier, name });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Бүртгэлд алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-[#08080c] flex items-center justify-center px-4">
      <div className="relative w-full max-w-sm animate-scale-in">
        <div className="bg-white dark:bg-[#0d0d14] border border-stone-200 dark:border-white/8 rounded-3xl overflow-hidden shadow-xl dark:shadow-none">

          {/* Header */}
          <div className="px-8 pt-8 pb-7 border-b border-white/6">
            <div className="h-px bg-gradient-to-r from-yellow-400/40 via-yellow-400/10 to-transparent mb-6" />
            <p className="text-yellow-400 font-black uppercase tracking-[0.4em] text-[9px] mb-2">Шинэ бүртгэл</p>
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Бүртгүүлэх</h1>
          </div>

          <form onSubmit={handleSignup} className="px-8 py-7 space-y-5">

            {/* Success */}
            {success && (
              <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-4 py-3 rounded-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Амжилттай бүртгүүллээ! Нэвтрэх хуудас руу шилжиж байна...
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-4 py-3 rounded-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Нэр</label>
              <input
                type="text"
                placeholder="Таны нэр"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                className="w-full bg-white/5 border border-white/8 rounded-2xl py-3.5 px-5 text-white placeholder-gray-600 outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10 transition-all font-bold"
                required
              />
            </div>

            {/* Method toggle */}
            <div className="bg-white/4 border border-white/6 p-1 rounded-2xl flex gap-1">
              {['phone', 'email'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMethod(m); setIdentifier(''); setError(''); }}
                  className={`flex-1 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all duration-200 ${
                    method === m ? 'bg-yellow-400 text-black' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {m === 'phone' ? 'Утас' : 'Имэйл'}
                </button>
              ))}
            </div>

            {/* Identifier */}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">
                {method === 'phone' ? 'Утасны дугаар' : 'Имэйл хаяг'}
              </label>
              <input
                type={method === 'phone' ? 'tel' : 'email'}
                placeholder={method === 'phone' ? '88000000' : 'user@email.com'}
                maxLength={method === 'phone' ? 8 : undefined}
                value={identifier}
                onChange={(e) => { setIdentifier(method === 'phone' ? e.target.value.replace(/\D/g, '') : e.target.value); setError(''); }}
                className="w-full bg-white/5 border border-white/8 rounded-2xl py-3.5 px-5 text-white placeholder-gray-600 outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10 transition-all font-bold"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-300 active:scale-[0.97] ${
                loading || success
                  ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                  : 'bg-yellow-400 text-black hover:bg-white'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  Бүртгэж байна...
                </span>
              ) : 'Бүртгэл үүсгэх'}
            </button>

            <p className="text-center text-xs text-gray-600 font-bold">
              Аль хэдийн бүртгэлтэй юу?{' '}
              <Link to="/login" className="text-yellow-400 hover:text-white transition-colors font-black">
                Нэвтрэх
              </Link>
            </p>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-gray-600 text-[10px] font-bold uppercase tracking-widest hover:text-gray-400 transition-colors">
            ← Нүүр хуудас руу буцах
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
