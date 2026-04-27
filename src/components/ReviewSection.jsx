import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatters';
import { Link } from 'react-router-dom';

const Star = ({ filled, hover, onClick, onMouseEnter, onMouseLeave }) => (
  <svg
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className={`w-7 h-7 cursor-pointer transition-all duration-150 ${filled || hover ? 'text-yellow-400 scale-110' : 'text-white/15'}`}
    fill="currentColor" viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const ReviewSection = ({ refId, refType }) => {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  const avg = reviews.length > 0
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => Math.round(r.rating) === star).length,
  }));

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/api/reviews/${refId}`);
      setReviews(res.data);
    } catch {}
  };

  useEffect(() => { fetchReviews(); }, [refId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!comment.trim()) return setFormError('Сэтгэгдэл бичнэ үү.');
    setLoading(true);
    try {
      await api.post('/api/reviews/add', {
        refId, refType,
        userName: user?.name || user?.phone || 'Зочин',
        rating, comment,
        phone: user?.phone,
      });
      setComment('');
      setRating(5);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      fetchReviews();
    } catch {
      setFormError('Сэтгэгдэл хадгалахад алдаа гарлаа.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 border-t border-white/5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

        {/* Left: stats + form */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <p className="text-yellow-400 font-black uppercase tracking-[0.4em] text-[9px] mb-3">Сэтгэгдэл</p>
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">
              Үйлчлүүлэгчдийн <span className="text-yellow-400">дүгнэлт</span>
            </h3>
          </div>

          {/* Average */}
          <div className="bg-white/3 border border-white/6 rounded-3xl p-6 space-y-5">
            <div className="flex items-center gap-5">
              <p className="text-6xl font-black text-yellow-400 italic leading-none">{avg}</p>
              <div>
                <div className="flex gap-0.5 mb-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} className={`text-lg ${s <= Math.round(avg) ? 'text-yellow-400' : 'text-white/10'}`}>★</span>
                  ))}
                </div>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{reviews.length} сэтгэгдэл</p>
              </div>
            </div>

            <div className="space-y-2">
              {ratingCounts.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-gray-600 w-3">{star}</span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                      style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 w-4">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-white/3 border border-white/6 rounded-3xl p-6 space-y-4">
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Сэтгэгдэл үлдээх</p>

            {token ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {success && (
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-4 py-3 rounded-2xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    Баярлалаа! Сэтгэгдэл амжилттай хадгалагдлаа.
                  </div>
                )}
                {formError && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-4 py-3 rounded-2xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    {formError}
                  </div>
                )}

                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star}
                      filled={rating >= star}
                      hover={hoverRating >= star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  ))}
                </div>

                <textarea
                  placeholder="Таны санал хүсэлт..."
                  required
                  className="w-full bg-white/5 border border-white/8 rounded-2xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/10 transition-all min-h-[100px] font-medium text-sm resize-none"
                  value={comment}
                  onChange={e => { setComment(e.target.value); setFormError(''); }}
                />

                <button disabled={loading} className="w-full bg-yellow-400 text-black py-3.5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white transition-all active:scale-[0.97] disabled:opacity-40">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Илгээж байна...
                    </span>
                  ) : 'Илгээх →'}
                </button>
              </form>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Сэтгэгдэл үлдээхийн тулд нэвтрэнэ үү</p>
                <Link to="/login" className="inline-block text-[10px] font-black text-yellow-400 uppercase tracking-widest hover:text-white transition-colors border-b border-yellow-400/40 pb-0.5">
                  Нэвтрэх →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right: reviews list */}
        <div className="lg:col-span-7">
          {reviews.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center border border-white/5 rounded-3xl bg-white/2">
              <p className="text-gray-600 font-black italic uppercase tracking-widest text-sm">Одоогоор сэтгэгдэл байхгүй</p>
              <p className="text-gray-700 text-xs mt-1">Эхний сэтгэгдлийг та үлдээгээрэй</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {reviews.map(r => (
                <div key={r._id} className="bg-white/3 border border-white/6 hover:border-yellow-400/15 rounded-3xl p-6 transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-yellow-400 flex items-center justify-center text-black font-black text-sm shrink-0">
                        {(r.userName || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-white text-sm">{r.userName || 'Зочин'}</p>
                        <div className="flex gap-0.5 mt-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <span key={s} className={`text-xs ${s <= r.rating ? 'text-yellow-400' : 'text-white/10'}`}>★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{formatDate(r.createdAt)}</p>
                  </div>

                  <p className="text-gray-400 text-sm leading-relaxed italic">"{r.comment}"</p>

                  {r.reply && (
                    <div className="mt-4 bg-yellow-400/6 border border-yellow-400/15 rounded-2xl px-4 py-3">
                      <p className="text-[9px] font-black text-yellow-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                        Ресортын хариу
                      </p>
                      <p className="text-gray-400 text-xs font-bold leading-relaxed">{r.reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewSection;
