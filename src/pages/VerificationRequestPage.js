import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';

export default function VerificationRequestPage() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [whyVerify, setWhyVerify]   = useState('');
  const [socialLinks, setSocialLinks] = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    axios.get(`${API_URL}/api/verification/status`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (!token) return <Navigate to="/login" />;
  if (loading) return <Spinner />;

  // Not a DJ
  if (data && !data.is_dj) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-20 text-center">
        <p className="text-5xl mb-4">🎧</p>
        <h1 className="text-2xl font-extrabold text-white mb-3">DJs Only</h1>
        <p className="text-gray-500 mb-6">You need a DJ profile to request verification.</p>
        <Link to="/create-dj" className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-all duration-200 hover:scale-105 shadow-glow">
          Create DJ Profile
        </Link>
      </div>
    );
  }

  const request = data?.request;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!whyVerify.trim()) { setError('Please tell us why you should be verified'); return; }
    setSubmitting(true);
    setError('');
    try {
      await axios.post(`${API_URL}/api/verification/request`,
        { why_verify: whyVerify, social_links: socialLinks },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      // Refresh status
      const r = await axios.get(`${API_URL}/api/verification/status`, { headers: { Authorization: `Bearer ${token}` } });
      setData(r.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-brand-700 text-3xl mb-4 shadow-glow">
          ✅
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">DJ Verification</h1>
        <p className="text-gray-500 max-w-sm mx-auto">
          Verified DJs get a ✅ badge on their profile, sets, and comments — building trust with the community.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[['✅', 'Verified Badge', 'On your profile and all sets'],
          ['🔍', 'Searchable', 'Highlighted in search results'],
          ['🏆', 'Credibility', 'Trust from the community']].map(([icon, title, desc]) => (
          <div key={title} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 text-center">
            <p className="text-2xl mb-1">{icon}</p>
            <p className="text-white font-bold text-sm">{title}</p>
            <p className="text-gray-600 text-xs mt-0.5">{desc}</p>
          </div>
        ))}
      </div>

      {/* Status card */}
      {request ? (
        <StatusCard request={request} onReRequest={() => { setData(prev => ({ ...prev, request: null })); }} />
      ) : (
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
          <h2 className="text-white font-extrabold text-lg mb-5">Request Verification</h2>
          {success && (
            <div className="mb-4 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-300 text-sm font-medium">
              ✅ Request submitted! We'll review it soon.
            </div>
          )}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-1.5">
                Why should you be verified? <span className="text-red-400">*</span>
              </label>
              <textarea
                value={whyVerify} onChange={e => setWhyVerify(e.target.value)}
                placeholder="Tell us about your DJ career, experience, notable gigs, releases…"
                rows={5}
                className="w-full bg-white/[0.04] border border-white/10 focus:border-brand-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-1.5">
                Social media / links <span className="text-gray-600 font-normal">(optional)</span>
              </label>
              <textarea
                value={socialLinks} onChange={e => setSocialLinks(e.target.value)}
                placeholder="Instagram, SoundCloud, Resident Advisor, Spotify, website…"
                rows={3}
                className="w-full bg-white/[0.04] border border-white/10 focus:border-brand-500 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm outline-none transition-colors resize-none"
              />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full py-3 btn-primary disabled:opacity-50  font-bold rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-95 shadow-glow">
              {submitting ? 'Submitting…' : 'Submit Verification Request'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function StatusCard({ request }) {
  const statusConfig = {
    pending: {
      icon: '⏳', color: 'yellow', label: 'Under Review',
      bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-300',
      message: 'Your request has been submitted and is being reviewed by our team.',
    },
    approved: {
      icon: '✅', color: 'green', label: 'Verified!',
      bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-300',
      message: 'Congratulations! Your DJ profile is now verified on DECK'D.',
    },
    rejected: {
      icon: '❌', color: 'red', label: 'Not Approved',
      bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-300',
      message: 'Your request was not approved this time. You can re-apply after 30 days.',
    },
  };

  const cfg = statusConfig[request.status] || statusConfig.pending;

  return (
    <div className={`${cfg.bg} border ${cfg.border} rounded-2xl p-6`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{cfg.icon}</span>
        <div>
          <p className={`font-extrabold text-lg ${cfg.text}`}>{cfg.label}</p>
          <p className="text-gray-500 text-xs">
            Requested {new Date(request.requested_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            {request.reviewed_at && ` · Reviewed ${new Date(request.reviewed_at).toLocaleDateString()}`}
          </p>
        </div>
      </div>
      <p className="text-gray-400 text-sm">{cfg.message}</p>
      {request.admin_notes && (
        <div className="mt-3 bg-black/30 rounded-xl px-4 py-3">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Admin Notes</p>
          <p className="text-gray-300 text-sm">{request.admin_notes}</p>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>;
}
