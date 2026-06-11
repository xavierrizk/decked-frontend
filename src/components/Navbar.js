import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ isLoggedIn, onLogout }) {
  return (
    <nav className="relative z-20 border-b border-white/5 bg-black/60 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
        <Link to="/" className="text-white text-xl font-extrabold tracking-tight hover:text-brand-400 transition-colors duration-200">
          🎛️ Decked
        </Link>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link to="/create-dj"
                className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200">
                + DJ
              </Link>
              <Link to="/create-set"
                className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200">
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

export default Navbar;
