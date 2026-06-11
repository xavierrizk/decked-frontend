import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { StarDisplay } from '../components/StarRating';
import { getCurrentUserId } from '../utils/auth';

export default function SetDetail() {
  const { id }                      = useParams();
  const [set, setSet]               = useState(null);
  const [ratings, setRatings]       = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const isLoggedIn                  = !!localStorage.getItem('token');
  const currentUserId               = getCurrentUserId();

  const fetchRatings = () =>
    axios.get(`${API_URL}/api/ratings/set/${id}`)
      .then((r) => { setRatings(r.data.ratings || []); setStats(r.data.stats || null); });

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/sets/${id}`),
      axios.get(`${API_URL}/api/ratings/set/${id}`)
    ])
      .then(([setRes, ratingsRes]) => {
        setSet(setRes.data);
        setRatings(ratingsRes.data.ratings || []);
        setStats(ratingsRes.data.stats || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleDelete = async (ratingId) => {
    if (!window.confirm('Delete your rating?')) return;
    setDeletingId(ratingId);
    try {
      await axios.delete(`${API_URL}/api/ratings/${ratingId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      await fetchRatings();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
    setDeletingId(null);
  };

  if (loading) return <Spinner />;
  if (!set)    return <div className="text-center py-20 text-gray-600">Set not found</div>;

  const avg   = stats?.average ? Number(stats.average) : null;
  const total = Number(stats?.total) || 0;
  const myRating = ratings.find(r => r.user_id === currentUserId);

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      {/* Breadcrumb */}
      {set.dj_name && (
        <Link to={`/dj/${set.dj_id}`} className="text-gray-500 hover:text-brand-400 text-sm transition-colors mb-3 inline-block">
          ← {set.dj_name}
        </Link>
      )}

      <h1 className="text-3xl font-extrabold text-white mb-3">{set.title}</h1>

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
          <Link to="/login" className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors">
            Log in to rate →
          </Link>
        )}
      </div>

      {/* User's own rating callout */}
      {myRating && (
        <div className="bg-brand-600/10 border border-brand-600/30 rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StarDisplay value={myRating.score} size={16} />
            <span className="text-brand-300 text-sm font-medium">Your rating</span>
          </div>
          <div className="flex gap-2">
            <Link to={`/rate/${set.id}`}
              className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors px-3 py-1 rounded-lg border border-brand-600/30 hover:border-brand-400/50">
              Edit
            </Link>
            <button
              onClick={() => handleDelete(myRating.id)}
              disabled={deletingId === myRating.id}
              className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors px-3 py-1 rounded-lg border border-red-600/20 hover:border-red-400/40 disabled:opacity-40">
              {deletingId === myRating.id ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      )}

      {/* Reviews */}
      <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest mb-4">Reviews</p>
      {ratings.length === 0 ? (
        <div className="text-center py-14 border border-white/[0.05] rounded-2xl text-gray-600">
          <p className="text-3xl mb-2">⭐</p>
          <p>No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ratings.map((r) => (
            <div key={r.id} className={`bg-white/[0.03] border rounded-2xl p-4 transition-colors ${r.user_id === currentUserId ? 'border-brand-600/30' : 'border-white/[0.07]'}`}>
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <Link to={`/profile/${r.user_id}`} className="flex-shrink-0">
                  {r.profile_picture_url ? (
                    <img src={r.profile_picture_url} alt={r.username}
                      className="w-9 h-9 rounded-full object-cover border border-white/10 hover:border-brand-400/50 transition-colors" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-sm font-bold text-white">
                      {r.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <Link to={`/profile/${r.user_id}`}
                        className="text-white font-semibold text-sm hover:text-brand-400 transition-colors">
                        {r.username}
                      </Link>
                      {r.user_id === currentUserId && (
                        <span className="text-xs bg-brand-700/30 text-brand-300 px-2 py-0.5 rounded-full">You</span>
                      )}
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
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="text-xs text-gray-400 bg-white/[0.05] border border-white/[0.07] px-3 py-1 rounded-full">
      {children}
    </span>
  );
}
