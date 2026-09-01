import React from 'react';
import { CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import StarRating from './StarRating';

const AVATAR_BG = ['bg-lime-600', 'bg-emerald-600', 'bg-teal-600', 'bg-green-700'];

function Avatar({ name }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  const bg = name ? AVATAR_BG[name.charCodeAt(0) % AVATAR_BG.length] : AVATAR_BG[0];
  return (
    <div className={`flex-shrink-0 h-10 w-10 rounded-xl ${bg} flex items-center justify-center text-white text-xs font-black shadow-sm`}>
      {initials}
    </div>
  );
}

const RATING_BADGE = {
  5: 'bg-lime-100 text-lime-800 border-lime-200',
  4: 'bg-lime-50 text-lime-700 border-lime-200',
  3: 'bg-amber-50 text-amber-700 border-amber-200',
  2: 'bg-orange-50 text-orange-700 border-orange-200',
  1: 'bg-red-50 text-red-600 border-red-200',
};

const ReviewCard = ({ review, isOwnReview = false, onEdit, onDelete }) => {
  if (!review) return null;

  const reviewId = review.id ?? review._id;
  const reviewIdStr = reviewId != null ? String(reviewId) : '';
  const { authorName, title, comment, rating, createdAt, variant, ecoTags = [] } = review;

  const dateLabel = createdAt
    ? new Date(createdAt).toLocaleDateString('en-LK', { dateStyle: 'medium' })
    : 'Recently';

  const ratingNum = Number(rating) || 0;

  return (
    <article className="rounded-2xl border border-lime-100/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.05)] overflow-hidden transition-shadow hover:shadow-[0_4px_20px_rgba(132,204,22,0.10)]">

      {/* Card header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-lime-50 bg-lime-50/40">
        <div className="flex items-center gap-3">
          <Avatar name={authorName} />
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">{authorName || 'Anonymous'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] text-gray-400 font-medium">{dateLabel}</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-lime-700">
                <CheckCircle2 size={9} /> Verified
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${RATING_BADGE[ratingNum] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
            {ratingNum}/5
          </span>
          <StarRating value={ratingNum} readOnly />
        </div>
      </div>

      {/* Card body */}
      <div className="px-5 py-4">
        {title && (
          <p className="text-sm font-bold text-gray-900 mb-1">{title}</p>
        )}
        {comment && (
          <p className="text-sm text-gray-600 leading-relaxed">{comment}</p>
        )}

        {(variant || ecoTags.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {variant && (
              <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700">
                {variant}
              </span>
            )}
            {ecoTags.map((tag) => (
              <span key={tag} className="inline-flex items-center rounded-full border border-lime-200 bg-lime-50 px-2.5 py-0.5 text-[11px] font-semibold text-lime-700">
                {tag}
              </span>
            ))}
          </div>
        )}

        {isOwnReview && reviewIdStr && (
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit?.(reviewIdStr); }}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0D0D0D] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-gray-700 transition-colors"
            >
              <Pencil size={11} /> Edit
            </button>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete?.(reviewIdStr); }}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-red-200 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={11} /> Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default ReviewCard;