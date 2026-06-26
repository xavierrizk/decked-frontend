import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function getYtThumb(url) {
  if (!url) return null;
  let m = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (!m) m = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null;
}

const PERF_TYPE_LABELS = {
  dj_set: 'DJ Set', concert: 'Concert', live_band: 'Live Band',
  festival_set: 'Festival', rave: 'Rave', other: 'Other',
};

function StatBox({ value, label, color }) {
  return (
    <div className="flex flex-col items-center justify-center bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-4 text-center">
      <p className="font-bold tabular-nums leading-none" style={{ fontSize: 'clamp(22px, 4vw, 32px)', color: color || '#FF006E' }}>
        {value ?? '—'}
      </p>
      <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.12em] mt-1">{label}</p>
    </div>
  );
}

function SubRating({ label, value, color }) {
  if (!value || parseFloat(value) === 0) return null;
  const pct = (parseFloat(value) / 5) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-500 text-xs w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-bold tabular-nums flex-shrink-0" style={{ color }}>{parseFloat(value).toFixed(1)}</span>
    </div>
  );
}

export default function VenueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/api/venues/${id}`)
      .then(r => { setVenue(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#FF006E', borderTopColor: 'transparent' }} />
    </div>
  );
  if (!venue) return (
    <div className="text-center py-20">
      <p className="text-gray-500">Venue not found</p>
      <button onClick={() => navigate('/venues')} className="mt-4 text-[#FF006E] text-sm hover:underline">← Back to Venues</button>
    </div>
  );

  const sets       = venue.sets        || [];
  const artists    = venue.top_artists || [];
  const bd         = venue.rating_breakdown || {};
  const avgScore   = bd.avg_score   ? parseFloat(bd.avg_score)   : null;
  const topSet     = sets[0] || null; // already sorted by rating desc

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link to="/venues" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-white text-sm transition-colors mb-5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        All Venues
      </Link>

      {/* Hero */}
      <div className="rounded-xl overflow-hidden border border-white/[0.07] bg-[#0f0f1a] mb-6">
        {venue.image_url ? (
          <div className="h-48 relative">
            <img src={venue.image_url} alt={venue.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <h1 className="text-2xl font-extrabold text-white">{venue.name}</h1>
              <p className="text-gray-400 text-sm mt-0.5">{[venue.city, venue.country].filter(Boolean).join(', ')}</p>
            </div>
          </div>
        ) : (
          <div className="px-5 py-6" style={{ background: 'linear-gradient(135deg, rgba(255,0,110,0.08) 0%, rgba(168,85,247,0.05) 100%)' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, #FF006E, #A855F7)' }} />
            <h1 className="text-2xl font-extrabold text-white">{venue.name}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{[venue.city, venue.country].filter(Boolean).join(', ') || 'Unknown location'}</p>
          </div>
        )}

        {venue.website && (
          <div className="px-5 py-3 border-t border-white/[0.05]">
            <a href={venue.website} target="_blank" rel="noreferrer" className="text-[#00D9FF] text-xs hover:underline">
              {venue.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatBox value={avgScore ? avgScore.toFixed(1) : null} label="Avg Score"     color="#FF006E" />
        <StatBox value={sets.length}                           label="Performances"  color="#00D9FF" />
        <StatBox value={bd.total_ratings || 0}                label="Ratings"       color="#A855F7" />
      </div>

      {/* Sub-ratings bar */}
      {(bd.avg_performance || bd.avg_venue || bd.avg_crowd) && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-5 py-4 mb-6 space-y-3">
          <SubRating label="Performance" value={bd.avg_performance} color="#00D9FF" />
          <SubRating label="Venue"       value={bd.avg_venue}       color="#FF006E" />
          <SubRating label="Crowd"       value={bd.avg_crowd}       color="#A855F7" />
        </div>
      )}

      {/* Top-rated set callout */}
      {topSet && topSet.avg_rating && (
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-3">Top Rated Set</p>
          <Link to={`/set/${topSet.id}`}
            className="group flex items-center gap-4 bg-white/[0.03] border border-white/[0.07] hover:border-[#FF006E]/30 rounded-xl p-4 transition-all">
            <div className="w-20 h-12 rounded-lg overflow-hidden bg-white/[0.05] flex-shrink-0">
              {getYtThumb(topSet.video_url)
                ? <img src={getYtThumb(topSet.video_url)} alt={topSet.title} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-gray-700">♪</div>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate group-hover:text-[#FF006E] transition-colors">{topSet.title}</p>
              {topSet.dj_name && <p className="text-gray-500 text-xs mt-0.5">{topSet.dj_name}</p>}
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-[#FF006E] font-bold text-lg tabular-nums">{parseFloat(topSet.avg_rating).toFixed(1)}</p>
              <p className="text-gray-600 text-[10px]">{topSet.rating_count} rating{topSet.rating_count !== 1 ? 's' : ''}</p>
            </div>
          </Link>
        </div>
      )}

      {/* Most frequent artists */}
      {artists.length > 0 && (
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-3">Frequent Artists</p>
          <div className="flex flex-wrap gap-2">
            {artists.map((a, i) => (
              a.dj_id ? (
                <Link key={i} to={`/artist/${a.dj_id}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] hover:border-[#00D9FF]/30 hover:bg-[#00D9FF]/[0.05] transition-all text-sm">
                  <span className="text-white font-medium">{a.name}</span>
                  <span className="text-gray-600 text-xs">{a.performance_count}×</span>
                </Link>
              ) : (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] text-sm">
                  <span className="text-gray-400">{a.name}</span>
                  <span className="text-gray-600 text-xs">{a.performance_count}×</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* All performances */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-3">
          All Performances <span className="text-gray-700 font-normal normal-case">({sets.length})</span>
        </p>
        {sets.length === 0 ? (
          <div className="text-center py-12 border border-white/[0.05] rounded-xl text-gray-600">
            <p className="text-3xl mb-2">🎶</p>
            <p>No performances recorded here yet</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {sets.map(set => (
              <Link key={set.id} to={`/set/${set.id}`}
                className="flex items-center gap-4 p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:border-white/[0.12] hover:bg-white/[0.04] transition-all group">
                <div className="w-12 h-8 rounded-lg overflow-hidden bg-white/[0.05] flex-shrink-0">
                  {getYtThumb(set.video_url)
                    ? <img src={getYtThumb(set.video_url)} alt={set.title} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">♪</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate group-hover:text-[#00D9FF] transition-colors">{set.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-600">
                    {set.dj_name && <span>{set.dj_name}</span>}
                    {set.performance_type && <span>· {PERF_TYPE_LABELS[set.performance_type] || set.performance_type}</span>}
                  </div>
                </div>
                {set.rating_count > 0 && (
                  <div className="flex-shrink-0 text-right">
                    <p className="text-white font-bold text-sm tabular-nums">{parseFloat(set.avg_rating).toFixed(1)}</p>
                    <p className="text-gray-700 text-[10px]">{set.rating_count} rating{set.rating_count !== 1 ? 's' : ''}</p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
