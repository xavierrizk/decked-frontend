import API_URL from '../api';
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import VisualizerBackground from '../components/backgrounds/VisualizerBackground';
import SetCard from '../components/cards/SetCard';
import { getCurrentUserId, getCurrentUsername } from '../utils/auth';

const authHeaders = () => {
  const t = localStorage.getItem('token');
  return t ? { Authorization: `Bearer ${t}` } : {};
};

// Inline follow button — stops click propagation so it works inside <Link> cards
function FollowBtn({ djId, djName, initialFollowing, initialCount, isLoggedIn, onUpdate }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) { window.location.href = '/login'; return; }
    if (loading) return;
    setLoading(true);
    try {
      const res = following
        ? await axios.delete(`${API_URL}/api/follows/${djId}`, { headers: authHeaders() })
        : await axios.post(`${API_URL}/api/follows/${djId}`, {}, { headers: authHeaders() });
      setFollowing(res.data.following);
      setCount(res.data.count);
      if (onUpdate) onUpdate(djId, res.data.following, res.data.count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handle}
      disabled={loading}
      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all duration-150 disabled:opacity-60 ${
        following
          ? 'bg-brand-500/20 border-brand-500/40 text-brand-400 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400'
          : 'bg-black/60 border-white/20 text-white hover:bg-brand-500/20 hover:border-brand-500/40 hover:text-brand-400'
      }`}
    >
      {loading ? '…' : following ? '✓ Following' : '+ Follow'}
    </button>
  );
}

/* ─── helpers ─────────────────────────────────────── */
const fmt = (n) => {
  const num = parseInt(n) || 0;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return `${num}`;
};

const accentGrads = [
  '#5A6470, #252D34',
  '#1d4ed8, #1e3a8a',
  '#0891b2, #164e63',
  '#be185d, #831843',
  '#059669, #064e3b',
];

/* ─── card sub-components ─────────────────────────── */

// Large hero card for the featured artist
function FeaturedDJCard({ dj, isLoggedIn, className = '', style: styleProp = {} }) {
  const bg = dj.profile_image_url
    ? `url(${dj.profile_image_url})`
    : `linear-gradient(135deg, ${accentGrads[dj.id % accentGrads.length]})`;
  return (
    <Link
      to={`/artist/${dj.id}`}
      className={`relative overflow-hidden group cursor-pointer ${className}`}
      style={{ backgroundImage: bg, backgroundSize: 'cover', backgroundPosition: 'center top', ...styleProp }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-md border border-white/20 rounded-full px-3 py-1">
        <span className="text-yellow-400 text-xs">★</span>
        <span className="text-white text-xs font-semibold tracking-wide">Featured</span>
      </div>
      {dj.verified && (
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md border border-white/20 rounded-full px-2.5 py-1">
          <span className="text-xs text-white">✅</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        {dj.genre && <p className="text-gray-400 text-xs font-medium uppercase tracking-widest mb-1">{dj.genre}</p>}
        <h2 className="text-white text-3xl font-black leading-tight mb-2 group-hover:text-[#00D9FF] transition-colors duration-200">
          {dj.name}
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm"><span className="text-white font-bold">{fmt(dj.follower_count)}</span> followers</span>
          <span className="text-gray-400 text-sm"><span className="text-white font-bold">{dj.set_count}</span> sets</span>
          <FollowBtn djId={dj.id} djName={dj.name} initialFollowing={dj.is_following} initialCount={dj.follower_count} isLoggedIn={isLoggedIn} />
        </div>
        {dj.bio && <p className="text-gray-500 text-sm mt-2 line-clamp-2">{dj.bio}</p>}
      </div>
    </Link>
  );
}

// Uniform small card for the grid below the featured artist
function ArtistGridCard({ dj, isLoggedIn, className = '' }) {
  const bg = dj.profile_image_url
    ? `url(${dj.profile_image_url})`
    : `linear-gradient(135deg, ${accentGrads[dj.id % accentGrads.length]})`;
  return (
    <Link
      to={`/artist/${dj.id}`}
      className={`relative overflow-hidden rounded-xl group cursor-pointer ${className}`}
      style={{ backgroundImage: bg, backgroundSize: 'cover', backgroundPosition: 'center top' }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent group-hover:from-black/85 transition-all duration-300" />
      {dj.verified && (
        <div className="absolute top-2 right-2 text-[10px] bg-black/50 backdrop-blur-sm rounded-full px-1.5 py-0.5 border border-white/10">✅</div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className="text-white font-bold text-sm leading-tight truncate group-hover:text-[#00D9FF] transition-colors duration-200">{dj.name}</p>
        {dj.genre && <p className="text-gray-500 text-[11px] mt-0.5 truncate">{dj.genre}</p>}
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-gray-500 text-[10px]">{fmt(dj.follower_count)} followers</p>
          <FollowBtn djId={dj.id} djName={dj.name} initialFollowing={dj.is_following} initialCount={dj.follower_count} isLoggedIn={isLoggedIn} />
        </div>
      </div>
    </Link>
  );
}

// Mobile list row
function SmallDJCard({ dj, isLoggedIn, className = '' }) {
  return (
    <Link
      to={`/artist/${dj.id}`}
      className={`flex items-center gap-3 bg-[#111114] border border-white/[0.07] hover:border-[#00D9FF]/30 rounded-xl p-3 group transition-all duration-200 overflow-hidden ${className}`}
    >
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
        {dj.profile_image_url ? (
          <img src={dj.profile_image_url} alt={dj.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg font-black text-white" style={{ background: `linear-gradient(135deg, ${accentGrads[dj.id % accentGrads.length]})` }}>
            {dj.name[0]}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-white font-bold text-sm truncate group-hover:text-[#00D9FF] transition-colors">{dj.name}</p>
        <p className="text-gray-500 text-xs mt-0.5">{fmt(dj.follower_count)} followers</p>
      </div>
      <FollowBtn djId={dj.id} djName={dj.name} initialFollowing={dj.is_following} initialCount={dj.follower_count} isLoggedIn={isLoggedIn} />
    </Link>
  );
}

/* ─── artist layout ───────────────────────────────── */
function ArtistSection({ djs, isLoggedIn }) {
  if (!djs.length) return null;
  const [featured, ...rest] = djs;

  return (
    <div className="space-y-3">
      {/* Featured — full width, tall */}
      <FeaturedDJCard dj={featured} isLoggedIn={isLoggedIn} className="w-full rounded-xl" style={{ height: '320px' }} />

      {/* Uniform grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-4 gap-2" style={{ gridAutoRows: '160px' }}>
          {rest.map(dj => <ArtistGridCard key={dj.id} dj={dj} isLoggedIn={isLoggedIn} />)}
        </div>
      )}
    </div>
  );
}

/* ─── main page ───────────────────────────────────── */
export default function Home() {
  const [djs, setDJs]                   = useState([]);
  const [trending, setTrending]         = useState([]);
  const [personalized, setPersonalized] = useState([]);
  const [hasPrefs, setHasPrefs]         = useState(false);
  const [loading, setLoading]           = useState(true);

  const isLoggedIn = !!localStorage.getItem('token');
  const userId     = getCurrentUserId();
  const username   = getCurrentUsername();
  const token      = localStorage.getItem('token');

  useEffect(() => {
    const headers = isLoggedIn ? { Authorization: `Bearer ${token}` } : {};
    const base = [
      axios.get(API_URL + '/api/artist-profiles/featured'),
      axios.get(API_URL + '/api/feed/trending?sort=likes'),
    ];
    const personalizedReq = isLoggedIn
      ? axios.get(API_URL + '/api/feed/personalized', { headers }).catch(() => null)
      : Promise.resolve(null);

    Promise.all([...base, personalizedReq])
      .then(async ([djsRes, trendingRes, persRes]) => {
        let djList = djsRes.data;

        // Fetch follow status for all artists in one shot if logged in
        if (isLoggedIn && djList.length) {
          const followStatuses = await Promise.allSettled(
            djList.map(dj => axios.get(`${API_URL}/api/follows/${dj.id}`, { headers }))
          );
          djList = djList.map((dj, i) => ({
            ...dj,
            is_following: followStatuses[i].status === 'fulfilled' ? followStatuses[i].value.data.following : false,
          }));
        }

        setDJs(djList);
        setTrending(trendingRes.data.slice(0, 3));
        if (persRes?.data) {
          const prefs = persRes.data.preferences || {};
          const genres = prefs.favorite_genres || [];
          const djIds  = prefs.favorite_djs    || [];
          if (genres.length > 0 || djIds.length > 0) {
            setPersonalized(persRes.data.sets?.slice(0, 6) || []);
            setHasPrefs(true);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <Spinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <VisualizerBackground />

      {/* ── Greeting (logged in) or Hero (logged out) ── */}
      {isLoggedIn && username ? (
        <div className="mb-8 pb-6 border-b border-white/[0.05]">
          <p className="text-2xl font-semibold text-gray-300" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
            Welcome back,{' '}
            <Link
              to={`/profile/${userId}`}
              className="transition-colors hover:underline"
              style={{ color: '#00D9FF' }}
            >
              {username}
            </Link>
            .
          </p>
          <p className="text-gray-600 text-sm mt-1">
            {hasPrefs ? "Here’s what we’ve been recommending based on your taste." : "Here’s what’s trending right now."}
          </p>
        </div>
      ) : (
        <div className="text-center mb-8">
          <div className="inline-block mb-3 px-2.5 py-0.5 text-[10px] font-semibold bg-brand-600/20 text-brand-300 border border-brand-600/30 tracking-widest uppercase">
            Beta
          </div>
          <h1 style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '-0.02em' }} className="text-4xl md:text-6xl font-bold text-white mb-3 leading-tight">
            Rate the sets that <span className="text-purple-gradient">DECK'D</span> you
          </h1>
          <p className="text-gray-500 text-base mb-5 max-w-sm mx-auto">
            The community platform for discovering and reviewing DJ sets.
          </p>
          <div className="flex justify-center gap-2">
            <Link to="/signup" className="btn-primary px-6 py-2 text-sm">
              Get Started
            </Link>
            <Link
              to="/discover"
              className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold transition-all duration-200"
            >
              Explore
            </Link>
          </div>
        </div>
      )}

      {/* ── Personalized sets ──────────────────────────── */}
      {hasPrefs && personalized.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-label">✨ Recommended for You</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {personalized.map(set => (
              <SetCard key={set.id} set={set} />
            ))}
          </div>
        </div>
      )}

      {/* ── Trending this week ─────────────────────────── */}
      {trending.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-label">🔥 Trending This Week</h2>
            <Link to="/trending" className="text-[#00D9FF]/60 hover:text-[#00D9FF] text-xs font-medium transition-colors">
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {trending.map((set, i) => (
              <SetCard key={set.id} set={set} rank={i + 1} />
            ))}
          </div>
        </div>
      )}

      {/* ── DJ Bento Grid ─────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-label">Artists</h2>
        <span className="text-gray-600 text-sm">{djs.length} total</span>
      </div>

      {djs.length === 0 ? (
        <div className="text-center py-24 border border-white/5">
          <p className="text-5xl mb-4">🎛️</p>
          <p className="text-gray-500">No Artists yet. Be the first to add one!</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <ArtistSection djs={djs} isLoggedIn={isLoggedIn} />
          </div>
          <div className="md:hidden space-y-2">
            {djs.map(dj => <SmallDJCard key={dj.id} dj={dj} isLoggedIn={isLoggedIn} />)}
          </div>
        </>
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
