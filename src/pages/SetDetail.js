import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function SetDetail() {
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
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!set) return <div className="text-center py-20 text-gray-600">Set not found</div>;

  const avg   = stats?.average ? Number(stats.average).toFixed(1) : null;
  const total = Number(stats?.total) || 0;

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      {/* Breadcrumb */}
      {set.dj_name && (
        <Link to={`/dj/${set.dj_id}`} className="text-gray-500 hover:text-brand-400 text-sm transition-colors mb-3 inline-block">
          ← {set.dj_name}
        </Link>
      )}

      <h1 className="text-3xl font-extrabold text-white mb-3">{set.title}</h1>

      {/* Meta pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {set.location && <Pill>📍 {set.location}</Pill>}
        {set.duration  && <Pill>⏱️ {set.duration} mins</Pill>}
        {set.genre     && <Pill>🎵 {set.genre}</Pill>}
      </div>

      {/* Video */}
      {set.video_url && (
        <div className="rounded-2xl overflow-hidden mb-6 aspect-video bg-black border border-white/[0.07]">
          <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${set.video_url}`} title={set.title} allowFullScreen />
        </div>
      )}

      {/* Rating bar */}
      <div className="bg-white/[0.04] border border-white/[0.07] rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-extrabold text-white">{avg ?? '—'}</span>
            <span className="text-gray-600 text-xl mb-1">/5</span>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            {total} {total === 1 ? 'rating' : 'ratings'}
          </p>
          {avg && (
            <div className="flex gap-0.5 mt-2">
              {[1,2,3,4,5].map(n => (
                <span key={n} className={`text-xl ${avg >= n ? 'text-yellow-400' : 'text-gray-700'}`}>★</span>
              ))}
            </div>
          )}
        </div>
        {isLoggedIn ? (
          <Link to={`/rate/${set.id}`}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-glow text-sm">
            Rate This Set
          </Link>
        ) : (
          <Link to="/login" className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors">
            Log in to rate →
          </Link>
        )}
      </div>

      {/* Reviews */}
      <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest mb-4">Reviews</p>
      {ratings.length === 0 ? (
        <div className="text-center py-14 border border-white/[0.05] rounded-2xl text-gray-600">
          <p className="text-3xl mb-2">⭐</p>
          <p>No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ratings.map((r, idx) => (
            <div key={idx} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold text-sm">{r.username}</span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(n => (
                      <span key={n} className={`text-sm ${r.score >= n ? 'text-yellow-400' : 'text-gray-700'}`}>★</span>
                    ))}
                  </div>
                  <span className="text-xs font-bold bg-brand-700/40 text-brand-300 px-2 py-0.5 rounded-full">{r.score}/5</span>
                </div>
              </div>
              {r.review && <p className="text-gray-400 text-sm">{r.review}</p>}
            </div>
          ))}
        </div>
      )}
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
