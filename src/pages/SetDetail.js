import API_URL from '../api';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StarDisplay } from '../components/StarRating';
import { getCurrentUserId } from '../utils/auth';
import Toast, { useToast } from '../components/Toast';
import ReportModal from '../components/ReportModal';
import ReviewCard from '../components/ReviewCard';
import ReviewDetailModal from '../components/ReviewDetailModal';
import ShareMenu from '../components/ShareMenu';

function Spinner() {
  return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-[#00D9FF] border-t-transparent rounded-full animate-spin" /></div>;
}

function Pill({ children, color }) {
  const style = color
    ? { color, background: `${color}15`, border: `1px solid ${color}40` }
    : {};
  return (
    <span className="text-xs px-3 py-1 rounded-full border" style={style || { color: '#9BA6B3', background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
      {children}
    </span>
  );
}

function RatingHistogram({ distribution, total }) {
  if (!distribution || !total || total === 0) return null;
  const max = Math.max(...Object.values(distribution), 1);
  return (
    <div className="space-y-1.5 mt-4 pt-4 border-t border-white/[0.05]">
      {[5, 4, 3, 2, 1].map(star => {
        const count = distribution[star] || 0;
        const pct = Math.round((count / max) * 100);
        return (
          <div key={star} className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 w-3 text-right flex-shrink-0">{star}</span>
            <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: '#FF006E' }}
              />
            </div>
            <span className="text-[10px] text-gray-600 w-4 flex-shrink-0">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

const TYPE_LABELS = {
  dj_set: 'DJ Set', concert: 'Concert', live_band: 'Live Band',
  festival_set: 'Festival Set', rave: 'Rave', other: 'Live',
};
const TYPE_COLORS = {
  dj_set: '#00D9FF', concert: '#FF006E', live_band: '#FBBF24',
  festival_set: '#A855F7', rave: '#F43F5E', other: '#9BA6B3',
};

export default function SetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [set, setSet]                   = useState(null);
  const [reviews, setReviews]           = useState([]);
  const [reviewTotal, setReviewTotal]   = useState(0);
  const [reviewPage, setReviewPage]     = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [reviewSort, setReviewSort]     = useState('newest');
  const [stats, setStats]               = useState(null);
  const [comments, setComments]         = useState([]);
  const [likes, setLikes]               = useState({ count: 0, liked: false });
  const [follow, setFollow]             = useState({ count: 0, following: false });
  const [commentText, setCommentText]   = useState('');
  const [loading, setLoading]           = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [deletingComment, setDeletingComment] = useState(null);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reportModal, setReportModal]   = useState({ open: false, type: null, id: null, name: '' });
  const [reviewsWithVideos, setReviewsWithVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [toast, showToast]              = useToast();
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
        headers, params: { sort, page, limit: 10 },
      });
      if (page === 1) setReviews(res.data.reviews || []);
      else setReviews(prev => [...prev, ...(res.data.reviews || [])]);
      setReviewTotal(res.data.total || 0);
      setReviewTotalPages(res.data.totalPages || 1);
    } catch (err) { console.error(err); }
    setReviewsLoading(false);
  };

  const fetchComments = () =>
    axios.get(`${API_URL}/api/comments/set/${id}`).then(r => setComments(r.data));

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    axios.get(`${API_URL}/api/sets/${id}`)
      .then(async (setRes) => {
        const s = setRes.data;
        setSet(s);
        const [ratingsRes, commentsRes, likesRes, followRes, videosRes] = await Promise.all([
          axios.get(`${API_URL}/api/ratings/set/${id}`),
          axios.get(`${API_URL}/api/comments/set/${id}`),
          axios.get(`${API_URL}/api/likes/set/${id}`, { headers }),
          s.dj_id ? axios.get(`${API_URL}/api/follows/${s.dj_id}`, { headers }) : Promise.resolve({ data: { count: 0, following: false } }),
          axios.get(`${API_URL}/api/reviews/set/${id}/videos`, { headers }).catch(() => ({ data: [] })),
        ]);
        setStats(ratingsRes.data.stats || null);
        setComments(commentsRes.data);
        setLikes(likesRes.data);
        setFollow(followRes.data);
        if (videosRes.data && Array.isArray(videosRes.data)) {
          setReviewsWithVideos(videosRes.data);
        }
        setLoading(false);
        fetchReviews('newest', 1);
      })
      .catch(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSortChange = (sort) => {
    setReviewSort(sort);
    setReviewPage(1);
    fetchReviews(sort, 1);
  };

  const handleLoadMore = useCallback(() => {
    if (reviewsLoading || reviewPage >= reviewTotalPages) return;
    const next = reviewPage + 1;
    setReviewPage(next);
    fetchReviews(reviewSort, next);
  }, [reviewsLoading, reviewPage, reviewTotalPages, reviewSort]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) handleLoadMore(); },
      { rootMargin: '200px' }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
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
        showToast(`Now following ${set.dj_name}`);
      }
    } catch (err) { console.error(err); }
    setFollowLoading(false);
  };

  const handleReviewLikeToggle = async (reviewId, currentlyLiked) => {
    if (!isLoggedIn) return;
    try {
      const res = currentlyLiked
        ? await axios.delete(`${API_URL}/api/reviews/${reviewId}/like`, { headers: authHeaders() })
        : await axios.post(`${API_URL}/api/reviews/${reviewId}/like`, {}, { headers: authHeaders() });
      setReviews(prev => prev.map(r => r.id === reviewId
        ? { ...r, like_count: res.data.like_count, user_has_liked: !currentlyLiked } : r));
      if (selectedReview?.id === reviewId)
        setSelectedReview(prev => ({ ...prev, like_count: res.data.like_count, user_has_liked: !currentlyLiked }));
    } catch (err) { console.error(err); }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await axios.delete(`${API_URL}/api/reviews/${reviewId}`, { headers: authHeaders() });
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      setReviewTotal(prev => prev - 1);
      showToast('Review deleted');
    } catch { showToast('Failed to delete review'); }
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

  const buildShareText = () => {
    const avg = stats?.average ? Number(stats.average).toFixed(1) : null;
    const score = avg ? ` — ${avg}/5` : '';
    return `"${set?.title}" by ${set?.dj_name}${score} on DECK'D ${window.location.href}`;
  };

  if (loading) return <Spinner />;
  if (!set)    return <div className="text-center py-20 text-gray-600">Set not found</div>;

  const avg        = stats?.average ? Number(stats.average) : null;
  const total      = stats?.total   ? parseInt(stats.total) : 0;
  const myReview   = reviews.find(r => r.user?.id === currentUserId);
  const isDjSet    = set.performance_type === 'dj_set' || (!set.performance_type && set.dj_id);
  const typeLabel  = TYPE_LABELS[set.performance_type] || null;
  const typeColor  = TYPE_COLORS[set.performance_type] || '#9BA6B3';

  const setDate = set.set_date || set.created_at;
  const dateStr = setDate ? new Date(setDate).getFullYear() : null;

  const subRatings = [
    { label: 'Performance', key: 'avg_performance', color: '#00D9FF' },
    { label: 'Venue',       key: 'avg_venue',       color: '#FF006E' },
    { label: 'Crowd',       key: 'avg_crowd',       color: '#A020F0' },
  ].filter(s => stats?.[s.key] && parseFloat(stats[s.key]) > 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
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
        onEdit={() => navigate(`/review/set/${id}`)}
        onDelete={handleDeleteReview}
        currentUserId={currentUserId}
      />

      {/* Back to artist */}
      {set.dj_name && (
        <div className="mb-4">
          {isDjSet && set.dj_id ? (
            <Link to={`/artist/${set.dj_id}`} className="inline-flex items-center gap-1.5 text-gray-500 hover:text-white text-sm transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              {set.dj_name}
            </Link>
          ) : set.artist_id ? (
            <Link to={`/artist/${set.artist_id}`} className="inline-flex items-center gap-1.5 text-gray-500 hover:text-white text-sm transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              {set.dj_name}
            </Link>
          ) : null}
        </div>
      )}

      {/* ── Two-column layout ─────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">

        {/* LEFT — video + metadata */}
        <div className="flex-1 min-w-0">

          {/* User review videos, always primary */}
          {reviewsWithVideos.length > 0 ? (
            <div className="mb-4">
              <div className="rounded-xl overflow-hidden bg-black aspect-video mb-3 relative group">
                <video
                  src={reviewsWithVideos[currentVideoIndex].video_url}
                  controls
                  className="w-full h-full"
                />
                {reviewsWithVideos.length > 1 && (
                  <div className="absolute inset-x-0 top-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <button
                      onClick={() => setCurrentVideoIndex((i) => (i - 1 + reviewsWithVideos.length) % reviewsWithVideos.length)}
                      className="ml-2 mt-2 px-3 py-2 bg-black/70 rounded-lg text-white hover:bg-black transition pointer-events-auto"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => setCurrentVideoIndex((i) => (i + 1) % reviewsWithVideos.length)}
                      className="mr-2 mt-2 px-3 py-2 bg-black/70 rounded-lg text-white hover:bg-black transition pointer-events-auto"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-gray-500 text-xs">Video from review by</p>
                <Link to={`/profile/${reviewsWithVideos[currentVideoIndex].user.id}`} className="text-[#00D9FF] hover:text-[#00D9FF]/80 font-semibold text-sm transition-colors">
                  @{reviewsWithVideos[currentVideoIndex].user.username}
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 to-black aspect-video mb-4 flex items-center justify-center text-4xl opacity-40">
              🎵
            </div>
          )}

          {/* YouTube link, secondary — set detail page only */}
          {set.video_url && (
            <a href={set.video_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.07] hover:border-white/20 rounded-xl px-5 py-4 mb-4 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </div>
              <span className="text-white font-medium text-sm">🎥 Watch Full Set on YouTube</span>
              <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-400 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            </a>
          )}

          {/* Title + year */}
          <div className="flex items-start gap-3 mb-2">
            <h1 className="text-2xl font-extrabold text-white leading-tight flex-1">{set.title}</h1>
            {dateStr && <span className="text-gray-600 text-lg font-light flex-shrink-0 mt-0.5">{dateStr}</span>}
          </div>

          {/* Artist + follow */}
          {set.dj_name && (
            <div className="flex items-center gap-3 mb-4">
              {(isDjSet && set.dj_id) || set.artist_id ? (
                <Link
                  to={`/artist/${isDjSet ? set.dj_id : set.artist_id}`}
                  className="text-gray-400 hover:text-white font-medium text-sm transition-colors"
                >
                  {set.dj_name}
                </Link>
              ) : (
                <span className="text-gray-400 text-sm font-medium">{set.dj_name}</span>
              )}
              {isLoggedIn && isDjSet && set.dj_id && (
                <button onClick={handleFollow} disabled={followLoading}
                  className={`text-xs font-semibold px-3 py-1 rounded-lg border transition-all duration-200 disabled:opacity-50 ${
                    follow.following
                      ? 'bg-white/[0.06] border-white/10 text-gray-400 hover:bg-red-500/10 hover:border-red-400/30 hover:text-red-300'
                      : 'bg-[#00D9FF]/10 border-[#00D9FF]/30 text-[#00D9FF] hover:bg-[#00D9FF]/20'
                  }`}>
                  {followLoading ? '…' : follow.following ? '✓ Following' : '+ Follow'}
                </button>
              )}
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {typeLabel   && <Pill color={typeColor}>{typeLabel}</Pill>}
            {set.genre   && <Pill>{set.genre}</Pill>}
            {set.duration && <Pill>{set.duration} mins</Pill>}
            {set.festival_name && (
              <Link to="/festivals">
                <Pill color="#A855F7">{set.festival_name}</Pill>
              </Link>
            )}
            {set.venue_name && set.venue_id ? (
              <Link to={`/venues/${set.venue_id}`}>
                <Pill color="#00D9FF">{set.venue_name}{set.venue_city ? `, ${set.venue_city}` : ''}</Pill>
              </Link>
            ) : set.venue_name ? (
              <Pill>{set.venue_name}{set.venue_city ? `, ${set.venue_city}` : ''}</Pill>
            ) : set.location ? (
              <Pill>{set.location}</Pill>
            ) : null}
          </div>
        </div>

        {/* RIGHT — score panel */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-5 sticky top-20">

            {/* Score */}
            <div className="flex items-end gap-2 mb-1">
              <span className="text-5xl font-extrabold text-white tabular-nums">
                {avg ? avg.toFixed(1) : '—'}
              </span>
              {avg && <span className="text-gray-600 text-lg mb-1">/5</span>}
            </div>
            {avg && <StarDisplay value={avg} size={18} />}
            <p className="text-gray-600 text-xs mt-1">{total} {total === 1 ? 'rating' : 'ratings'}</p>

            {/* Histogram */}
            <RatingHistogram distribution={stats?.distribution} total={total} />

            {/* Sub-ratings */}
            {subRatings.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/[0.05]">
                {subRatings.map(({ label, key, color }) => (
                  <div key={key} className="flex flex-col items-center gap-0.5 p-2 rounded-lg bg-white/[0.03]">
                    <span className="text-base font-bold tabular-nums" style={{ color }}>
                      {parseFloat(stats[key]).toFixed(1)}
                    </span>
                    <span className="text-[9px] text-gray-500 font-medium text-center">{label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="mt-4 pt-4 border-t border-white/[0.05]">
              {isLoggedIn ? (
                <Link
                  to={`/review/set/${set.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
                  style={{ background: '#00D9FF', color: '#0a0a0a' }}
                >
                  {myReview ? 'Edit Your Review' : 'Write a Review'}
                </Link>
              ) : (
                <Link to="/login" className="w-full flex items-center justify-center py-2.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/20 text-sm transition-all">
                  Log in to review
                </Link>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleToggleLike}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                  likes.liked
                    ? 'bg-red-500/15 border-red-500/30 text-red-400'
                    : 'bg-white/[0.03] border-white/[0.07] text-gray-400 hover:text-red-400 hover:border-red-500/20'
                }`}
                title={isLoggedIn ? (likes.liked ? 'Unlike' : 'Like') : 'Log in to like'}
              >
                {likes.liked ? '♥' : '♡'} {likes.count}
              </button>
              <ShareMenu text={buildShareText()} />
              {isLoggedIn && (
                <button
                  onClick={() => setReportModal({ open: true, type: 'set', id: set.id, name: set.title })}
                  className="flex items-center justify-center w-9 h-9 rounded-lg border border-white/[0.07] text-gray-600 hover:text-red-400 hover:border-red-500/20 transition-all"
                  title="Report set"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* My review callout */}
      {myReview && (
        <div className="bg-[#00D9FF]/10 border border-[#00D9FF]/30 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StarDisplay value={myReview.rating} size={14} />
            <span className="text-[#00D9FF] text-sm font-medium">Your review</span>
            {myReview.review_title && <span className="text-gray-400 text-sm">— {myReview.review_title}</span>}
          </div>
          <div className="flex gap-2">
            <Link to={`/review/set/${set.id}`} className="text-xs text-[#00D9FF] font-medium px-3 py-1 rounded-lg border border-[#00D9FF]/30 hover:border-[#00D9FF]/60 transition-colors">Edit</Link>
            <button onClick={() => handleDeleteReview(myReview.id)} className="text-xs text-red-400 font-medium px-3 py-1 rounded-lg border border-red-500/20 hover:border-red-400/40 transition-colors">Delete</button>
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest">
          Reviews <span className="text-gray-700 font-normal normal-case">({reviewTotal})</span>
        </p>
        <div className="flex gap-1">
          {['newest', 'likes', 'highest'].map(s => (
            <button key={s} onClick={() => handleSortChange(s)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                reviewSort === s
                  ? 'bg-[#00D9FF]/10 border-[#00D9FF]/30 text-[#00D9FF]'
                  : 'bg-white/[0.02] border-white/[0.06] text-gray-500 hover:text-gray-300 hover:border-white/10'
              }`}>
              {s === 'newest' ? 'Newest' : s === 'likes' ? 'Most Liked' : 'Highest Rated'}
            </button>
          ))}
        </div>
      </div>

      {reviewsLoading && reviews.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-6 h-6 border-2 border-[#00D9FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 border border-white/[0.05] rounded-2xl text-gray-600 mb-6">
          <p className="text-2xl mb-2">⭐</p>
          <p className="mb-3 text-sm">No reviews yet. Be the first!</p>
          {isLoggedIn && (
            <Link to={`/review/set/${set.id}`} className="text-[#00D9FF] text-sm font-medium">Write a review →</Link>
          )}
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {reviews.map(r => (
            <ReviewCard key={r.id} review={r} onLikeToggle={handleReviewLikeToggle} onOpen={setSelectedReview} currentUserId={currentUserId} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-1 mb-4" />
      {reviewsLoading && reviews.length > 0 && (
        <div className="flex justify-center pb-4">
          <div className="w-5 h-5 border-2 border-[#00D9FF] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Comments */}
      <div className="border-t border-white/[0.05] pt-6 mt-2">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-4">
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
              className="px-4 py-2.5 rounded-xl disabled:opacity-40 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
              style={{ background: '#00D9FF', color: '#0a0a0a' }}>
              {submittingComment ? '…' : 'Post'}
            </button>
          </form>
        ) : (
          <div className="mb-5 text-center py-4 border border-white/[0.05] rounded-xl text-gray-600 text-sm">
            <Link to="/login" className="text-[#00D9FF] font-medium">Log in</Link> to comment
          </div>
        )}

        {comments.length === 0 ? (
          <div className="text-center py-8 border border-white/[0.05] rounded-2xl text-gray-600 text-sm">
            No comments yet
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map(c => (
              <div key={c.id} className="flex items-start gap-3 py-3 border-b border-white/[0.04] last:border-0">
                <Link to={`/profile/${c.user_id}`} className="flex-shrink-0">
                  {c.profile_picture_url
                    ? <img src={c.profile_picture_url} alt={c.username} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                    : <div className="w-8 h-8 rounded-full bg-[#00D9FF]/20 flex items-center justify-center text-xs font-bold text-[#00D9FF]">{c.username?.[0]?.toUpperCase()}</div>
                  }
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="flex items-center gap-2">
                      <Link to={`/profile/${c.user_id}`} className="text-white font-semibold text-sm hover:text-[#00D9FF] transition-colors">{c.username}</Link>
                      <span className="text-gray-700 text-xs">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.user_id === currentUserId && (
                        <button onClick={() => handleDeleteComment(c.id)} disabled={deletingComment === c.id}
                          className="text-xs text-gray-700 hover:text-red-400 transition-colors disabled:opacity-40">
                          {deletingComment === c.id ? '…' : 'Delete'}
                        </button>
                      )}
                      {isLoggedIn && c.user_id !== currentUserId && (
                        <button onClick={() => setReportModal({ open: true, type: 'comment', id: c.id, name: `comment by ${c.username}` })}
                          className="text-xs text-gray-700 hover:text-red-400 transition-colors" title="Report">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile sticky bottom bar — score + CTA (hidden on lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.07] bg-[#0a0a0a]/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
        {avg ? (
          <div className="flex items-baseline gap-1 flex-shrink-0">
            <span className="text-2xl font-extrabold text-white tabular-nums">{avg.toFixed(1)}</span>
            <span className="text-gray-600 text-sm">/5</span>
          </div>
        ) : (
          <span className="text-gray-600 text-sm">{total} rating{total !== 1 ? 's' : ''}</span>
        )}
        <div className="flex-1">
          {isLoggedIn ? (
            <Link to={`/review/set/${set.id}`}
              className="w-full flex items-center justify-center py-2.5 rounded-lg font-semibold text-sm transition-all hover:opacity-90"
              style={{ background: '#00D9FF', color: '#0a0a0a' }}>
              {myReview ? 'Edit Review' : 'Write a Review'}
            </Link>
          ) : (
            <Link to="/login"
              className="w-full flex items-center justify-center py-2.5 rounded-lg border border-white/10 text-gray-400 hover:text-white text-sm transition-all">
              Log in to review
            </Link>
          )}
        </div>
        <ShareMenu text={buildShareText()} />
      </div>

      {/* Spacer so content isn't hidden behind mobile sticky bar */}
      <div className="lg:hidden h-20" />
    </div>
  );
}
