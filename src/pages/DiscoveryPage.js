import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { StarDisplay } from '../components/StarRating';

export default function DiscoveryPage() {
  const [trending, setTrending]   = useState([]);
  const [topRated, setTopRated]   = useState([]);
  const [recent, setRecent]       = useState([]);
  const [topDjs, setTopDjs]       = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/feed/trending?sort=likes`),
      axios.get(`${API_URL}/api/search/top-rated`),
      axios.get(`${API_URL}/api/search/recent`),
      axios.get(`${API_URL}/api/search/top-djs`),
    ]).then(([trendRes, topRes, recentRes, djRes]) => {
      setTrending(trendRes.data.slice(0, 6));
      setTopRated(topRes.data.slice(0, 6));
      setRecent(recentRes.data.slice(0, 6));
      setTopDjs(djRes.data.slice(0, 6));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3">
          Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">New Music</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-md mx-auto">
          Trending sets, top-rated classics, fresh uploads, and the best DJs on the platform.
        </p>
        <Link to="/search"
          className="inline-flex items-center gap-2 mt-5 px-6 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white font-semibold hover:bg-white/10 hover:border-white/20 transition-all duration-200 hover:scale-105">
          🔍 Search everything
        </Link>
      </div>

      {/* Trending Now */}
      {trending.length > 0 && (
        <Section title="🔥 Trending Now" subtitle="Most liked this week" linkTo="/trending">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {trending.map((set, i) => <SetCard key={set.id} set={set} rank={i + 1} />)}
          </div>
        </Section>
      )}

      {/* Top Rated All Time */}
      {topRated.length > 0 && (
        <Section title="⭐ Top Rated All Time" subtitle="Highest average ratings">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topRated.map((set, i) => <SetCard key={set.id} set={set} rank={i + 1} showRating />)}
          </div>
        </Section>
      )}

      {/* Newest Sets */}
      {recent.length > 0 && (
        <Section title="🆕 Just Uploaded" subtitle="Fresh sets from the community">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recent.map(set => <SetCard key={set.id} set={set} showDate />)}
          </div>
        </Section>
      )}

      {/* Top DJs */}
      {topDjs.length > 0 && (
        <Section title="🎧 Top DJs" subtitle="Most followed artists on Decked">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topDjs.map((dj, i) => <DjCard key={dj.id} dj={dj} rank={i + 1} />)}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, subtitle, linkTo, children }) {
  return (
    <div className="mb-12">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-white font-extrabold text-xl">{title}</h2>
          {subtitle && <p className="text-gray-500 text-sm mt-0.5">{subtitle}</p>}
        </div>
        {linkTo && (
          <Link to={linkTo} className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors">
            See all →
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

function SetCard({ set, rank, showRating, showDate }) {
  return (
    <Link to={`/set/${set.id}`}
      className="group bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-brand-500/30 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5">
      {rank && (
        <span className={`inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-bold mb-2 ${
          rank === 1 ? 'bg-yellow-400/20 text-yellow-300' :
          rank === 2 ? 'bg-gray-400/20 text-gray-300' :
          rank === 3 ? 'bg-orange-400/20 text-orange-300' : 'bg-white/[0.05] text-gray-500'
        }`}>{rank}</span>
      )}
      <p className="text-white font-bold text-sm group-hover:text-brand-400 transition-colors truncate">{set.title}</p>
      <p className="text-brand-400 text-xs mt-0.5 truncate">{set.dj_name}</p>
      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
        <span>❤️ {set.like_count}</span>
        {showRating && set.avg_rating && <StarDisplay value={parseFloat(set.avg_rating)} size={11} />}
        {showRating && set.avg_rating && <span>{set.avg_rating}</span>}
        {showDate && set.created_at && <span>🕐 {new Date(set.created_at).toLocaleDateString()}</span>}
        {set.genre && <span className="truncate">🎵 {set.genre}</span>}
      </div>
    </Link>
  );
}

function DjCard({ dj, rank }) {
  return (
    <Link to={`/dj/${dj.id}`}
      className="group flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-brand-500/30 rounded-2xl p-4 transition-all duration-200">
      <div className="relative flex-shrink-0">
        {rank <= 3 && (
          <span className={`absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            rank === 1 ? 'bg-yellow-400/20 text-yellow-300' :
            rank === 2 ? 'bg-gray-400/20 text-gray-300' : 'bg-orange-400/20 text-orange-300'
          }`}>{rank}</span>
        )}
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-xl">🎧</div>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-white font-bold text-sm group-hover:text-brand-400 transition-colors truncate">{dj.name}</p>
          {dj.verified && <span className="text-xs">✅</span>}
        </div>
        <p className="text-gray-500 text-xs mt-0.5">
          👥 {dj.follower_count} followers
          {dj.avg_rating ? ` · ⭐ ${dj.avg_rating}` : ''}
        </p>
      </div>
    </Link>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>;
}
