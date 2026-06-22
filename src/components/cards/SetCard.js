import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const genreGradient = {
  'Techno':       'from-slate-900 via-blue-950 to-black',
  'Tech House':   'from-violet-950 via-purple-900 to-black',
  'House':        'from-orange-950 via-amber-900 to-black',
  'Drum and Bass':'from-red-950 via-rose-900 to-black',
  'Trance':       'from-cyan-950 via-teal-900 to-black',
  'default':      'from-gray-900 via-zinc-800 to-black',
};

function getGradient(genre) {
  if (!genre) return genreGradient['default'];
  return genreGradient[genre] || genreGradient['default'];
}

const TYPE_BADGE = {
  dj_set:       { label: 'DJ Set',    color: '#00D9FF' },
  concert:      { label: 'Concert',   color: '#FF006E' },
  live_band:    { label: 'Live Band', color: '#FBBF24' },
  festival_set: { label: 'Festival',  color: '#A855F7' },
  rave:         { label: 'Rave',      color: '#F43F5E' },
  other:        { label: 'Live',      color: '#9BA6B3' },
};

function getYouTubeId(url) {
  if (!url) return null;
  // Standard: youtube.com/watch?v=ID
  let m = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];
  // Short: youtu.be/ID
  m = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];
  // Embed: youtube.com/embed/ID
  m = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];
  return null;
}

function YouTubeThumbnail({ videoId, alt, className }) {
  // Try maxresdefault, fall back to hqdefault if it 404s (maxres isn't always available)
  const [src, setSrc] = useState(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setSrc(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`)}
    />
  );
}

export default function SetCard({ set, rank }) {
  const gradient = getGradient(set.genre);
  const badge = TYPE_BADGE[set.performance_type] || null;
  const isDjSet = set.performance_type === 'dj_set' || (!set.performance_type && set.dj_id);
  const ytId = getYouTubeId(set.video_url);

  return (
    <div className="relative">
      {/* Rating badge */}
      <div className="absolute -top-3 -right-2 z-10 bg-[#0d0d0f] border border-white/10 rounded-xl px-2.5 py-1.5 text-center shadow-lg">
        <p className="text-yellow-400 text-sm font-black leading-none" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
          {set.avg_rating ? Number(set.avg_rating).toFixed(1) : '—'}
        </p>
        <p className="text-gray-600 text-[10px] leading-none mt-0.5">{set.rating_count} ratings</p>
      </div>

      <Link to={`/set/${set.id}`}>
        <div className={`rounded overflow-hidden relative aspect-[4/3] group cursor-pointer hover:scale-[1.02] transition-all duration-300 ${!ytId ? `bg-gradient-to-br ${gradient}` : 'bg-black'}`}>

          {/* YouTube thumbnail */}
          {ytId ? (
            <>
              <YouTubeThumbnail
                videoId={ytId}
                alt={set.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Dark overlay so text is readable */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            </>
          ) : (
            <>
              {/* Vinyl SVG fallback */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none">
                <circle cx="50" cy="50" r="48" fill="white" />
                <circle cx="50" cy="50" r="36" fill="#111" />
                <circle cx="50" cy="50" r="24" fill="white" />
                <circle cx="50" cy="50" r="16" fill="#111" />
                <circle cx="50" cy="50" r="6" fill="white" />
                <circle cx="50" cy="50" r="2" fill="#111" />
              </svg>
            </>
          )}

          {/* Rank number */}
          {rank && (
            <span className="absolute bottom-12 right-3 text-5xl font-black text-white/10 leading-none select-none z-[1]">
              {rank}
            </span>
          )}

          {/* Performance-type badge */}
          {badge && (
            <span
              className="absolute top-3 left-3 z-10 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-sm"
              style={{
                color: badge.color,
                background: 'rgba(0,0,0,0.55)',
                border: `1px solid ${badge.color}55`,
              }}
            >
              {badge.label}
            </span>
          )}

          {/* Duration badge */}
          {set.duration && (
            <span className="absolute bottom-3 right-3 bg-black/60 text-gray-300 text-xs px-2 py-0.5 rounded-full backdrop-blur-sm z-10">
              {set.duration} min
            </span>
          )}

          {/* Bottom text overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 group-hover:from-black/95 transition-all duration-300 z-10">
            <p className="text-white font-bold text-base leading-tight line-clamp-2">{set.title}</p>
            {isDjSet && set.dj_id ? (
              <Link
                to={`/artist/${set.dj_id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-gray-300 text-xs mt-1 hover:text-[#00D9FF] transition-colors inline-block"
              >
                {set.dj_name}
              </Link>
            ) : set.artist_id ? (
              <Link
                to={`/artist/${set.artist_id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-gray-300 text-xs mt-1 hover:text-[#FF006E] transition-colors inline-block"
              >
                {set.dj_name}
              </Link>
            ) : (
              <span className="text-gray-300 text-xs mt-1 inline-block">{set.dj_name}</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
