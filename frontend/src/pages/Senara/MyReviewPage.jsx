import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Leaf, Loader2, ArrowRight, Star, Trash2, Pencil,
  ShoppingCart, CheckCircle2, RotateCcw,
} from 'lucide-react';
import reviewService from '../../services/Senara/reviewService';

/* ── Config ──────────────────────────────────────── */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');

const getProductImageSrc = (imagePath) => {
  if (!imagePath) return null;
  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('blob:') ||
    imagePath.startsWith('data:')
  ) return imagePath;
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_BASE_URL}${path}`;
};

/* ── Helpers ─────────────────────────────────────── */
function StarRow({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={13}
          className={n <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '–';
  return new Date(iso).toLocaleDateString('en-LK', { dateStyle: 'medium' });
}

const RATING_STYLES = {
  5: 'bg-lime-100 text-lime-800',
  4: 'bg-lime-100 text-lime-700',
  3: 'bg-amber-100 text-amber-800',
  2: 'bg-orange-100 text-orange-700',
  1: 'bg-red-100 text-red-700',
};

/* ── Component ───────────────────────────────────── */
export default function MyReviewPage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setIsAuthenticated(false); setLoading(false); return; }
    fetchMyReviews();
  }, []);

  async function fetchMyReviews() {
    setLoading(true);
    setError('');
    try {
      const res = await reviewService.getMyReviews();
      setReviews(res.data?.data || []);
    } catch (err) {
      if (err.response?.status === 401) { setIsAuthenticated(false); setLoading(false); return; }
      setError(err.response?.data?.message || 'Failed to load your reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteReview(e, reviewId) {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    setError('');
    try {
      await reviewService.deleteReview(reviewId);
      fetchMyReviews();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete review');
    }
  }

  function handleEdit(review) {
    const productId = review.product?._id || review.product;
    if (productId) navigate(`/products/${productId}/review`);
  }

  const sorted = [...reviews].sort((a, b) => {
    if (sortBy === 'highest') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'lowest')  return (a.rating || 0) - (b.rating || 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const totalReviews = reviews.length;
  const average = totalReviews === 0
    ? 0
    : reviews.reduce((s, r) => s + (r.rating || 0), 0) / totalReviews;

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 text-gray-500">
        <Loader2 size={30} className="animate-spin text-lime-600" strokeWidth={2} />
        <p className="text-sm font-medium">Loading your reviews…</p>
      </div>
    );
  }

  /* ── Not authenticated ── */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center rounded-2xl border border-lime-200 bg-gradient-to-br from-white via-lime-50 to-lime-100 px-8 py-14 shadow-[0_8px_30px_rgba(132,204,22,0.1)]">
          <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0D0D0D] text-lime-300 shadow-lg">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Login Required</h2>
          <p className="mt-2 text-sm text-gray-500">Please log in to view and manage your reviews.</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0D0D0D] px-7 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-gray-700"
          >
            Go to Login <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  /* ── Main ── */
  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ── */}
      <div className="px-4 md:px-6 lg:px-8 pt-4 pb-12 max-w-8xl mx-auto">
        <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-lime-100 via-lime-200 to-lime-400 px-8 py-12">
          <div className="pointer-events-none absolute top-0 right-0 w-2/3 h-full bg-white/10 rounded-l-full blur-3xl transform translate-x-1/4" />
          <div className="pointer-events-none absolute bottom-0 left-0 w-1/2 h-1/2 bg-lime-300/20 blur-3xl rounded-full" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-lime-300 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-lime-800 backdrop-blur-sm">
                <Leaf size={13} className="text-lime-700" />
                Eco.Mart
              </span>
              <h1 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900 leading-tight">My Reviews</h1>
              <p className="mt-1 text-sm text-gray-700">
                {totalReviews > 0
                  ? `${totalReviews} review${totalReviews !== 1 ? 's' : ''} written`
                  : 'Track and manage your product reviews'}
              </p>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full bg-[#0D0D0D] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-gray-700"
            >
              <ArrowRight size={14} /> Continue Shopping
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-8 pt-6 pb-16 max-w-7xl mx-auto">

        {/* ── Error banner ── */}
        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <span className="font-bold">!</span>
            {error}
            <button
              type="button"
              onClick={() => { setError(''); fetchMyReviews(); }}
              className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800"
            >
              <RotateCcw size={12} /> Try again
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {reviews.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-lime-200 bg-gradient-to-br from-white via-lime-50 to-lime-100 px-8 py-14 text-center shadow-[0_8px_30px_rgba(132,204,22,0.1)]">
            <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0D0D0D] text-lime-300 shadow-lg">
              <Star size={30} strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">No reviews yet</h2>
            <p className="mt-2 text-sm text-gray-500">Start sharing your thoughts on products you've purchased.</p>
            <button
              onClick={() => navigate('/products')}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0D0D0D] px-7 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-gray-700"
            >
              Browse products <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <>
            {/* ── Toolbar ── */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-gray-700">
                {totalReviews} review{totalReviews !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Sort by</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-full border border-lime-200 bg-lime-50 px-3 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-lime-400"
                >
                  <option value="recent">Most recent</option>
                  <option value="highest">Highest rated</option>
                  <option value="lowest">Lowest rated</option>
                </select>
              </div>
            </div>

            {/* ── Two-column layout: cards + sidebar ── */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">

              {/* Cards list */}
              <div className="flex-1 flex flex-col gap-5">
                {sorted.map((review) => {
                  const productTitle = review.product?.title || 'Product';
                  const reviewId     = review._id;
                  const userName     = review.user?.name || review.userName || 'You';
                  const imgSrc       = getProductImageSrc(review.product?.image);

                  return (
                    <article
                      key={reviewId}
                      className="rounded-2xl border border-lime-200/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)] overflow-hidden transition-shadow hover:shadow-[0_8px_30px_rgba(132,204,22,0.12)]"
                    >
                      {/* Card header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-lime-100 bg-lime-50/40">
                        <div className="flex items-center gap-3">

                          {/* Product image thumbnail */}
                          {imgSrc ? (
                            <div className="flex-shrink-0 h-12 w-12 rounded-xl overflow-hidden border border-lime-200 shadow-sm bg-gray-100">
                              <img
                                src={imgSrc}
                                alt={productTitle}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 h-12 w-12 rounded-xl border border-lime-200 bg-lime-50 flex items-center justify-center">
                              <ShoppingCart size={16} className="text-lime-400" />
                            </div>
                          )}

                          <div>
                            <p className="text-sm font-bold text-gray-900 leading-none">{userName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-lime-700">
                                <CheckCircle2 size={10} /> Verified purchase
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${RATING_STYLES[review.rating] || 'bg-gray-100 text-gray-700'}`}>
                            {review.rating}/5
                          </span>
                          <StarRow rating={review.rating} />
                        </div>
                      </div>

                      <div className="px-6 py-5">
                        {/* Product pill */}
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-lime-200 bg-lime-50 px-3 py-1 text-xs font-semibold text-lime-800 mb-3">
                          <ShoppingCart size={11} />
                          {productTitle}
                        </div>

                        {/* Comment */}
                        <p className="text-sm text-gray-600 leading-relaxed mb-5">{review.comment}</p>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(review)}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#0D0D0D] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-gray-700"
                          >
                            <Pencil size={12} /> Edit review
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteReview(e, reviewId)}
                            className="inline-flex items-center gap-1.5 rounded-full border-2 border-red-200 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-500 transition-colors hover:bg-red-50"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* ── Sidebar ── */}
              <aside className="w-full lg:w-64 flex-shrink-0">
                <div className="rounded-2xl border border-lime-200/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)] overflow-hidden sticky top-6">
                  <div className="px-5 py-4 border-b border-lime-100 bg-lime-50/40">
                    <h3 className="text-sm font-bold text-gray-900">Review activity</h3>
                  </div>
                  <div className="px-5 py-5 flex flex-col gap-4">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Your reviews help other shoppers make better, more sustainable choices.
                    </p>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Total reviews</span>
                        <span className="text-sm font-bold text-gray-900">{totalReviews}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Avg rating</span>
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-gray-900">
                          <Star size={13} className="fill-amber-400 text-amber-400" />
                          {average.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate('/my-orders')}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0D0D0D] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-gray-700"
                    >
                      <ArrowRight size={13} /> Review another
                    </button>
                  </div>
                </div>
              </aside>

            </div>
          </>
        )}
      </div>
    </div>
  );
}