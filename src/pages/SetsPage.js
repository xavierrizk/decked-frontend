import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import SetCard from '../components/cards/SetCard';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest'      },
  { value: 'oldest',     label: 'Oldest'      },
  { value: 'top_rated',  label: 'Top Rated'   },
  { value: 'most_rated', label: 'Most Rated'  },
  { value: 'most_liked', label: 'Most Liked'  },
];

const GENRE_OPTIONS = [
  'Techno', 'Tech House', 'House', 'Drum and Bass', 'Trance',
  'Dubstep', 'EDM', 'Garage', 'Afrobeats', 'Hip-Hop', 'Electronica',
];

const TYPE_OPTIONS = [
  { value: 'dj_set',       label: 'DJ Set'    },
  { value: 'concert',      label: 'Concert'   },
  { value: 'festival_set', label: 'Festival'  },
  { value: 'live_band',    label: 'Live Band' },
  { value: 'rave',         label: 'Rave'      },
];

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 whitespace-nowrap ${
        active
          ? 'bg-[#00D9FF] text-[#0a0a0a]'
          : 'bg-white/[0.06] text-gray-400 hover:text-white hover:bg-white/10 border border-white/[0.08]'
      }`}
    >
      {label}
    </button>
  );
}

export default function SetsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sets, setSets]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState(searchParams.get('q') || '');
  const [sort, setSort]       = useState(searchParams.get('sort') || 'newest');
  const [genre, setGenre]     = useState(searchParams.get('genre') || '');
  const [type, setType]       = useState(searchParams.get('type') || '');
  const debounceRef = useRef(null);

  const fetchSets = useCallback(async (params) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (params.sort)  query.set('sort',  params.sort);
      if (params.genre) query.set('genre', params.genre);
      if (params.type)  query.set('type',  params.type);
      if (params.search) query.set('search', params.search);
      const res = await axios.get(`${API_URL}/api/sets?${query}`);
      setSets(res.data);
    } catch {}
    setLoading(false);
  }, []);

  // Sync URL params and fetch
  useEffect(() => {
    const p = {};
    if (sort)  p.sort  = sort;
    if (genre) p.genre = genre;
    if (type)  p.type  = type;
    if (search) p.q    = search;
    setSearchParams(p, { replace: true });

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSets({ sort, genre, type, search });
    }, search ? 300 : 0);
  }, [sort, genre, type, search]); // eslint-disable-line

  const toggleGenre = (g) => setGenre(prev => prev === g ? '' : g);
  const toggleType  = (t) => setType(prev => prev === t ? '' : t);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1
          className="text-3xl font-black text-white mb-1"
          style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '-0.02em' }}
        >
          Sets
        </h1>
        <p className="text-gray-500 text-sm">
          {loading ? 'Loading…' : `${sets.length} sets`}
        </p>
      </div>

      {/* Search + Sort row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search sets or artists…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white/[0.05] border border-white/[0.1] rounded-lg text-sm text-white placeholder-gray-600 outline-none focus:border-[#00D9FF]/40 transition-colors"
          />
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-gray-600 text-xs uppercase tracking-wider hidden sm:block">Sort</span>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-white/[0.06] border border-white/[0.1] text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:border-[#00D9FF]/40 transition-colors cursor-pointer"
            style={{ colorScheme: 'dark' }}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="text-gray-600 text-xs self-center mr-1 uppercase tracking-wider hidden sm:block">Type</span>
        {TYPE_OPTIONS.map(t => (
          <FilterChip key={t.value} label={t.label} active={type === t.value} onClick={() => toggleType(t.value)} />
        ))}
      </div>

      {/* Genre filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <span className="text-gray-600 text-xs self-center mr-1 uppercase tracking-wider hidden sm:block">Genre</span>
        {GENRE_OPTIONS.map(g => (
          <FilterChip key={g} label={g} active={genre === g} onClick={() => toggleGenre(g)} />
        ))}
        {(genre || type || search) && (
          <button
            onClick={() => { setGenre(''); setType(''); setSearch(''); }}
            className="px-3 py-1.5 rounded-full text-xs font-semibold text-gray-500 hover:text-white transition-colors"
          >
            Clear all ✕
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-28">
          <div className="w-8 h-8 border-2 border-[#00D9FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sets.length === 0 ? (
        <div className="text-center py-24 border border-white/[0.05] rounded-2xl">
          <p className="text-4xl mb-3">🎵</p>
          <p className="text-gray-500">No sets found</p>
          {(genre || type || search) && (
            <button onClick={() => { setGenre(''); setType(''); setSearch(''); }} className="mt-3 text-[#00D9FF] text-sm hover:underline">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {sets.map((set, i) => (
            <SetCard key={set.id} set={set} />
          ))}
        </div>
      )}
    </div>
  );
}
