import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import API_URL from '../api';
import ArtistCard from '../components/cards/DJCard';

const SORTS = [
  { key: 'followers', label: 'Most Followers' },
  { key: 'sets',       label: 'Most Sets' },
  { key: 'newest',     label: 'Newest' },
  { key: 'az',         label: 'A–Z' },
];

export default function ArtistsPage() {
  const [artists, setArtists]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [sort, setSort]         = useState('followers');
  const [genre, setGenre]       = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/api/artist-profiles`)
      .then(r => { setArtists(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const genres = useMemo(() => {
    const set = new Set(artists.filter(a => a.genre).map(a => a.genre));
    return Array.from(set).sort();
  }, [artists]);

  const filtered = useMemo(() => {
    let list = artists.filter(a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.genre && a.genre.toLowerCase().includes(search.toLowerCase()))
    );

    if (genre !== 'all') list = list.filter(a => a.genre === genre);
    if (verifiedOnly) list = list.filter(a => a.verified);

    list = [...list];
    if (sort === 'followers') list.sort((a, b) => (b.follower_count || 0) - (a.follower_count || 0));
    else if (sort === 'sets') list.sort((a, b) => (b.set_count || 0) - (a.set_count || 0));
    else if (sort === 'newest') list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else if (sort === 'az') list.sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [artists, search, sort, genre, verifiedOnly]);

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

      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter by name or genre…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-80 bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#00D9FF]/40 transition-colors"
        />
      </div>

      {/* Sort */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {SORTS.map(s => (
          <button key={s.key} onClick={() => setSort(s.key)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              sort === s.key
                ? 'bg-brand-500/30 border border-brand-500/50 text-white'
                : 'bg-white/[0.05] border border-white/[0.07] text-gray-400 hover:bg-white/[0.08] hover:text-white'
            }`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Genre + verified filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <select
          value={genre}
          onChange={e => setGenre(e.target.value)}
          className="bg-white/[0.05] border border-white/[0.07] rounded-lg px-3 py-2 text-xs font-semibold text-gray-300 outline-none focus:border-[#00D9FF]/40 transition-colors"
        >
          <option value="all">All Genres</option>
          {genres.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        <button
          onClick={() => setVerifiedOnly(v => !v)}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
            verifiedOnly
              ? 'bg-brand-500/30 border border-brand-500/50 text-white'
              : 'bg-white/[0.05] border border-white/[0.07] text-gray-400 hover:bg-white/[0.08] hover:text-white'
          }`}>
          Verified Only
        </button>

        {(genre !== 'all' || verifiedOnly || search) && (
          <button
            onClick={() => { setGenre('all'); setVerifiedOnly(false); setSearch(''); }}
            className="text-xs text-gray-500 hover:text-white transition-colors"
          >
            Clear filters
          </button>
        )}
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
