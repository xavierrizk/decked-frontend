import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function DJProfile() {
  const { id } = useParams();
  const [dj, setDJ] = useState(null);
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/djs/${id}`),
      axios.get(`${API_URL}/api/sets/dj/${id}`)
    ])
      .then(([djRes, setsRes]) => { setDJ(djRes.data); setSets(setsRes.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner />;
  if (!dj) return <NotFound label="DJ not found" />;

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-900/60 to-black border border-white/[0.07] rounded-2xl p-8 mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/10 to-indigo-600/10 pointer-events-none" />
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-4xl flex-shrink-0 shadow-glow">
            🎧
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white">{dj.name}</h1>
            <p className="text-gray-400 mt-1 max-w-lg">{dj.bio || 'No bio available'}</p>
            <span className="inline-block mt-3 text-xs font-semibold bg-brand-600/20 text-brand-300 border border-brand-600/30 px-3 py-1 rounded-full">
              {sets.length} set{sets.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Sets */}
      <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest mb-4">Sets</p>
      {sets.length === 0 ? (
        <Empty label="No sets yet" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sets.map((set) => (
            <Link key={set.id} to={`/set/${set.id}`}
              className="group bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-brand-500/40 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-sm">
              <h3 className="text-white font-bold text-base group-hover:text-brand-400 transition-colors">{set.title}</h3>
              <div className="flex gap-4 mt-2 text-gray-500 text-sm">
                {set.location && <span>📍 {set.location}</span>}
                {set.duration  && <span>⏱️ {set.duration} mins</span>}
              </div>
              <span className="mt-3 inline-block text-brand-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">View Set →</span>
            </Link>
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

function NotFound({ label }) {
  return <div className="text-center py-20 text-gray-600">{label}</div>;
}

function Empty({ label }) {
  return (
    <div className="text-center py-16 border border-white/[0.05] rounded-2xl text-gray-600">
      <p className="text-3xl mb-2">🎵</p>
      <p>{label}</p>
    </div>
  );
}
