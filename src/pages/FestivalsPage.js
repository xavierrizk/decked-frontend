import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import PulsingOrbs from '../components/backgrounds/PulsingOrbs';

const GRADS = [
  'from-fuchsia-900 via-purple-900 to-black',
  'from-cyan-900 via-blue-950 to-black',
  'from-amber-900 via-orange-950 to-black',
  'from-emerald-900 via-teal-950 to-black',
  'from-rose-900 via-red-950 to-black',
];

function dateRange(start, end) {
  if (!start) return null;
  const opts = { month: 'short', day: 'numeric' };
  const s = new Date(start).toLocaleDateString('en-US', opts);
  if (!end) return s;
  const e = new Date(end).toLocaleDateString('en-US', { ...opts, year: 'numeric' });
  return `${s} – ${e}`;
}

function FestivalCard({ festival, idx }) {
  const grad = GRADS[idx % GRADS.length];
  return (
    <div
      className="relative overflow-hidden aspect-[3/2] bg-gradient-to-br group cursor-default"
      style={{}}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${grad}`} />
      {festival.image_url && (
        <img src={festival.image_url} alt={festival.name}
          className="absolute inset-0 w-full h-full object-cover opacity-70" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white font-bold text-lg leading-tight" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
          {festival.name}
        </p>
        {festival.location && <p className="text-gray-300 text-xs mt-0.5">📍 {festival.location}</p>}
        <div className="flex items-center gap-3 mt-2">
          {dateRange(festival.start_date, festival.end_date) && (
            <span className="text-gray-300 text-xs">📅 {dateRange(festival.start_date, festival.end_date)}</span>
          )}
          <span className="text-gray-400 text-xs" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
            {festival.set_count || 0} sets
          </span>
        </div>
      </div>
    </div>
  );
}

export default function FestivalsPage() {
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/api/festivals`)
      .then(r => { setFestivals(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <PulsingOrbs />
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white" style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '-0.02em' }}>Festivals</h1>
        <p className="text-gray-500 mt-1 text-sm">Discover festival lineups and rate the sets</p>
      </div>

      {loading ? <Spinner /> : festivals.length === 0 ? (
        <div className="text-center py-20 border border-white/[0.05] rounded-2xl text-gray-600">
          <p className="text-4xl mb-3">🎪</p>
          <p>No festivals yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {festivals.map((f, i) => <FestivalCard key={f.id} festival={f} idx={i} />)}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center min-h-[40vh]"><div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>;
}
