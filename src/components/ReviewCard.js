import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { StarDisplay } from './StarRating';
import ShareMenu from './ShareMenu';

export default function ReviewCard({ review, onLikeToggle, onOpen, currentUserId }) {
  const [likeAnim, setLikeAnim] = useState(false);

  const isOwn = review.user?.id === currentUserId;
  const isPopular = (review.like_count || 0) >= 10;

  const previewText = review.review_text && review.review_text.length > 160
    ? review.review_text.slice(0, 160) + '…'
    : review.review_text;
  const truncated = review.review_text && review.review_text.length > 160;

  const handleLike = (e) => {
    e.stopPropagation();
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 300);
    if (onLikeToggle) onLikeToggle(review.id, review.user_has_liked);
  };

  return (
    <div
      onClick={() => onOpen && onOpen(review)}
      className={`relative bg-[#111114] p-4 border transition-all duration-200 cursor-pointer group ${
        isOwn
          ? 'border-l-2 border-l-[#00D9FF]/40 border-white/[0.06] hover:border-white/[0.12]'
          : 'border-white/[0.06] hover:border-white/[0.12]'
      }`}
    >
      {/* Popular badge */}
      {isPopular && (
        <span className="absolute top-2.5 right-2.5 text-[10px] bg-orange-500/15 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded-full">
          🔥 Popular
        </span>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {/* Avatar */}
          <Link to={`/profile/${review.user?.id}`} onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
            {review.user?.profile_picture_url ? (
              <img
                src={review.user.profile_picture_url}
                alt={review.user.username}
                className="w-7 h-7 rounded-full object-cover border border-white/10"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-xs font-bold text-white">
                {review.user?.username?.[0]?.toUpperCase()}
              </div>
            )}
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to={`/profile/${review.user?.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-semibold text-white hover:text-[#00D9FF] transition-colors"
            >
              @{review.user?.username}
            </Link>
            <span className="text-gray-700 text-xs">{review.time_ago}{review.was_edited ? ' · edited' : ''}</span>
          </div>
        </div>

        {/* Stars */}
        <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
          {review.performance_rating && (
            <StarDisplay value={review.performance_rating} size={11} color="#00D9FF" />
          )}
          {review.venue_rating && (
            <StarDisplay value={review.venue_rating} size={11} color="#FF006E" />
          )}
          {review.crowd_rating && (
            <StarDisplay value={review.crowd_rating} size={11} color="#A020F0" />
          )}
          {!review.performance_rating && (
            <StarDisplay value={review.rating} size={13} />
          )}
        </div>
      </div>

      {/* Review title */}
      {review.review_title && (
        <p className="text-sm font-bold text-white mb-1 leading-snug">{review.review_title}</p>
      )}

      {/* Review text preview */}
      {previewText && (
        <p className="text-gray-400 text-sm leading-relaxed">
          {previewText}
          {truncated && <span className="text-[#00D9FF] ml-1 text-xs font-medium cursor-pointer">more</span>}
        </p>
      )}

      {/* Video clip */}
      {review.video_url && (
        <div className="mt-3 rounded-xl overflow-hidden border border-[#00D9FF]/20 bg-black">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#00D9FF]/10 border-b border-[#00D9FF]/20">
            <span className="text-[#00D9FF] text-xs">▶</span>
            <span className="text-[#00D9FF] text-xs font-semibold uppercase tracking-wider">Video Clip</span>
            {review.video_duration && (
              <span className="ml-auto text-gray-500 text-[10px] font-mono">{Math.floor(review.video_duration)}s</span>
            )}
          </div>
          <video
            src={review.video_url}
            controls
            playsInline
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-56 object-contain bg-black"
          />
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.04]">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 text-xs transition-colors ${
            review.user_has_liked ? 'text-red-400' : 'text-gray-600 hover:text-red-400'
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
          {review.is_favorited && (
            <span className="text-yellow-400 text-[10px] font-semibold flex items-center gap-1">
              ⭐ Favorited
            </span>
          )}
          <ShareMenu
            url={review.set_id ? `${window.location.origin}/set/${review.set_id}` : undefined}
            text={review.review_text
              ? `"${review.review_text.slice(0, 80)}${review.review_text.length > 80 ? '…' : ''}" — DECK'D ${window.location.origin}/set/${review.set_id}`
              : `Check out this review on DECK'D — ${window.location.origin}/set/${review.set_id}`}
            className="ml-auto"
          />
        </div>
      </div>
    </div>
  );
}
