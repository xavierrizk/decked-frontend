import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../api';
import ArtistCard from '../components/cards/DJCard';

export default function ArtistsPage() {
  const [artists, setArtists]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    axios.get(`${API_URL}/api/artist-profiles`)
      .then(r => { setArtists(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = artists.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.genre && a.genre.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1
          className="text-3xl font-black text-white mb-1"
          style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '-0.02em' }}
        >
          Artists
        </h1>
        <p className="text-gray-500 text-sm">Browse and follow artists on DECK&apos;D</p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Filter by name or genre…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-80 bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#00D9FF]/40 transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-[#00D9FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p className="text-3xl mb-3">🎧</p>
          <p>No artists found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map(a => (
            <ArtistCard key={a.id} dj={a} showFollow={false} />
          ))}
        </div>
      )}
    </div>
  );
}
