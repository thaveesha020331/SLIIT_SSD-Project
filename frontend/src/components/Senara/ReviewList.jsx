import React from 'react';
import { Star } from 'lucide-react';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';

const ReviewList = ({
  reviews = [],
  currentUserId,
  editingId,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  submitting = false,
}) => {
  const normalizeId = (id) => {
    if (id == null) return '';
    if (typeof id === 'string') return id;
    if (typeof id === 'object' && id.toString) return id.toString();
    return String(id);
  };

  const currentUserStr = currentUserId ? normalizeId(currentUserId) : '';

  if (!reviews.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-3">
          <Star size={24} className="text-gray-200" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-bold text-gray-400">No reviews yet</p>
        <p className="text-xs text-gray-300 mt-1">Be the first to share your eco-friendly experience.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {reviews.map((review) => {
        const reviewId = review.id ?? review._id;
        const reviewIdStr = normalizeId(reviewId);
        const isOwn = Boolean(
          currentUserStr && review.userId != null &&
          normalizeId(review.userId) === currentUserStr
        );
        const isEditing = editingId != null && normalizeId(editingId) === reviewIdStr;

        if (isEditing) {
          return (
            <div key={reviewIdStr || reviewId}
              className="rounded-2xl border border-lime-200 bg-lime-50/30 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-lime-700 mb-4">Editing your review</p>
              <ReviewForm
                initialValues={{
                  rating: Math.min(5, Math.max(1, Number(review.rating) || 1)),
                  title: review.title || '',
                  comment: review.comment || '',
                }}
                onSubmit={(data) => onUpdate?.(reviewIdStr || reviewId, data)}
                onCancel={onCancelEdit}
                submitting={submitting}
              />
            </div>
          );
        }

        return (
          <ReviewCard
            key={reviewIdStr || reviewId}
            review={review}
            isOwnReview={isOwn}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
};

export default ReviewList;