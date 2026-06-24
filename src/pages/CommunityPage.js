import API_URL from '../api';
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

function Avatar({ src, name }) {
  return src ? (
    <img src={src} alt={name} className="w-9 h-9 rounded-full object-cover flex-shrink-0 ring-1 ring-white/10" />
  ) : (
    <div className="w-9 h-9 rounded-full flex-shrink-0 bg-gradient-to-br from-brand-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm ring-1 ring-white/10">
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

function ReviewCard({ review, onLike }) {
  const [videoOpen, setVideoOpen] = useState(false);
  const username   = review.actor_username || review.username || review.user?.username;
  const profilePic = review.actor_pic || review.profile_picture_url || review.user?.profile_picture_url;
  const profileId  = review.actor_id  || review.user_id || review.user?.id;

  const subRatings = [
    { label: 'Perf',  value: review.performance_rating },
    { label: 'Venue', value: review.venue_rating },
    { label: 'Crowd', value: review.crowd_rating },
  ].filter(r => r.value);

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.11] transition-colors">
      <div className="flex items-start gap-3 mb-4">
        <Link to={`/profile/${profileId}`}><Avatar src={profilePic} name={username} /></Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            <Link to={`/profile/${profileId}`} className="text-white font-semibold hover:text-brand-400 transition-colors">{username}</Link>
            <span className="text-gray-600">reviewed</span>
            <Link to={`/set/${review.set_id}`} className="text-brand-400 hover:text-brand-300 font-semibold truncate max-w-[180px]">{review.set_title}</Link>
            {review.dj_name && <>
              <span className="text-gray-600">by</span>
              <Link to={`/artist/${review.dj_id}`} className="text-pink-400 hover:text-pink-300 font-semibold">{review.dj_name}</Link>
            </>}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <Stars value={review.rating} />
            <span className="text-gray-600 text-xs">{timeAgo(review.created_at)}</span>
          </div>
        </div>
      </div>

      {review.review_title && <p className="text-white font-bold text-sm mb-1">{review.review_title}</p>}
      {review.review_text  && <p className="text-gray-400 text-sm leading-relaxed mb-3 line-clamp-4">{review.review_text}</p>}

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

      {review.video_url && (
        <button onClick={() => setVideoOpen(true)}
          className="flex items-center gap-2 text-xs font-bold text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 rounded-lg px-3 py-2 transition-colors mb-3">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          WATCH VIDEO CLIP
          {review.video_duration && (
            <span className="text-gray-500 font-normal">
              {Math.floor(review.video_duration/60)}:{String(Math.floor(review.video_duration%60)).padStart(2,'0')}
            </span>
          )}
        </button>
      )}

      <div className="flex items-center gap-4 pt-3 border-t border-white/[0.05]">
        <button onClick={() => onLike(review)}
          className={`flex items-center gap-1.5 text-xs transition-colors ${review.user_has_liked ? 'text-pink-400' : 'text-gray-600 hover:text-pink-400'}`}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill={review.user_has_liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          {review.like_count > 0 ? `${review.like_count} ${review.like_count === 1 ? 'like' : 'likes'}` : 'Like'}
        </button>
        <Link to={`/set/${review.set_id}`} className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-400 transition-colors">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          View Set
        </Link>
      </div>

      {videoOpen && <VideoModal url={review.video_url} onClose={() => setVideoOpen(false)} />}
    </div>
  );
}

function CommentCard({ item }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5 hover:border-white/[0.09] transition-colors">
      <div className="flex items-center gap-2.5 mb-3">
        <Link to={`/profile/${item.actor_id}`}><Avatar src={item.actor_pic} name={item.actor_username} /></Link>
        <div>
          <div className="flex flex-wrap items-center gap-1.5 text-sm">
            <Link to={`/profile/${item.actor_id}`} className="text-white font-semibold hover:text-brand-400 transition-colors">{item.actor_username}</Link>
            <span className="text-gray-600">commented on</span>
            <Link to={`/set/${item.set_id}`} className="text-brand-400 hover:text-brand-300 font-semibold truncate max-w-[180px]">{item.set_title}</Link>
          </div>
          <span className="text-gray-600 text-xs">{timeAgo(item.created_at)}</span>
        </div>
      </div>
      <p className="text-gray-400 text-sm leading-relaxed pl-11 line-clamp-3">{item.comment_text}</p>
    </div>
  );
}

