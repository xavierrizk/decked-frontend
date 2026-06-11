import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Home() {
  const [djs, setDJs] = useState([]);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    axios.get(API_URL + '/api/djs')
      .then((res) => { setDJs(res.data); setLoading(false); })
      .catch(() => setLoading(false));
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
            <Link to="/create-dj"
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-glow">
              + Add DJ
            </Link>
            <Link to="/create-set"
              className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all duration-200 hover:scale-105 active:scale-95">
              + Add Set
            </Link>
          </div>
        ) : (
          <Link to="/signup"
            className="inline-block px-8 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-glow">
            Get Started
          </Link>
        )}
      </div>

      {/* DJ Grid */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-400 uppercase tracking-widest text-xs">DJs</h2>
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

export default Home;
