import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';
import { getCurrentUserId } from '../utils/auth';

export default function Navbar({ isLoggedIn, onLogout }) {
  const userId                        = getCurrentUserId();
  const [unread, setUnread]           = useState(0);
  const [menuOpen, setMenuOpen]       = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    const token = localStorage.getItem('token');
    const fetchUnread = () =>
      axios.get(`${API_URL}/api/notifications/unread-count`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => setUnread(r.data.count))
        .catch(() => {});
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  return (
    <nav className="relative z-20 border-b border-white/5 bg-black/60 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-white text-xl font-extrabold tracking-tight hover:text-brand-400 transition-colors duration-200">
            🎛️ Decked
          </Link>
          <Link to="/trending" className="text-gray-500 hover:text-white text-sm font-medium transition-colors duration-200 hidden sm:block">
            Trending
          </Link>
          {isLoggedIn && (
            <Link to="/feed" className="text-gray-500 hover:text-white text-sm font-medium transition-colors duration-200 hidden sm:block">
              Feed
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              {/* Notification bell */}
              <Link to="/notifications" className="relative text-gray-400 hover:text-white transition-colors duration-200 p-1.5">
                <span className="text-lg">🔔</span>
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>

              {userId && (
                <Link to={`/profile/${userId}`}
                  className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200">
                  Profile
                </Link>
              )}
              <Link to="/create-dj"
                className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200 hidden sm:block">
                + DJ
              </Link>
              <Link to="/create-set"
                className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200 hidden sm:block">
                + Set
              </Link>
              <button onClick={onLogout}
                className="text-sm font-medium px-4 py-1.5 rounded-full border border-white/10 text-gray-300 hover:border-white/30 hover:text-white transition-all duration-200 active:scale-95">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"
                className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200">
                Login
              </Link>
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
