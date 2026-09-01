import React, { useMemo } from 'react';
import StarRating from './StarRating';

const RatingSummaryBar = ({ reviews = [] }) => {
  const { average, counts, total } = useMemo(() => {
    if (!reviews.length)
      return {
        average: 0,
        counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        total: 0,
      };

    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    reviews.forEach((r) => {
      const rating = Number(r.rating) || 0;
      if (rating >= 1 && rating <= 5) {
        counts[rating] += 1;
        sum += rating;
      }
    });

    const total = reviews.length;
    const average = total ? sum / total : 0;

    return { average, counts, total };
  }, [reviews]);

  const BAR_COLORS = {
    5: 'bg-lime-500',
    4: 'bg-lime-400',
    3: 'bg-amber-400',
    2: 'bg-orange-400',
    1: 'bg-red-400',
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
      {/* Score */}
      <div className="flex flex-col items-center justify-center flex-shrink-0 w-32">
        <span className="text-5xl font-black text-gray-900">
          {average.toFixed(1)}
        </span>
        <div className="mt-2">
          <StarRating value={Math.round(average)} readOnly />
        </div>
        <span className="mt-1.5 text-xs text-gray-400">
          {total} review{total !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px bg-gray-100" />

      {/* Bars */}
      <div className="flex-1 w-full flex flex-col gap-2.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = counts[star] || 0;
          const pct = total ? (count / total) * 100 : 0;

          return (
            <div key={star} className="flex items-center gap-3">
              <span className="w-12 text-xs text-gray-500 text-right">
                {star} star
              </span>

              <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full ${BAR_COLORS[star]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <span className="w-6 text-xs text-gray-400 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RatingSummaryBar;