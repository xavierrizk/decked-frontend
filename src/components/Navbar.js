import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import { getCurrentUserId, getIsAdmin, getCurrentUsername } from '../utils/auth';
import ProfileDropdown from './ProfileDropdown';

const NAV_LINKS = [
  { to: '/discover',   label: 'DISCOVER'   },
  { to: '/sets',       label: 'SETS'        },
  { to: '/reviews',    label: 'REVIEWS'     },
  { to: '/artists',    label: 'ARTISTS'     },
  { to: '/venues',     label: 'VENUES'      },
  { to: '/trending',   label: 'TRENDING'    },
  { to: '/community',  label: 'COMMUNITY'   },
  { to: '/friends',    label: 'FRIENDS'     },
];

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const BellIcon = ({ badge }) => (
  <span className="relative">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
    {badge > 0 && (
      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FF006E] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
        {badge > 9 ? '9+' : badge}
      </span>
    )}
  </span>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

function NavLink({ to, label }) {
  const location = useLocation();
  const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  return (
    <Link
      to={to}
      className={`text-[11px] font-bold tracking-[0.12em] transition-colors duration-150 whitespace-nowrap ${
        active ? 'text-[#00D9FF]' : 'text-[#8a8f97] hover:text-[#F5F5F5]'
      }`}
      style={{ fontFamily: '"Space Grotesk", sans-serif' }}
    >
      {label}
    </Link>
  );
}

