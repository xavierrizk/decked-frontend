import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import API_URL from '../api';

export default function BucketListSearchModal({ open, onClose, existingIds, onAdd }) {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [addingId, setAddingId] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!open) { setQuery(''); setResults([]); }
  }, [open]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      axios.get(`${API_URL}/api/search/djs?q=${encodeURIComponent(query.trim())}`)
        .then(r => setResults(r.data || []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
  }, [query]);

  if (!open) return null;

  const handleAdd = async (dj) => {
    setAddingId(dj.id);
    await onAdd(dj);
    setAddingId(null);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <div
        className="w-full max-w-md rounded-xl border border-white/10 p-5"
        style={{ background: '#0f0f1a' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-base">Add DJ to Bucket List</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xl leading-none">&times;</button>
        </div>

        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search DJs..."
          className="w-full bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 outline-none focus:border-[#00D9FF]/50 mb-3"
        />

        <div className="max-h-80 overflow-y-auto space-y-1.5">
          {loading && <p className="text-gray-600 text-sm text-center py-4">Searching…</p>}
          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <p className="text-gray-600 text-sm text-center py-4">No DJs found.</p>
          )}
          {!loading && results.map(dj => {
            const already = existingIds.has(dj.id);
            return (
              <div key={dj.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #FF006E, #7c1d4e)' }}
                >
                  {dj.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{dj.name}</p>
                  <p className="text-gray-600 text-[10px]">
                    {dj.follower_count || 0} followers{dj.avg_rating ? ` · ★ ${dj.avg_rating}` : ''}
                  </p>
                </div>
                {already ? (
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-md text-gray-500 flex-shrink-0">✓ Added</span>
                ) : (
                  <button
                    onClick={() => handleAdd(dj)}
                    disabled={addingId === dj.id}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-md transition-opacity hover:opacity-90 disabled:opacity-50 flex-shrink-0"
                    style={{ background: '#00D9FF', color: '#0a0a0a' }}
                  >
                    {addingId === dj.id ? '…' : '+ Add'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
