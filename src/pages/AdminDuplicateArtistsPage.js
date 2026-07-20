import API_URL from '../api';
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Toast, { useToast } from '../components/Toast';

const authHeaders = () => ({ Authorization: 'Bearer ' + localStorage.getItem('token') });

export default function AdminDuplicateArtistsPage() {
  const [pairs, setPairs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [mergingKey, setMergingKey] = useState(null);
  const [dismissed, setDismissed]   = useState(new Set());
  const [toast, showToast]    = useToast();

  const fetchDuplicates = useCallback(() => {
    setLoading(true);
    axios.get(`${API_URL}/api/artists/duplicates`, { headers: authHeaders() })
      .then(r => setPairs(r.data || []))
      .catch(() => setPairs([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchDuplicates(); }, [fetchDuplicates]);

  const pairKey = (pair) => `${pair.a.id}-${pair.b.id}`;

  const merge = async (pair, keepId, removeId) => {
    setMergingKey(pairKey(pair));
    try {
      await axios.post(`${API_URL}/api/artists/merge`, { keep_id: keepId, remove_id: removeId }, { headers: authHeaders() });
      setPairs(p => p.filter(x => pairKey(x) !== pairKey(pair)));
      showToast('Artists merged');
    } catch (err) {
      showToast(err.response?.data?.error || 'Error merging artists');
    }
    setMergingKey(null);
  };

  const dismiss = (pair) => {
    setDismissed(d => new Set(d).add(pairKey(pair)));
    showToast('Dismissed — not a duplicate');
  };

  const visiblePairs = pairs.filter(p => !dismissed.has(pairKey(p)));

  return (
    <div>
      <Toast message={toast} />
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-white text-lg font-bold">Duplicate Artists</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {loading ? 'Scanning…' : `${visiblePairs.length} likely duplicate pair${visiblePairs.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <button
          onClick={fetchDuplicates}
          className="text-xs font-semibold px-3 py-2 rounded-lg bg-white/[0.06] border border-white/15 text-gray-300 hover:text-white hover:bg-white/[0.1] transition-colors"
        >
          Rescan
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map(i => <div key={i} className="h-20 rounded-xl bg-white/[0.03] animate-pulse" />)}
        </div>
      ) : visiblePairs.length === 0 ? (
        <div className="text-center py-16 border border-white/[0.05] rounded-xl text-gray-600">
          <p className="text-3xl mb-3">✨</p>
          <p>No duplicate artists detected.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visiblePairs.map(pair => {
            const key = pairKey(pair);
            const merging = mergingKey === key;
            return (
              <div key={key} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    {Math.round(pair.similarity * 100)}% similar
                  </span>
                  <button onClick={() => dismiss(pair)} className="text-[11px] text-gray-600 hover:text-white transition-colors">
                    Not a duplicate
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {[pair.a, pair.b].map((artist, i) => {
                    const other = i === 0 ? pair.b : pair.a;
                    return (
                      <div key={artist.id} className="flex-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                        <Link to={`/artist/${artist.id}`} className="text-white text-sm font-semibold hover:text-brand-400 transition-colors">
                          {artist.name}
                        </Link>
                        <p className="text-gray-600 text-[11px] mt-0.5">
                          {artist.performance_count} performance{artist.performance_count !== 1 ? 's' : ''}
                        </p>
                        <button
                          onClick={() => merge(pair, artist.id, other.id)}
                          disabled={merging}
                          className="mt-2 w-full text-[11px] font-bold px-2 py-1.5 rounded-md bg-brand-600/20 border border-brand-600/30 text-brand-300 hover:bg-brand-600/30 transition-colors disabled:opacity-40"
                        >
                          {merging ? '…' : `Keep this, merge "${other.name}" in`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
