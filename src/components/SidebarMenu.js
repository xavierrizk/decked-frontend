import React, { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const MENU_ITEMS = [
  { to: '/feed',      label: 'My Feed',   icon: '📰', auth: true  },
  { to: '/discover',  label: 'Discover',  icon: '🧭', auth: false },
  { to: '/search',    label: 'Search',    icon: '🔍', auth: false },
  { to: '/trending',  label: 'Trending',  icon: '🔥', auth: false },
  { to: '/concerts',  label: 'Concerts',  icon: '🎤', auth: false },
  { to: '/festivals', label: 'Festivals', icon: '🎪', auth: false },
  { to: '/venues',    label: 'Venues',    icon: '🏟️', auth: false },
];

export default function SidebarMenu() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleEnter = useCallback(() => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  }, []);

  const handleLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') setOpen(false);
  }, []);

  const handleItemClick = useCallback((to) => {
    setOpen(false);
    navigate(to);
  }, [navigate]);

  const visibleItems = MENU_ITEMS.filter(item => !item.auth || isLoggedIn);

  return (
    <>
      {/* Trigger zone — invisible strip on right edge */}
      <div
        className="fixed right-0 top-0 bottom-0 w-8 z-40 hidden md:block"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        aria-hidden="true"
      />

      {/* Arrow indicator — only shown when menu is closed */}
      <div
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 hidden md:flex items-center justify-center w-7 h-14 cursor-pointer transition-opacity duration-300"
        style={{ opacity: open ? 0 : 1, pointerEvents: open ? 'none' : 'auto' }}
        onMouseEnter={handleEnter}
        aria-label="Open navigation menu"
      >
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-px h-4 bg-white/20" />
          <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
            <path d="M8 2L3 7L8 12" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="w-px h-4 bg-white/20" />
        </div>
      </div>

      {/* Sidebar panel */}
      <div
        className="fixed top-0 bottom-0 right-0 z-50 hidden md:flex flex-col justify-center"
        style={{
          width: '220px',
          background: '#0a0a0a',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
        }}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        onKeyDown={handleKeyDown}
        role="navigation"
        aria-label="Side navigation"
        aria-hidden={!open}
      >
        {/* Menu label */}
        <p className="px-8 mb-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 select-none">
          Navigate
        </p>

        {/* Nav items */}
        <nav className="flex flex-col px-6 gap-1">
          {visibleItems.map((item) => (
            <button
              key={item.to}
              onClick={() => handleItemClick(item.to)}
              tabIndex={open ? 0 : -1}
              className="flex items-center gap-4 px-4 py-3 text-left text-white/60 hover:text-white hover:bg-white/[0.04] transition-all duration-150 group focus:outline-none focus:bg-white/[0.06]"
            >
              <span className="text-lg opacity-70 group-hover:opacity-100 transition-opacity">{item.icon}</span>
              <span className="text-base font-semibold tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom divider + close hint */}
        <p className="absolute bottom-8 px-8 text-[10px] text-white/15 select-none">
          ESC to close
        </p>
      </div>

      {/* Backdrop (subtle, just closes the menu) */}
      {open && (
        <div
          className="fixed inset-0 z-40 hidden md:block"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
