import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function DJProfile() {
  const { id } = useParams();
  const [dj, setDJ] = useState(null);
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/djs/${id}`),
      axios.get(`${API_URL}/api/sets/dj/${id}`)
    ])
      .then(([djRes, setsRes]) => {
        setDJ(djRes.data);
        setSets(setsRes.data);
        setLoading(false);
      })
      .catch((err) => { console.error(err); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!dj) return (
    <div className="text-center py-20 text-gray-500">DJ not found</div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-900 to-purple-900 rounded-2xl p-8 mb-8 flex items-center gap-6 border border-brand-700/50">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-4xl flex-shrink-0">
          🎧
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white">{dj.name}</h1>
          <p className="text-gray-300 mt-1">{dj.bio || 'No bio available'}</p>
          <span className="inline-block mt-2 text-xs bg-brand-700/50 text-brand-300 px-3 py-1 rounded-full">
            {sets.length} set{sets.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Sets */}
      <h2 className="text-xl font-semibold text-gray-300 mb-4">Sets by {dj.name}</h2>
      {sets.length === 0 ? (
        <div className="text-center py-16 text-gray-500 border border-white/5 rounded-xl">
          <p className="text-3xl mb-2">🎵</p>
          <p>No sets yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sets.map((set) => (
            <Link key={set.id} to={`/set/${set.id}`}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-all group">
              <h3 className="text-white font-bold text-lg group-hover:text-brand-400 transition-colors">{set.title}</h3>
              <div className="flex gap-4 mt-2 text-gray-400 text-sm">
                {set.location && <span>📍 {set.location}</span>}
                {set.duration && <span>⏱️ {set.duration} mins</span>}
              </div>
              <span className="inline-block mt-3 text-brand-400 text-sm font-medium">View Set →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default DJProfile;
