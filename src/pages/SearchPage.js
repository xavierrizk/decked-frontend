import API_URL from '../api';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { StarDisplay } from '../components/StarRating';

const TABS = ['All', 'DJs', 'Sets', 'Users'];

function highlight(text, query) {
  if (!query || !text) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-brand-500/30 text-brand-300 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const [query, setQuery]         = useState(initialQ);
  const [tab, setTab]             = useState('All');
  const [results, setResults]     = useState({ djs: [], sets: [], users: [] });
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);
  const [showSugg, setShowSugg]   = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Recent searches from localStorage
  const getRecent = () => {
    try { return JSON.parse(localStorage.getItem('decked_recent_searches') || '[]'); }
    catch { return []; }
  };
  const saveRecent = (q) => {
    const prev = getRecent().filter(s => s !== q);
    localStorage.setItem('decked_recent_searches', JSON.stringify([q, ...prev].slice(0, 5)));
  };

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults({ djs: [], sets: [], users: [] }); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    setSearchParams({ q });
    try {
      const res = await axios.get(`${API_URL}/api/search?q=${encodeURIComponent(q)}`);
      setResults(res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [setSearchParams]);

  // Run search if there's an initial query from URL
  useEffect(() => {
    if (initialQ) doSearch(initialQ);
    inputRef.current?.focus();
  }, []); // eslint-disable-line

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSugg(false);
    if (query.trim()) { saveRecent(query.trim()); doSearch(query.trim()); }
  };

  const handleSuggClick = (label) => {
    setQuery(label);
    setShowSugg(false);
    saveRecent(label);
    doSearch(label);
  };

  const djs   = results.djs   || [];
  const sets  = results.sets  || [];
  const users = results.users || [];
  const total = djs.length + sets.length + users.length;

  const recentSearches = getRecent();

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      {/* Search bar */}
      <div className="mb-8">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-3 bg-white/[0.05] border border-white/10 focus-within:border-brand-500/60 rounded-2xl px-5 py-4 transition-all duration-200 shadow-glow-sm">
            <span className="text-gray-500 text-xl flex-shrink-0">🔍</span>
            <input
              ref={inputRef}
              value={query}
              onChange={e => { setQuery(e.target.value); setShowSugg(true); }}
              onFocus={() => setShowSugg(true)}
              onBlur={() => setTimeout(() => setShowSugg(false), 150)}
              placeholder="Search DJs, sets, users…"
              className="flex-1 bg-transparent text-white text-lg placeholder-gray-600 outline-none"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); setResults({ djs: [], sets: [], users: [] }); setSearched(false); setSearchParams({}); }}
                className="text-gray-600 hover:text-gray-400 transition-colors text-xl">×</button>
            )}
            <button type="submit"
              className="bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold px-5 py-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0">
              Search
            </button>
          </div>

          {/* Autocomplete dropdown */}
          {showSugg && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d0d0f] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-xl">
              {suggestions.map((s, i) => (
                <button key={i} onMouseDown={() => handleSuggClick(s.label)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/[0.05] transition-colors text-left">
                  <span className="text-sm">{s.type === 'dj' ? '🎧' : s.type === 'set' ? '🎵' : '👤'}</span>
                  <span className="text-white text-sm">{s.label}</span>
                  <span className="text-gray-600 text-xs ml-auto capitalize">{s.type}</span>
                </button>
              ))}
            </div>
          )}

          {/* Recent searches shown when focused + empty */}
          {showSugg && !query && recentSearches.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d0d0f] border border-white/10 rounded-2xl overflow-hidden z-50 shadow-xl">
              <p className="px-5 py-2 text-gray-600 text-xs font-semibold uppercase tracking-widest">Recent</p>
              {recentSearches.map((s, i) => (
                <button key={i} onMouseDown={() => handleSuggClick(s)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-white/[0.05] transition-colors text-left">
                  <span className="text-gray-500 text-sm">🕐</span>
                  <span className="text-gray-300 text-sm">{s}</span>
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* Results count + tabs */}
      {searched && !loading && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <p className="text-gray-500 text-sm">
            {total === 0
              ? `No results for "${query}"`
              : `Found ${total} result${total !== 1 ? 's' : ''} for "${query}"`}
          </p>
          <div className="flex gap-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  tab === t ? 'bg-brand-600 text-white' : 'text-gray-500 hover:text-white'
                }`}>
                {t}
                {t === 'DJs'   && djs.length   > 0 && <span className="ml-1 text-xs opacity-60">({djs.length})</span>}
                {t === 'Sets'  && sets.length  > 0 && <span className="ml-1 text-xs opacity-60">({sets.length})</span>}
                {t === 'Users' && users.length > 0 && <span className="ml-1 text-xs opacity-60">({users.length})</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4 animate-pulse">
              <div className="h-4 bg-white/[0.05] rounded w-1/3 mb-2" />
              <div className="h-3 bg-white/[0.04] rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Empty / no search yet */}
      {!loading && !searched && (
        <div className="text-center py-20 text-gray-600">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-semibold text-gray-500">Search Decked</p>
          <p className="text-sm mt-1">Find DJs, sets, and users</p>
        </div>
      )}

      {!loading && searched && total === 0 && (
        <div className="text-center py-20 border border-white/[0.05] rounded-2xl text-gray-600">
          <p className="text-4xl mb-3">😶</p>
          <p className="font-semibold text-gray-500">No results for "{query}"</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      )}

      {/* Results */}
      {!loading && searched && total > 0 && (
        <div className="space-y-8">
          {/* DJs */}
          {(tab === 'All' || tab === 'DJs') && djs.length > 0 && (
            <section>
              {tab === 'All' && <SectionLabel>🎧 DJs ({djs.length})</SectionLabel>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {djs.map(dj => (
                  <Link key={dj.id} to={`/dj/${dj.id}`}
                    className="group flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-brand-500/30 rounded-2xl p-4 transition-all duration-200">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-xl flex-shrink-0">🎧</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-white font-bold text-sm group-hover:text-brand-400 transition-colors truncate">{highlight(dj.name, query)}</p>
                        {dj.verified && <span className="text-xs">✅</span>}
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5 truncate">{dj.bio || 'No bio'}</p>
                      <p className="text-gray-600 text-xs mt-0.5">👥 {dj.follower_count} followers{dj.avg_rating ? ` · ⭐ ${dj.avg_rating}` : ''}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Sets */}
          {(tab === 'All' || tab === 'Sets') && sets.length > 0 && (
            <section>
              {tab === 'All' && <SectionLabel>🎵 Sets ({sets.length})</SectionLabel>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sets.map(set => (
                  <Link key={set.id} to={`/set/${set.id}`}
                    className="group bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-brand-500/30 rounded-2xl p-4 transition-all duration-200">
                    <p className="text-white font-bold text-sm group-hover:text-brand-400 transition-colors">{highlight(set.title, query)}</p>
                    <p className="text-brand-400 text-xs mt-0.5">{set.dj_name}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      {set.location && <span>📍 {set.location}</span>}
                      {set.genre    && <span>🎵 {set.genre}</span>}
                      <span>❤️ {set.like_count}</span>
                      {set.avg_rating && <span>⭐ {set.avg_rating}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Users */}
          {(tab === 'All' || tab === 'Users') && users.length > 0 && (
            <section>
              {tab === 'All' && <SectionLabel>👤 Users ({users.length})</SectionLabel>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {users.map(u => (
                  <Link key={u.id} to={`/profile/${u.id}`}
                    className="group flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-brand-500/30 rounded-2xl p-4 transition-all duration-200">
                    {u.profile_picture_url
                      ? <img src={u.profile_picture_url} alt={u.username} className="w-10 h-10 rounded-full object-cover border border-white/10 flex-shrink-0" />
                      : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">{u.username?.[0]?.toUpperCase()}</div>
                    }
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-white font-bold text-sm group-hover:text-brand-400 transition-colors">{highlight(u.username, query)}</p>
                        {u.is_dj && <span className="text-xs">🎵</span>}
                      </div>
                      {u.location && <p className="text-gray-500 text-xs mt-0.5">📍 {u.location}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }) {
  return <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest mb-3">{children}</p>;
}
