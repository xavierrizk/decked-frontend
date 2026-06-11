import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const TYPE_ICON = {
  new_set:     '🎵',
  new_rating:  '⭐',
  new_comment: '💬',
  new_like:    '❤️',
  new_follow:  '👤',
  new_friend:  '🤝',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios.get(`${API_URL}/api/notifications`, { headers })
      .then(r => { setNotifications(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await axios.post(`${API_URL}/api/notifications/read-all`, {}, { headers });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = async (id) => {
    await axios.patch(`${API_URL}/api/notifications/${id}/read`, {}, { headers });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unread = notifications.filter(n => !n.read).length;

  if (loading) return <Spinner />;

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Notifications</h1>
          {unread > 0 && <p className="text-brand-400 text-sm mt-1">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead}
            className="text-sm text-gray-400 hover:text-white font-medium transition-colors px-3 py-1.5 border border-white/[0.07] rounded-lg hover:border-white/20">
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 border border-white/[0.05] rounded-2xl text-gray-600">
          <p className="text-4xl mb-3">🔔</p>
          <p className="font-medium text-gray-500">You're all caught up!</p>
          <p className="text-sm mt-1">Notifications appear here when someone rates, comments, likes, or follows.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} onClick={() => !n.read && markRead(n.id)}
              className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                n.read
                  ? 'bg-white/[0.02] border-white/[0.05] text-gray-500'
                  : 'bg-white/[0.05] border-brand-600/20 text-white'
              }`}>
              <span className="text-2xl flex-shrink-0 mt-0.5">{TYPE_ICON[n.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${n.read ? 'text-gray-500' : 'text-white'}`}>{n.message}</p>
                <p className="text-gray-600 text-xs mt-0.5">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {!n.read && <div className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0 mt-1.5" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>;
}
