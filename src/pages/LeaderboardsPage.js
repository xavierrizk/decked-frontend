import API_URL from '../api';
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const TABS = [
  { key: 'global',   label: 'Global'   },
  { key: 'trending', label: 'Trending' },
  { key: 'city',     label: 'City'     },
];

function Avatar({ src, name, size = 36 }) {
  const [err, setErr] = useState(false);
  const initials = name ? name.slice(0, 2).toUpperCase() : '??';
  if (src && !err) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setErr(true)}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold"
      style={{
        width: size, height: size, fontSize: size * 0.35,
        background: 'linear-gradient(135deg, #00D9FF22, #FF006E22)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {initials}
    </div>
  );
}

function RankBadge({ rank }) {
  if (rank === 1) return <span className="text-yellow-400 font-black text-base w-8 text-center flex-shrink-0">🥇</span>;
  if (rank === 2) return <span className="text-gray-300 font-black text-base w-8 text-center flex-shrink-0">🥈</span>;
  if (rank === 3) return <span className="text-amber-600 font-black text-base w-8 text-center flex-shrink-0">🥉</span>;
  return (
    <span
      className="font-black tabular-nums w-8 text-center flex-shrink-0 text-sm"
      style={{ color: '#00D9FF' }}
    >
      {rank}
    </span>
  );
}

function ArtistRow({ artist, isCard }) {
  const content = (
    <div className={`flex items-center gap-3 ${isCard ? 'p-4' : 'px-5 py-3'} hover:bg-white/[0.04] transition-colors group cursor-pointer`}>
      <RankBadge rank={artist.rank} />
      <Avatar src={artist.profile_image_url} name={artist.name} size={isCard ? 44 : 36} />
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm truncate group-hover:text-[#00D9FF] transition-colors">
          {artist.name}
        </p>
        {artist.location && (
          <p className="text-gray-600 text-xs truncate">{artist.location}</p>
        )}
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="text-right">
          <p className="font-black text-sm tabular-nums" style={{ color: '#FF006E' }}>
            {artist.avg_rating ? artist.avg_rating.toFixed(2) : '—'}
          </p>
          <p className="text-gray-600 text-[10px] tabular-nums">
            {artist.rating_count} rating{artist.rating_count !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-gray-500 text-xs tabular-nums">{artist.set_count}</p>
          <p className="text-gray-700 text-[10px]">sets</p>
        </div>
      </div>
    </div>
  );

  return (
    <Link to={`/artist/${artist.artist_id}`} className="block">
      {content}
    </Link>
  );
}

export default function LeaderboardsPage() {
  const [tab, setTab]         = useState('global');
  const [artists, setArtists] = useState([]);
  const [cities, setCities]   = useState([]);
  const [city, setCity]       = useState('');
  const [total, setTotal]     = useState(0);
  const [offset, setOffset]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const LIMIT = 50;

  // Fetch cities once
  useEffect(() => {
    axios.get(`${API_URL}/api/leaderboards/cities`).then(r => setCities(r.data)).catch(() => {});
  }, []);

  const fetchArtists = useCallback(async (reset = true) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    const currentOffset = reset ? 0 : offset;
    try {
      let res;
      if (tab === 'global') {
        res = await axios.get(`${API_URL}/api/leaderboards/artists`, {
          params: { limit: LIMIT, offset: currentOffset, minRatings: 1 },
        });
        const rows = res.data.artists.map((a, i) => ({ ...a, rank: currentOffset + i + 1 }));
        setArtists(prev => reset ? rows : [...prev, ...rows]);
        setTotal(res.data.total);
      } else if (tab === 'trending') {
        res = await axios.get(`${API_URL}/api/leaderboards/artists/trending`, {
          params: { limit: LIMIT },
        });
        setArtists(res.data.artists);
        setTotal(res.data.artists.length);
      } else if (tab === 'city' && city) {
        res = await axios.get(`${API_URL}/api/leaderboards/artists/city/${encodeURIComponent(city)}`, {
          params: { limit: LIMIT, offset: currentOffset },
        });
        const rows = res.data.artists.map((a, i) => ({ ...a, rank: currentOffset + i + 1 }));
        setArtists(prev => reset ? rows : [...prev, ...rows]);
        setTotal(res.data.artists.length);
      } else if (tab === 'city') {
        setArtists([]);
        setTotal(0);
      }
      if (reset) setOffset(LIMIT);
      else setOffset(prev => prev + LIMIT);
    } catch {}

    if (reset) setLoading(false);
    else setLoadingMore(false);
  }, [tab, city, offset]);

  useEffect(() => {
    setOffset(0);
    setArtists([]);
    fetchArtists(true);
  }, [tab, city]); // eslint-disable-line

  const handleTabChange = (t) => {
    setTab(t);
    setOffset(0);
    setArtists([]);
  };

  const canLoadMore = tab !== 'trending' && artists.length < total && artists.length >= LIMIT;

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white mb-0.5">Artist Leaderboards</h1>
        <p className="text-gray-500 text-sm">Rankings based on community ratings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
              tab === t.key
                ? 'bg-white/[0.08] text-white'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* City selector */}
      {tab === 'city' && (
        <div className="mb-5">
          <select
            value={city}
            onChange={e => setCity(e.target.value)}
            className="bg-[#111114] border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-[#00D9FF]/40 transition-colors w-full sm:w-72"
          >
            <option value="">Select a city…</option>
            {cities.map(c => (
              <option key={c.city} value={c.city}>
                {c.city} — {c.artist_count} artist{c.artist_count !== 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tab label */}
      {tab === 'trending' && (
        <p className="text-gray-600 text-xs mb-4">Most activity in the last 30 days</p>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-2 border-[#00D9FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === 'city' && !city ? (
        <div className="text-center py-20 text-gray-600">
          <p className="text-4xl mb-3">🌍</p>
          <p className="font-semibold">Pick a city to see its leaderboard</p>
        </div>
      ) : artists.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-semibold">No data yet</p>
          <p className="text-sm mt-1">Rate some artists to build the leaderboard</p>
        </div>
      ) : (
        <>
          {/* Column headers — desktop only */}
          <div className="hidden sm:flex items-center gap-3 px-5 pb-2 border-b border-white/[0.05] mb-0">
            <span className="w-8 flex-shrink-0" />
            <span className="text-gray-600 text-[10px] font-semibold uppercase tracking-wider flex-1">Artist</span>
            <span className="text-gray-600 text-[10px] font-semibold uppercase tracking-wider w-20 text-right">Rating</span>
            <span className="text-gray-600 text-[10px] font-semibold uppercase tracking-wider w-12 text-right">Sets</span>
          </div>

          <div className="border border-white/[0.07] rounded-xl overflow-hidden">
            {artists.map((artist, i) => (
              <div key={artist.artist_id} className={i < artists.length - 1 ? 'border-b border-white/[0.05]' : ''}>
                <ArtistRow artist={artist} />
              </div>
            ))}
          </div>

          {/* Load more */}
          {canLoadMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => fetchArtists(false)}
                disabled={loadingMore}
                className="px-8 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors text-sm disabled:opacity-40"
              >
                {loadingMore ? 'Loading…' : `Load More (${total - artists.length} remaining)`}
              </button>
            </div>
          )}

          <p className="text-center text-gray-700 text-xs mt-4">
            Showing {artists.length} of {total} artist{total !== 1 ? 's' : ''}
          </p>
        </>
      )}
    </div>
  );
}
