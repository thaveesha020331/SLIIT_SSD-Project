import React, { useState } from 'react';

// Polished star rating used only in Senara pages
const StarRating = ({ value = 0, onChange, readOnly = false }) => {
  const [hoverValue, setHoverValue] = useState(null);

  const effectiveValue = hoverValue ?? value;

  const handleClick = (rating) => {
    if (readOnly || !onChange) return;
    onChange(rating);
  };

  const handleKeyDown = (event, rating) => {
    if (readOnly || !onChange) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating) => {
    if (readOnly) return;
    setHoverValue(rating);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverValue(null);
  };

  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= effectiveValue;
        return (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onKeyDown={(e) => handleKeyDown(e, star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-150 ${
              readOnly
                ? 'cursor-default'
                : 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400/70'
            }`}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <svg
              viewBox="0 0 24 24"
              className={`h-5 w-5 drop-shadow-sm ${
                filled
                  ? 'text-amber-400'
                  : 'text-gray-300 hover:text-amber-300'
              }`}
            >
              <path
                d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                fill="currentColor"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;

