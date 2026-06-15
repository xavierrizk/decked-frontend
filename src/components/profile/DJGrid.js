import React from 'react';
import { Link } from 'react-router-dom';
import { fmt, gradFor } from './helpers';

export default function DJGrid({ djs, loading, isOwn }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-white/[0.04]" />
            <div className="h-4 w-2/3 bg-white/[0.04] mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (!djs.length) {
    return (
      <div className="text-center py-16 border border-white/[0.05]">
        <p className="text-3xl mb-2">🎧</p>
        <p className="text-gray-500">Not following any DJs yet.</p>
        <Link to="/discover" className="inline-block mt-3 text-sm font-medium transition-colors" style={{ color: '#00D9FF' }}>
          Discover DJs →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {djs.map(dj => (
        <Link key={dj.id} to={`/dj/${dj.id}`} className="group">
          <div
            className="relative aspect-square overflow-hidden border border-white/[0.07] group-hover:border-[#00D9FF]/40 transition-all duration-200"
            style={{
              backgroundImage: dj.profile_image_url ? `url(${dj.profile_image_url})` : gradFor(dj.id),
              backgroundSize: 'cover', backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            {dj.verified && <div className="absolute top-2 right-2 text-sm">✅</div>}
            {!dj.profile_image_url && (
              <div className="absolute inset-0 flex items-center justify-center text-4xl font-black text-white/30">
                {dj.name?.[0]}
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 p-2.5">
              <p className="text-white font-bold text-sm leading-tight truncate">{dj.name}</p>
              <p className="text-gray-400 text-xs">{fmt(dj.follower_count)} followers</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
