import API_URL from '../api';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Toast, { useToast } from '../components/Toast';
import BucketListCard from '../components/BucketListCard';
import BucketListSearchModal from '../components/BucketListSearchModal';

export default function BucketListPage() {
  const [list, setList]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [toast, showToast]    = useToast();

  const authHeaders = () => ({ Authorization: 'Bearer ' + localStorage.getItem('token') });

  const fetchList = useCallback(() => {
    setLoading(true);
    axios.get(`${API_URL}/api/bucket-list`, { headers: authHeaders() })
      .then(r => setList(r.data || []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const handleRemove = async (artistId) => {
    setRemovingId(artistId);
    try {
      await axios.delete(`${API_URL}/api/bucket-list/remove/${artistId}`, { headers: authHeaders() });
      setList(l => l.filter(d => d.artist_id !== artistId));
      showToast('Removed from bucket list');
    } catch (err) {
      showToast('Error removing DJ');
    }
    setRemovingId(null);
  };

  const handleAdd = async (dj) => {
    try {
      await axios.post(`${API_URL}/api/bucket-list/add/${dj.id}`, {}, { headers: authHeaders() });
      showToast(`Added ${dj.name} to your bucket list`);
      fetchList();
    } catch (err) {
      if (err.response?.status === 409) showToast(`${dj.name} is already on your list`);
      else showToast('Error adding DJ');
    }
  };

  const existingIds = new Set(list.map(d => d.artist_id));

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Toast message={toast} />
      <BucketListSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        existingIds={existingIds}
        onAdd={handleAdd}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-xl font-bold">Bucket List</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {loading ? 'Loading…' : `${list.length} DJ${list.length !== 1 ? 's' : ''} on your bucket list`}
          </p>
        </div>
        <button
          onClick={() => setSearchOpen(true)}
          className="text-xs font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-90 flex-shrink-0"
          style={{ background: '#00D9FF', color: '#0a0a0a' }}
        >
          + Add DJ
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] rounded-xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-16 border border-white/[0.05] rounded-xl text-gray-600">
          <p className="text-3xl mb-3">🎧</p>
          <p className="mb-4">No DJs on your bucket list yet.</p>
          <button
            onClick={() => setSearchOpen(true)}
            className="text-xs font-bold px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
            style={{ background: '#00D9FF', color: '#0a0a0a' }}
          >
            + Find DJs to add
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {list.map(dj => (
            <BucketListCard key={dj.artist_id} dj={dj} onRemove={handleRemove} removing={removingId === dj.artist_id} />
          ))}
        </div>
      )}
    </div>
  );
}
