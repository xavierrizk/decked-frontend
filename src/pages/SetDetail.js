import API_URL from '../api';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import WaveformBackground from '../components/backgrounds/WaveformBackground';
import { StarDisplay } from '../components/StarRating';
import { getCurrentUserId } from '../utils/auth';
import Toast, { useToast } from '../components/Toast';
import ReportModal from '../components/ReportModal';
import ReviewCard from '../components/ReviewCard';
import ReviewDetailModal from '../components/ReviewDetailModal';

export default function SetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [set, setSet]               = useState(null);
  const [reviews, setReviews]       = useState([]);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [reviewSort, setReviewSort] = useState('newest');
  const [stats, setStats]           = useState(null);
  const [comments, setComments]     = useState([]);
  const [likes, setLikes]           = useState({ count: 0, liked: false });
  const [follow, setFollow]         = useState({ count: 0, following: false });
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading]       = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [deletingComment, setDeletingComment] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reportModal, setReportModal] = useState({ open: false, type: null, id: null, name: '' });
  const [toast, showToast] = useToast();
  const isLoggedIn    = !!localStorage.getItem('token');
  const currentUserId = getCurrentUserId();
  const sentinelRef   = useRef(null);

  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  const fetchReviews = async (sort = reviewSort, page = 1) => {
    setReviewsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_URL}/api/reviews/set/${id}`, {
        headers,
        params: { sort, page, limit: 10 }
      });
      if (page === 1) {
        setReviews(res.data.reviews || []);
      } else {
        setReviews(prev => [...prev, ...(res.data.reviews || [])]);
      }
      setReviewTotal(res.data.total || 0);
      setReviewTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    }
    setReviewsLoading(false);
  };

  const fetchComments = () =>
    axios.get(`${API_URL}/api/comments/set/${id}`)
      .then(r => setComments(r.data));

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios.get(`${API_URL}/api/sets/${id}`)
      .then(async (setRes) => {
        const s = setRes.data;
        setSet(s);
        const [ratingsRes, commentsRes, likesRes, followRes] = await Promise.all([
          axios.get(`${API_URL}/api/ratings/set/${id}`),
          axios.get(`${API_URL}/api/comments/set/${id}`),
          axios.get(`${API_URL}/api/likes/set/${id}`, { headers }),
          s.dj_id ? axios.get(`${API_URL}/api/follows/${s.dj_id}`, { headers }) : Promise.resolve({ data: { count: 0, following: false } }),
        ]);
        setStats(ratingsRes.data.stats || null);
        setComments(commentsRes.data);
        setLikes(likesRes.data);
        setFollow(followRes.data);
        setLoading(false);
        // Fetch reviews separately
        fetchReviews('newest', 1);
      })
      .catch(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSortChange = (sort) => {
    setReviewSort(sort);
    setReviewPage(1);
    fetchReviews(sort, 1);
  };

  // Infinite scroll sentinel
  const handleLoadMore = useCallback(() => {
    if (reviewsLoading || reviewPage >= reviewTotalPages) return;
    const nextPage = reviewPage + 1;
    setReviewPage(nextPage);
    fetchReviews(reviewSort, nextPage);
  }, [reviewsLoading, reviewPage, reviewTotalPages, reviewSort]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) handleLoadMore(); },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleLoadMore]);

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

  const handleFollow = async () => {
    if (!isLoggedIn || !set?.dj_id) return;
    setFollowLoading(true);
    try {
      if (follow.following) {
        if (!window.confirm(`Unfollow ${set.dj_name}?`)) { setFollowLoading(false); return; }
        const res = await axios.delete(`${API_URL}/api/follows/${set.dj_id}`, { headers: authHeaders() });
        setFollow(res.data);
        showToast(`Unfollowed ${set.dj_name}`);
      } else {
        const res = await axios.post(`${API_URL}/api/follows/${set.dj_id}`, {}, { headers: authHeaders() });
        setFollow(res.data);
        showToast(`You're now following ${set.dj_name}! 🎵`);
      }
    } catch (err) { console.error(err); }
    setFollowLoading(false);
  };

  const handleReviewLikeToggle = async (reviewId, currentlyLiked) => {
    if (!isLoggedIn) return;
    try {
      let res;
      if (currentlyLiked) {
        res = await axios.delete(`${API_URL}/api/reviews/${reviewId}/like`, { headers: authHeaders() });
      } else {
        res = await axios.post(`${API_URL}/api/reviews/${reviewId}/like`, {}, { headers: authHeaders() });
      }
      const newLikeCount = res.data.like_count;
      setReviews(prev => prev.map(r => r.id === reviewId
        ? { ...r, like_count: newLikeCount, user_has_liked: !currentlyLiked }
        : r
      ));
      if (selectedReview?.id === reviewId) {
        setSelectedReview(prev => ({ ...prev, like_count: newLikeCount, user_has_liked: !currentlyLiked }));
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await axios.delete(`${API_URL}/api/reviews/${reviewId}`, { headers: authHeaders() });
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      setReviewTotal(prev => prev - 1);
      showToast('Review deleted');
    } catch (err) {
      showToast('Failed to delete review');
    }
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Link copied! 🔗');
  };

  if (loading) return <Spinner />;
  if (!set)    return <div className="text-center py-20 text-gray-600">Set not found</div>;

  const avg = stats?.average ? Number(stats.average) : null;
  const myReview = reviews.find(r => r.user?.id === currentUserId);

  const isDjSet = set.performance_type === 'dj_set' || (!set.performance_type && set.dj_id);
  const TYPE_LABELS = {
    dj_set: 'DJ Set', concert: 'Concert', live_band: 'Live Band',
    festival_set: 'Festival Set', rave: 'Rave', other: 'Live',
  };
  const typeLabel = TYPE_LABELS[set.performance_type] || null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <WaveformBackground />
      <Toast message={toast} />
      <ReportModal
        open={reportModal.open}
        onClose={() => setReportModal({ open: false, type: null, id: null, name: '' })}
        reportType={reportModal.type}
        targetId={reportModal.id}
        targetName={reportModal.name}
      />
      <ReviewDetailModal
        review={selectedReview}
        open={!!selectedReview}
        onClose={() => setSelectedReview(null)}
        onLikeToggle={handleReviewLikeToggle}
        onEdit={(review) => navigate(`/review/set/${id}`)}
        onDelete={handleDeleteReview}
        currentUserId={currentUserId}
      />

      {/* Breadcrumb + Follow */}
      {set.dj_name && (
        <div className="flex items-center justify-between mb-3">
          {isDjSet && set.dj_id ? (
            <Link to={`/dj/${set.dj_id}`} className="text-gray-500 hover:text-[#00D9FF] text-sm transition-colors">
              ← 🎵 {set.dj_name}
            </Link>
          ) : (
            <span className="text-gray-400 text-sm">🎤 {set.dj_name}</span>
          )}
          {isLoggedIn && isDjSet && set.dj_id && (
            <button onClick={handleFollow} disabled={followLoading}
              className={`text-xs font-semibold px-4 py-1.5 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 ${
                follow.following
                  ? 'bg-white/[0.06] border-white/10 text-gray-300 hover:bg-red-500/10 hover:border-red-400/30 hover:text-red-300'
                  : 'bg-brand-600/20 border-brand-600/30 text-[#00D9FF] hover:bg-brand-600 hover:text-white'
              }`}>
              {followLoading ? '…' : follow.following ? '✓ Following' : `+ Follow ${set.dj_name}`}
            </button>
          )}
        </div>
      )}

      {/* Title + Like + Share + Copy */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h1 className="text-3xl font-extrabold text-white">{set.title}</h1>
        <div className="flex items-center gap-2 flex-shrink-0 mt-1">
          <button onClick={handleCopyLink}
            className="text-gray-500 hover:text-white text-sm px-3 py-1.5 rounded-lg border border-white/[0.07] hover:border-white/20 transition-all duration-200"
            title="Copy link">
            🔗
          </button>
          <button onClick={handleShare}
            className="text-gray-500 hover:text-white text-sm px-3 py-1.5 rounded-lg border border-white/[0.07] hover:border-white/20 transition-all duration-200"
            title="Share on Twitter">
            🐦
          </button>
          {isLoggedIn && (
            <button onClick={() => setReportModal({ open: true, type: 'set', id: set.id, name: set.title })}
              className="text-gray-500 hover:text-red-400 text-sm px-3 py-1.5 rounded-lg border border-white/[0.07] hover:border-red-500/30 transition-all duration-200"
              title="Report set">
              🚩
            </button>
          )}
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
        {typeLabel && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ color: '#00D9FF', background: 'rgba(0,217,255,0.1)', border: '1px solid rgba(0,217,255,0.3)' }}>
            {typeLabel}
          </span>
        )}
        {set.festival_name && (
          <Link to="/festivals" className="text-xs text-[#A855F7] bg-[#A855F7]/10 border border-[#A855F7]/30 px-3 py-1 rounded-full hover:bg-[#A855F7]/20 transition-colors">
            🎪 {set.festival_name}
          </Link>
        )}
        {set.venue_name && (
          <Pill>🏟️ {set.venue_name}{set.venue_city ? `, ${set.venue_city}` : ''}</Pill>
        )}
        {set.location && !set.venue_name && <Pill>📍 {set.location}</Pill>}
        {set.duration  && <Pill>⏱️ {set.duration} mins</Pill>}
        {set.genre     && <Pill>🎵 {set.genre}</Pill>}
      </div>

      {set.video_url && (
        <a
          href={set.video_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.07] hover:border-white/20 hover:bg-white/[0.06] rounded-2xl px-5 py-4 mb-6 transition-all duration-200 group"
        >
          <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">Watch on YouTube</p>
            <p className="text-gray-500 text-xs truncate mt-0.5">{set.video_url}</p>
          </div>
          <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}

      {/* Rating bar */}
      <div className="bg-white/[0.04] border border-white/[0.07] rounded-xl p-4 mb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-end gap-2 mb-1">
            <span className="text-5xl font-extrabold text-white">{avg ? avg.toFixed(1) : '—'}</span>
            <span className="text-gray-600 text-xl mb-1">/5</span>
          </div>
          {avg && <StarDisplay value={avg} size={20} />}
          <p className="text-gray-500 text-sm mt-1">{reviewTotal} {reviewTotal === 1 ? 'review' : 'reviews'}</p>
        </div>
        {isLoggedIn ? (
          <Link to={`/review/set/${set.id}`}
            className="px-5 py-2.5 font-semibold transition-all duration-200 hover:scale-105 active:scale-95 text-sm" style={{ background: '#00D9FF', color: '#0a0a0a' }}>
            {myReview ? 'Edit Review' : 'Write a Review'}
          </Link>
        ) : (
          <Link to="/login" className="text-[#00D9FF] hover:text-[#00D9FF] text-sm font-medium transition-colors">Log in to review →</Link>
        )}
      </div>

      {/* My review callout */}
      {myReview && (
        <div className="bg-brand-600/10 border border-brand-600/30 rounded-xl px-4 py-3 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StarDisplay value={myReview.rating} size={16} />
            <span className="text-[#00D9FF] text-sm font-medium">Your review</span>
            {myReview.review_title && (
              <span className="text-gray-400 text-sm">— {myReview.review_title}</span>
            )}
          </div>
          <div className="flex gap-2">
            <Link to={`/review/set/${set.id}`} className="text-xs text-[#00D9FF] hover:text-[#00D9FF] font-medium px-3 py-1 rounded-lg border border-brand-600/30 hover:border-[#00D9FF]/50 transition-colors">Edit</Link>
            <button onClick={() => handleDeleteReview(myReview.id)}
              className="text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1 rounded-lg border border-red-600/20 hover:border-red-400/40 transition-colors">
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Reviews section */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest">
          Reviews <span className="text-gray-700 font-normal normal-case">({reviewTotal})</span>
        </p>
        <div className="flex gap-1">
          {['newest', 'likes', 'highest'].map(s => (
            <button
              key={s}
              onClick={() => handleSortChange(s)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                reviewSort === s
                  ? 'bg-brand-600/20 border-brand-600/30 text-[#00D9FF]'
                  : 'bg-white/[0.02] border-white/[0.06] text-gray-500 hover:text-gray-300 hover:border-white/10'
              }`}
            >
              {s === 'newest' ? 'Newest' : s === 'likes' ? 'Most Liked' : 'Highest Rated'}
            </button>
          ))}
        </div>
      </div>

      {reviewsLoading && reviews.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-7 h-7 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 border border-white/[0.05] rounded-2xl text-gray-600 mb-8">
          <p className="text-3xl mb-2">⭐</p>
          <p className="mb-3">No reviews yet. Be the first!</p>
          {isLoggedIn && (
            <Link to={`/review/set/${set.id}`} className="text-[#00D9FF] hover:text-[#00D9FF] text-sm font-medium transition-colors">
              Write a review →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {reviews.map(r => (
            <ReviewCard
              key={r.id}
              review={r}
              onLikeToggle={handleReviewLikeToggle}
              onOpen={setSelectedReview}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1 mb-4" />
      {reviewsLoading && reviews.length > 0 && (
        <div className="flex justify-center pb-4">
          <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Comments */}
      <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest mb-4">
        Comments <span className="text-gray-700 font-normal normal-case">({comments.length})</span>
      </p>

      {isLoggedIn ? (
        <form onSubmit={handleSubmitComment} className="flex gap-2 mb-5">
          <input
            value={commentText} onChange={e => setCommentText(e.target.value)}
            placeholder="Add a comment…"
            className="flex-1 bg-white/[0.04] border border-white/10 focus:border-[#00D9FF] rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm outline-none transition-colors"
          />
          <button type="submit" disabled={submittingComment || !commentText.trim()}
            className="px-4 py-2.5 disabled:opacity-40 text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95" style={{ background: '#00D9FF', color: '#0a0a0a' }}>
            {submittingComment ? '…' : 'Post'}
          </button>
        </form>
      ) : (
        <div className="mb-5 text-center py-4 border border-white/[0.05] rounded-xl text-gray-600 text-sm">
          <Link to="/login" className="text-[#00D9FF] hover:text-[#00D9FF] font-medium transition-colors">Log in</Link> to leave a comment
        </div>
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
                    : <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-xs font-bold text-white">{c.username?.[0]?.toUpperCase()}</div>
                  }
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-2">
                      <Link to={`/profile/${c.user_id}`} className="text-white font-semibold text-sm hover:text-[#00D9FF] transition-colors">{c.username}</Link>
                      <span className="text-gray-600 text-xs">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.user_id === currentUserId && (
                        <button onClick={() => handleDeleteComment(c.id)} disabled={deletingComment === c.id}
                          className="text-xs text-gray-600 hover:text-red-400 transition-colors disabled:opacity-40">
                          {deletingComment === c.id ? '…' : 'Delete'}
                        </button>
                      )}
                      {isLoggedIn && c.user_id !== currentUserId && (
                        <button onClick={() => setReportModal({ open: true, type: 'comment', id: c.id, name: `comment by ${c.username}` })}
                          className="text-xs text-gray-700 hover:text-red-400 transition-colors"
                          title="Report comment">
                          🚩
                        </button>
                      )}
                    </div>
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
