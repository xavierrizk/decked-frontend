import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function SetDetail() {
  const { id } = useParams();
  const [set, setSet] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = !!localStorage.getItem('token');

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
      .catch((err) => { console.error(err); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!set) return (
    <div className="text-center py-20 text-gray-500">Set not found</div>
  );

  const avg = stats?.average || 0;
  const total = stats?.total || 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-6">
        <Link to={`/dj/${set.dj_id}`} className="text-brand-400 hover:text-brand-300 text-sm font-medium">
          ← {set.dj_name}
        </Link>
        <h1 className="text-3xl font-extrabold text-white mt-1">{set.title}</h1>
        <div className="flex flex-wrap gap-4 mt-3 text-gray-400 text-sm">
          {set.location && <span>📍 {set.location}</span>}
          {set.duration && <span>⏱️ {set.duration} mins</span>}
          {set.genre && <span>🎵 {set.genre}</span>}
        </div>
      </div>

      {/* Video */}
      {set.video_url && (
        <div className="rounded-xl overflow-hidden mb-6 aspect-video w-full">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${set.video_url}`}
            title={set.title}
            allowFullScreen
          />
        </div>
      )}

      {/* Rating summary */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="text-4xl font-extrabold text-white">{avg > 0 ? Number(avg).toFixed(1) : '—'}<span className="text-gray-500 text-xl font-normal">/5</span></p>
          <p className="text-gray-400 text-sm mt-1">{total} {total === 1 ? 'rating' : 'ratings'}</p>
        </div>
        {isLoggedIn ? (
          <Link to={`/rate/${set.id}`}
            className="bg-brand-600 hover:bg-brand-500 text-white font-semibold px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-brand-900/50">
            Rate This Set
          </Link>
        ) : (
          <Link to="/login" className="text-brand-400 hover:text-brand-300 text-sm font-medium">
            Log in to rate
          </Link>
        )}
      </div>

      {/* Reviews */}
      <h2 className="text-xl font-semibold text-gray-300 mb-4">Reviews</h2>
      {ratings.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border border-white/5 rounded-xl">
          <p className="text-3xl mb-2">⭐</p>
          <p>No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ratings.map((r, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold text-sm">{r.username}</span>
                <span className="bg-brand-700/50 text-brand-300 text-xs font-bold px-2.5 py-1 rounded-full">
                  {r.score}/5
                </span>
              </div>
              {r.review && <p className="text-gray-400 text-sm">{r.review}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SetDetail;
