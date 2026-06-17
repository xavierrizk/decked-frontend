import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { StarDisplay } from '../components/StarRating';
import PulsingOrbs from '../components/backgrounds/PulsingOrbs';

export default function FeedPage() {
  const [sets, setSets]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${API_URL}/api/feed`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { setSets(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PulsingOrbs />
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Your Feed</h1>
        <p className="text-gray-500 mt-1 text-sm">New sets from Artists you follow</p>
      </div>

      {sets.length === 0 ? (
        <div className="text-center py-20 border border-white/[0.05] rounded-2xl text-gray-600">
          <p className="text-5xl mb-4">🎛️</p>
          <p className="font-semibold text-gray-400 mb-1">Nothing here yet</p>
          <p className="text-sm">Follow some Artists to see their sets here</p>
          <Link to="/" className="inline-block mt-5 px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl transition-all hover:scale-105">
            Browse DJs
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sets.map((set) => (
            <Link key={set.id} to={`/set/${set.id}`}
              className="group block bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-brand-500/30 rounded-2xl p-5 transition-all duration-200">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link to={`/artist/${set.dj_id}`} onClick={e => e.stopPropagation()}
                      className="text-brand-400 hover:text-brand-300 text-xs font-semibold transition-colors">
                      {set.dj_name}
                    </Link>
                    <span className="text-gray-700 text-xs">·</span>
                    <span className="text-gray-600 text-xs">{new Date(set.created_at).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg group-hover:text-brand-400 transition-colors">{set.title}</h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-gray-500 text-sm">
                    {set.location && <span>📍 {set.location}</span>}
                    {set.duration  && <span>⏱️ {set.duration} mins</span>}
                  </div>
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                  {set.avg_rating && <StarDisplay value={set.avg_rating} size={14} />}
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span>❤️ {set.like_count}</span>
                    <span>⭐ {set.rating_count}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>;
}
