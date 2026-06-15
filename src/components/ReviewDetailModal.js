import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { StarDisplay } from './StarRating';

export default function ReviewDetailModal({ review, open, onClose, onLikeToggle, onEdit, onDelete, currentUserId }) {
  const [likeAnim, setLikeAnim] = useState(false);

  if (!open || !review) return null;

  const isOwn = review.user?.id === currentUserId;

  const handleLike = () => {
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 300);
    if (onLikeToggle) onLikeToggle(review.id, review.user_has_liked);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-w-2xl w-full bg-[#0d0d0f] border border-white/[0.07] rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="flex items-center justify-end px-5 pt-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.06]"
          >
            ✕
          </button>
        </div>

        <div className="px-6 pb-6">
          {/* User row */}
          <div className="flex items-center gap-3 mb-5">
            <Link to={`/profile/${review.user?.id}`} onClick={onClose} className="flex-shrink-0">
              {review.user?.profile_picture_url ? (
                <img
                  src={review.user.profile_picture_url}
                  alt={review.user.username}
                  className="w-10 h-10 rounded-full object-cover border border-white/10"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-base font-bold text-white">
                  {review.user?.username?.[0]?.toUpperCase()}
                </div>
              )}
            </Link>
            <div>
              <Link
                to={`/profile/${review.user?.id}`}
                onClick={onClose}
                className="text-white font-semibold hover:text-[#00D9FF] transition-colors"
              >
                {review.user?.username}
              </Link>
              <p className="text-gray-500 text-xs mt-0.5">
                {review.time_ago}
                {review.was_edited && <span className="ml-1 text-gray-600">· edited</span>}
              </p>
            </div>
          </div>

          {/* Stars */}
          <div className="mb-3">
            <StarDisplay value={review.rating} size={20} />
          </div>

          {/* Title */}
          {review.review_title && (
            <h2 className="text-xl font-bold text-white mb-3">{review.review_title}</h2>
          )}

          {/* Full text */}
          {review.review_text ? (
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm mb-5">{review.review_text}</p>
          ) : (
            <p className="text-gray-600 text-sm italic mb-5">No written review.</p>
          )}

          {/* Video placeholder */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-6 text-center text-gray-600 mb-5">
            <p className="text-3xl mb-2">🎬</p>
            <p className="text-sm">Video reviews coming soon</p>
          </div>

          {/* Bottom row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-200 text-sm font-medium ${
                review.user_has_liked
                  ? 'bg-red-500/15 border-red-500/30 text-red-400'
                  : 'bg-white/[0.04] border-white/[0.07] text-gray-400 hover:text-red-400 hover:border-red-500/30'
              }`}
              style={{ transform: likeAnim ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.15s ease' }}
            >
              <span>{review.user_has_liked ? '❤️' : '🤍'}</span>
              <span>{review.like_count}</span>
            </button>

            {isOwn && (
              <div className="flex items-center gap-2">
                {onEdit && (
                  <button
                    onClick={() => { onClose(); onEdit(review); }}
                    className="text-sm font-medium px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:border-[#00D9FF]/50 hover:text-white transition-all duration-200"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => { if (window.confirm('Delete this review?')) { onClose(); onDelete(review.id); } }}
                    className="text-sm font-medium px-4 py-2 rounded-xl border border-red-600/20 text-red-400 hover:border-red-400/40 hover:text-red-300 transition-all duration-200"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
