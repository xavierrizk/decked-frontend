import API_URL from '../api';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function VenuesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [venues, setVenues]   = useState([]);
  const [cities, setCities]   = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const debounceRef = useRef(null);

  const city   = searchParams.get('city')   || '';
  const sortBy = searchParams.get('sortBy') || 'name';
  const q      = searchParams.get('q')      || '';
  const page   = parseInt(searchParams.get('page') || '1');
  const limit  = 50;

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sortBy, page, limit };
      if (city) params.city = city;
      if (q) params.q = q;
      const res = await axios.get(`${API_URL}/api/venues`, { params });
      setVenues(res.data.venues);
      setTotal(res.data.total);
    } catch {}
    setLoading(false);
  }, [city, sortBy, page, q]);

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

  const handleSearchChange = (val) => {
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setParam('q', val.trim()), 300);
  };

  const totalPages = Math.ceil(total / limit);
  const SORTS = [
    { value: 'name',   label: 'A–Z' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'recent', label: 'Recent' },
  ];

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white mb-0.5">Venues</h1>
        <p className="text-gray-500 text-sm">Best clubs and stages worldwide</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-5">
        {/* Search */}
        <input
          type="text"
          value={searchInput}
          onChange={e => handleSearchChange(e.target.value)}
          placeholder="Search venues…"
          className="bg-[#111114] border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-[#00D9FF]/40 placeholder-gray-600 w-44 transition-colors"
        />

        {/* City */}
        <select
          value={city}
          onChange={e => setParam('city', e.target.value)}
          className="bg-[#111114] border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-[#00D9FF]/40 transition-colors"
        >
          <option value="">All Cities</option>
          {cities.map(c => (
            <option key={c.city} value={c.city}>{c.city} ({c.venue_count})</option>
          ))}
        </select>

        {/* Sort */}
        <div className="flex gap-1">
          {SORTS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setParam('sortBy', opt.value)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                sortBy === opt.value
                  ? 'bg-[#00D9FF]/10 border-[#00D9FF]/30 text-[#00D9FF]'
                  : 'bg-[#111114] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {(city || q || sortBy !== 'name') && (
          <button
            onClick={() => { setSearchParams({}); setSearchInput(''); }}
            className="px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-white border border-white/[0.06] hover:border-white/20 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Count */}
      {!loading && (
        <p className="text-gray-600 text-xs mb-3">{total} venue{total !== 1 ? 's' : ''}</p>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#00D9FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : venues.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p className="text-lg font-semibold">No venues found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="border border-white/[0.07] rounded-xl overflow-hidden">
          {venues.map((venue, i) => (
            <VenueRow
              key={venue.id}
              venue={venue}
              index={(page - 1) * limit + i + 1}
              last={i === venues.length - 1}
              onClick={() => navigate(`/venues/${venue.id}`)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setParam('page', String(page - 1))}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 disabled:opacity-30 hover:border-white/20 hover:text-white transition-colors text-sm"
          >
            ← Prev
          </button>
          <span className="px-4 py-2 text-gray-500 text-sm">{page} / {totalPages}</span>
          <button
            onClick={() => setParam('page', String(page + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-lg border border-white/10 text-gray-400 disabled:opacity-30 hover:border-white/20 hover:text-white transition-colors text-sm"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function VenueRow({ venue, index, last, onClick }) {
  const rating = parseFloat(venue.avg_venue_rating);
  const hasRating = !isNaN(rating) && rating > 0;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-white/[0.04] transition-colors group ${
        !last ? 'border-b border-white/[0.06]' : ''
      }`}
    >
      {/* Index */}
      <span className="text-gray-700 text-xs w-6 text-right flex-shrink-0 tabular-nums">{index}</span>

      {/* Name + location */}
      <div className="flex-1 min-w-0">
        <span className="text-white text-sm font-medium group-hover:text-[#00D9FF] transition-colors truncate block">
          {venue.name}
        </span>
        <span className="text-gray-600 text-xs truncate block">
          {[venue.city, venue.country].filter(Boolean).join(', ')}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 flex-shrink-0 text-xs text-gray-600">
        {venue.set_count > 0 && (
          <span>{venue.set_count} set{venue.set_count !== 1 ? 's' : ''}</span>
        )}
        {hasRating ? (
          <span className="text-[#00D9FF] font-semibold tabular-nums">{rating.toFixed(1)}</span>
        ) : (
          <span className="text-gray-700 w-6"></span>
        )}
      </div>

      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700 flex-shrink-0">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </div>
  );
}
