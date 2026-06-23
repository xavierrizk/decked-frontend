import API_URL from '../api';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const authHeaders = () => {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const SORTS = [
  { value: 'newest',    label: 'Newest' },
  { value: 'oldest',    label: 'Oldest' },
  { value: 'top_liked', label: 'Most Liked' },
  { value: 'top_rated', label: 'Top Rated' },
];

function StarRating({ value, size = 'sm' }) {
  if (!value) return null;
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const s = size === 'sm' ? 12 : 14;
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={s} height={s} viewBox="0 0 24 24" fill={i <= full ? '#00D9FF' : (i === full + 1 && half ? 'url(#half)' : 'none')} stroke="#00D9FF" strokeWidth="2">
          {i === full + 1 && half && (
            <defs>
              <linearGradient id="half"><stop offset="50%" stopColor="#00D9FF" /><stop offset="50%" stopColor="transparent" /></linearGradient>
            </defs>
          )}
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="text-xs text-gray-400 ml-0.5">{value.toFixed(1)}</span>
    </span>
  );
}

function VideoModal({ url, onClose }) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative w-full max-w-3xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-10 right-0 text-gray-400 hover:text-white text-sm font-semibold">✕ Close</button>
        <video src={url} controls autoPlay className="w-full rounded-2xl max-h-[70vh] bg-black" />
      </div>
    </div>
  );
}

function ReviewCard({ review, onLike, currentUserId }) {
  const [videoOpen, setVideoOpen] = useState(false);
  const navigate = useNavigate();

  const subRatings = [
    { label: 'Performance', value: review.performance_rating },
    { label: 'Venue', value: review.venue_rating },
    { label: 'Crowd', value: review.crowd_rating },
  ].filter(r => r.value);

  const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] transition-colors group">
      {/* Header row */}
      <div className="flex items-start gap-3 mb-4">
        {/* Avatar */}
        <Link to={`/profile/${review.username}`} className="flex-shrink-0">
          {review.profile_picture_url ? (
            <img src={review.profile_picture_url} alt={review.username} className="w-9 h-9 rounded-full object-cover ring-1 ring-white/10 hover:ring-brand-500/50 transition-all" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-600 to-pink-600 flex items-center justify-center text-white text-sm font-bold ring-1 ring-white/10 hover:ring-brand-500/50 transition-all">
              {review.username?.[0]?.toUpperCase()}
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link to={`/profile/${review.username}`} className="text-white font-semibold text-sm hover:text-brand-400 transition-colors">
              {review.username}
            </Link>
            <span className="text-gray-600 text-xs">reviewed</span>
            <Link to={`/set/${review.set_id}`} className="text-brand-400 hover:text-brand-300 font-semibold text-sm transition-colors truncate max-w-[200px]">
              {review.set_title}
            </Link>
            {review.dj_name && (
              <>
                <span className="text-gray-600 text-xs">by</span>
                <Link to={`/artist/${review.dj_id}`} className="text-pink-400 hover:text-pink-300 font-semibold text-sm transition-colors">
                  {review.dj_name}
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <StarRating value={review.rating} />
            <span className="text-gray-600 text-xs">{timeAgo(review.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Review content */}
      {review.review_title && (
        <p className="text-white font-bold text-sm mb-1">{review.review_title}</p>
      )}
      {review.review_text && (
        <p className="text-gray-400 text-sm leading-relaxed mb-3 line-clamp-4">{review.review_text}</p>
      )}

      {/* Sub-ratings */}
      {subRatings.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-3">
          {subRatings.map(({ label, value }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="text-gray-600 text-xs">{label}</span>
              <StarRating value={value} />
            </div>
          ))}
        </div>
      )}

      {/* Video clip */}
      {review.video_url && (
        <button
          onClick={() => setVideoOpen(true)}
          className="flex items-center gap-2 text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors mb-3 bg-brand-500/10 hover:bg-brand-500/20 rounded-lg px-3 py-2 border border-brand-500/20"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          WATCH VIDEO CLIP
          {review.video_duration && (
            <span className="text-gray-500 font-normal ml-1">
              {Math.floor(review.video_duration / 60)}:{String(Math.floor(review.video_duration % 60)).padStart(2, '0')}
            </span>
          )}
        </button>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 pt-3 border-t border-white/[0.05]">
        <button
          onClick={() => onLike(review)}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            review.user_has_liked ? 'text-pink-400' : 'text-gray-600 hover:text-pink-400'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={review.user_has_liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          {review.like_count > 0 ? review.like_count : ''} {review.like_count === 1 ? 'like' : review.like_count > 1 ? 'likes' : 'Like'}
        </button>

        <Link
          to={`/set/${review.set_id}`}
          className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          View Set
        </Link>

        {currentUserId && review.user_id === currentUserId && (
          <Link
            to={`/review/set/${review.set_id}`}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors ml-auto"
          >
            Edit
          </Link>
        )}
      </div>

      {videoOpen && <VideoModal url={review.video_url} onClose={() => setVideoOpen(false)} />}
    </div>
  );
}

export default function ReviewsFeedPage() {
  const [reviews, setReviews] = useState([]);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const token = localStorage.getItem('token');
  const currentUserId = token ? (() => { try { return JSON.parse(atob(token.split('.')[1])).userId; } catch { return null; } })() : null;

  const fetchReviews = useCallback(async (newSort, newPage, append = false) => {
    if (newPage === 1) setLoading(true); else setLoadingMore(true);
    try {
      const res = await axios.get(`${API_URL}/api/reviews`, {
        headers: authHeaders(),
        params: { sort: newSort, page: newPage, limit: 20 },
      });
      setReviews(prev => append ? [...prev, ...res.data.reviews] : res.data.reviews);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchReviews(sort, 1, false);
  }, [sort, fetchReviews]);

  const handleLike = async (review) => {
    if (!token) return;
    try {
      if (review.user_has_liked) {
        await axios.delete(`${API_URL}/api/reviews/${review.id}/like`, { headers: authHeaders() });
        setReviews(prev => prev.map(r => r.id === review.id ? { ...r, like_count: r.like_count - 1, user_has_liked: false } : r));
      } else {
        await axios.post(`${API_URL}/api/reviews/${review.id}/like`, {}, { headers: authHeaders() });
        setReviews(prev => prev.map(r => r.id === review.id ? { ...r, like_count: r.like_count + 1, user_has_liked: true } : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchReviews(sort, next, true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Reviews</h1>
          <p className="text-gray-500 text-sm mt-1">What the community is saying</p>
        </div>

        {/* Sort tabs */}
        <div className="flex gap-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-1">
          {SORTS.map(s => (
            <button
              key={s.value}
              onClick={() => setSort(s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sort === s.value
                  ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 text-gray-600">No reviews yet.</div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <ReviewCard key={r.id} review={r} onLike={handleLike} currentUserId={currentUserId} />
          ))}

          {page < totalPages && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full py-3 mt-2 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] rounded-xl text-gray-400 hover:text-white text-sm font-semibold transition-all disabled:opacity-50"
            >
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
