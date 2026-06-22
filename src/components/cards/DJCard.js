import React from 'react';
import { Link } from 'react-router-dom';

function fmt(n) {
  if (!n && n !== 0) return '0';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
}

const accentColors = [
  ['#5A6470', '#252D34'],
  ['#1d4ed8', '#1e3a8a'],
  ['#0891b2', '#164e63'],
  ['#be185d', '#831843'],
  ['#059669', '#064e3b'],
];

export default function ArtistCard({ dj, onFollow, isFollowing, showFollow = true }) {
  const initial = dj.name?.[0]?.toUpperCase() || '?';
  const profileImage = dj.profile_image_url || dj.profile_picture_url;
  const hasBanner = !!dj.banner_image_url;
  // When no banner, use profile pic as the full-width top image
  const topImage = dj.banner_image_url || profileImage;
  const [c1, c2] = accentColors[dj.id % accentColors.length];

  return (
    <div className="relative group border border-white/[0.07] hover:border-[#00D9FF]/30 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-900/20 bg-[#111114] flex flex-col">
      <Link to={`/artist/${dj.id}`} className="block flex-1">

        {/* Top image */}
        <div className={`relative overflow-hidden ${hasBanner ? 'h-24' : 'h-44'}`}>
          {topImage ? (
            <>
              <img
                src={topImage}
                alt={dj.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Bottom fade so text reads cleanly */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-transparent" style={{ backgroundSize: '100% 60%', backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom' }} />
            </>
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-5xl font-black"
              style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, color: 'rgba(255,255,255,0.2)' }}
            >
              {initial}
            </div>
          )}
          {dj.verified && (
            <span className="absolute top-2 right-2 text-xs bg-black/50 backdrop-blur-sm rounded-full px-1.5 py-0.5 border border-white/10">✅</span>
          )}
        </div>

        {/* Avatar overlapping — only when a real separate banner exists */}
        {hasBanner && (
          <div className="px-4 -mt-6 mb-2 relative z-10">
            <div className="w-12 h-12 rounded-xl border-2 border-[#111114] overflow-hidden bg-[#111114] shadow-lg">
              {profileImage ? (
                <img src={profileImage} alt={dj.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-black text-white text-lg" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                  {initial}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info */}
        <div className={`px-4 pb-4 ${hasBanner ? 'pt-1' : 'pt-3'}`}>
          <p className="text-base font-black text-white tracking-tight leading-tight mb-1 truncate">{dj.name}</p>
          {dj.genre && (
            <p className="text-xs text-gray-400 mb-3 truncate">{dj.genre}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div>
              <p className="text-xl font-black text-white leading-none" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{fmt(dj.follower_count)}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Followers</p>
            </div>
            <div>
              <p className="text-xl font-black text-white leading-none" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>{fmt(dj.set_count)}</p>
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
