import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PulsingOrbs from '../components/backgrounds/PulsingOrbs';
import SetCard from '../components/cards/SetCard';

const TYPES = [
  { key: '',             label: 'All' },
  { key: 'concert',      label: 'Concerts' },
  { key: 'live_band',    label: 'Live Bands' },
  { key: 'festival_set', label: 'Festival Sets' },
  { key: 'rave',         label: 'Raves' },
];

const SORTS = [
  { key: 'newest', label: '🆕 Newest' },
  { key: 'likes',  label: '❤️ Most Liked' },
  { key: 'rated',  label: '⭐ Top Rated' },
];

export default function ConcertsPage() {
  const [sets, setSets]   = useState([]);
  const [type, setType]   = useState('');
  const [sort, setSort]   = useState('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ sort });
    if (type) params.set('type', type);
    axios.get(`${API_URL}/api/concerts?${params.toString()}`)
      .then(r => { setSets(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [type, sort]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <PulsingOrbs />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '-0.02em' }}>Concerts & Live Music</h1>
        <p className="text-gray-500 mt-1 text-sm">Rate concerts, live bands, festival sets, and raves</p>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {TYPES.map(t => (
          <button key={t.key} onClick={() => setType(t.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              type === t.key
                ? 'bg-brand-600 text-white shadow-glow-sm'
                : 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.10] hover:text-white border border-white/[0.07]'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {SORTS.map(s => (
          <button key={s.key} onClick={() => setSort(s.key)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
              sort === s.key
                ? 'bg-white/[0.12] text-white border border-white/20'
                : 'bg-white/[0.03] text-gray-500 hover:text-white border border-white/[0.06]'
            }`}>
            {s.label}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : sets.length === 0 ? (
        <div className="text-center py-20 border border-white/[0.05] rounded-2xl text-gray-600">
          <p className="text-4xl mb-3">🎤</p>
          <p>No live music here yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3">
          {sets.map(set => <SetCard key={set.id} set={set} />)}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center min-h-[40vh]"><div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>;
}
