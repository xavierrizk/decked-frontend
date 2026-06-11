import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import { getCurrentUserId } from '../utils/auth';

export default function Navbar({ isLoggedIn, onLogout }) {
  const userId                        = getCurrentUserId();
  const [unread, setUnread]           = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg]       = useState(false);
  const debounceRef = useRef(null);
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

  // Autocomplete on navbar search
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
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery('');
  };

  const handleSuggClick = (s) => {
    setShowSugg(false);
    setSearchQuery('');
    if (s.type === 'dj')   navigate(`/dj/${s.id}`);
    if (s.type === 'set')  navigate(`/set/${s.id}`);
    if (s.type === 'user') navigate(`/profile/${s.id}`);
  };

  return (
    <nav className="relative z-20 border-b border-white/5 bg-black/60 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="text-white text-xl font-extrabold tracking-tight hover:text-brand-400 transition-colors duration-200 flex-shrink-0">
          🎛️ Decked
        </Link>

        {/* Nav links */}
        <div className="hidden sm:flex items-center gap-5 flex-shrink-0">
          <Link to="/discover" className="text-gray-500 hover:text-white text-sm font-medium transition-colors duration-200">Discover</Link>
          <Link to="/trending" className="text-gray-500 hover:text-white text-sm font-medium transition-colors duration-200">Trending</Link>
          {isLoggedIn && (
            <Link to="/feed" className="text-gray-500 hover:text-white text-sm font-medium transition-colors duration-200">Feed</Link>
          )}
        </div>

        {/* Search bar — grows to fill space */}
        <div className="flex-1 relative max-w-xs hidden sm:block">
          <form onSubmit={handleSearch}>
            <div className="flex items-center gap-2 bg-white/[0.05] border border-white/[0.07] focus-within:border-brand-500/50 rounded-xl px-3 py-1.5 transition-all duration-200">
              <span className="text-gray-600 text-sm">🔍</span>
              <input
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSugg(true); }}
                onFocus={() => setShowSugg(true)}
                onBlur={() => setTimeout(() => setShowSugg(false), 150)}
                placeholder="Search…"
                className="flex-1 bg-transparent text-white text-sm placeholder-gray-600 outline-none w-full"
              />
            </div>
          </form>

          {/* Autocomplete */}
          {showSugg && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0d0d0f] border border-white/10 rounded-xl overflow-hidden z-50 shadow-xl">
              {suggestions.map((s, i) => (
                <button key={i} onMouseDown={() => handleSuggClick(s)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/[0.05] transition-colors text-left">
                  <span className="text-sm">{s.type === 'dj' ? '🎧' : s.type === 'set' ? '🎵' : '👤'}</span>
                  <span className="text-white text-sm truncate">{s.label}</span>
                  <span className="text-gray-600 text-xs ml-auto capitalize flex-shrink-0">{s.type}</span>
                </button>
              ))}
              <button onMouseDown={() => { navigate(`/search?q=${encodeURIComponent(searchQuery)}`); setSearchQuery(''); setShowSugg(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 border-t border-white/[0.06] hover:bg-white/[0.05] transition-colors text-left">
                <span className="text-gray-500 text-sm">🔍</span>
                <span className="text-gray-400 text-sm">See all results for "{searchQuery}"</span>
              </button>
            </div>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Mobile search icon */}
          <Link to="/search" className="sm:hidden text-gray-400 hover:text-white p-1.5 transition-colors">
            🔍
          </Link>

          {isLoggedIn ? (
            <>
              <Link to="/notifications" className="relative text-gray-400 hover:text-white transition-colors duration-200 p-1.5">
                <span className="text-lg">🔔</span>
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>
              {userId && (
                <Link to={`/profile/${userId}`} className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200">
                  Profile
                </Link>
              )}
              <Link to="/create-dj" className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200 hidden sm:block">+ DJ</Link>
              <Link to="/create-set" className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200 hidden sm:block">+ Set</Link>
              <button onClick={onLogout}
                className="text-sm font-medium px-4 py-1.5 rounded-full border border-white/10 text-gray-300 hover:border-white/30 hover:text-white transition-all duration-200 active:scale-95">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200">Login</Link>
              <Link to="/signup"
                className="text-sm font-semibold px-4 py-1.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-glow-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
