import React, { useState } from 'react';
import API_URL from '../api';
import axios from 'axios';

export default function VenueSubmitModal({ open, onClose }) {
  const [formData, setFormData] = useState({ name: '', city: '', country: '', website: '', image_url: '' });
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
      await axios.post(`${API_URL}/api/curated/venues/submit`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      setSuccess(true);
      setFormData({ name: '', city: '', country: '', website: '', image_url: '' });
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
        <h2 className="text-xl font-bold text-white mb-4">Add a Venue</h2>

        {success ? (
          <div className="text-center py-8">
            <p className="text-[#00D9FF] text-sm font-semibold mb-2">✓ Submitted!</p>
            <p className="text-gray-500 text-xs">We'll review and add it soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Venue Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Berghain"
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm outline-none focus:border-[#00D9FF]/50"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">City*</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g., Berlin"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm outline-none focus:border-[#00D9FF]/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="e.g., Germany"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm outline-none focus:border-[#00D9FF]/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://berghain.de"
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm outline-none focus:border-[#00D9FF]/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Image URL</label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm outline-none focus:border-[#00D9FF]/50"
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
                {loading ? 'Submitting...' : 'Submit Venue'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
