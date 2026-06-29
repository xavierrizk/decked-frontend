import React, { useState, useEffect } from 'react';
import API_URL from '../api';
import axios from 'axios';

export default function SubmitSetModal({ open, onClose, venues }) {
  const [formData, setFormData] = useState({ dj_name: '', venue_id: '', date: '', youtube_url: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [remaining, setRemaining] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(`${API_URL}/api/submissions/submit`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      setSuccess(true);
      setRemaining(res.data.remaining);
      setFormData({ dj_name: '', venue_id: '', date: '', youtube_url: '' });
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-white mb-4">Add a Set You Attended</h2>

        {success ? (
          <div className="text-center py-8">
            <p className="text-[#00D9FF] text-sm font-semibold mb-2">✓ Submitted!</p>
            <p className="text-gray-500 text-xs">We'll review and approve shortly.</p>
            {remaining !== null && (
              <p className="text-gray-600 text-[10px] mt-3">{remaining} submissions remaining today</p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">DJ Name*</label>
              <input
                type="text"
                name="dj_name"
                value={formData.dj_name}
                onChange={handleChange}
                placeholder="e.g., Adam Beyer"
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm outline-none focus:border-[#00D9FF]/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Venue*</label>
              <select
                name="venue_id"
                value={formData.venue_id}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm outline-none focus:border-[#00D9FF]/50"
                required
              >
                <option value="">Select venue...</option>
                {venues?.map(v => (
                  <option key={v.id} value={v.id}>{v.name}, {v.city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Date*</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm outline-none focus:border-[#00D9FF]/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">YouTube URL*</label>
              <input
                type="url"
                name="youtube_url"
                value={formData.youtube_url}
                onChange={handleChange}
                placeholder="youtube.com/watch?v=..."
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm outline-none focus:border-[#00D9FF]/50"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border border-white/[0.1] text-white text-sm font-semibold hover:bg-white/[0.05] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg bg-[#00D9FF] text-[#0a0a0a] text-sm font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
