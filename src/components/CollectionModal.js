import React, { useState } from 'react';
import API_URL from '../api';
import axios from 'axios';

export default function CollectionModal({ open, onClose, onCreated }) {
  const [formData, setFormData] = useState({ name: '', description: '' });
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
      const res = await axios.post(`${API_URL}/api/curated/collections`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      setSuccess(true);
      setFormData({ name: '', description: '' });
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onCreated) onCreated(res.data.collection_id);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create collection');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-white mb-4">Create a Collection</h2>

        {success ? (
          <div className="text-center py-8">
            <p className="text-[#00D9FF] text-sm font-semibold mb-2">✓ Created!</p>
            <p className="text-gray-500 text-xs">You can now add sets to your collection.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Collection Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Best Techno 2024"
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm outline-none focus:border-[#00D9FF]/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="What's this collection about?"
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
                className="flex-1 px-4 py-2 rounded-lg bg-[#FF006E] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
