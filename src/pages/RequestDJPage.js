import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';

export default function RequestDJPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ dj_name: '', bio: '', soundcloud_url: '', instagram_url: '', why_decked: '' });
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    axios.get(`${API_URL}/api/dj-requests/my-status`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { setRequests(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (!token) return <Navigate to="/login" />;

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.dj_name.trim())      { setError('DJ name is required'); return; }
    if (!form.soundcloud_url.trim()) { setError('SoundCloud link is required'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await axios.post(`${API_URL}/api/dj-requests`, form,
        { headers: { Authorization: `Bearer ${token}` } });
      setRequests(prev => [res.data, ...prev]);
      setSuccess(true);
      setForm({ dj_name: '', bio: '', soundcloud_url: '', instagram_url: '', why_decked: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
    setSubmitting(false);
  };

  if (loading) return <Spinner />;

  const inp = "w-full bg-white/[0.04] border border-white/10 focus:border-brand-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm outline-none transition-colors";

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 text-3xl mb-4 shadow-glow">🎧</div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Request a DJ Profile</h1>
        <p className="text-gray-500 max-w-sm mx-auto">
          Submit a request to add a DJ to DECK'D. Our team reviews every request within 24 hours.
        </p>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[['📝', 'Submit', 'Fill in the DJ details and links'],
          ['⏳', 'Review', 'We verify your links and info'],
          ['✅', 'Approved', 'Start uploading sets immediately']].map(([icon, title, desc]) => (
          <div key={title} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 text-center">
            <p className="text-2xl mb-1">{icon}</p>
            <p className="text-white font-bold text-sm">{title}</p>
            <p className="text-gray-600 text-xs mt-0.5">{desc}</p>
          </div>
        ))}
      </div>

      {/* Past requests */}
      {requests.length > 0 && (
        <div className="mb-8">
          <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest mb-3">Your Requests</p>
          <div className="space-y-3">
            {requests.map(r => <RequestStatusCard key={r.id} r={r} />)}
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
        <h2 className="text-white font-extrabold text-lg mb-5">New Request</h2>

        {success && (
          <div className="mb-4 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-300 text-sm font-medium">
            ✅ Request submitted! We'll review it within 24 hours and notify you.
          </div>
        )}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">DJ Name <span className="text-red-400">*</span></label>
            <input value={form.dj_name} onChange={set('dj_name')} placeholder="e.g. Fisher, Charlotte de Witte" className={inp} required />
          </div>
          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Bio</label>
            <textarea value={form.bio} onChange={set('bio')} placeholder="Brief description of the DJ…" rows={3} className={inp + ' resize-none'} />
          </div>
          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">SoundCloud Link <span className="text-red-400">*</span></label>
            <input value={form.soundcloud_url} onChange={set('soundcloud_url')} placeholder="https://soundcloud.com/djname" className={inp} />
          </div>
          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Instagram <span className="text-gray-600 font-normal normal-case">(optional)</span></label>
            <input value={form.instagram_url} onChange={set('instagram_url')} placeholder="https://instagram.com/djname" className={inp} />
          </div>
          <div>
            <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Why should this DJ be on DECK'D? <span className="text-gray-600 font-normal normal-case">(optional)</span></label>
            <textarea value={form.why_decked} onChange={set('why_decked')} placeholder="Tell us about their impact, notable gigs, releases…" rows={4} className={inp + ' resize-none'} />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full py-3 btn-primary disabled:opacity-50  font-bold rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-95 shadow-glow">
            {submitting ? 'Submitting…' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

function RequestStatusCard({ r }) {
  const cfg = {
    pending:  { icon: '⏳', text: 'text-yellow-300', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Under Review' },
    approved: { icon: '✅', text: 'text-green-300',  bg: 'bg-green-500/10',  border: 'border-green-500/20',  label: 'Approved' },
    rejected: { icon: '❌', text: 'text-red-300',    bg: 'bg-red-500/10',    border: 'border-red-500/20',    label: 'Not Approved' },
  }[r.status] || { icon: '⏳', text: 'text-gray-400', bg: 'bg-white/[0.03]', border: 'border-white/[0.07]', label: r.status };

  return (
    <div className={`${cfg.bg} border ${cfg.border} rounded-xl p-4`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl flex-shrink-0">{cfg.icon}</span>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate">{r.dj_name}</p>
            <p className="text-gray-500 text-xs mt-0.5">
              {new Date(r.created_at).toLocaleDateString()}
              {r.reviewed_at && ` · Reviewed ${new Date(r.reviewed_at).toLocaleDateString()}`}
            </p>
          </div>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text} flex-shrink-0`}>
          {cfg.label}
        </span>
      </div>
      {r.admin_notes && (
        <div className="mt-3 bg-black/20 rounded-lg px-3 py-2">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Admin Notes</p>
          <p className="text-gray-300 text-sm">{r.admin_notes}</p>
        </div>
      )}
      {r.status === 'approved' && r.dj_id && (
        <Link to={`/dj/${r.dj_id}`} className="inline-block mt-3 text-brand-400 hover:text-brand-300 text-xs font-semibold transition-colors">
          View DJ Profile →
        </Link>
      )}
    </div>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>;
}
