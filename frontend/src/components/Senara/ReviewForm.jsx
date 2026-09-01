import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import StarRating from './StarRating';

const initialState = { rating: 0, title: '', comment: '' };

const ReviewForm = ({ onSubmit, submitting = false, initialValues = null, onCancel }) => {
  const [form, setForm] = useState(initialValues || initialState);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(initialValues ? { ...initialState, ...initialValues } : initialState);
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.rating || !form.comment?.trim()) {
      setError('Please select a rating and write a short review.');
      return;
    }
    if (form.comment.trim().length < 10) {
      setError('Comment must be at least 10 characters.');
      return;
    }
    onSubmit?.(form);
    if (!initialValues) setForm(initialState);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={14} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Rating */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Your Rating <span className="text-red-400">*</span>
        </label>
        <StarRating value={form.rating} onChange={(r) => setForm((p) => ({ ...p, rating: r }))} />
      </div>

      {/* Headline */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Headline
        </label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Summarize your experience in a few words"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-lime-400 focus:bg-white focus:ring-2 focus:ring-lime-100"
        />
      </div>

      {/* Comment */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Your Review <span className="text-red-400">*</span>
        </label>
        <textarea
          name="comment"
          value={form.comment}
          onChange={handleChange}
          rows={4}
          placeholder="What did you like or dislike? How is the eco-friendliness and quality?"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-lime-400 focus:bg-white focus:ring-2 focus:ring-lime-100 resize-none"
        />
        <span className="text-[10px] text-gray-400 text-right">{form.comment.length} chars · min 10</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-full bg-[#0D0D0D] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting
            ? <><Loader2 size={12} className="animate-spin" /> Saving…</>
            : initialValues ? 'Update Review' : 'Submit Review'}
        </button>
        {initialValues && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 rounded-full border-2 border-gray-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ReviewForm;