export default function Navbar({ isLoggedIn, onLogout }) {
  const userId   = getCurrentUserId();
  const isAdmin  = getIsAdmin();
  const username = getCurrentUsername();
  const [unread, setUnread]           = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg]       = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const debounceRef    = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

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
    if (s.type === 'dj')   navigate(`/artist/${s.id}`);
    if (s.type === 'set')  navigate(`/set/${s.id}`);
    if (s.type === 'user') navigate(`/profile/${s.id}`);
  };

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSuggestions([]);
  };

  return (
    <>
      <nav
        className="relative z-20 border-b border-white/[0.06] backdrop-blur-md"
        style={{ height: '60px', background: '#0a0a0a' }}
      >
        <div className="max-w-7xl mx-auto px-5 h-full flex items-center gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="relative w-6 h-6 flex-shrink-0">
              <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(135deg, #5A6470, #00D9FF)' }} />
              <div className="absolute inset-[3.5px] rounded-full bg-[#0a0a0a]" />
              <div className="absolute inset-[7px] rounded-full" style={{ background: 'linear-gradient(135deg, #00D9FF, #FF006E)' }} />
              <div className="absolute inset-[9.5px] rounded-full bg-[#0a0a0a]" />
            </div>
            <span
              className="text-sm font-black tracking-tight leading-none"
              style={{
                fontFamily: '"Space Grotesk", sans-serif',
                background: 'linear-gradient(135deg, #F5F5F5 30%, #00D9FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              DECK&apos;D
            </span>
          </Link>

          {/* Divider */}
          <div className="w-px h-4 bg-white/[0.1] flex-shrink-0 hidden lg:block" />

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-5">
            {NAV_LINKS.map(l => <NavLink key={l.to} {...l} />)}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search */}
          <div className="relative hidden sm:block">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2 border border-[#00D9FF]/40 rounded-md px-3 py-1.5 bg-white/[0.05] transition-all duration-200" style={{ minWidth: '220px' }}>
                <SearchIcon />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setShowSugg(true); }}
                  onBlur={() => { setTimeout(() => { setShowSugg(false); if (!searchQuery) closeSearch(); }, 150); }}
                  placeholder="Search artists, sets…"
                  className="flex-1 bg-transparent text-white text-sm placeholder-gray-600 outline-none"
                />
                <button type="button" onClick={closeSearch} className="text-gray-600 hover:text-white transition-colors">
                  <CloseIcon />
                </button>
              </form>
            ) : (
              <button
                onClick={openSearch}
                className="flex items-center justify-center w-8 h-8 text-[#8a8f97] hover:text-[#F5F5F5] transition-colors duration-150"
                aria-label="Search"
              >
                <SearchIcon />
              </button>
            )}

            {/* Autocomplete dropdown */}
            {showSugg && suggestions.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-[#0d0d0f] border border-white/10 rounded-lg overflow-hidden z-50 shadow-2xl">
                {suggestions.map((s, i) => (
                  <button key={i} onMouseDown={() => handleSuggClick(s)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/[0.05] transition-colors text-left">
                    <span className="text-xs text-gray-500">{s.type === 'dj' ? '🎧' : s.type === 'set' ? '🎵' : '👤'}</span>
                    <span className="text-white text-sm truncate">{s.label}</span>
                    <span className="text-gray-600 text-[10px] ml-auto capitalize flex-shrink-0">{s.type}</span>
                  </button>
                ))}
                <button
                  onMouseDown={() => { navigate(`/search?q=${encodeURIComponent(searchQuery)}`); setSearchQuery(''); setShowSugg(false); closeSearch(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 border-t border-white/[0.06] hover:bg-white/[0.05] transition-colors text-left"
                >
                  <SearchIcon />
                  <span className="text-gray-400 text-xs">All results for "{searchQuery}"</span>
                </button>
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Link
                  to="/create-set"
                  className="hidden sm:flex items-center gap-1.5 h-7 px-3 rounded text-[11px] font-bold tracking-[0.08em] transition-all duration-150 hover:opacity-90 active:scale-95 flex-shrink-0"
                  style={{ background: '#FF006E', color: '#fff', fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  + Add Set
                </Link>
                <Link
                  to="/notifications"
                  className="flex items-center justify-center w-8 h-8 text-[#8a8f97] hover:text-[#F5F5F5] transition-colors duration-150"
                  aria-label="Notifications"
                >
                  <BellIcon badge={unread} />
                </Link>
                <ProfileDropdown
                  userId={userId}
                  username={username}
                  isAdmin={isAdmin}
                  onLogout={onLogout}
                />
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-[11px] font-bold tracking-[0.1em] text-[#8a8f97] hover:text-[#F5F5F5] transition-colors duration-150"
                  style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  LOG IN
                </Link>
                <Link
                  to="/signup"
                  className="text-[11px] font-bold tracking-[0.1em] px-3 py-1.5 rounded transition-all duration-150 hover:opacity-90 active:scale-95"
                  style={{ background: '#00D9FF', color: '#0a0a0a', fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  SIGN UP
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              className="lg:hidden flex items-center justify-center w-8 h-8 text-[#8a8f97] hover:text-[#F5F5F5] transition-colors duration-150"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[19] bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu drawer */}
      <div
        className={`lg:hidden fixed top-[60px] left-0 right-0 z-[20] border-b border-white/[0.08] transition-all duration-200 ${
          mobileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
        style={{ background: '#0a0a0a' }}
      >
        <div className="px-5 py-4 flex flex-col gap-1">
          {/* Search on mobile */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 border border-white/[0.1] rounded-md px-3 py-2 mb-3 bg-white/[0.04]">
            <SearchIcon />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search artists, sets…"
              className="flex-1 bg-transparent text-white text-sm placeholder-gray-600 outline-none"
            />
          </form>

          {NAV_LINKS.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className="text-[12px] font-bold tracking-[0.12em] text-[#8a8f97] hover:text-[#00D9FF] py-2.5 border-b border-white/[0.04] transition-colors duration-150"
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            >
              {l.label}
            </Link>
          ))}

          {isLoggedIn && (
            <Link
              to="/create-set"
              className="mt-2 block text-center text-[11px] font-bold tracking-[0.1em] py-2.5 rounded transition-opacity hover:opacity-90"
              style={{ background: '#FF006E', color: '#fff', fontFamily: '"Space Grotesk", sans-serif' }}
            >
              + ADD SET
            </Link>
          )}

          {!isLoggedIn && (
            <div className="flex gap-3 pt-3">
              <Link to="/login" className="flex-1 text-center text-[11px] font-bold tracking-[0.1em] py-2 border border-white/20 rounded text-[#8a8f97] hover:text-white hover:border-white/40 transition-colors"
                style={{ fontFamily: '"Space Grotesk", sans-serif' }}>LOG IN</Link>
              <Link to="/signup" className="flex-1 text-center text-[11px] font-bold tracking-[0.1em] py-2 rounded transition-opacity hover:opacity-90"
                style={{ background: '#00D9FF', color: '#0a0a0a', fontFamily: '"Space Grotesk", sans-serif' }}>SIGN UP</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
