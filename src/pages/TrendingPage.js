import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { StarDisplay } from '../components/StarRating';

const SORTS = [
  { key: 'likes',  label: '❤️ Most Liked' },
  { key: 'rated',  label: '⭐ Most Rated' },
  { key: 'newest', label: '🆕 Newest' },
];

export default function TrendingPage() {
  const [sets, setSets]   = useState([]);
  const [sort, setSort]   = useState('likes');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/api/feed/trending?sort=${sort}`)
      .then(r => { setSets(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [sort]);

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white">Trending</h1>
        <p className="text-gray-500 mt-1 text-sm">The hottest sets on Decked this week</p>
      </div>

      {/* Sort tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {SORTS.map(s => (
          <button key={s.key} onClick={() => setSort(s.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              sort === s.key
                ? 'bg-brand-600 text-white shadow-glow-sm'
                : 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.10] hover:text-white border border-white/[0.07]'
            }`}>
            {s.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : sets.length === 0 ? (
        <div className="text-center py-20 border border-white/[0.05] rounded-2xl text-gray-600">
          <p className="text-4xl mb-3">📊</p>
          <p>Nothing trending yet — add some sets!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sets.map((set, i) => (
            <Link key={set.id} to={`/set/${set.id}`}
              className="group flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-brand-500/30 rounded-2xl p-4 transition-all duration-200">
              {/* Rank */}
              <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm ${
                i === 0 ? 'bg-yellow-400/20 text-yellow-300' :
                i === 1 ? 'bg-gray-400/20 text-gray-300' :
                i === 2 ? 'bg-orange-400/20 text-orange-300' :
                'bg-white/[0.05] text-gray-500'
              }`}>
                {i + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <Link to={`/dj/${set.dj_id}`} onClick={e => e.stopPropagation()}
                    className="text-brand-400 hover:text-brand-300 text-xs font-semibold transition-colors">
                    {set.dj_name}
                  </Link>
                </div>
                <h3 className="text-white font-bold group-hover:text-brand-400 transition-colors truncate">{set.title}</h3>
                {set.avg_rating && <StarDisplay value={set.avg_rating} size={13} />}
              </div>

              <div className="flex-shrink-0 flex flex-col items-end gap-1 text-sm">
                <span className="text-red-400 font-semibold">❤️ {set.like_count}</span>
                <span className="text-gray-500 text-xs">⭐ {set.rating_count} ratings</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center min-h-[40vh]"><div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>;
}
