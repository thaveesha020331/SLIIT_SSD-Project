import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Leaf, Loader2, ArrowLeft, Star, RotateCcw, PackageCheck, LogIn,
} from 'lucide-react';
import api from '../../services/Tudakshana/authService';
import reviewService from '../../services/Senara/reviewService';
import { authHelpers } from '../../services/Tudakshana/authService';
import RatingSummaryBar from '../../components/Senara/RatingSummaryBar';
import ReviewList from '../../components/Senara/ReviewList';
import ReviewForm from '../../components/Senara/ReviewForm';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');

const getProductImageSrc = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/400';
  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('blob:') ||
    imagePath.startsWith('data:')
  ) return imagePath;
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_BASE_URL}${path}`;
};

const ProductReviewPage = () => {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('orderId');

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const currentUser = authHelpers.getUser();

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${productId}`);
      setProduct(res.data?.data || res.data);
    } catch (err) {
      setError(err.response?.status === 404 ? 'Product not found' : err.response?.data?.message || 'Failed to load product');
      setProduct(null);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await reviewService.getProductReviews(productId);
      setReviews(res.data?.data || []);
    } catch {
      setReviews([]);
    }
  };

  const fetchCanReview = async () => {
    try {
      const res = await reviewService.checkCanReview(productId, orderId || undefined);
      setCanReview(res.data?.canReview === true);
    } catch {
      setCanReview(false);
    }
  };

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setError('');
    Promise.all([fetchProduct(), fetchReviews(), fetchCanReview()]).finally(() => setLoading(false));
  }, [productId, orderId]);

  const refreshReviews = () => { fetchReviews(); fetchCanReview(); };

  const handleCreateReview = async (data) => {
    if (!canReview) return;
    setError(''); setSubmitting(true);
    try {
      await reviewService.addReview({ productId, orderId: orderId || undefined, rating: data.rating, title: data.title || '', comment: data.comment.trim() });
      refreshReviews(); setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add review');
    } finally { setSubmitting(false); }
  };

  const handleUpdateReview = async (id, data) => {
    setError(''); setSubmitting(true);
    try {
      const rating = Math.min(5, Math.max(1, Number(data.rating) || 1));
      if (data.comment.trim().length < 10) { setError('Comment must be at least 10 characters.'); setSubmitting(false); return; }
      await reviewService.updateReview(id, { rating, title: (data.title || '').trim(), comment: data.comment.trim() });
      refreshReviews(); setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update review');
    } finally { setSubmitting(false); }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    setError('');
    try {
      await reviewService.deleteReview(id); refreshReviews(); setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete review');
    }
  };

  const productData = product || {};
  const showReviewForm = canReview && currentUser;
  const alreadyReviewed = reviews.some(
    (r) => r.userId && (currentUser?._id || currentUser?.id) &&
      String(r.userId) === String(currentUser._id || currentUser.id)
  );

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 text-gray-500">
        <Loader2 size={30} className="animate-spin text-lime-600" strokeWidth={2} />
        <p className="text-sm font-medium">Loading product reviews…</p>
      </div>
    );
  }

  /* ── Error (no product) ── */
  if (error && !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center rounded-2xl border border-red-200 bg-red-50 px-8 py-14 shadow">
          <p className="text-sm font-semibold text-red-700 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full bg-[#0D0D0D] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft size={13} /> Go back
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
                <Leaf size={13} className="text-lime-700" /> Eco.Mart
              </span>
              <h1 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900 leading-tight">Product Reviews</h1>
              <p className="mt-1 text-sm text-gray-700">
                See what eco-shoppers think and share your own experience.
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full bg-[#0D0D0D] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-gray-700"
              >
                <ArrowLeft size={14} /> Back
              </button>
              {showReviewForm && (
                <button
                  type="button"
                  onClick={() => { const el = document.querySelector('#review-form'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
                  className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full border-2 border-lime-400 bg-lime-50 px-6 py-3 text-xs font-bold uppercase tracking-wider text-lime-800 transition-colors hover:bg-lime-100"
                >
                  <Star size={13} /> Write a review
                </button>
              )}
            </div>
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
              onClick={() => { setError(''); refreshReviews(); }}
              className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800"
            >
              <RotateCcw size={12} /> Try again
            </button>
          </div>
        )}

        {/* ── Review eligibility notice ── */}
        {!showReviewForm && currentUser && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-lime-200 bg-lime-50 px-5 py-4 text-sm text-lime-800">
            {alreadyReviewed
              ? <><PackageCheck size={15} className="flex-shrink-0" /> You have already reviewed this product.</>
              : <><PackageCheck size={15} className="flex-shrink-0" /> You can only review products from delivered orders.</>
            }
          </div>
        )}
        {!currentUser && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-lime-200 bg-lime-50 px-5 py-4 text-sm text-lime-800">
            <LogIn size={15} className="flex-shrink-0" />
            Log in to write a review.
            <button onClick={() => navigate('/login')} className="ml-auto text-xs font-bold text-lime-700 hover:text-lime-900 underline">Go to Login</button>
          </div>
        )}

        {/* ── Two-column layout ── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Product sidebar ── */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="rounded-2xl border border-lime-200/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)] overflow-hidden sticky top-6">
              {/* Product image */}
              <div className="w-full h-52 bg-gray-100 overflow-hidden">
                <img
                  src={getProductImageSrc(productData.image)}
                  alt={productData.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Card header strip */}
              <div className="flex items-center justify-between gap-2 px-5 py-3 border-b border-lime-100 bg-lime-50/40">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide bg-blue-100 text-blue-800">
                  {productData.category || '—'}
                </span>
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide bg-lime-100 text-lime-800">
                  {productData.ecocertification || '—'}
                </span>
              </div>

              <div className="px-5 py-4 flex flex-col gap-2">
                <h2 className="text-base font-bold text-gray-900">{productData.title || 'Product'}</h2>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-extrabold text-lime-700">${(productData.price ?? 0).toFixed(2)}</span>
                  <span className={`text-xs font-semibold ${(productData.stock ?? 0) > 0 ? 'text-lime-700' : 'text-red-600'}`}>
                    {(productData.stock ?? 0) > 0 ? `${productData.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{productData.description || '—'}</p>
              </div>
            </div>
          </aside>

          {/* ── Reviews section ── */}
          <div className="flex-1 flex flex-col gap-5">

            {/* Rating summary card */}
            <article className="rounded-2xl border border-lime-200/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)] overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-lime-100 bg-lime-50/40">
                <h2 className="text-sm font-bold text-gray-900">Customer Rating</h2>
                <span className="text-xs text-gray-400">{reviews.length} verified review{reviews.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="px-6 py-5">
                <RatingSummaryBar reviews={reviews} />
              </div>
            </article>

            {/* Review list card */}
            <article className="rounded-2xl border border-lime-200/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)] overflow-hidden">
              <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-lime-100 bg-lime-50/40">
                <h2 className="text-sm font-bold text-gray-900">All Reviews</h2>
              </div>
              <div className="px-6 py-5">
                <ReviewList
                  reviews={reviews}
                  currentUserId={currentUser ? String(currentUser._id || currentUser.id || '') : undefined}
                  editingId={editingId}
                  onEdit={(id) => setEditingId(id)}
                  onCancelEdit={() => setEditingId(null)}
                  onUpdate={handleUpdateReview}
                  onDelete={handleDeleteReview}
                  submitting={submitting}
                />
              </div>
            </article>

            {/* Review form card */}
            {showReviewForm && (
              <article id="review-form" className="rounded-2xl border border-lime-200/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)] overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-lime-100 bg-lime-50/40">
                  <Star size={14} className="text-lime-600" />
                  <h2 className="text-sm font-bold text-gray-900">Write Your Review</h2>
                </div>
                <div className="px-6 py-5">
                  <ReviewForm onSubmit={handleCreateReview} submitting={submitting} initialValues={null} />
                </div>
              </article>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductReviewPage;