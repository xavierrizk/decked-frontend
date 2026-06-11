import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { getIsAdmin } from '../utils/auth';
import { useToast } from '../components/Toast';
import Toast from '../components/Toast';

const REASONS = ['Spam', 'Harassment', 'Inappropriate Content', 'Other'];

export default function BanManager() {
  const isAdmin = getIsAdmin();
  const [bans, setBans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, showToast] = useToast();

  // Modal state
  const [userId, setUserId] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [permanent, setPermanent] = useState(true);
  const [days, setDays] = useState(7);
  const [submitting, setSubmitting] = useState(false);

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  const fetchBans = async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API_URL}/api/admin/bans`, { headers });
      setBans(r.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) fetchBans(); }, [isAdmin]); // eslint-disable-line

  if (!isAdmin) return <Navigate to="/" />;

  const handleBan = async (e) => {
    e.preventDefault();
    if (!userId.trim()) return;
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/admin/bans`, {
        user_id: parseInt(userId) || userId,
        reason,
        duration_days: permanent ? null : parseInt(days),
      }, { headers });
      showToast('User banned');
      setShowModal(false);
      setUserId('');
      setReason(REASONS[0]);
      setPermanent(true);
      setDays(7);
      fetchBans();
    } catch (err) {
      showToast(err.response?.data?.error || 'Ban failed');
    }
    setSubmitting(false);
  };

  const handleUnban = async (ban) => {
    if (!window.confirm(`Unban ${ban.username}?`)) return;
    try {
      await axios.delete(`${API_URL}/api/admin/bans/${ban.user_id}`, { headers });
      setBans(prev => prev.filter(b => b.user_id !== ban.user_id));
      showToast(`${ban.username} unbanned`);
    } catch (err) { showToast('Unban failed'); }
  };

  return (
    <div>
      <Toast message={toast} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white mb-0.5">Ban Manager</h1>
          <p className="text-gray-500 text-sm">{bans.length} user{bans.length !== 1 ? 's' : ''} currently banned</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-all hover:scale-105 active:scale-95">
          + Ban User
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5 animate-pulse h-20" />)}</div>
      ) : bans.length === 0 ? (
        <div className="text-center py-16 border border-white/[0.05] rounded-2xl text-gray-600">
          <p className="text-3xl mb-2">🔓</p><p>No active bans</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bans.map(ban => (
            <div key={ban.id} className="bg-white/[0.03] border border-red-500/10 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold flex-shrink-0">
                {ban.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold">@{ban.username}</p>
                <p className="text-gray-400 text-sm">{ban.reason}</p>
                <div className="flex gap-3 mt-1 text-gray-600 text-xs">
                  <span>Banned {new Date(ban.created_at).toLocaleDateString()}</span>
                  <span>{ban.expires_at ? `Expires ${new Date(ban.expires_at).toLocaleDateString()}` : 'Permanent'}</span>
                </div>
              </div>
              <button onClick={() => handleUnban(ban)}
                className="flex-shrink-0 px-4 py-2 bg-green-600/20 hover:bg-green-600 border border-green-500/30 hover:border-green-500 text-green-300 hover:text-white text-xs font-bold rounded-xl transition-all duration-200">
                Unban
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Ban Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-[#0d0d0f] border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-red-600 to-red-400" />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-xl">🔒</div>
                <h2 className="text-white font-extrabold text-lg">Ban User</h2>
              </div>
              <form onSubmit={handleBan} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5">User ID or Username</label>
                  <input value={userId} onChange={e => setUserId(e.target.value)} required
                    placeholder="Enter user ID…"
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-red-500/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1.5">Reason</label>
                  <select value={reason} onChange={e => setReason(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none">
                    {REASONS.map(r => <option key={r} value={r} className="bg-[#0d0d0f]">{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Duration</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setPermanent(true)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${permanent ? 'bg-red-600/20 border-red-500/40 text-red-300' : 'border-white/10 text-gray-500 hover:text-white'}`}>
                      Permanent
                    </button>
                    <button type="button" onClick={() => setPermanent(false)}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all ${!permanent ? 'bg-yellow-600/20 border-yellow-500/40 text-yellow-300' : 'border-white/10 text-gray-500 hover:text-white'}`}>
                      Temporary
                    </button>
                  </div>
                </div>
                {!permanent && (
                  <div>
                    <label className="block text-gray-400 text-sm mb-1.5">Duration in days</label>
                    <input type="number" value={days} onChange={e => setDays(e.target.value)} min={1}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none" />
                  </div>
                )}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:text-white text-sm font-semibold transition-all">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-sm font-bold transition-all">
                    {submitting ? '…' : 'Ban User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
