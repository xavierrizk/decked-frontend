import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PulsingOrbs from '../components/backgrounds/PulsingOrbs';
import SetCard from '../components/cards/SetCard';

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
    <div className="max-w-3xl mx-auto px-4 py-6">
      <PulsingOrbs />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '-0.02em' }}>Trending</h1>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3">
          {sets.map((set, i) => (
            <SetCard key={set.id} set={set} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center min-h-[40vh]"><div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>;
}
