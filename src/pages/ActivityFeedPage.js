import API_URL from '../api';
import React, { useState, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';

const authHeaders = () => {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
};

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

function Stars({ value }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24"
          fill={i <= Math.round(value) ? '#00D9FF' : 'none'}
          stroke="#00D9FF" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-0.5">{parseFloat(value).toFixed(1)}</span>
    </span>
  );
}

function Avatar({ src, name, size = 9 }) {
  const s = `w-${size} h-${size}`;
  return src ? (
    <img src={src} alt={name} className={`${s} rounded-full object-cover flex-shrink-0 ring-1 ring-white/10`} />
  ) : (
    <div className={`${s} rounded-full flex-shrink-0 bg-gradient-to-br from-brand-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm ring-1 ring-white/10`}>
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

function VideoModal({ url, onClose }) {
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative w-full max-w-3xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-9 right-0 text-gray-400 hover:text-white text-sm">✕ Close</button>
        <video src={url} controls autoPlay className="w-full rounded-2xl max-h-[70vh] bg-black" />
      </div>
    </div>
  );
}

function ReviewItem({ item, onLike }) {
  const [videoOpen, setVideoOpen] = useState(false);
  const subRatings = [
    { label: 'Perf', value: item.performance_rating },
    { label: 'Venue', value: item.venue_rating },
    { label: 'Crowd', value: item.crowd_rating },
  ].filter(r => r.value);

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] transition-colors">
      {/* Actor row */}
      <div className="flex items-center gap-2.5 mb-4">
        <Link to={`/profile/${item.actor_id}`}>
          <Avatar src={item.actor_pic} name={item.actor_username} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            <Link to={`/profile/${item.actor_id}`} className="text-white font-semibold hover:text-brand-400 transition-colors">
              {item.actor_username}
            </Link>
            <span className="text-gray-600">reviewed</span>
            <Link to={`/set/${item.set_id}`} className="text-brand-400 hover:text-brand-300 font-semibold truncate max-w-[180px]">
              {item.set_title}
            </Link>
            {item.dj_name && (
              <>
                <span className="text-gray-600">by</span>
                <Link to={`/artist/${item.dj_id}`} className="text-pink-400 hover:text-pink-300 font-semibold">
                  {item.dj_name}
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <Stars value={item.rating} />
            <span className="text-gray-600 text-xs">{timeAgo(item.created_at)}</span>
          </div>
        </div>
      </div>

      {item.review_title && <p className="text-white font-bold text-sm mb-1">{item.review_title}</p>}
      {item.review_text && <p className="text-gray-400 text-sm leading-relaxed mb-3 line-clamp-4">{item.review_text}</p>}

      {subRatings.length > 0 && (
        <div className="flex gap-4 mb-3">
          {subRatings.map(({ label, value }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="text-gray-600 text-xs">{label}</span>
              <Stars value={value} />
            </div>
          ))}
        </div>
      )}

      {item.video_url && (
        <button
          onClick={() => setVideoOpen(true)}
          className="flex items-center gap-2 text-xs font-bold text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 rounded-lg px-3 py-2 transition-colors mb-3"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          WATCH VIDEO CLIP
          {item.video_duration && (
            <span className="text-gray-500 font-normal">
              {Math.floor(item.video_duration/60)}:{String(Math.floor(item.video_duration%60)).padStart(2,'0')}
            </span>
          )}
        </button>
      )}

      <div className="flex items-center gap-4 pt-3 border-t border-white/[0.05]">
        <button
          onClick={() => onLike(item)}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            item.user_has_liked ? 'text-pink-400' : 'text-gray-600 hover:text-pink-400'
          }`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24"
            fill={item.user_has_liked ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          {item.like_count > 0 ? `${item.like_count} ${item.like_count === 1 ? 'like' : 'likes'}` : 'Like'}
        </button>
        <Link to={`/set/${item.set_id}`} className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          View Set
        </Link>
      </div>

      {videoOpen && <VideoModal url={item.video_url} onClose={() => setVideoOpen(false)} />}
    </div>
  );
}

function CommentItem({ item }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 hover:border-white/[0.09] transition-colors">
      <div className="flex items-center gap-2.5 mb-3">
        <Link to={`/profile/${item.actor_id}`}>
          <Avatar src={item.actor_pic} name={item.actor_username} />
        </Link>
        <div>
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            <Link to={`/profile/${item.actor_id}`} className="text-white font-semibold hover:text-brand-400 transition-colors">
              {item.actor_username}
            </Link>
            <span className="text-gray-600">commented on</span>
            <Link to={`/set/${item.set_id}`} className="text-brand-400 hover:text-brand-300 font-semibold truncate max-w-[180px]">
              {item.set_title}
            </Link>
          </div>
          <span className="text-gray-600 text-xs">{timeAgo(item.created_at)}</span>
        </div>
      </div>
      <p className="text-gray-400 text-sm leading-relaxed pl-11 line-clamp-3">{item.comment_text}</p>
    </div>
  );
}

// ── Pending friend requests banner ──────────────────────────────
function FriendRequestsPanel({ requests, onAccept, onDecline }) {
  if (!requests.length) return null;
  return (
    <div className="mb-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
        Friend Requests ({requests.length})
      </p>
      <div className="space-y-3">
        {requests.map(r => (
          <div key={r.from_user_id} className="flex items-center gap-3">
            <Link to={`/profile/${r.from_user_id}`}>
              <Avatar src={r.profile_picture_url} name={r.username} size={8} />
            </Link>
            <Link to={`/profile/${r.from_user_id}`} className="flex-1 text-white font-semibold text-sm hover:text-brand-400 transition-colors">
              {r.username}
            </Link>
            <div className="flex gap-2">
              <button
                onClick={() => onAccept(r.from_user_id)}
                className="px-3 py-1.5 text-xs font-bold text-black bg-[#00D9FF] hover:bg-[#00c4e8] rounded-lg transition-colors"
              >
                Accept
              </button>
              <button
                onClick={() => onDecline(r.from_user_id)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-lg transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="text-center py-24">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-2xl">
        👥
      </div>
      <p className="text-white font-bold text-lg mb-2">Nothing here yet</p>
      <p className="text-gray-600 text-sm max-w-xs mx-auto">
        Add friends to see their reviews and comments here.
        Search for users on their profile pages to send a request.
      </p>
    </div>
  );
}

export default function ActivityFeedPage() {
  const token = localStorage.getItem('token');
  const [items, setItems]           = useState([]);
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage]             = useState(1);
  const [hasMore, setHasMore]       = useState(false);

  const load = useCallback(async (p, append = false) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const [feedRes, reqRes] = await Promise.all([
        axios.get(`${API_URL}/api/friends/feed`, { headers: authHeaders(), params: { page: p } }),
        p === 1
          ? axios.get(`${API_URL}/api/friends/requests/pending`, { headers: authHeaders() })
          : Promise.resolve(null),
      ]);
      setItems(prev => append ? [...prev, ...feedRes.data.items] : feedRes.data.items);
      setHasMore(feedRes.data.hasMore);
      if (reqRes) setRequests(reqRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => { load(1, false); }, [load]);

  if (!token) return <Navigate to="/login" />;

  const handleLike = async (item) => {
    try {
      if (item.user_has_liked) {
        await axios.delete(`${API_URL}/api/reviews/${item.id}/like`, { headers: authHeaders() });
        setItems(prev => prev.map(i => i.id === item.id && i.type === 'review'
          ? { ...i, like_count: i.like_count - 1, user_has_liked: false } : i));
      } else {
        await axios.post(`${API_URL}/api/reviews/${item.id}/like`, {}, { headers: authHeaders() });
        setItems(prev => prev.map(i => i.id === item.id && i.type === 'review'
          ? { ...i, like_count: i.like_count + 1, user_has_liked: true } : i));
      }
    } catch (err) { console.error(err); }
  };

  const handleAccept = async (fromUserId) => {
    try {
      await axios.post(`${API_URL}/api/friends/${fromUserId}/accept`, {}, { headers: authHeaders() });
      setRequests(prev => prev.filter(r => r.from_user_id !== fromUserId));
      load(1, false); // reload feed — new friend's content may appear
    } catch (err) { console.error(err); }
  };

  const handleDecline = async (fromUserId) => {
    try {
      await axios.delete(`${API_URL}/api/friends/${fromUserId}`, { headers: authHeaders() });
      setRequests(prev => prev.filter(r => r.from_user_id !== fromUserId));
    } catch (err) { console.error(err); }
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    load(next, true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Friends</h1>
        <p className="text-gray-500 text-sm mt-1">Reviews and comments from people you&apos;re friends with</p>
      </div>

      {/* Pending requests */}
      <FriendRequestsPanel
        requests={requests}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />

      {/* Feed */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            item.type === 'review'
              ? <ReviewItem key={`r-${item.id}`} item={item} onLike={handleLike} />
              : <CommentItem key={`c-${item.id}`} item={item} />
          ))}

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full py-3 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] rounded-xl text-gray-400 hover:text-white text-sm font-semibold transition-all disabled:opacity-50"
            >
              {loadingMore ? 'Loading…' : 'Load more'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
