import React from 'react';
import { Link } from 'react-router-dom';
import { StarDisplay } from '../StarRating';
import { gradFor, shortDate } from './helpers';

export default function ProfileReviewCard({ review, onOpen }) {
  const art = review.dj_image ? `url(${review.dj_image})` : gradFor(review.dj_id || review.set_id);

  return (
    <div
      onClick={() => onOpen && onOpen(review)}
      className="group flex flex-col sm:flex-row bg-[#0f0f1a] border border-white/[0.07] hover:border-white/[0.16] cursor-pointer transition-all duration-200 overflow-hidden"
      style={{ transformOrigin: 'center' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.006)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {/* Set art — hero image */}
      <div
        className="relative flex-shrink-0 w-full sm:w-[180px] md:w-[200px] h-44 sm:h-auto overflow-hidden"
        style={{ backgroundImage: art, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/60 to-transparent" />
        {!review.dj_image && (
          <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-20">🎧</div>
        )}
        {review.is_favorited && (
          <div className="absolute top-2 left-2 text-yellow-400 text-sm" title="Favorited">⭐</div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 p-4 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-white font-bold text-lg leading-tight group-hover:text-[#00D9FF] transition-colors truncate"
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              {review.set_title || 'Unknown Set'}
            </h3>
            {review.dj_name && (
              <Link
                to={`/dj/${review.dj_id}`}
                onClick={e => e.stopPropagation()}
                className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
              >
                {review.dj_name}
              </Link>
            )}
          </div>
          <div className="flex-shrink-0">
            <StarDisplay value={review.rating} size={18} />
          </div>
        </div>

        {/* Review title */}
        {review.review_title && (
          <p className="text-gray-200 font-semibold text-sm mt-2.5">{review.review_title}</p>
        )}

        {/* Review body */}
        {review.review_text && (
          <p className="text-gray-400 text-sm mt-1.5 leading-relaxed line-clamp-3">{review.review_text}</p>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 mt-auto pt-3 text-xs text-gray-600">
          <span>{shortDate(review.created_at)}</span>
          <span className="flex items-center gap-1">❤️ {review.like_count || 0}</span>
          {review.set_genre && (
            <span className="ml-auto px-2 py-0.5 border border-white/[0.07] text-gray-500">{review.set_genre}</span>
          )}
        </div>
      </div>
    </div>
  );
}
