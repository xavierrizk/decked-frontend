import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StarDisplay } from '../components/StarRating';

const PERF_TYPE_LABELS = {
  dj_set: 'DJ Set', concert: 'Concert', live_band: 'Live Band',
  festival_set: 'Festival', rave: 'Rave', other: 'Other',
};

export default function VenueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${API_URL}/api/venues/${id}`)
      .then(r => { setVenue(r.data); setLoading(false); })
      .catch(() => { setError('Venue not found'); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-[#FF006E] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !venue) return (
    <div className="text-center py-20">
      <p className="text-gray-500">{error || 'Something went wrong'}</p>
      <button onClick={() => navigate('/venues')} className="mt-4 text-[#FF006E] text-sm hover:underline">
        ← Back to Venues
      </button>
    </div>
  );

  const bd = venue.rating_breakdown || {};
  const hasBreakdown = bd.avg_overall && parseFloat(bd.avg_overall) > 0;

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 py-8">
      {/* Back */}
      <button
        onClick={() => navigate('/venues')}
        className="text-gray-500 hover:text-[#FF006E] text-sm transition-colors mb-6 block"
      >
        ← All Venues
      </button>

      {/* Hero */}
      <div className="rounded-2xl overflow-hidden border border-white/[0.07] mb-8">
        {venue.image_url ? (
          <div className="h-56 relative">
            <img
              src={venue.image_url}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <h1 className="text-3xl font-extrabold text-white mb-1">{venue.name}</h1>
              <p className="text-gray-300 text-sm">
                {[venue.city, venue.country].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-[#111114] p-6">
            <h1 className="text-3xl font-extrabold text-white mb-1">{venue.name}</h1>
            <p className="text-gray-500 text-sm">
              {[venue.city, venue.country].filter(Boolean).join(', ') || 'Unknown location'}
            </p>
          </div>
        )}

        {/* Meta row */}
        <div className="bg-[#111114] px-6 py-4 flex flex-wrap gap-4 items-center border-t border-white/[0.05]">
          {venue.website && (
            <a
              href={venue.website}
              target="_blank"
              rel="noreferrer"
              className="text-[#00D9FF] text-sm hover:underline"
            >
              🌐 Website
            </a>
          )}
          {venue.capacity && (
            <span className="text-gray-500 text-sm">🏟️ Capacity: {venue.capacity.toLocaleString()}</span>
          )}
          <span className="text-gray-500 text-sm">{venue.sets?.length || 0} performances</span>
        </div>
      </div>

      {/* Rating Breakdown */}
      {hasBreakdown && (
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-6 mb-8">
          <h2 className="text-white font-bold text-lg mb-5">Venue Ratings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '🎤', label: 'Performance', key: 'avg_performance', color: '#00D9FF' },
              { icon: '🏟️', label: 'Venue',       key: 'avg_venue',       color: '#FF006E' },
              { icon: '👥', label: 'Crowd',       key: 'avg_crowd',       color: '#A020F0' },
            ].map(({ icon, label, key, color }) => {
              const val = parseFloat(bd[key]);
              if (!val) return null;
              return (
                <div key={key} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-lg">{icon}</span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold mb-1" style={{ color }}>{label}</p>
                    <StarDisplay value={val} size={14} color={color} />
                  </div>
                  <span className="text-sm font-bold" style={{ color }}>{val.toFixed(1)}</span>
                </div>
              );
            })}

            {/* Overall */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] sm:col-span-2">
              <span className="text-lg">⭐</span>
              <div className="flex-1">
                <p className="text-xs font-semibold text-white mb-1">Overall</p>
                <StarDisplay value={parseFloat(bd.avg_overall)} size={14} />
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-white">{parseFloat(bd.avg_overall).toFixed(1)}</span>
                {bd.total_ratings > 0 && (
                  <p className="text-gray-600 text-[11px]">{bd.total_ratings} rating{bd.total_ratings !== 1 ? 's' : ''}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sets at this venue */}
      <div>
        <h2 className="text-white font-bold text-lg mb-4">Performances</h2>
        {!venue.sets || venue.sets.length === 0 ? (
          <div className="text-center py-12 text-gray-600 bg-[#111114] border border-white/[0.05] rounded-2xl">
            <p className="text-3xl mb-2">🎶</p>
            <p>No performances recorded at this venue yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {venue.sets.map(set => (
              <Link
                key={set.id}
                to={`/set/${set.id}`}
                className="flex items-center justify-between p-4 bg-[#111114] border border-white/[0.06] rounded-xl hover:border-[#FF006E]/30 hover:bg-[#FF006E]/[0.02] transition-all duration-200 group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate group-hover:text-[#FF006E] transition-colors">
                    {set.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {set.dj_name && (
                      set.dj_id ? (
                        <Link
                          to={`/artist/${set.dj_id}`}
                          onClick={e => e.stopPropagation()}
                          className="text-[#00D9FF] text-xs truncate hover:underline"
                        >
                          {set.dj_name}
                        </Link>
                      ) : (
                        <span className="text-gray-500 text-xs truncate">{set.dj_name}</span>
                      )
                    )}
                    {set.performance_type && (
                      <span className="text-gray-700 text-xs">
                        · {PERF_TYPE_LABELS[set.performance_type] || set.performance_type}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                  {set.rating_count > 0 && (
                    <div className="text-right">
                      <div className="flex items-center gap-1.5">
                        <StarDisplay value={parseFloat(set.avg_rating)} size={12} color="#FF006E" />
                        <span className="text-[#FF006E] text-xs font-bold">{parseFloat(set.avg_rating).toFixed(1)}</span>
                      </div>
                      <p className="text-gray-600 text-[11px]">{set.rating_count} rating{set.rating_count !== 1 ? 's' : ''}</p>
                    </div>
                  )}
                  <span className="text-gray-700 text-sm">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
