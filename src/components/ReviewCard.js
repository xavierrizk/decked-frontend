import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { StarDisplay } from './StarRating';

export default function ReviewCard({ review, onLikeToggle, onOpen, currentUserId }) {
  const [likeAnim, setLikeAnim] = useState(false);

  const isOwn = review.user?.id === currentUserId;
  const isPopular = (review.like_count || 0) >= 10;

  const previewText = review.review_text && review.review_text.length > 180
    ? review.review_text.slice(0, 180) + '…'
    : review.review_text;
  const truncated = review.review_text && review.review_text.length > 180;

  const handleLike = (e) => {
    e.stopPropagation();
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 300);
    if (onLikeToggle) onLikeToggle(review.id, review.user_has_liked);
  };

  const handleCardClick = () => {
    if (onOpen) onOpen(review);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative bg-[#111114] rounded-2xl p-5 border transition-all duration-200 cursor-pointer group ${
        isOwn
          ? 'border-l-2 border-l-purple-500/50 border-white/[0.06] hover:border-white/[0.12]'
          : 'border-white/[0.06] hover:border-white/[0.12]'
      }`}
    >
      {/* Popular badge */}
      {isPopular && (
        <span className="absolute top-3 right-3 text-xs bg-orange-500/15 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full">
          🔥 Popular
        </span>
      )}

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          {/* Avatar */}
          <Link
            to={`/profile/${review.user?.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0"
          >
            {review.user?.profile_picture_url ? (
              <img
                src={review.user.profile_picture_url}
                alt={review.user.username}
                className="w-9 h-9 rounded-full object-cover border border-white/10 hover:border-purple-400/50 transition-colors"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-sm font-bold text-white">
                {review.user?.username?.[0]?.toUpperCase()}
              </div>
            )}
          </Link>

          <div>
            <Link
              to={`/profile/${review.user?.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-semibold text-white hover:text-purple-400 transition-colors block"
            >
              @{review.user?.username}
            </Link>
            <p className="text-xs text-gray-600 mt-0.5">
              {review.time_ago}{review.was_edited ? ' · edited' : ''}
            </p>
          </div>
        </div>

        {/* Stars (top-right) */}
        <div className="flex-shrink-0">
          <StarDisplay value={review.rating} size={14} />
        </div>
      </div>

      {/* Review title */}
      {review.review_title && (
        <p className="text-base font-bold text-white mt-3 mb-2 leading-snug">{review.review_title}</p>
      )}

      {/* Review text preview */}
      {previewText && (
        <p className="text-gray-400 text-sm leading-relaxed">
          {previewText}
          {truncated && (
            <span className="text-purple-400 ml-1 font-medium cursor-pointer">Read more</span>
          )}
        </p>
      )}

      {/* Divider + footer */}
      <div className="border-t border-white/[0.05] mt-4 pt-3 flex items-center justify-between">
        {/* Like button */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            review.user_has_liked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'
          }`}
          style={{
            transform: likeAnim ? 'scale(1.25)' : 'scale(1)',
            transition: 'transform 0.15s ease, color 0.15s ease',
          }}
        >
          <span>{review.user_has_liked ? '♥' : '♡'}</span>
          <span>{review.like_count || 0}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Favorited badge */}
          {review.is_favorited && (
            <span className="text-yellow-400 text-xs font-semibold flex items-center gap-1">
              ⭐ Favorited
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
