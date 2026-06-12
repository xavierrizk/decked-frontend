import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import VisualizerBackground from '../components/backgrounds/VisualizerBackground';
import DJCard from '../components/cards/DJCard';
import SetCard from '../components/cards/SetCard';

export default function Home() {
  const [djs, setDJs]         = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    Promise.all([
      axios.get(API_URL + '/api/djs'),
      axios.get(API_URL + '/api/feed/trending?sort=likes'),
    ]).then(([djsRes, trendingRes]) => {
      setDJs(djsRes.data);
      setTrending(trendingRes.data.slice(0, 3));
      setLoading(false);
    }).catch(() => setLoading(false));
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
          Rate the <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">Best Sets</span>
        </h1>
        <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
          The community platform for discovering and reviewing DJ sets.
        </p>
        {isLoggedIn ? (
          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/feed"
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-glow">
              My Feed
            </Link>
            <Link to="/discover"
              className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-200 hover:scale-105 active:scale-95">
              🧭 Discover
            </Link>
            <Link to="/search"
              className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-200 hover:scale-105 active:scale-95">
              🔍 Search
            </Link>
            <Link to="/trending"
              className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-200 hover:scale-105 active:scale-95">
              🔥 Trending
            </Link>
          </div>
        ) : (
          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/signup"
              className="px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-glow">
              Get Started
            </Link>
            <Link to="/discover"
              className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-200 hover:scale-105 active:scale-95">
              🧭 Discover
            </Link>
            <Link to="/search"
              className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-200 hover:scale-105 active:scale-95">
              🔍 Search
            </Link>
          </div>
        )}
      </div>

      {/* Trending this week */}
      {trending.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-widest">🔥 Trending This Week</h2>
            <Link to="/trending" className="text-brand-400 hover:text-brand-300 text-xs font-medium transition-colors">See all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-3">
            {trending.map((set, i) => (
              <SetCard key={set.id} set={set} rank={i + 1} />
            ))}
          </div>
        </div>
      )}

      {/* DJ Grid */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-widest">All DJs</h2>
        <span className="text-gray-600 text-sm">{djs.length} total</span>
      </div>

      {djs.length === 0 ? (
        <div className="text-center py-24 border border-white/5 rounded-2xl">
          <p className="text-5xl mb-4">🎛️</p>
          <p className="text-gray-500">No DJs yet. Be the first to add one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {djs.map((dj) => (
            <DJCard key={dj.id} dj={dj} showFollow={false} />
          ))}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>;
}
