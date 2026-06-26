import API_URL from '../api';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ArtistCard from '../components/cards/DJCard';
import SetCard from '../components/cards/SetCard';
import UserCard from '../components/cards/UserCard';

const TABS = ['All', 'Sets', 'Artists', 'Users'];

const SORT_OPTIONS = [
  { value: 'relevant',   label: 'Most Relevant' },
  { value: 'newest',     label: 'Newest' },
  { value: 'top_rated',  label: 'Top Rated' },
  { value: 'most_liked', label: 'Most Liked' },
];

function FilterSelect({ label, value, onChange, options, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-white/[0.04] border border-white/10 focus:border-[#00D9FF]/50 rounded-lg px-3 py-2 text-sm text-white outline-none appearance-none cursor-pointer transition-colors"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
      >
        <option value="">{placeholder}</option>
        {options.map(o => (
          <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
        ))}
      </select>
    </div>
  );
}

function FilterInput({ label, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-white/[0.04] border border-white/10 focus:border-[#00D9FF]/50 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none transition-colors"
      />
    </div>
  );
}

const getRecent = () => {
  try { return JSON.parse(localStorage.getItem('decked_recent_searches') || '[]'); }
  catch { return []; }
};
const saveRecent = (q) => {
  const prev = getRecent().filter(s => s !== q);
  localStorage.setItem('decked_recent_searches', JSON.stringify([q, ...prev].slice(0, 5)));
};

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery]           = useState(searchParams.get('q') || '');
  const [tab, setTab]               = useState('All');
  const [genre, setGenre]           = useState(searchParams.get('genre') || '');
  const [city, setCity]             = useState(searchParams.get('city') || '');
  const [year, setYear]             = useState(searchParams.get('year') || '');
  const [sort, setSort]             = useState('relevant');
  const [showFilters, setShowFilters] = useState(false);

  const [allResults, setAllResults] = useState({ artistProfiles: [], sets: [], users: [] });
  const [setResults, setSetResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [genres, setGenres]         = useState([]);
  const [loading, setLoading]       = useState(false);
  const [setsLoading, setSetsLoading] = useState(false);
  const [searched, setSearched]     = useState(false);
  const [showSugg, setShowSugg]     = useState(false);

  const inputRef    = useRef(null);
  const debounceRef = useRef(null);
  const filterDebounce = useRef(null);

  // Load genres for dropdown
  useEffect(() => {
    axios.get(`${API_URL}/api/search/genres`).then(r => setGenres(r.data)).catch(() => {});
    inputRef.current?.focus();
    if (searchParams.get('q') || searchParams.get('genre') || searchParams.get('city')) {
      runAllSearch(searchParams.get('q') || '');
      runSetSearch(searchParams.get('q') || '', searchParams.get('genre') || '', searchParams.get('city') || '', '', 'relevant');
    }
  }, []); // eslint-disable-line

  const runAllSearch = useCallback(async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await axios.get(`${API_URL}/api/search?q=${encodeURIComponent(q)}`);
      setAllResults(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  const runSetSearch = useCallback(async (q, g, c, y, s) => {
    setSetsLoading(true);
    setSearched(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (g) params.set('genre', g);
    if (c) params.set('city', c);
    if (y) params.set('year', y);
    if (s) params.set('sort', s);
    try {
      const res = await axios.get(`${API_URL}/api/search/sets?${params}`);
      setSetResults(res.data);
    } catch (err) { console.error(err); }
    setSetsLoading(false);
  }, []);

  // Debounced autocomplete
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_URL}/api/search/autocomplete?q=${encodeURIComponent(query)}`);
        setSuggestions(res.data);
      } catch {}
    }, 250);
  }, [query]);

  // Re-run set search when filters change
  useEffect(() => {
    clearTimeout(filterDebounce.current);
    filterDebounce.current = setTimeout(() => {
      if (query || genre || city || year) {
        runSetSearch(query, genre, city, year, sort);
        const p = {};
        if (query) p.q = query;
        if (genre) p.genre = genre;
        if (city)  p.city = city;
        if (year)  p.year = year;
        setSearchParams(p);
      }
    }, 300);
  }, [genre, city, year, sort]); // eslint-disable-line

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSugg(false);
    if (query.trim()) {
      saveRecent(query.trim());
      runAllSearch(query.trim());
      runSetSearch(query.trim(), genre, city, year, sort);
      const p = { q: query.trim() };
      if (genre) p.genre = genre;
      if (city)  p.city = city;
      setSearchParams(p);
    }
  };

  const handleSuggClick = (label) => {
    setQuery(label);
    setShowSugg(false);
    saveRecent(label);
    runAllSearch(label);
    runSetSearch(label, genre, city, year, sort);
    setSearchParams({ q: label });
  };

  const clearAll = () => {
    setQuery(''); setGenre(''); setCity(''); setYear('');
    setAllResults({ artistProfiles: [], sets: [], users: [] });
    setSetResults([]);
    setSearched(false);
    setSearchParams({});
  };

  const hasFilters = genre || city || year;
  const artistProfiles = allResults.artistProfiles || [];
  const users          = allResults.users          || [];
  const displaySets    = tab === 'Sets' || hasFilters ? setResults : (allResults.sets || []);
  const total = artistProfiles.length + (allResults.sets || []).length + users.length;
  const recentSearches = getRecent();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* Search bar */}
      <div className="mb-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 focus-within:border-[#00D9FF]/40 rounded-xl px-4 py-3 transition-all duration-200">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={e => { setQuery(e.target.value); setShowSugg(true); }}
              onFocus={() => setShowSugg(true)}
              onBlur={() => setTimeout(() => setShowSugg(false), 150)}
              placeholder="Search artists, sets, users, genre, city…"
              className="flex-1 bg-transparent text-white text-base placeholder-gray-600 outline-none"
            />
            {(query || hasFilters) && (
              <button type="button" onClick={clearAll} className="text-gray-600 hover:text-gray-400 transition-colors text-lg leading-none">×</button>
            )}
            <button
              type="button"
              onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                showFilters || hasFilters
                  ? 'bg-[#00D9FF]/10 border-[#00D9FF]/30 text-[#00D9FF]'
                  : 'border-white/10 text-gray-500 hover:text-white hover:border-white/20'
              }`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
              Filters{hasFilters ? ` (${[genre, city, year].filter(Boolean).length})` : ''}
            </button>
            <button type="submit"
              className="text-white text-sm font-bold px-4 py-1.5 rounded-lg transition-all hover:opacity-90 active:scale-[0.98] flex-shrink-0"
              style={{ background: '#00D9FF', color: '#0a0a0a' }}>
              Search
            </button>
          </div>

          {/* Autocomplete */}
          {showSugg && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#111114] border border-white/10 rounded-xl overflow-hidden z-50 shadow-xl">
              {suggestions.map((s, i) => (
                <button key={i} onMouseDown={() => handleSuggClick(s.label)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.05] transition-colors text-left">
                  <span className="text-gray-500 text-xs">{s.type === 'dj' ? '🎧' : s.type === 'set' ? '♪' : '👤'}</span>
                  <span className="text-white text-sm">{s.label}</span>
                  <span className="text-gray-600 text-xs ml-auto capitalize">{s.type}</span>
                </button>
              ))}
            </div>
          )}

          {showSugg && !query && recentSearches.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#111114] border border-white/10 rounded-xl overflow-hidden z-50 shadow-xl">
              <p className="px-4 py-2 text-gray-600 text-[10px] font-bold uppercase tracking-widest">Recent</p>
              {recentSearches.map((s, i) => (
                <button key={i} onMouseDown={() => handleSuggClick(s)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.05] transition-colors text-left">
                  <span className="text-gray-500 text-xs">↩</span>
                  <span className="text-gray-300 text-sm">{s}</span>
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 mb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <FilterSelect
              label="Genre"
              value={genre}
              onChange={setGenre}
              placeholder="All genres"
              options={genres}
            />
            <FilterInput
              label="City"
              value={city}
              onChange={setCity}
              placeholder="e.g. Berlin"
            />
            <FilterInput
              label="Year"
              value={year}
              onChange={setYear}
              placeholder="e.g. 2023"
            />
            <FilterSelect
              label="Sort by"
              value={sort}
              onChange={setSort}
              placeholder=""
              options={SORT_OPTIONS}
            />
          </div>
          {hasFilters && (
            <button onClick={() => { setGenre(''); setCity(''); setYear(''); }}
              className="mt-3 text-xs text-gray-600 hover:text-red-400 transition-colors">
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Tabs — only show when we have all-result data */}
      {searched && !loading && !hasFilters && (
        <div className="flex items-center justify-between mb-5">
          <p className="text-gray-600 text-sm">
            {total > 0 ? `${total} result${total !== 1 ? 's' : ''}` : `No results for "${query}"`}
          </p>
          <div className="flex gap-1">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tab === t
                    ? 'bg-[#00D9FF]/10 text-[#00D9FF] border border-[#00D9FF]/30'
                    : 'text-gray-500 hover:text-white border border-transparent'
                }`}>
                {t}
                {t === 'Sets'    && (allResults.sets||[]).length > 0    && <span className="ml-1 opacity-50">({(allResults.sets||[]).length})</span>}
                {t === 'Artists' && artistProfiles.length > 0           && <span className="ml-1 opacity-50">({artistProfiles.length})</span>}
                {t === 'Users'   && users.length > 0                    && <span className="ml-1 opacity-50">({users.length})</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter mode label */}
      {searched && hasFilters && !setsLoading && (
        <p className="text-gray-600 text-sm mb-5">
          {setResults.length > 0 ? `${setResults.length} set${setResults.length !== 1 ? 's' : ''} found` : 'No sets match these filters'}
        </p>
      )}

      {/* Loading */}
      {(loading || setsLoading) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.05] rounded-xl h-32 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !setsLoading && !searched && (
        <div className="text-center py-20 text-gray-600">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" className="mx-auto mb-4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <p className="text-gray-500 font-medium mb-1">Search DECK'D</p>
          <p className="text-sm">Find sets by genre, city, artist, or year</p>
        </div>
      )}

      {!loading && !setsLoading && searched && !hasFilters && total === 0 && (
        <div className="text-center py-16 border border-white/[0.05] rounded-xl text-gray-600">
          <p className="text-3xl mb-3">😶</p>
          <p className="font-medium text-gray-500">No results for "{query}"</p>
          <p className="text-sm mt-1">Try a different term or use filters to browse</p>
        </div>
      )}

      {!loading && !setsLoading && searched && hasFilters && setResults.length === 0 && (
        <div className="text-center py-16 border border-white/[0.05] rounded-xl text-gray-600">
          <p className="text-3xl mb-3">🎛️</p>
          <p className="font-medium text-gray-500">No sets match these filters</p>
          <button onClick={() => { setGenre(''); setCity(''); setYear(''); }} className="text-sm text-[#00D9FF] mt-2">Clear filters</button>
        </div>
      )}

      {/* Results */}
      {!loading && !setsLoading && searched && (
        <div className="space-y-8">
          {/* Filter mode: show only sets */}
          {hasFilters && setResults.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {setResults.map(set => <SetCard key={set.id} set={set} />)}
            </div>
          )}

          {/* Normal search mode */}
          {!hasFilters && (
            <>
              {/* Sets */}
              {(tab === 'All' || tab === 'Sets') && (allResults.sets||[]).length > 0 && (
                <section>
                  {tab === 'All' && <SectionLabel>Sets</SectionLabel>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(allResults.sets||[]).map(set => <SetCard key={set.id} set={set} />)}
                  </div>
                </section>
              )}

              {/* Artists */}
              {(tab === 'All' || tab === 'Artists') && artistProfiles.length > 0 && (
                <section>
                  {tab === 'All' && <SectionLabel>Artists</SectionLabel>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {artistProfiles.map(dj => <ArtistCard key={dj.id} dj={dj} showFollow={false} />)}
                  </div>
                </section>
              )}

              {/* Users */}
              {(tab === 'All' || tab === 'Users') && users.length > 0 && (
                <section>
                  {tab === 'All' && <SectionLabel>Users</SectionLabel>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.map(u => <UserCard key={u.id} user={u} />)}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-3">{children}</p>;
}
