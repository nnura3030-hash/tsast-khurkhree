import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const { login } = useAuth();
  const [method, setMethod] = useState('phone');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const otpRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (timer <= 0) return;
    const t = setInterval(() => setTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [timer]);

  useEffect(() => {
    if (step === 2) setTimeout(() => otpRef.current?.focus(), 100);
  }, [step]);

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError('');
    if (method === 'phone' && !/^\d{8}$/.test(identifier)) return setError('8 оронтой утасны дугаар оруулна уу');
    if (method === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) return setError('Зөв имэйл хаяг оруулна уу');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { identifier });
      if (res.data.devOtp) setDevOtp(res.data.devOtp);
      setTimer(60);
      setStep(2);
      setOtp('');
    } catch (err) {
      setError(err.response?.data?.message || 'Алдаа гарлаа. Дахин оролдоно уу.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length < 4) return setError('Кодоо бүрэн оруулна уу');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/verify-otp', { identifier, otp });
      if (res.data.token) {
        login(res.data.token, res.data.user);
        navigate(res.data.user?.phone === '88888888' ? '/admin' : '/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Код буруу байна');
      setOtp('');
      otpRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setStep(1); setTimer(0); setOtp(''); setError(''); };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-[#08080c] flex items-center justify-center px-4 transition-colors duration-300">
      <div className="relative w-full max-w-sm animate-scale-in">
        <div className="bg-white dark:bg-[#0d0d14] border border-stone-200 dark:border-white/8 rounded-3xl overflow-hidden shadow-xl dark:shadow-none">

          {/* Header */}
          <div className="px-8 pt-8 pb-7 border-b border-stone-100 dark:border-white/6">
            <div className="h-px bg-gradient-to-r from-green-400/50 dark:from-yellow-400/40 via-transparent to-transparent mb-6" />
            <p className="text-green-600 dark:text-yellow-400 font-black uppercase tracking-[0.4em] text-[9px] mb-2">
              {step === 1 ? 'Тавтай морил' : 'Баталгаажуулах'}
            </p>
            <h1 className="text-3xl font-black text-stone-900 dark:text-white uppercase italic tracking-tighter">
              {step === 1 ? 'Нэвтрэх' : 'Код оруулах'}
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={step === 1 ? handleSendOtp : handleVerifyOtp} className="px-8 py-7 space-y-5">

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-4 py-3 rounded-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {step === 1 ? (
              <>
                {/* Method toggle */}
                <div className="bg-stone-100 dark:bg-white/4 border border-stone-200 dark:border-white/6 p-1 rounded-2xl flex gap-1">
                  {['phone', 'email'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setMethod(m); setIdentifier(''); setError(''); }}
                      className={`flex-1 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all duration-200 ${
                        method === m ? 'bg-green-600 dark:bg-yellow-400 text-white dark:text-black' : 'text-stone-500 dark:text-gray-500 hover:text-stone-900 dark:hover:text-white'
                      }`}
                    >
                      {m === 'phone' ? 'Утас' : 'Имэйл'}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-stone-400 dark:text-gray-500 uppercase tracking-widest ml-1">
                    {method === 'phone' ? 'Утасны дугаар' : 'Имэйл хаяг'}
                  </label>
                  <input
                    type={method === 'phone' ? 'tel' : 'email'}
                    placeholder={method === 'phone' ? '88000000' : 'user@email.com'}
                    maxLength={method === 'phone' ? 8 : undefined}
                    inputMode={method === 'phone' ? 'numeric' : 'email'}
                    autoComplete={method === 'phone' ? 'tel' : 'email'}
                    value={identifier}
                    onChange={(e) => { setIdentifier(method === 'phone' ? e.target.value.replace(/\D/g, '') : e.target.value); setError(''); }}
                    className={`w-full bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/8 rounded-2xl py-4 px-5 text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-gray-600 outline-none focus:border-green-400 dark:focus:border-yellow-400/50 focus:ring-2 focus:ring-green-400/10 dark:focus:ring-yellow-400/10 transition-all font-black ${method === 'phone' ? 'text-2xl text-center tracking-[0.3em]' : 'text-base'}`}
                    required
                  />
                </div>
              </>
            ) : (
              <div className="space-y-5 text-center">
                {/* Sent info */}
                <div className="bg-green-50 dark:bg-yellow-400/8 border border-green-200 dark:border-yellow-400/15 rounded-2xl px-5 py-3">
                  <p className="text-[9px] font-black text-green-700 dark:text-yellow-400/80 uppercase tracking-widest mb-1">
                    {method === 'email' ? '📧 Имэйл рүү' : '📱 Утас руу'}
                  </p>
                  <p className="text-stone-900 dark:text-white font-black text-sm">{identifier}</p>
                </div>

                {/* Dev OTP hint */}
                {devOtp && (
                  <button
                    type="button"
                    onClick={() => setOtp(devOtp)}
                    className="w-full bg-emerald-500/10 border border-emerald-500/25 rounded-2xl px-4 py-3 text-center hover:bg-emerald-500/20 transition-all"
                  >
                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">🔑 Dev код (дарж автоматаар оруулна)</p>
                    <p className="text-emerald-300 font-black text-2xl tracking-[0.5em]">{devOtp}</p>
                  </button>
                )}

                {/* OTP */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-stone-400 dark:text-gray-500 uppercase tracking-widest">
                    Баталгаажуулах код
                  </label>
                  <input
                    ref={otpRef}
                    type="text"
                    placeholder="· · · · · ·"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                    className="w-full bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/8 rounded-2xl py-5 px-4 text-stone-900 dark:text-white placeholder-stone-300 dark:placeholder-gray-600 outline-none focus:border-green-400 dark:focus:border-yellow-400/50 focus:ring-2 focus:ring-green-400/10 dark:focus:ring-yellow-400/10 transition-all font-black text-3xl text-center tracking-[0.8em]"
                    required
                  />
                </div>

                {/* Timer / Resend */}
                {timer > 0 ? (
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                    Дахин авах:{' '}
                    <span className="text-yellow-400 font-black">{timer}с</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-[10px] font-black text-yellow-400 uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Дахин код авах
                  </button>
                )}

                <button
                  type="button"
                  onClick={reset}
                  className="block mx-auto text-[10px] font-bold text-gray-600 hover:text-gray-400 uppercase tracking-widest transition-colors"
                >
                  ← Буцах
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-300 active:scale-[0.97] ${
                loading
                  ? 'bg-stone-100 dark:bg-white/5 text-stone-400 dark:text-gray-600 cursor-not-allowed'
                  : 'bg-green-600 dark:bg-yellow-400 text-white dark:text-black hover:bg-green-700 dark:hover:bg-white'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  Уншиж байна...
                </span>
              ) : step === 1 ? 'Код авах →' : 'Нэвтрэх →'}
            </button>

            <p className="text-center text-xs text-stone-400 dark:text-gray-600 font-bold">
              Бүртгэлгүй юу?{' '}
              <Link to="/signup" className="text-green-600 dark:text-yellow-400 hover:text-green-800 dark:hover:text-white transition-colors font-black">
                Бүртгүүлэх
              </Link>
            </p>
          </form>
        </div>

        {/* Back home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-gray-600 text-[10px] font-bold uppercase tracking-widest hover:text-gray-400 transition-colors">
            ← Нүүр хуудас руу буцах
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
