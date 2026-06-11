import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ isLoggedIn, onLogout }) {
  return (
    <nav className="bg-gradient-to-r from-brand-900 via-brand-700 to-purple-600 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-white text-2xl font-bold tracking-tight hover:text-brand-100 transition-colors">
          🎛️ Decked
        </Link>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Link to="/create-dj" className="text-brand-100 hover:text-white text-sm font-medium transition-colors">
                + DJ
              </Link>
              <Link to="/create-set" className="text-brand-100 hover:text-white text-sm font-medium transition-colors">
                + Set
              </Link>
              <button
                onClick={onLogout}
                className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-brand-100 hover:text-white text-sm font-medium transition-colors">
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-white text-brand-700 hover:bg-brand-50 text-sm font-semibold px-4 py-1.5 rounded-full transition-all"
              >
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
