import React from 'react';
import { Link } from 'react-router-dom';

function fmt(n) {
  if (!n && n !== 0) return '0';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
}

const accentColors = [
  '#5A6470, #252D34',
  '#1d4ed8, #1e3a8a',
  '#0891b2, #164e63',
  '#be185d, #831843',
  '#059669, #064e3b',
];

export default function ArtistCard({ dj, onFollow, isFollowing, showFollow = true }) {
  const initial = dj.name?.[0]?.toUpperCase() || '?';
  const profileImage = dj.profile_image_url || dj.profile_picture_url;

  return (
    <div className="relative group border border-white/[0.07] hover:border-[#00D9FF]/30 rounded overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-900/20 bg-[#111114]">
      {/* Radial gradient overlay at top */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(90,100,112,0.15) 0%, transparent 70%)' }}
      />

      <Link to={`/artist/${dj.id}`} className="block p-5 pb-4">
        {/* Avatar */}
        <div className="flex flex-col items-center text-center mb-4">
          <div className="w-20 h-20 rounded-full border-2 border-purple-500/40 flex items-center justify-center text-2xl font-black text-white mb-3 flex-shrink-0 overflow-hidden">
            {profileImage ? (
              <img src={profileImage} alt={dj.name} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-2xl font-black text-white"
                style={{ background: `linear-gradient(135deg, ${accentColors[dj.id % accentColors.length]})` }}
              >
                {initial}
              </div>
            )}
          </div>

          {/* Name + verified */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <span className="text-xl font-black text-white tracking-tight leading-tight">{dj.name}</span>
            {dj.verified && <span title="Verified">✅</span>}
          </div>

          {/* Genre pill */}
          {dj.genre && (
            <span className="mt-1.5 text-xs bg-brand-600/15 text-[#00D9FF] px-2 py-0.5 rounded-full border border-brand-600/20">
              {dj.genre}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-center">
          <div>
            <p className="text-3xl font-black text-white leading-none" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{fmt(dj.follower_count)}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Followers</p>
          </div>
          <div>
            <p className="text-3xl font-black text-white leading-none" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{fmt(dj.set_count)}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Sets</p>
          </div>
        </div>
      </Link>

      {/* Follow button */}
      {showFollow && onFollow && (
        <div className="px-5 pb-5">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFollow(dj.id); }}
            className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
              isFollowing
                ? 'bg-transparent border border-white/20 text-gray-300 hover:border-red-400/30 hover:text-red-300'
                : 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-purple-900/30'
            }`}
          >
            {isFollowing ? '✓ Following' : '+ Follow'}
          </button>
        </div>
      )}

      {/* If no follow button, just add bottom padding via the link */}
      {!(showFollow && onFollow) && <div className="pb-5" />}
    </div>
  );
}
