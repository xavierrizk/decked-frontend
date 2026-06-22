import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

/* ─── Feather-style icons (16px) ──────────────── */
const ic = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
const IconUser     = () => <svg {...ic}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const IconStar     = () => <svg {...ic}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
const IconHeart    = () => <svg {...ic}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" /></svg>;
const IconVinyl    = () => <svg {...ic}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>;
const IconSettings = () => <svg {...ic}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
const IconHelp     = () => <svg {...ic}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
const IconInfo     = () => <svg {...ic}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>;
const IconAdmin    = () => <svg {...ic}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
const IconLogout   = () => <svg {...ic}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;

function MenuItem({ to, onClick, icon, label, danger }) {
  const cls = `flex items-center gap-3 w-full px-4 text-left text-sm transition-colors duration-150 ${
    danger ? 'text-gray-400 hover:text-red-400' : 'text-gray-400 hover:text-[#00D9FF]'
  } hover:bg-white/[0.04]`;
  const style = { height: 'var(--item-h)' };
  const inner = (
    <>
      <span className="flex-shrink-0 opacity-80">{icon}</span>
      <span className="font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{label}</span>
    </>
  );
  if (to) return <Link to={to} onClick={onClick} className={cls} style={style}>{inner}</Link>;
  return <button onClick={onClick} className={cls} style={style}>{inner}</button>;
}

const Divider = () => <div className="my-2 mx-4 border-t border-white/[0.07]" />;

export default function ProfileDropdown({ userId, username, isAdmin, onLogout }) {
  const [open, setOpen]       = useState(false);
  const [profilePic, setPic]  = useState(null);
  const [isArtist, setIsArtist]       = useState(false);
  const [artistId, setArtistId]       = useState(null);
  const closeTimer = useRef(null);
  const wrapRef    = useRef(null);
  const navigate   = useNavigate();

  // Fetch avatar + DJ status
  useEffect(() => {
    if (!userId) return;
    axios.get(`${API_URL}/api/users/${userId}`)
      .then(r => {
        setPic(r.data.profile_picture_url || null);
        setIsArtist(!!r.data.is_dj);
        setArtistId(r.data.dj_id || null);
      })
      .catch(() => {});
  }, [userId]);

  // Desktop hover
  const handleEnter = useCallback(() => {
    if (window.matchMedia('(hover: none)').matches) return; // skip on touch
    clearTimeout(closeTimer.current);
    setOpen(true);
  }, []);
  const handleLeave = useCallback(() => {
    if (window.matchMedia('(hover: none)').matches) return;
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  }, []);

  // Click toggle (mobile / tap)
  const handleToggle = () => setOpen(o => !o);

  // Click outside + ESC
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDocClick); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const close = () => setOpen(false);

  const handleSignOut = () => {
    setOpen(false);
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* Trigger: avatar + name + arrow */}
      <button
        onClick={handleToggle}
        className="flex items-center gap-2 h-8 pl-1 pr-2 rounded transition-colors duration-150 hover:bg-white/[0.05]"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {profilePic ? (
          <img
            src={profilePic}
            alt={username}
            className="w-7 h-7 rounded-full object-cover"
            style={{ border: '1.5px solid rgba(0,217,255,0.6)' }}
          />
        ) : (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #5A6470, #252D34)', border: '1.5px solid rgba(0,217,255,0.6)' }}
          >
            {username?.[0]?.toUpperCase()}
          </div>
        )}
        <span className="hidden sm:block text-white text-sm font-medium max-w-[120px] truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
          {username}
        </span>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          className="text-gray-500 transition-transform duration-200 hidden sm:block"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      <div
        className="absolute right-0 top-full mt-1.5 z-[120] origin-top-right"
        style={{
          '--item-h': '44px',
          width: '220px',
          background: '#0f0f1a',
          borderLeft: '1px solid rgba(0,217,255,0.25)',
          border: '1px solid rgba(255,255,255,0.08)',
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0)' : 'translateY(-8px)',
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.2s ease-out, transform 0.2s ease-out',
        }}
        role="menu"
      >
        <div className="py-2">
          {/* Section 1: Profile & Activity */}
          <MenuItem to={`/profile/${userId}`}                  onClick={close} icon={<IconUser />}  label="View Profile" />
          <MenuItem to={`/profile/${userId}?tab=reviews`}      onClick={close} icon={<IconStar />}  label="My Reviews" />
          <MenuItem to={`/profile/${userId}?tab=favorites`}    onClick={close} icon={<IconHeart />} label="Favorite Reviews" />

          {/* Section 2: Creator */}
          {isArtist && (
            <>
              <Divider />
              <MenuItem to="/my-artists"    onClick={close} icon={<IconVinyl />} label="My Artists" />
              <MenuItem to="/create-set"    onClick={close} icon={<IconStar />}  label="Add Set" />
            </>
          )}

          {/* Section 3: Settings & Help */}
          <Divider />
          <MenuItem to="/profile/edit" onClick={close} icon={<IconSettings />} label="Settings" />
          <MenuItem to="/help"         onClick={close} icon={<IconHelp />}     label="Help & FAQ" />
          {isAdmin && (
            <MenuItem to="/admin" onClick={close} icon={<IconAdmin />} label="Admin Dashboard" />
          )}

          {/* Section 4: Account */}
          <Divider />
          <MenuItem onClick={handleSignOut} icon={<IconLogout />} label="Sign Out" danger />
        </div>
      </div>
    </div>
  );
}
