import React from 'react';
import { Link } from 'react-router-dom';

export default function NetworkGrid({ friends, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="flex flex-col items-center animate-pulse">
            <div className="w-16 h-16 rounded-full bg-white/[0.04]" />
            <div className="h-3 w-2/3 bg-white/[0.04] mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (!friends.length) {
    return (
      <div className="text-center py-16 border border-white/[0.05]">
        <p className="text-3xl mb-2">🤝</p>
        <p className="text-gray-500">No friends yet.</p>
        <Link to="/discover" className="inline-block mt-3 text-sm font-medium transition-colors" style={{ color: '#00D9FF' }}>
          Find people →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
      {friends.map(f => (
        <Link key={f.id} to={`/profile/${f.id}`} className="group flex flex-col items-center text-center">
          {f.profile_picture_url ? (
            <img src={f.profile_picture_url} alt={f.username}
              className="w-16 h-16 rounded-full object-cover border border-white/10 group-hover:border-[#00D9FF]/50 transition-colors" />
          ) : (
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white group-hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #5A6470, #252D34)' }}>
              {f.username?.[0]?.toUpperCase()}
            </div>
          )}
          <p className="text-gray-300 text-sm mt-2 truncate w-full group-hover:text-white transition-colors">{f.username}</p>
        </Link>
      ))}
    </div>
  );
}