function FriendRequestsPanel({ requests, onAccept, onDecline }) {
  if (!requests.length) return null;
  return (
    <div className="mb-6 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Friend Requests ({requests.length})</p>
      <div className="space-y-3">
        {requests.map(r => (
          <div key={r.from_user_id} className="flex items-center gap-3">
            <Link to={`/profile/${r.from_user_id}`}>
              {r.profile_picture_url
                ? <img src={r.profile_picture_url} alt={r.username} className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10" />
                : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-pink-600 flex items-center justify-center text-white font-bold text-xs">{r.username?.[0]?.toUpperCase()}</div>}
            </Link>
            <Link to={`/profile/${r.from_user_id}`} className="flex-1 text-white font-semibold text-sm hover:text-brand-400 transition-colors">{r.username}</Link>
            <div className="flex gap-2">
              <button onClick={() => onAccept(r.from_user_id)}
                className="px-3 py-1.5 text-xs font-bold text-black bg-[#00D9FF] hover:bg-[#00c4e8] rounded-lg transition-colors">Accept</button>
              <button onClick={() => onDecline(r.from_user_id)}
                className="px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-lg transition-colors">Decline</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Newest' },
  { value: 'oldest',   label: 'Oldest' },
  { value: 'top_liked', label: 'Most Liked' },
  { value: 'top_rated', label: 'Top Rated' },
];

export default function CommunityPage() {
  const token      = localStorage.getItem('token');
  const isLoggedIn = !!token;
  const navigate   = useNavigate();

  const [tab, setTab]         = useState(isLoggedIn ? 'friends' : 'all');
  const [sort, setSort]       = useState('newest');

  // Friends feed state
  const [friendItems, setFriendItems]     = useState([]);
  const [friendRequests, setFriendReqs]   = useState([]);
  const [friendPage, setFriendPage]       = useState(1);
  const [friendHasMore, setFriendHasMore] = useState(false);
  const [friendLoading, setFriendLoading] = useState(false);
  const [friendLoadingMore, setFriendLoadingMore] = useState(false);

  // All reviews state
  const [allItems, setAllItems]       = useState([]);
  const [allPage, setAllPage]         = useState(1);
  const [allPages, setAllPages]       = useState(1);
  const [allLoading, setAllLoading]   = useState(false);
  const [allLoadingMore, setAllLoadingMore] = useState(false);

  // Load friends feed
  const loadFriends = useCallback(async (p, append = false) => {
    if (!token) return;
    if (p === 1) setFriendLoading(true); else setFriendLoadingMore(true);
    try {
      const [feedRes, reqRes] = await Promise.all([
        axios.get(`${API_URL}/api/friends/feed`, { headers: authHeaders(), params: { page: p } }),
        p === 1 ? axios.get(`${API_URL}/api/friends/requests/pending`, { headers: authHeaders() }) : Promise.resolve(null),
      ]);
      setFriendItems(prev => append ? [...prev, ...feedRes.data.items] : feedRes.data.items);
      setFriendHasMore(feedRes.data.hasMore);
      if (reqRes) setFriendReqs(reqRes.data);
    } catch (err) { console.error(err); }
    finally { setFriendLoading(false); setFriendLoadingMore(false); }
  }, [token]);

  // Load all reviews
  const loadAll = useCallback(async (p, s, append = false) => {
    if (p === 1) setAllLoading(true); else setAllLoadingMore(true);
    try {
      const res = await axios.get(`${API_URL}/api/reviews`, {
        headers: authHeaders(),
        params: { sort: s, page: p, limit: 20 },
      });
      setAllItems(prev => append ? [...prev, ...res.data.reviews] : res.data.reviews);
      setAllPages(res.data.pages);
    } catch (err) { console.error(err); }
    finally { setAllLoading(false); setAllLoadingMore(false); }
  }, []);

  useEffect(() => {
    if (tab === 'friends') { setFriendPage(1); loadFriends(1, false); }
    if (tab === 'all')     { setAllPage(1);    loadAll(1, sort, false); }
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tab === 'all') { setAllPage(1); loadAll(1, sort, false); }
  }, [sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLike = async (item) => {
    if (!token) { navigate('/login'); return; }
    try {
      if (item.user_has_liked) {
        await axios.delete(`${API_URL}/api/reviews/${item.id}/like`, { headers: authHeaders() });
        const patch = i => i.id === item.id ? { ...i, like_count: i.like_count - 1, user_has_liked: false } : i;
        setFriendItems(prev => prev.map(patch));
        setAllItems(prev => prev.map(patch));
      } else {
        await axios.post(`${API_URL}/api/reviews/${item.id}/like`, {}, { headers: authHeaders() });
        const patch = i => i.id === item.id ? { ...i, like_count: i.like_count + 1, user_has_liked: true } : i;
        setFriendItems(prev => prev.map(patch));
        setAllItems(prev => prev.map(patch));
      }
    } catch (err) { console.error(err); }
  };

  const handleAccept = async (fromUserId) => {
    try {
      await axios.post(`${API_URL}/api/friends/${fromUserId}/accept`, {}, { headers: authHeaders() });
      setFriendReqs(prev => prev.filter(r => r.from_user_id !== fromUserId));
      loadFriends(1, false);
    } catch (err) { console.error(err); }
  };

  const handleDecline = async (fromUserId) => {
    try {
      await axios.delete(`${API_URL}/api/friends/${fromUserId}`, { headers: authHeaders() });
      setFriendReqs(prev => prev.filter(r => r.from_user_id !== fromUserId));
    } catch (err) { console.error(err); }
  };

  const TABS = [
    ...(isLoggedIn ? [{ id: 'friends', label: 'Friends' }] : []),
    { id: 'all', label: 'Everyone' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header + tabs */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Community</h1>
          <p className="text-gray-500 text-sm mt-1">Reviews and activity across DECK&apos;D</p>
        </div>

        {tab === 'all' && (
          <div className="flex gap-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-1">
            {SORT_OPTIONS.map(s => (
              <button key={s.value} onClick={() => setSort(s.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sort === s.value
                    ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                    : 'text-gray-500 hover:text-gray-300'
                }`}>
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-1 mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t.id
                ? 'bg-white/[0.08] text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}>
            {t.label}
            {t.id === 'friends' && friendRequests.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-pink-500 text-white text-[9px] font-bold">
                {friendRequests.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Friends tab ─────────────────────────────── */}
      {tab === 'friends' && (
        <>
          <FriendRequestsPanel requests={friendRequests} onAccept={handleAccept} onDecline={handleDecline} />

          {friendLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : friendItems.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-2xl">👥</div>
              <p className="text-white font-bold text-lg mb-2">Nothing here yet</p>
              <p className="text-gray-600 text-sm max-w-xs mx-auto">Add friends to see their reviews and comments here. Visit their profile and hit Add Friend.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {friendItems.map(item =>
                item.type === 'review'
                  ? <ReviewCard key={`r-${item.id}`} review={item} onLike={handleLike} />
                  : <CommentCard key={`c-${item.id}`} item={item} />
              )}
              {friendHasMore && (
                <button onClick={() => { const n = friendPage+1; setFriendPage(n); loadFriends(n, true); }}
                  disabled={friendLoadingMore}
                  className="w-full py-3 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] rounded-xl text-gray-400 hover:text-white text-sm font-semibold transition-all disabled:opacity-50">
                  {friendLoadingMore ? 'Loading…' : 'Load more'}
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Everyone tab ────────────────────────────── */}
      {tab === 'all' && (
        <>
          {allLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : allItems.length === 0 ? (
            <div className="text-center py-20 text-gray-600">No reviews yet.</div>
          ) : (
            <div className="space-y-4">
              {allItems.map(r => <ReviewCard key={r.id} review={r} onLike={handleLike} />)}
              {allPage < allPages && (
                <button onClick={() => { const n = allPage+1; setAllPage(n); loadAll(n, sort, true); }}
                  disabled={allLoadingMore}
                  className="w-full py-3 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] rounded-xl text-gray-400 hover:text-white text-sm font-semibold transition-all disabled:opacity-50">
                  {allLoadingMore ? 'Loading…' : 'Load more'}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
