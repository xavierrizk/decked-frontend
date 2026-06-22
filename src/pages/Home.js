import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import VisualizerBackground from '../components/backgrounds/VisualizerBackground';
import SetCard from '../components/cards/SetCard';
import { getCurrentUserId, getCurrentUsername } from '../utils/auth';

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

const accentSolids = ['#5A6470', '#3b82f6', '#06b6d4', '#ec4899'];

/* ─── card sub-components ─────────────────────────── */
function FeaturedDJCard({ dj, className = '' }) {
  const bg = dj.profile_image_url
    ? `url(${dj.profile_image_url})`
    : `linear-gradient(135deg, ${accentGrads[dj.id % accentGrads.length]})`;

  return (
    <Link
      to={`/artist/${dj.id}`}
      className={`relative overflow-hidden group cursor-pointer ${className}`}
      style={{ backgroundImage: bg, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      {/* Featured badge */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-md border border-white/20 rounded-full px-3 py-1">
        <span className="text-yellow-400 text-xs">⭐</span>
        <span className="text-white text-xs font-semibold">Featured</span>
      </div>
      {/* Verified */}
      {dj.verified && (
        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md border border-white/20 rounded-full px-3 py-1">
          <span className="text-xs text-white">✅ Verified</span>
        </div>
      )}
      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        {dj.genre && (
          <p className="text-[#00D9FF] text-xs font-semibold uppercase tracking-widest mb-1">{dj.genre}</p>
        )}
        <h2 className="text-white text-3xl font-black leading-tight mb-1 group-hover:text-[#00D9FF] transition-colors">
          {dj.name}
        </h2>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-gray-300 text-sm">
            <span className="text-white font-bold">{fmt(dj.follower_count)}</span> followers
          </span>
          <span className="text-gray-300 text-sm">
            <span className="text-white font-bold">{dj.set_count}</span> sets
          </span>
        </div>
        {dj.bio && (
          <p className="text-gray-400 text-sm mt-2 line-clamp-2 leading-relaxed">{dj.bio}</p>
        )}
      </div>
      <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-brand-500/5 transition-colors duration-300" />
    </Link>
  );
}

function SmallDJCard({ dj, className = '' }) {
  return (
    <Link
      to={`/artist/${dj.id}`}
      className={`flex items-center gap-3 bg-[#111114] border border-white/[0.07] hover:border-[#00D9FF]/30 rounded p-3 group transition-all duration-200 hover:-translate-y-0.5 overflow-hidden ${className}`}
    >
      {/* Square image */}
      <div className="w-16 h-16 rounded-sm overflow-hidden flex-shrink-0">
        {dj.profile_image_url ? (
          <img
            src={dj.profile_image_url}
            alt={dj.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-xl font-black text-white"
            style={{ background: `linear-gradient(135deg, ${accentGrads[dj.id % accentGrads.length]})` }}
          >
            {dj.name[0]}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="text-white font-bold text-sm truncate group-hover:text-[#00D9FF] transition-colors">
            {dj.name}
          </p>
          {dj.verified && <span className="text-xs flex-shrink-0">✅</span>}
        </div>
        <p className="text-gray-500 text-xs mt-0.5">{fmt(dj.follower_count)} followers</p>
        {dj.genre && <p className="text-[#00D9FF] text-xs mt-0.5 truncate">{dj.genre}</p>}
      </div>
    </Link>
  );
}

function MediumDJCardA({ dj }) {
  return (
    <Link
      to={`/artist/${dj.id}`}
      className="relative overflow-hidden group cursor-pointer border border-white/[0.07] hover:border-[#00D9FF]/30 transition-all duration-300 hover:-translate-y-1 flex flex-col"
      style={{ height: '100%' }}
    >
      {/* Image fills top 65% */}
      <div className="overflow-hidden" style={{ height: '65%' }}>
        {dj.profile_image_url ? (
          <img
            src={dj.profile_image_url}
            alt={dj.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-5xl font-black text-white/30"
            style={{ background: `linear-gradient(135deg, ${accentGrads[dj.id % accentGrads.length]})` }}
          >
            {dj.name[0]}
          </div>
        )}
      </div>
      {/* Text section */}
      <div className="bg-[#111114] p-4 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-white font-black text-base truncate">{dj.name}</p>
            {dj.verified && <span className="text-sm">✅</span>}
          </div>
          {dj.genre && <p className="text-[#00D9FF] text-xs">{dj.genre}</p>}
        </div>
        <div className="flex gap-4 mt-2">
          <div>
            <p className="text-white font-black text-lg leading-none">{fmt(dj.follower_count)}</p>
            <p className="text-gray-600 text-xs">followers</p>
          </div>
          <div>
            <p className="text-white font-black text-lg leading-none">{dj.set_count}</p>
            <p className="text-gray-600 text-xs">sets</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function MediumDJCardB({ dj }) {
  const accent = accentSolids[dj.id % accentSolids.length];
  return (
    <Link
      to={`/artist/${dj.id}`}
      className="relative overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
      style={{
        height: '100%',
        backgroundImage: dj.profile_image_url
          ? `url(${dj.profile_image_url})`
          : `linear-gradient(135deg, ${accentGrads[dj.id % accentGrads.length]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderLeft: `3px solid ${accent}`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
      {dj.verified && (
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs text-white border border-white/20">
          ✅
        </div>
      )}
      <div className="absolute bottom-0 p-4">
        <p className="text-white font-black text-xl leading-tight">{dj.name}</p>
        <p className="text-white font-black leading-none mt-1" style={{ fontSize: '28px' }}>
          {fmt(dj.follower_count)}
        </p>
        <p className="text-gray-400 text-xs">followers</p>
      </div>
    </Link>
  );
}

function MediumDJCardC({ dj }) {
  return (
    <Link
      to={`/artist/${dj.id}`}
      className="relative overflow-hidden group cursor-pointer border border-white/[0.07] hover:border-[#00D9FF]/30 transition-all duration-300 hover:-translate-y-1 flex flex-col bg-[#111114]"
      style={{ height: '100%' }}
    >
      {/* Image fills top 65% */}
      <div className="overflow-hidden" style={{ height: '65%' }}>
        {dj.profile_image_url ? (
          <img
            src={dj.profile_image_url}
            alt={dj.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-5xl font-black text-white/30"
            style={{ background: `linear-gradient(135deg, ${accentGrads[dj.id % accentGrads.length]})` }}
          >
            {dj.name[0]}
          </div>
        )}
      </div>
      {/* Text section */}
      <div className="bg-[#111114] p-4 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-white font-black text-base truncate">{dj.name}</p>
            {dj.verified && <span className="text-sm">✅</span>}
          </div>
          {dj.genre && <p className="text-gray-400 text-xs">{dj.genre}</p>}
        </div>
        <div className="flex gap-4 mt-2">
          <div>
            <p className="text-white font-black text-lg leading-none">{fmt(dj.follower_count)}</p>
            <p className="text-gray-600 text-xs">followers</p>
          </div>
          <div>
            <p className="text-white font-black text-lg leading-none">{dj.set_count}</p>
            <p className="text-gray-600 text-xs">sets</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function CompactDJCard({ dj }) {
  return (
    <Link
      to={`/artist/${dj.id}`}
      className="relative overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.03]"
      style={{
        height: '100%',
        backgroundImage: dj.profile_image_url
          ? `url(${dj.profile_image_url})`
          : `linear-gradient(135deg, ${accentGrads[dj.id % accentGrads.length]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      {dj.verified && <div className="absolute top-2 right-2 text-sm">✅</div>}
      <div className="absolute bottom-0 p-3">
        <p className="text-white font-bold text-sm leading-tight">{dj.name}</p>
        <p className="text-gray-400 text-xs">{fmt(dj.follower_count)} followers</p>
      </div>
    </Link>
  );
}

/* ─── bento grid ──────────────────────────────────── */
function BentoDJGrid({ djs }) {
  if (!djs.length) return null;

  const [featured, ...rest] = djs;
  const top = rest.slice(0, 3);
  const remaining = rest.slice(3);

  return (
    <div className="space-y-3">
      {/* Row 1: Featured (2 cols) + 2 small stacked (1 col) */}
      <div className="grid grid-cols-3 gap-3" style={{ gridTemplateRows: '270px' }}>
        <FeaturedDJCard dj={featured} className="col-span-2" />
        <div className="flex flex-col gap-3">
          {top.slice(0, 2).map((dj) => (
            <SmallDJCard key={dj.id} dj={dj} className="flex-1" />
          ))}
        </div>
      </div>

      {/* Row 2: 3 medium cards */}
      {top[2] && (
        <div className="grid grid-cols-3 gap-3" style={{ gridTemplateRows: '220px' }}>
          <MediumDJCardA dj={top[2]} />
          {remaining[0] && <MediumDJCardB dj={remaining[0]} />}
          {remaining[1] && <MediumDJCardC dj={remaining[1]} />}
        </div>
      )}

      {/* Row 3: 4 compact cards */}
      {remaining.length > 2 && (
        <div className="grid grid-cols-4 gap-3" style={{ gridTemplateRows: '160px' }}>
          {remaining.slice(2, 6).map((dj) => (
            <CompactDJCard key={dj.id} dj={dj} />
          ))}
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
    const base = [
      axios.get(API_URL + '/api/artist-profiles/featured'),
      axios.get(API_URL + '/api/feed/trending?sort=likes'),
    ];
    const personalizedReq = isLoggedIn
      ? axios.get(API_URL + '/api/feed/personalized', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null)
      : Promise.resolve(null);

    Promise.all([...base, personalizedReq])
      .then(([djsRes, trendingRes, persRes]) => {
        setDJs(djsRes.data);
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
            <BentoDJGrid djs={djs} />
          </div>
          <div className="md:hidden space-y-3">
            {djs.map(dj => <SmallDJCard key={dj.id} dj={dj} className="h-20" />)}
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
