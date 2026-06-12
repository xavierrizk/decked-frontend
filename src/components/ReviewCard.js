import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { StarDisplay } from './StarRating';

export default function ReviewCard({ review, onLikeToggle, onOpen, currentUserId }) {
  const [likeAnim, setLikeAnim] = useState(false);

  const isOwn = review.user?.id === currentUserId;
  const previewText = review.review_text && review.review_text.length > 200
    ? review.review_text.slice(0, 200) + '…'
    : review.review_text;

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
      className="bg-[#111114] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.15] transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <Link
            to={`/profile/${review.user?.id}`}
            onClick={e => e.stopPropagation()}
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
              onClick={e => e.stopPropagation()}
              className="text-white font-semibold text-sm hover:text-purple-400 transition-colors"
            >
              {review.user?.username}
            </Link>
            <p className="text-gray-600 text-xs mt-0.5">
              {review.time_ago}{review.was_edited ? ' · edited' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {review.is_favorited && isOwn && (
            <span className="text-yellow-400 text-xs bg-yellow-400/10 px-2 py-0.5 rounded-full font-semibold">⭐ Fav</span>
          )}
        </div>
      </div>

      {/* Stars + Title */}
      <div className="flex items-center gap-2 mb-1">
        <StarDisplay value={review.rating} size={14} />
      </div>
      {review.review_title && (
        <p className="text-white font-semibold text-sm mb-2">{review.review_title}</p>
      )}

      {/* Preview text */}
      {previewText && (
        <p className="text-gray-400 text-sm leading-relaxed mb-3">
          {previewText}
          {review.review_text && review.review_text.length > 200 && (
            <span className="text-purple-400 ml-1 font-medium">Read more</span>
          )}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-all duration-200 ${
            review.user_has_liked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'
          }`}
          style={{ transform: likeAnim ? 'scale(1.3)' : 'scale(1)', transition: 'transform 0.15s ease' }}
        >
          <span>{review.user_has_liked ? '❤️' : '🤍'}</span>
          <span>{review.like_count}</span>
        </button>
        {isOwn && (
          <span className="text-xs text-purple-400 bg-purple-600/10 px-2 py-0.5 rounded-full">Your review</span>
        )}
      </div>
    </div>
  );
}
