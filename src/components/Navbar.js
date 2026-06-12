import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import { getCurrentUserId, getIsAdmin } from '../utils/auth';

const NAV_LINKS = [
  { to: '/discover', label: 'Discover', icon: '🧭' },
  { to: '/trending', label: 'Trending', icon: '🔥' },
  { to: '/help',     label: 'Help',     icon: '❓' },
];

const AUTH_LINKS = [
  { to: '/feed',      label: 'Feed',    icon: '📰' },
  { to: '/my-djs',   label: 'My DJs',  icon: '🎧' },
  { to: '/create-set', label: 'Add Set', icon: '+' },
];

function NavIconBtn({ to, label, icon, badge, className = '' }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      title={label}
      aria-label={label}
      className={`relative flex items-center justify-center w-8 h-8 rounded transition-all duration-150 group
        ${active ? 'text-white bg-white/10' : 'text-gray-500 hover:text-white hover:bg-white/[0.06]'}
        ${className}`}
    >
      <span className="text-base leading-none select-none">{icon}</span>
      {badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
      {/* Tooltip */}
      <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-0.5 text-[10px] font-semibold text-white bg-black/90 border border-white/10 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
        {label}
      </span>
    </Link>
  );
}

export default function Navbar({ isLoggedIn, onLogout }) {
  const userId  = getCurrentUserId();
  const isAdmin = getIsAdmin();
  const [unread, setUnread]           = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg]       = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const debounceRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) return;
    const token = localStorage.getItem('token');
    const fetchUnread = () =>
      axios.get(`${API_URL}/api/notifications/unread-count`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => setUnread(r.data.count))
        .catch(() => {});
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (searchQuery.length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_URL}/api/search/autocomplete?q=${encodeURIComponent(searchQuery)}`);
        setSuggestions(res.data);
      } catch {}
    }, 250);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setShowSugg(false);
    setSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
  };

  const handleSuggClick = (s) => {
    setShowSugg(false);
    setSearchOpen(false);
    setSearchQuery('');
    if (s.type === 'dj')   navigate(`/dj/${s.id}`);
    if (s.type === 'set')  navigate(`/set/${s.id}`);
    if (s.type === 'user') navigate(`/profile/${s.id}`);
  };

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  return (
    <nav className="relative z-20 border-b border-white/[0.06] bg-black/70 backdrop-blur-md" style={{ height: '44px' }}>
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center gap-3">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5 group flex-shrink-0 mr-1">
          <div className="relative w-5 h-5 flex-shrink-0">
            <div className="absolute inset-0 rounded-full opacity-90" style={{ background: 'linear-gradient(135deg, #A855F7, #00D9FF)' }} />
            <div className="absolute inset-[3px] rounded-full bg-[#0a0a0a]" />
            <div className="absolute inset-[6.5px] rounded-full opacity-80" style={{ background: 'linear-gradient(135deg, #A855F7, #00D9FF)' }} />
            <div className="absolute inset-[8.5px] rounded-full bg-[#0a0a0a]" />
          </div>
          <span
            className="text-sm font-bold tracking-tight leading-none"
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              background: 'linear-gradient(135deg, #F5F5F5, #A855F7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            DECKED
          </span>
        </Link>

        {/* Divider */}
        <div className="w-px h-5 bg-white/[0.08] flex-shrink-0 hidden sm:block" />

        {/* Nav icon buttons */}
        <div className="hidden sm:flex items-center gap-0.5 flex-shrink-0">
          {NAV_LINKS.map(l => <NavIconBtn key={l.to} {...l} />)}
          {isLoggedIn && AUTH_LINKS.map(l => <NavIconBtn key={l.to} {...l} />)}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-white/[0.08] flex-shrink-0 hidden sm:block" />

        {/* Search — expands inline */}
        <div className="flex-1 relative hidden sm:block" style={{ maxWidth: '280px' }}>
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white/[0.07] border border-purple-500/30 rounded px-2.5 py-1 transition-all duration-200">
              <span className="text-gray-500 text-xs">🔍</span>
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSugg(true); }}
                onBlur={() => { setTimeout(() => { setShowSugg(false); if (!searchQuery) setSearchOpen(false); }, 150); }}
                placeholder="Search DJs, sets…"
                className="flex-1 bg-transparent text-white text-sm placeholder-gray-600 outline-none"
              />
              <button type="button" onClick={() => { setSearchOpen(false); setSearchQuery(''); setSuggestions([]); }}
                className="text-gray-600 hover:text-white text-xs transition-colors">✕</button>
            </form>
          ) : (
            <button onClick={openSearch}
              className="flex items-center gap-2 w-full bg-white/[0.04] border border-white/[0.06] hover:border-white/10 rounded px-2.5 py-1 text-gray-600 hover:text-gray-400 text-sm transition-all duration-200">
              <span className="text-xs">🔍</span>
              <span className="text-xs">Search…</span>
            </button>
          )}

          {/* Autocomplete */}
          {showSugg && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#0d0d0f] border border-white/10 rounded overflow-hidden z-50 shadow-xl">
              {suggestions.map((s, i) => (
                <button key={i} onMouseDown={() => handleSuggClick(s)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/[0.05] transition-colors text-left">
                  <span className="text-xs">{s.type === 'dj' ? '🎧' : s.type === 'set' ? '🎵' : '👤'}</span>
                  <span className="text-white text-xs truncate">{s.label}</span>
                  <span className="text-gray-600 text-[10px] ml-auto capitalize flex-shrink-0">{s.type}</span>
                </button>
              ))}
              <button onMouseDown={() => { navigate(`/search?q=${encodeURIComponent(searchQuery)}`); setSearchQuery(''); setShowSugg(false); setSearchOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 border-t border-white/[0.06] hover:bg-white/[0.05] transition-colors text-left">
                <span className="text-gray-500 text-xs">🔍</span>
                <span className="text-gray-400 text-xs">All results for "{searchQuery}"</span>
              </button>
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Mobile search */}
          <Link to="/search" className="sm:hidden flex items-center justify-center w-8 h-8 text-gray-500 hover:text-white transition-colors">
            <span className="text-sm">🔍</span>
          </Link>

          {isLoggedIn ? (
            <>
              <NavIconBtn to="/notifications" label="Notifications" icon="🔔" badge={unread} />
              {userId && <NavIconBtn to={`/profile/${userId}`} label="Profile" icon="👤" />}
              {isAdmin && (
                <Link to="/admin" title="Admin" aria-label="Admin"
                  className="flex items-center justify-center w-8 h-8 rounded bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-all duration-150 ml-0.5">
                  <span className="text-xs">⚙️</span>
                </Link>
              )}
              <button onClick={onLogout} title="Logout"
                className="flex items-center justify-center h-7 px-2.5 rounded border border-white/[0.08] text-gray-500 hover:border-white/20 hover:text-white text-xs font-medium transition-all duration-150 ml-0.5">
                Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                className="flex items-center h-7 px-3 text-gray-400 hover:text-white text-xs font-medium transition-colors">
                Login
              </Link>
              <Link to="/signup"
                className="flex items-center h-7 px-3 rounded bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-all duration-150 hover:scale-105 active:scale-95">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
