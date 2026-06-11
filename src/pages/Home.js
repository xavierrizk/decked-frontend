import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [djs, setDJs] = useState([]);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    axios.get(API_URL + '/api/djs')
      .then((res) => { setDJs(res.data); setLoading(false); })
      .catch((err) => { console.error(err); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-white mb-3 tracking-tight">
          Discover & Rate <span className="text-brand-400">DJ Sets</span>
        </h1>
        <p className="text-gray-400 text-lg mb-6">The community for DJ set reviews</p>
        {isLoggedIn && (
          <div className="flex justify-center gap-3">
            <Link to="/create-dj"
              className="bg-brand-600 hover:bg-brand-500 text-white font-semibold px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-brand-900/50">
              + Add DJ
            </Link>
            <Link to="/create-set"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-lg transition-all">
              + Add Set
            </Link>
          </div>
        )}
      </div>

      {/* DJ Grid */}
      <h2 className="text-xl font-semibold text-gray-300 mb-4">All DJs</h2>
      {djs.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-3">🎛️</p>
          <p>No DJs yet. Be the first to add one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {djs.map((dj) => (
            <Link key={dj.id} to={`/dj/${dj.id}`}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-5 transition-all group">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-purple-700 flex items-center justify-center text-xl mb-3">
                🎧
              </div>
              <h3 className="text-white font-bold text-lg group-hover:text-brand-400 transition-colors">{dj.name}</h3>
              <p className="text-gray-400 text-sm mt-1 line-clamp-2">{dj.bio || 'No bio yet'}</p>
              <span className="inline-block mt-3 text-brand-400 text-sm font-medium">View Profile →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
