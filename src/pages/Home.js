import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import VisualizerBackground from '../components/backgrounds/VisualizerBackground';
import SetCard from '../components/cards/SetCard';

/* ─── helpers ─────────────────────────────────────── */
const fmt = (n) => {
  const num = parseInt(n) || 0;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return `${num}`;
};

const accentGrads = [
  '#7c3aed, #4c1d95',
  '#1d4ed8, #1e3a8a',
  '#0891b2, #164e63',
  '#be185d, #831843',
  '#059669, #064e3b',
];

const accentSolids = ['#7c3aed', '#3b82f6', '#06b6d4', '#ec4899'];

/* ─── card sub-components ─────────────────────────── */
function FeaturedDJCard({ dj, className = '' }) {
  const bg = dj.profile_image_url
    ? `url(${dj.profile_image_url})`
    : `linear-gradient(135deg, ${accentGrads[dj.id % accentGrads.length]})`;

  return (
    <Link
      to={`/dj/${dj.id}`}
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
          <p className="text-purple-300 text-xs font-semibold uppercase tracking-widest mb-1">{dj.genre}</p>
        )}
        <h2 className="text-white text-3xl font-black leading-tight mb-1 group-hover:text-purple-200 transition-colors">
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
      <div className="absolute inset-0 bg-purple-600/0 group-hover:bg-purple-600/5 transition-colors duration-300" />
    </Link>
  );
}

function SmallDJCard({ dj, className = '' }) {
  return (
    <Link
      to={`/dj/${dj.id}`}
      className={`flex items-center gap-3 bg-[#111114] border border-white/[0.07] hover:border-purple-500/30 rounded p-3 group transition-all duration-200 hover:-translate-y-0.5 overflow-hidden ${className}`}
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
          <p className="text-white font-bold text-sm truncate group-hover:text-purple-300 transition-colors">
            {dj.name}
          </p>
          {dj.verified && <span className="text-xs flex-shrink-0">✅</span>}
        </div>
        <p className="text-gray-500 text-xs mt-0.5">{fmt(dj.follower_count)} followers</p>
        {dj.genre && <p className="text-purple-400 text-xs mt-0.5 truncate">{dj.genre}</p>}
      </div>
    </Link>
  );
}

function MediumDJCardA({ dj }) {
  return (
    <Link
      to={`/dj/${dj.id}`}
      className="relative overflow-hidden group cursor-pointer border border-white/[0.07] hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1 flex flex-col"
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
          {dj.genre && <p className="text-purple-400 text-xs">{dj.genre}</p>}
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
      to={`/dj/${dj.id}`}
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
        <p className="font-black leading-none mt-1" style={{ color: accent, fontSize: '28px' }}>
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
      to={`/dj/${dj.id}`}
      className="flex overflow-hidden group cursor-pointer bg-[#111114] border border-white/[0.07] hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
      style={{ height: '100%' }}
    >
      {/* Image — left 45% */}
      <div className="flex-shrink-0 overflow-hidden" style={{ width: '45%' }}>
        {dj.profile_image_url ? (
          <img
            src={dj.profile_image_url}
            alt={dj.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-4xl font-black text-white/40"
            style={{ background: `linear-gradient(135deg, ${accentGrads[dj.id % accentGrads.length]})` }}
          >
            {dj.name[0]}
          </div>
        )}
      </div>
      {/* Info — right 55% */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1 flex-wrap mb-1">
            <p className="text-white font-black text-base leading-tight">{dj.name}</p>
            {dj.verified && <span className="text-sm">✅</span>}
          </div>
          {dj.genre && (
            <span className="text-xs bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded-full">
              {dj.genre}
            </span>
          )}
          {dj.bio && (
            <p className="text-gray-500 text-xs mt-2 line-clamp-3 leading-relaxed">{dj.bio}</p>
          )}
        </div>
        <div className="flex gap-3 mt-2">
          <div>
            <p className="text-white font-black text-lg leading-none">{fmt(dj.follower_count)}</p>
            <p className="text-gray-600 text-[10px] uppercase tracking-wide">followers</p>
          </div>
          <div>
            <p className="text-white font-black text-lg leading-none">{dj.set_count}</p>
            <p className="text-gray-600 text-[10px] uppercase tracking-wide">sets</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function CompactDJCard({ dj }) {
  return (
    <Link
      to={`/dj/${dj.id}`}
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
    <div className="space-y-4">
      {/* Row 1: Featured (2 cols) + 2 small stacked (1 col) */}
      <div className="grid grid-cols-3 gap-4" style={{ gridTemplateRows: '320px' }}>
        <FeaturedDJCard dj={featured} className="col-span-2" />
        <div className="flex flex-col gap-4">
          {top.slice(0, 2).map((dj) => (
            <SmallDJCard key={dj.id} dj={dj} className="flex-1" />
          ))}
        </div>
      </div>

      {/* Row 2: 3 medium cards */}
      {top[2] && (
        <div className="grid grid-cols-3 gap-4" style={{ gridTemplateRows: '260px' }}>
          <MediumDJCardA dj={top[2]} />
          {remaining[0] && <MediumDJCardB dj={remaining[0]} />}
          {remaining[1] && <MediumDJCardC dj={remaining[1]} />}
        </div>
      )}

      {/* Row 3: 4 compact cards */}
      {remaining.length > 2 && (
        <div className="grid grid-cols-4 gap-4" style={{ gridTemplateRows: '200px' }}>
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
  const [djs, setDJs]           = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading]   = useState(true);
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    Promise.all([
      axios.get(API_URL + '/api/djs/featured'),
      axios.get(API_URL + '/api/feed/trending?sort=likes'),
    ])
      .then(([djsRes, trendingRes]) => {
        setDJs(djsRes.data);
        setTrending(trendingRes.data.slice(0, 3));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-6xl mx-auto px-5 py-14">
      <VisualizerBackground />

      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-semibold bg-brand-600/20 text-brand-300 border border-brand-600/30 tracking-widest uppercase">
          Beta
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-4">
          Rate the{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">
            Best Sets
          </span>
        </h1>
        <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
          The community platform for discovering and reviewing DJ sets.
        </p>
        {!isLoggedIn && (
          <div className="flex justify-center gap-3">
            <Link
              to="/signup"
              className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-glow"
            >
              Get Started
            </Link>
            <Link
              to="/discover"
              className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Explore
            </Link>
          </div>
        )}
      </div>

      {/* Trending this week */}
      {trending.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-widest">
              🔥 Trending This Week
            </h2>
            <Link
              to="/trending"
              className="text-brand-400 hover:text-brand-300 text-xs font-medium transition-colors"
            >
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-3">
            {trending.map((set, i) => (
              <SetCard key={set.id} set={set} rank={i + 1} />
            ))}
          </div>
        </div>
      )}

      {/* DJ Bento Grid */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-widest">DJs</h2>
        <span className="text-gray-600 text-sm">{djs.length} total</span>
      </div>

      {djs.length === 0 ? (
        <div className="text-center py-24 border border-white/5 rounded-2xl">
          <p className="text-5xl mb-4">🎛️</p>
          <p className="text-gray-500">No DJs yet. Be the first to add one!</p>
        </div>
      ) : (
        <>
          {/* Desktop: bento grid */}
          <div className="hidden md:block">
            <BentoDJGrid djs={djs} />
          </div>
          {/* Mobile: stacked list */}
          <div className="md:hidden space-y-4">
            {djs.map((dj) => (
              <SmallDJCard key={dj.id} dj={dj} className="h-20" />
            ))}
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
