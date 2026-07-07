import React, { useState, useEffect } from 'react';
import API_URL from '../api';
import axios from 'axios';

export default function SubmitSetModal({ open, onClose, venues }) {
  const [formData, setFormData] = useState({ dj_name: '', venue_id: '', date: '', youtube_url: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [remaining, setRemaining] = useState(null);
  const [venueSearch, setVenueSearch] = useState('');
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [showVenueDropdown, setShowVenueDropdown] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);

  useEffect(() => {
    if (venueSearch.trim() === '') {
      setFilteredVenues([]);
      setShowVenueDropdown(false);
      return;
    }
    const search = venueSearch.toLowerCase();
    const filtered = venues?.filter(v =>
      `${v.name} ${v.city}`.toLowerCase().includes(search)
    ) || [];
    setFilteredVenues(filtered);
    setShowVenueDropdown(true);
  }, [venueSearch, venues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const selectVenue = (venue) => {
    setSelectedVenue(venue);
    setFormData(prev => ({ ...prev, venue_id: venue.id }));
    setVenueSearch(`${venue.name}, ${venue.city}`);
    setShowVenueDropdown(false);
  };

  const handleVenueInputChange = (e) => {
    setVenueSearch(e.target.value);
    setSelectedVenue(null);
    setFormData(prev => ({ ...prev, venue_id: '' }));
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
      setVenueSearch('');
      setSelectedVenue(null);
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

  const canSubmit = formData.dj_name.trim() && selectedVenue && formData.date;

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

            <div className="relative">
              <label className="block text-xs font-semibold text-gray-400 mb-1">Venue*</label>
              <input
                type="text"
                value={venueSearch}
                onChange={handleVenueInputChange}
                onFocus={() => venueSearch.trim() && setShowVenueDropdown(true)}
                placeholder="Search venues..."
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm outline-none focus:border-[#00D9FF]/50"
              />
              {showVenueDropdown && filteredVenues.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#0f0f1a] border border-white/[0.1] rounded-lg max-h-48 overflow-y-auto z-10">
                  {filteredVenues.map(v => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => selectVenue(v)}
                      className="w-full text-left px-3 py-2 hover:bg-white/[0.05] text-white text-sm border-b border-white/[0.05] last:border-b-0"
                    >
                      {v.name}, {v.city}
                    </button>
                  ))}
                </div>
              )}
              {showVenueDropdown && venueSearch.trim() && filteredVenues.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#0f0f1a] border border-white/[0.1] rounded-lg p-3 z-10">
                  <p className="text-gray-500 text-xs">No venues found. Try a different search.</p>
                </div>
              )}
              {selectedVenue && (
                <p className="text-[#00D9FF] text-[10px] mt-1">✓ {selectedVenue.name} selected</p>
              )}
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
              <label className="block text-xs font-semibold text-gray-400 mb-1">YouTube URL (optional)</label>
              <input
                type="url"
                name="youtube_url"
                value={formData.youtube_url}
                onChange={handleChange}
                placeholder="youtube.com/watch?v=..."
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
                disabled={loading || !canSubmit}
                className="flex-1 px-4 py-2 rounded-lg bg-[#00D9FF] text-[#0a0a0a] text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
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
