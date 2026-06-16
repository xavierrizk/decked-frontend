import API_URL from '../api';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { StarDisplay } from '../components/StarRating';

export default function VenuesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [venues, setVenues] = useState([]);
  const [cities, setCities] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const city = searchParams.get('city') || '';
  const sortBy = searchParams.get('sortBy') || 'rating';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 18;

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sortBy, page, limit };
      if (city) params.city = city;
      const res = await axios.get(`${API_URL}/api/venues`, { params });
      setVenues(res.data.venues);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [city, sortBy, page]);

  useEffect(() => {
    axios.get(`${API_URL}/api/venues/cities`).then(r => setCities(r.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchVenues(); }, [fetchVenues]);

  const setParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-1">Venues</h1>
        <p className="text-gray-500 text-sm">Discover the best venues ranked by crowd experience</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <select
          value={city}
          onChange={e => setParam('city', e.target.value)}
          className="bg-[#111114] border border-white/10 text-white text-sm rounded-xl px-4 py-2 outline-none focus:border-[#FF006E]/50 transition-colors"
        >
          <option value="">All Cities</option>
          {cities.map(c => (
            <option key={c.city} value={c.city}>
              {c.city} ({c.venue_count})
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          {[
            { value: 'rating', label: 'Top Rated' },
            { value: 'name',   label: 'A–Z' },
            { value: 'recent', label: 'Recent Activity' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setParam('sortBy', opt.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                sortBy === opt.value
                  ? 'bg-[#FF006E]/15 border-[#FF006E]/40 text-[#FF006E]'
                  : 'bg-[#111114] border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {(city || sortBy !== 'rating') && (
          <button
            onClick={() => { setSearchParams({}); }}
            className="px-4 py-2 rounded-xl text-sm text-gray-500 hover:text-white border border-white/[0.06] hover:border-white/20 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-gray-600 text-xs mb-4">{total} venue{total !== 1 ? 's' : ''}</p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#FF006E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : venues.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p className="text-4xl mb-3">🏟️</p>
          <p className="text-lg font-semibold">No venues found</p>
          {city && <p className="text-sm mt-1">Try a different city filter</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {venues.map(venue => (
            <VenueCard key={venue.id} venue={venue} onClick={() => navigate(`/venues/${venue.id}`)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          <button
            onClick={() => setParam('page', String(page - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 disabled:opacity-30 hover:border-white/20 hover:text-white transition-colors text-sm"
          >
            ← Prev
          </button>
          <span className="px-4 py-2 text-gray-500 text-sm">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setParam('page', String(page + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-xl border border-white/10 text-gray-400 disabled:opacity-30 hover:border-white/20 hover:text-white transition-colors text-sm"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function VenueCard({ venue, onClick }) {
  const rating = parseFloat(venue.avg_venue_rating);
  const hasRating = !isNaN(rating) && rating > 0;

  return (
    <div
      onClick={onClick}
      className="bg-[#111114] border border-white/[0.07] rounded-2xl overflow-hidden cursor-pointer hover:border-[#FF006E]/30 transition-all duration-200 hover:shadow-lg hover:shadow-[#FF006E]/5 group"
    >
      {/* Image */}
      <div className="relative h-36 bg-[#0d0d0f] overflow-hidden">
        {venue.image_url ? (
          <img
            src={venue.image_url}
            alt={venue.name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-20">🏟️</span>
          </div>
        )}
        {hasRating && (
          <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-sm border border-[#FF006E]/30 rounded-xl px-2.5 py-1 flex items-center gap-1.5">
            <StarDisplay value={rating} size={11} color="#FF006E" />
            <span className="text-[#FF006E] text-xs font-bold">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-white font-bold text-base leading-tight mb-1 group-hover:text-[#FF006E] transition-colors">
          {venue.name}
        </h3>
        <p className="text-gray-500 text-sm mb-3">
          {[venue.city, venue.country].filter(Boolean).join(', ') || 'Unknown location'}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{venue.set_count || 0} set{venue.set_count !== 1 ? 's' : ''}</span>
          {venue.rating_count > 0 ? (
            <span>{venue.rating_count} rating{venue.rating_count !== 1 ? 's' : ''}</span>
          ) : (
            <span className="text-gray-700">No ratings yet</span>
          )}
        </div>

        {venue.capacity && (
          <p className="text-gray-700 text-xs mt-1">Capacity: {venue.capacity.toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}
