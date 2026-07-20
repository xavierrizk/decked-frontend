import React from 'react';
import { Link } from 'react-router-dom';
import SetThumbnail from '../SetThumbnail';

const genreGradient = {
  'Techno':       'from-slate-900 via-blue-950 to-black',
  'Tech House':   'from-violet-950 via-purple-900 to-black',
  'House':        'from-orange-950 via-amber-900 to-black',
  'Drum and Bass':'from-red-950 via-rose-900 to-black',
  'Trance':       'from-cyan-950 via-teal-900 to-black',
  'default':      'from-gray-900 via-zinc-800 to-black',
};

const TYPE_BADGE = {
  dj_set:       { label: 'DJ Set',    color: '#00D9FF' },
  concert:      { label: 'Concert',   color: '#FF006E' },
  live_band:    { label: 'Live Band', color: '#FBBF24' },
  festival_set: { label: 'Festival',  color: '#A855F7' },
  rave:         { label: 'Rave',      color: '#F43F5E' },
  other:        { label: 'Live',      color: '#9BA6B3' },
};

function getGradient(genre) {
  if (!genre) return genreGradient['default'];
  return genreGradient[genre] || genreGradient['default'];
}

function getYouTubeId(url) {
  if (!url) return null;
  let m = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];
  m = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];
  m = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];
  return null;
}

export default function SetCard({ set, rank }) {
  const gradient   = getGradient(set.genre);
  const badge      = TYPE_BADGE[set.performance_type] || null;
  const isDjSet    = set.performance_type === 'dj_set' || (!set.performance_type && set.dj_id);
  const ytId       = getYouTubeId(set.video_url);
  const artistImg  = set.dj_profile_image_url;
  const rating     = set.avg_rating ? Number(set.avg_rating).toFixed(1) : null;
  const artistLink = isDjSet && set.dj_id ? `/artist/${set.dj_id}` : set.artist_id ? `/artist/${set.artist_id}` : null;

  return (
    <Link to={`/set/${set.id}`} className="group block">
      {/* Thumbnail */}
      <div className={`relative rounded-lg overflow-hidden aspect-video ${!ytId && !artistImg ? `bg-gradient-to-br ${gradient}` : 'bg-black'}`}>
        <SetThumbnail
          setId={set.id}
          youtubeUrl={set.video_url}
          performanceType={set.performance_type}
          fallbackImage={artistImg}
          alt={set.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Type badge */}
        {badge && (
          <span
            className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded backdrop-blur-sm"
            style={{ color: badge.color, background: 'rgba(0,0,0,0.6)', border: `1px solid ${badge.color}44` }}
          >
            {badge.label}
          </span>
        )}

        {/* Rank */}
        {rank && (
          <span className="absolute bottom-2 right-2 text-3xl font-black text-white/10 leading-none select-none">
            {rank}
          </span>
        )}
      </div>

      {/* Info row */}
      <div className="mt-1.5 px-0.5">
        <p className="text-white text-xs font-semibold leading-snug line-clamp-1 group-hover:text-[#00D9FF] transition-colors">
          {set.title}
        </p>
        <div className="flex items-center justify-between mt-0.5">
          {artistLink ? (
            <Link
              to={artistLink}
              onClick={e => e.stopPropagation()}
              className="text-gray-500 text-[11px] hover:text-white transition-colors truncate max-w-[70%]"
            >
              {set.dj_name}
            </Link>
          ) : (
            <span className="text-gray-600 text-[11px] truncate max-w-[70%]">{set.dj_name}</span>
          )}
          {rating && (
            <span className="text-[#FF006E] text-[11px] font-bold tabular-nums flex-shrink-0">{rating}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
