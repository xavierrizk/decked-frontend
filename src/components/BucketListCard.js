import React from 'react';
import { Link } from 'react-router-dom';

export default function BucketListCard({ dj, onRemove, removing }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 flex flex-col items-center text-center hover:border-white/[0.14] transition-colors duration-200">
      <Link to={`/artist/${dj.artist_id}`} className="flex-shrink-0 mb-3">
        {dj.profile_image_url ? (
          <img src={dj.profile_image_url} alt={dj.name} className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black text-white"
            style={{ background: 'linear-gradient(135deg, #FF006E, #7c1d4e)' }}
          >
            {dj.name?.[0]?.toUpperCase()}
          </div>
        )}
      </Link>
      <Link to={`/artist/${dj.artist_id}`} className="text-white text-sm font-semibold hover:text-[#00D9FF] transition-colors truncate max-w-full">
        {dj.name}
      </Link>
      <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-600">
        {dj.avg_rating ? <span>★ {dj.avg_rating}</span> : <span>Unrated</span>}
        <span>·</span>
        <span>{dj.set_count || 0} sets</span>
      </div>
      <p className="text-gray-700 text-[10px] mt-0.5">{dj.follower_count || 0} followers</p>

      {onRemove && (
        <button
          onClick={() => onRemove(dj.artist_id)}
          disabled={removing}
          className="mt-3 text-[10px] font-bold px-3 py-1.5 rounded-md border transition-all duration-150 disabled:opacity-50 w-full"
          style={{ borderColor: 'rgba(255,0,110,0.4)', color: '#FF006E', background: 'rgba(255,0,110,0.08)' }}
        >
          {removing ? '…' : 'Remove'}
        </button>
      )}
    </div>
  );
}
