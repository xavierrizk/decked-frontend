import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

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
            <Link to="/trending"
              className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-200 hover:scale-105 active:scale-95">
              Trending
            </Link>
            <Link to="/create-dj"
              className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-200 hover:scale-105 active:scale-95">
              + Add DJ
            </Link>
          </div>
        ) : (
          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/signup"
              className="px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-glow">
              Get Started
            </Link>
            <Link to="/trending"
              className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-200 hover:scale-105 active:scale-95">
              Trending
            </Link>
          </div>
        )}
      </div>

      {/* Trending this week */}
      {trending.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-widest">🔥 Trending This Week</h2>
            <Link to="/trending" className="text-brand-400 hover:text-brand-300 text-xs font-medium transition-colors">See all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {trending.map((set, i) => (
              <Link key={set.id} to={`/set/${set.id}`}
                className="group bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-brand-500/30 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${
                    i === 0 ? 'bg-yellow-400/20 text-yellow-300' : i === 1 ? 'bg-gray-400/20 text-gray-300' : 'bg-orange-400/20 text-orange-300'
                  }`}>{i + 1}</span>
                  <span className="text-brand-400 text-xs font-semibold truncate">{set.dj_name}</span>
                </div>
                <p className="text-white font-bold text-sm group-hover:text-brand-400 transition-colors truncate">{set.title}</p>
                <div className="flex gap-3 mt-2 text-xs text-gray-500">
                  <span>❤️ {set.like_count}</span>
                  <span>⭐ {set.rating_count}</span>
                </div>
              </Link>
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
            <Link key={dj.id} to={`/dj/${dj.id}`}
              className="group relative bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-brand-500/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-glow-sm hover:-translate-y-1">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-lg mb-4">
                🎧
              </div>
              <h3 className="text-white font-bold text-lg leading-tight group-hover:text-brand-400 transition-colors duration-200">{dj.name}</h3>
              <p className="text-gray-500 text-sm mt-1.5 line-clamp-2">{dj.bio || 'No bio yet'}</p>
              <div className="mt-4 flex items-center text-brand-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                View Profile <span className="ml-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>;
}
