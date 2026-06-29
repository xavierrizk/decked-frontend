import React, { useState } from 'react';
import API_URL from '../api';
import axios from 'axios';

export default function ArtistVerificationModal({ open, onClose, djName, djId }) {
  const [formData, setFormData] = useState({ email: '', proof_url: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
      await axios.post(
        `${API_URL}/api/artist-verification/request`,
        { dj_id: djId, ...formData },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
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
        <h2 className="text-xl font-bold text-white mb-2">Verify Your Artist Profile</h2>
        <p className="text-gray-500 text-sm mb-4">Claim <strong>{djName}</strong> as your artist profile</p>

        {success ? (
          <div className="text-center py-8">
            <p className="text-[#00D9FF] text-sm font-semibold mb-2">✓ Request Sent!</p>
            <p className="text-gray-500 text-xs">We'll verify your identity and get back to you.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Email*</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm outline-none focus:border-[#00D9FF]/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Proof URL (optional)</label>
              <input
                type="url"
                name="proof_url"
                value={formData.proof_url}
                onChange={handleChange}
                placeholder="Link to social media or website"
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm outline-none focus:border-[#00D9FF]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Message (optional)</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us why you're this artist..."
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm outline-none focus:border-[#00D9FF]/50"
                rows="3"
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
                {loading ? 'Submitting...' : 'Request Verification'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
