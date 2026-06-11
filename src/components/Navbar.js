import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ isLoggedIn, onLogout }) {
  return (
    <nav style={{ padding: '20px', background: '#333', color: 'white' }}>
      <Link to="/" style={{ marginRight: '20px', color: 'white', textDecoration: 'none' }}>
        🎵 Decked
      </Link>
      {isLoggedIn ? (
        <button onClick={onLogout} style={{ cursor: 'pointer' }}>
          Logout
        </button>
      ) : (
        <>
          <Link to="/login" style={{ marginRight: '10px', color: 'white' }}>
            Login
          </Link>
          <Link to="/signup" style={{ color: 'white' }}>
            Signup
          </Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;