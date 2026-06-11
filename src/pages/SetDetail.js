import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { StarDisplay } from '../components/StarRating';
import { getCurrentUserId } from '../utils/auth';

export default function SetDetail() {
  const { id } = useParams();
  const [set, setSet]               = useState(null);
  const [ratings, setRatings]       = useState([]);
  const [stats, setStats]           = useState(null);
  const [comments, setComments]     = useState([]);
  const [likes, setLikes]           = useState({ count: 0, liked: false });
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading]       = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingComment, setDeletingComment] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const isLoggedIn    = !!localStorage.getItem('token');
  const currentUserId = getCurrentUserId();

  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const fetchRatings = () =>
    axios.get(`${API_URL}/api/ratings/set/${id}`)
      .then(r => { setRatings(r.data.ratings || []); setStats(r.data.stats || null); });

  const fetchComments = () =>
    axios.get(`${API_URL}/api/comments/set/${id}`)
      .then(r => setComments(r.data));

  const fetchLikes = () => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return axios.get(`${API_URL}/api/likes/set/${id}`, { headers })
      .then(r => setLikes(r.data));
  };

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/sets/${id}`),
      axios.get(`${API_URL}/api/ratings/set/${id}`),
      axios.get(`${API_URL}/api/comments/set/${id}`),
      (() => { const t = localStorage.getItem('token'); return axios.get(`${API_URL}/api/likes/set/${id}`, t ? { headers: { Authorization: `Bearer ${t}` } } : {}); })(),
    ]).then(([setRes, ratingsRes, commentsRes, likesRes]) => {
      setSet(setRes.data);
      setRatings(ratingsRes.data.ratings || []);
      setStats(ratingsRes.data.stats || null);
      setComments(commentsRes.data);
      setLikes(likesRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleToggleLike = async () => {
    if (!isLoggedIn) return;
    try {
      if (likes.liked) {
        const res = await axios.delete(`${API_URL}/api/likes/set/${id}`, { headers: authHeaders() });
        setLikes(res.data);
      } else {
        const res = await axios.post(`${API_URL}/api/likes/set/${id}`, {}, { headers: authHeaders() });
        setLikes(res.data);
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteRating = async (ratingId) => {
    if (!window.confirm('Delete your rating?')) return;
    setDeletingId(ratingId);
    try {
      await axios.delete(`${API_URL}/api/ratings/${ratingId}`, { headers: authHeaders() });
      await fetchRatings();
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) alert('Rating not found — it may have already been deleted.');
      else if (status === 401) alert('You need to be logged in.');
      else alert(err.response?.data?.error || 'Failed to delete');
    }
    setDeletingId(null);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await axios.post(`${API_URL}/api/comments/set/${id}`, { text: commentText }, { headers: authHeaders() });
      setComments(prev => [...prev, res.data]);
      setCommentText('');
    } catch (err) { console.error(err); }
    setSubmittingComment(false);
  };

  const handleDeleteComment = async (commentId) => {
    setDeletingComment(commentId);
    try {
      await axios.delete(`${API_URL}/api/comments/${commentId}`, { headers: authHeaders() });
      await fetchComments();
    } catch (err) { console.error(err); }
    setDeletingComment(null);
  };

  const handleShare = () => {
    const url = window.location.href;
    const avg = stats?.average ? Number(stats.average).toFixed(1) : '?';
    const text = `I just rated "${set.title}" by ${set.dj_name} ${avg}/5 stars on Decked! 🎵 ${url}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
  };

  if (loading) return <Spinner />;
  if (!set)    return <div className="text-center py-20 text-gray-600">Set not found</div>;

  const avg      = stats?.average ? Number(stats.average) : null;
  const total    = Number(stats?.total) || 0;
  const myRating = ratings.find(r => r.user_id === currentUserId);

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      {/* Breadcrumb */}
      {set.dj_name && (
        <Link to={`/dj/${set.dj_id}`} className="text-gray-500 hover:text-brand-400 text-sm transition-colors mb-3 inline-block">
          ← {set.dj_name}
        </Link>
      )}

      {/* Title + Like + Share */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h1 className="text-3xl font-extrabold text-white">{set.title}</h1>
        <div className="flex items-center gap-2 flex-shrink-0 mt-1">
          {/* Share */}
          <button onClick={handleShare}
            className="text-gray-500 hover:text-white text-sm px-3 py-1.5 rounded-lg border border-white/[0.07] hover:border-white/20 transition-all duration-200"
            title="Share on Twitter">
            🐦
          </button>
          {/* Like */}
          <button onClick={handleToggleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95 text-sm font-medium ${
              likes.liked
                ? 'bg-red-500/15 border-red-500/30 text-red-400'
                : 'bg-white/[0.04] border-white/[0.07] text-gray-400 hover:text-red-400 hover:border-red-500/30'
            }`}>
            {likes.liked ? '❤️' : '🤍'} {likes.count}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {set.location && <Pill>📍 {set.location}</Pill>}
        {set.duration  && <Pill>⏱️ {set.duration} mins</Pill>}
        {set.genre     && <Pill>🎵 {set.genre}</Pill>}
      </div>

      {set.video_url && (
        <div className="rounded-2xl overflow-hidden mb-6 aspect-video bg-black border border-white/[0.07]">
          <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${set.video_url}`} title={set.title} allowFullScreen />
        </div>
      )}

      {/* Rating bar */}
      <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-end gap-2 mb-1">
            <span className="text-5xl font-extrabold text-white">{avg ? avg.toFixed(1) : '—'}</span>
            <span className="text-gray-600 text-xl mb-1">/5</span>
          </div>
          {avg && <StarDisplay value={avg} size={20} />}
          <p className="text-gray-500 text-sm mt-1">{total} {total === 1 ? 'rating' : 'ratings'}</p>
        </div>
        {isLoggedIn ? (
          <Link to={`/rate/${set.id}`}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-glow text-sm">
            {myRating ? 'Edit Rating' : 'Rate This Set'}
          </Link>
        ) : (
          <Link to="/login" className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors">Log in to rate →</Link>
        )}
      </div>

      {/* My rating callout */}
      {myRating && (
        <div className="bg-brand-600/10 border border-brand-600/30 rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StarDisplay value={myRating.score} size={16} />
            <span className="text-brand-300 text-sm font-medium">Your rating</span>
          </div>
          <div className="flex gap-2">
            <Link to={`/rate/${set.id}`} className="text-xs text-brand-400 hover:text-brand-300 font-medium px-3 py-1 rounded-lg border border-brand-600/30 hover:border-brand-400/50 transition-colors">Edit</Link>
            <button onClick={() => handleDeleteRating(myRating.id)} disabled={deletingId === myRating.id}
              className="text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1 rounded-lg border border-red-600/20 hover:border-red-400/40 transition-colors disabled:opacity-40">
              {deletingId === myRating.id ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      )}

      {/* Reviews */}
      <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest mb-4">Reviews</p>
      {ratings.length === 0 ? (
        <div className="text-center py-10 border border-white/[0.05] rounded-2xl text-gray-600 mb-8">
          <p className="text-3xl mb-2">⭐</p><p>No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {ratings.map((r) => (
            <div key={r.id} className={`bg-white/[0.03] border rounded-2xl p-4 ${r.user_id === currentUserId ? 'border-brand-600/30' : 'border-white/[0.07]'}`}>
              <div className="flex items-start gap-3">
                <Link to={`/profile/${r.user_id}`} className="flex-shrink-0">
                  {r.profile_picture_url
                    ? <img src={r.profile_picture_url} alt={r.username} className="w-9 h-9 rounded-full object-cover border border-white/10 hover:border-brand-400/50 transition-colors" />
                    : <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-sm font-bold text-white">{r.username?.[0]?.toUpperCase()}</div>
                  }
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <Link to={`/profile/${r.user_id}`} className="text-white font-semibold text-sm hover:text-brand-400 transition-colors">{r.username}</Link>
                      {r.user_id === currentUserId && <span className="text-xs bg-brand-700/30 text-brand-300 px-2 py-0.5 rounded-full">You</span>}
                    </div>
                    <StarDisplay value={r.score} size={14} />
                  </div>
                  {r.review && <p className="text-gray-400 text-sm">{r.review}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comments */}
      <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest mb-4">
        Comments <span className="text-gray-700 font-normal normal-case">({comments.length})</span>
      </p>

      {isLoggedIn && (
        <form onSubmit={handleSubmitComment} className="flex gap-2 mb-5">
          <input
            value={commentText} onChange={e => setCommentText(e.target.value)}
            placeholder="Add a comment…"
            className="flex-1 bg-white/[0.04] border border-white/10 focus:border-brand-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm outline-none transition-colors"
          />
          <button type="submit" disabled={submittingComment || !commentText.trim()}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95">
            {submittingComment ? '…' : 'Post'}
          </button>
        </form>
      )}

      {comments.length === 0 ? (
        <div className="text-center py-10 border border-white/[0.05] rounded-2xl text-gray-600">
          <p className="text-2xl mb-2">💬</p><p>No comments yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Link to={`/profile/${c.user_id}`} className="flex-shrink-0">
                  {c.profile_picture_url
                    ? <img src={c.profile_picture_url} alt={c.username} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                    : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-xs font-bold text-white">{c.username?.[0]?.toUpperCase()}</div>
                  }
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-2">
                      <Link to={`/profile/${c.user_id}`} className="text-white font-semibold text-sm hover:text-brand-400 transition-colors">{c.username}</Link>
                      <span className="text-gray-600 text-xs">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    {c.user_id === currentUserId && (
                      <button onClick={() => handleDeleteComment(c.id)} disabled={deletingComment === c.id}
                        className="text-xs text-gray-600 hover:text-red-400 transition-colors disabled:opacity-40">
                        {deletingComment === c.id ? '…' : 'Delete'}
                      </button>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm">{c.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>;
}
function Pill({ children }) {
  return <span className="text-xs text-gray-400 bg-white/[0.05] border border-white/[0.07] px-3 py-1 rounded-full">{children}</span>;
}
