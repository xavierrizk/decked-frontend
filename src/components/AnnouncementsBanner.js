import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AnnouncementsBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    axios.get(`${API_URL}/api/announcements`)
      .then(r => {
        const dismissed = JSON.parse(localStorage.getItem('dismissed_announcements') || '[]');
        const visible = r.data.filter(a => !dismissed.includes(a.id));
        setAnnouncements(visible);
      })
      .catch(() => {});
  }, []);

  if (announcements.length === 0) return null;

  const current = announcements[currentIdx];

  const dismiss = () => {
    const dismissed = JSON.parse(localStorage.getItem('dismissed_announcements') || '[]');
    dismissed.push(current.id);
    localStorage.setItem('dismissed_announcements', JSON.stringify(dismissed));
    const remaining = announcements.filter(a => a.id !== current.id);
    setAnnouncements(remaining);
    setCurrentIdx(0);
  };

  const next = () => setCurrentIdx(i => (i + 1) % announcements.length);

  return (
    <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 px-4 py-2.5 flex items-center gap-3 relative z-20">
      <span className="text-lg flex-shrink-0">📢</span>
      <div className="flex-1 min-w-0">
        <span className="font-bold text-sm">{current.title}: </span>
        <span className="text-sm">{current.message}</span>
      </div>
      {announcements.length > 1 && (
        <div className="flex items-center gap-1 flex-shrink-0 text-xs font-semibold">
          <span>{currentIdx + 1} of {announcements.length}</span>
          <button onClick={next}
            className="ml-1 w-6 h-6 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors">
            →
          </button>
        </div>
      )}
      <button onClick={dismiss}
        className="flex-shrink-0 w-6 h-6 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-sm font-bold transition-colors"
        aria-label="Dismiss">
        ×
      </button>
    </div>
  );
}
