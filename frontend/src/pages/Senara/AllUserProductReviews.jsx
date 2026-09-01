import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Leaf, Loader2, ArrowLeft, ArrowRight, Star, ShieldCheck,
  RotateCcw, PackageOpen, UserCircle2, MessageSquare,
} from 'lucide-react';
import api from '../../services/Tudakshana/authService';
import reviewService from '../../services/Senara/reviewService';
import { authHelpers } from '../../services/Tudakshana/authService';
import ReviewList from '../../components/Senara/ReviewList';
import RatingSummaryBar from '../../components/Senara/RatingSummaryBar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const API_BASE_URL = API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');

const getProductImageSrc = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/400x400?text=No+Image';
  if (
    imagePath.startsWith('http://') || imagePath.startsWith('https://') ||
    imagePath.startsWith('blob:') || imagePath.startsWith('data:')
  ) return imagePath;
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_BASE_URL}${path}`;
};

const AllUserProductReviews = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentUser = authHelpers.getUser();

  useEffect(() => {
    if (!productId) return;
    const load = async () => {
      setLoading(true); setError('');
      try {
        const [productRes, reviewsRes] = await Promise.all([
          api.get(`/products/${productId}`),
          reviewService.getProductReviews(productId),
        ]);
        setProduct(productRes.data?.data || productRes.data);
        setReviews(reviewsRes.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product reviews');
        setProduct(null); setReviews([]);
      } finally { setLoading(false); }
    };
    load();
  }, [productId]);

  const { ownReviews, otherReviews } = useMemo(() => {
    if (!currentUser) return { ownReviews: [], otherReviews: reviews };
    const userId = String(currentUser._id || currentUser.id || '');
    const own = [], others = [];
    reviews.forEach((r) => {
      const rUserId = r.userId ? String(r.userId) : '';
      if (rUserId && userId && rUserId === userId) own.push(r);
      else others.push(r);
    });
    return { ownReviews: own, otherReviews: others };
  }, [reviews, currentUser]);

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length
    : 0;

  const productData = product || {};

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 text-gray-500">
      <Loader2 size={30} className="animate-spin text-lime-600" strokeWidth={2} />
      <p className="text-sm font-medium">Loading reviews…</p>
    </div>
  );

  /* ── Error (no product) ── */
  if (error && !product) return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center rounded-2xl border border-red-200 bg-red-50 px-8 py-14 shadow">
        <p className="text-sm font-semibold text-red-700 mb-4">{error}</p>
        <button onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full bg-[#0D0D0D] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-gray-700 transition-colors">
          <ArrowLeft size={13} /> Go back
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero — identical to MyOrders ── */}
      <div className="px-4 md:px-6 lg:px-8 pt-4 pb-12 max-w-8xl mx-auto">
        <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-lime-100 via-lime-200 to-lime-400 px-8 py-12">
          <div className="pointer-events-none absolute top-0 right-0 w-2/3 h-full bg-white/10 rounded-l-full blur-3xl transform translate-x-1/4" />
          <div className="pointer-events-none absolute bottom-0 left-0 w-1/2 h-1/2 bg-lime-300/20 blur-3xl rounded-full" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-lime-300 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-lime-800 backdrop-blur-sm">
                <Leaf size={13} className="text-lime-700" /> Eco.Mart
              </span>
              <h1 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900 leading-tight">All Reviews</h1>
              <p className="mt-1 text-sm text-gray-700">
                {reviews.length > 0
                  ? `${reviews.length} review${reviews.length !== 1 ? 's' : ''} for this product`
                  : 'Read what customers think about this product'}
              </p>
              {reviews.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map((n) => (
                      <Star key={n} size={15}
                        className={n <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'fill-white/60 text-white/40'}
                        strokeWidth={1} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-gray-800">{avgRating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full bg-[#0D0D0D] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-gray-700"
            >
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 lg:px-8 pb-16 max-w-7xl mx-auto">

        {/* ── Error banner ── */}
        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <span className="font-bold">!</span>
            {error}
            <button
              type="button"
              onClick={() => navigate(0)}
              className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800"
            >
              <RotateCcw size={12} /> Try again
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {reviews.length === 0 && !error ? (
          <div className="mx-auto max-w-md rounded-2xl border border-lime-200 bg-gradient-to-br from-white via-lime-50 to-lime-100 px-8 py-14 text-center shadow-[0_8px_30px_rgba(132,204,22,0.1)]">
            <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0D0D0D] text-lime-300 shadow-lg">
              <PackageOpen size={30} strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">No reviews yet</h2>
            <p className="mt-2 text-sm text-gray-500">Be the first to share your experience with this product.</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0D0D0D] px-7 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-gray-700"
            >
              Go back <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* ── Product sidebar ── */}
            <aside className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-6">
              <article className="rounded-2xl border border-lime-200/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)] overflow-hidden">

                {/* Card header strip */}
                <div className="flex items-center justify-between gap-2 px-5 py-3 border-b border-lime-100 bg-lime-50/40">
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide bg-blue-100 text-blue-800">
                    {productData.category || '—'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide bg-lime-100 text-lime-800">
                    <ShieldCheck size={10} /> {productData.ecocertification || '—'}
                  </span>
                </div>

                {/* Product image */}
                <div className="w-full h-52 bg-gray-100 overflow-hidden">
                  <img
                    src={getProductImageSrc(productData.image)}
                    alt={productData.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>

                <div className="px-5 py-4 flex flex-col gap-2">
                  <h2 className="text-base font-bold text-gray-900 leading-snug">
                    {productData.title || 'Product'}
                  </h2>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-extrabold text-lime-700">
                      ${(productData.price ?? 0).toFixed(2)}
                    </span>
                    <span className={`text-xs font-semibold ${(productData.stock ?? 0) > 0 ? 'text-lime-700' : 'text-red-600'}`}>
                      {(productData.stock ?? 0) > 0 ? `${productData.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                    {productData.description || '—'}
                  </p>
                  {reviews.length > 0 && (
                    <div className="mt-2 pt-3 border-t border-lime-100 flex items-center justify-between">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map((n) => (
                          <Star key={n} size={12}
                            className={n <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-200'}
                            strokeWidth={1} />
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-gray-500">
                        {avgRating.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </article>
            </aside>

            {/* ── Reviews column ── */}
            <div className="flex-1 flex flex-col gap-5 min-w-0">

              {/* Rating Summary card */}
              <article className="rounded-2xl border border-lime-200/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)] overflow-hidden transition-shadow hover:shadow-[0_8px_30px_rgba(132,204,22,0.12)]">
                <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-lime-100 bg-lime-50/40">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Star size={13} className="fill-amber-400 text-amber-400" />
                    </div>
                    <h2 className="text-sm font-bold text-gray-900">Customer Rating</h2>
                  </div>
                  <span className="text-xs text-gray-400">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="px-6 py-5">
                  <RatingSummaryBar reviews={reviews} />
                </div>
              </article>

              {/* Your Review card */}
              {currentUser && ownReviews.length > 0 && (
                <article className="rounded-2xl border border-lime-200/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)] overflow-hidden transition-shadow hover:shadow-[0_8px_30px_rgba(132,204,22,0.12)]">
                  <div className="flex items-center gap-2 px-6 py-4 border-b border-lime-100 bg-lime-50/40">
                    <div className="w-7 h-7 rounded-xl bg-lime-200 flex items-center justify-center">
                      <UserCircle2 size={13} className="text-lime-700" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-gray-900">Your Review</h2>
                      <p className="text-[10px] text-gray-400 font-medium">Your submitted review for this product</p>
                    </div>
                  </div>
                  <div className="px-6 py-5">
                    <ReviewList reviews={ownReviews} />
                  </div>
                </article>
              )}

              {/* All Reviews card */}
              <article className="rounded-2xl border border-lime-200/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)] overflow-hidden transition-shadow hover:shadow-[0_8px_30px_rgba(132,204,22,0.12)]">
                <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-lime-100 bg-lime-50/40">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-lime-100 flex items-center justify-center">
                      <MessageSquare size={13} className="text-lime-700" />
                    </div>
                    <h2 className="text-sm font-bold text-gray-900">All Reviews</h2>
                  </div>
                  <span className="text-xs text-gray-400">{otherReviews.length} review{otherReviews.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="px-6 py-5">
                  <ReviewList reviews={otherReviews} />
                </div>
              </article>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllUserProductReviews;