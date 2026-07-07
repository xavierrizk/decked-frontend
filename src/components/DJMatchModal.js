import React, { useState, useEffect } from 'react';
import API_URL from '../api';
import axios from 'axios';

export default function DJMatchModal({ open, onClose, djName, onConfirm, loading }) {
  const [djSearch, setDjSearch] = useState(djName || '');
  const [djOptions, setDjOptions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDj, setSelectedDj] = useState(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!djSearch.trim()) {
      setDjOptions([]);
      setShowDropdown(false);
      return;
    }

    const searchDJs = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/submissions/admin/search-djs`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          params: { q: djSearch },
        });
        setDjOptions(res.data);
        setShowDropdown(true);
      } catch (err) {
        console.error('Error searching DJs:', err);
      }
    };

    const t = setTimeout(searchDJs, 300);
    return () => clearTimeout(t);
  }, [djSearch]);

  const selectDj = (dj) => {
    setSelectedDj(dj);
    setDjSearch(dj.name);
    setShowDropdown(false);
  };

  const createNewDj = async () => {
    if (!djSearch.trim()) return;
    setCreating(true);
    try {
      const res = await axios.post(`${API_URL}/api/submissions/admin/create-dj`,
        { name: djSearch.trim() },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSelectedDj(res.data);
      setCreatingNew(false);
    } catch (err) {
      alert('Error creating DJ');
    } finally {
      setCreating(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0f0f1a] border border-white/[0.07] rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-bold text-white mb-4">Select or Create DJ</h2>

        {selectedDj && !creatingNew ? (
          <div className="space-y-4">
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-sm font-semibold">✓ Selected</p>
              <p className="text-white text-sm mt-1">{selectedDj.name}</p>
              {selectedDj.bio && <p className="text-gray-500 text-xs mt-1">{selectedDj.bio}</p>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setSelectedDj(null); setDjSearch(djName); setCreatingNew(false); }}
                className="flex-1 px-4 py-2 rounded-lg border border-white/[0.1] text-white text-sm font-semibold hover:bg-white/[0.05]"
              >
                Change
              </button>
              <button
                onClick={() => onConfirm(selectedDj.id)}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-semibold hover:bg-green-500/30 disabled:opacity-50"
              >
                {loading ? 'Approving...' : 'Confirm'}
              </button>
            </div>
          </div>
        ) : creatingNew ? (
          <div className="space-y-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-400 text-xs font-semibold uppercase">Creating new</p>
              <p className="text-white text-sm mt-1">{djSearch}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCreatingNew(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-white/[0.1] text-white text-sm font-semibold hover:bg-white/[0.05]"
              >
                Cancel
              </button>
              <button
                onClick={createNewDj}
                disabled={creating}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-semibold hover:bg-blue-500/30 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={djSearch}
                onChange={e => { setDjSearch(e.target.value); setSelectedDj(null); }}
                onFocus={() => djSearch && setShowDropdown(true)}
                placeholder="Search or type DJ name..."
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm outline-none focus:border-[#00D9FF]/50"
              />
              {showDropdown && djOptions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#0f0f1a] border border-white/[0.1] rounded-lg max-h-48 overflow-y-auto z-10">
                  {djOptions.map(dj => (
                    <button
                      key={dj.id}
                      type="button"
                      onClick={() => selectDj(dj)}
                      className="w-full text-left px-3 py-2 hover:bg-white/[0.05] text-white text-sm border-b border-white/[0.05] last:border-b-0"
                    >
                      <p className="font-semibold">{dj.name}</p>
                      {dj.bio && <p className="text-gray-500 text-xs truncate">{dj.bio}</p>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setCreatingNew(true)}
              className="w-full px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-sm font-semibold hover:bg-white/[0.08]"
            >
              or Create New DJ
            </button>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg border border-white/[0.1] text-white text-sm font-semibold hover:bg-white/[0.05]"
              >
                Cancel
              </button>
              <button
                onClick={() => onConfirm(null)}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg bg-[#00D9FF] text-[#0a0a0a] text-sm font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Approving...' : 'Continue'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
