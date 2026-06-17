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
    <div className="relative group border border-white/[0.07] hover:border-[#00D9FF]/30 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-900/20 bg-[#111114]">
      <Link to={`/artist/${dj.id}`} className="block">
        {/* Banner */}
        <div className="relative h-20 bg-gradient-to-br from-brand-900/60 to-black overflow-hidden">
          {dj.banner_image_url ? (
            <img src={dj.banner_image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div
              className="absolute inset-0 opacity-30"
              style={{ background: `linear-gradient(135deg, ${accentColors[dj.id % accentColors.length]})` }}
            />
          )}
        </div>

        {/* Avatar overlapping banner */}
        <div className="px-4 pb-4">
          <div className="flex items-end justify-between -mt-7 mb-3">
            <div className="w-14 h-14 rounded-xl border-2 border-[#111114] overflow-hidden flex-shrink-0 bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              {profileImage ? (
                <img src={profileImage} alt={dj.name} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-xl font-black text-white"
                  style={{ background: `linear-gradient(135deg, ${accentColors[dj.id % accentColors.length]})` }}
                >
                  {initial}
                </div>
              )}
            </div>
            {dj.verified && <span title="Verified" className="text-sm pb-1">✅</span>}
          </div>

          {/* Name + genre */}
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="text-base font-black text-white tracking-tight leading-tight">{dj.name}</span>
          </div>
          {dj.genre && (
            <span className="text-xs bg-brand-600/15 text-[#00D9FF] px-2 py-0.5 rounded-full border border-brand-600/20">
              {dj.genre}
            </span>
          )}
          {dj.location && !dj.genre && (
            <span className="text-xs text-gray-600">📍 {dj.location}</span>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mt-3 text-center">
            <div>
              <p className="text-2xl font-black text-white leading-none" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{fmt(dj.follower_count)}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Followers</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white leading-none" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{fmt(dj.set_count)}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Sets</p>
            </div>
          </div>
        </div>
      </Link>

      {/* Follow button */}
      {showFollow && onFollow && (
        <div className="px-4 pb-4">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFollow(dj.id); }}
            className={`w-full py-2 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
              isFollowing
                ? 'bg-transparent border border-white/20 text-gray-300 hover:border-red-400/30 hover:text-red-300'
                : 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-purple-900/30'
            }`}
          >
            {isFollowing ? '✓ Following' : '+ Follow'}
          </button>
        </div>
      )}
    </div>
  );
}
