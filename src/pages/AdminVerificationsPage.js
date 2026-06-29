import React, { useState, useEffect } from 'react';
import API_URL from '../api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminVerificationsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/artist-verification/admin/pending`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
      if (err.response?.status === 403) navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id) => {
    try {
      await axios.patch(`${API_URL}/api/artist-verification/admin/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setRequests(r => r.filter(x => x.id !== id));
    } catch (err) {
      alert('Error approving verification');
    }
  };

  const reject = async (id) => {
    try {
      await axios.patch(
        `${API_URL}/api/artist-verification/admin/${id}/reject`,
        { reason: rejectReason || undefined },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setRequests(r => r.filter(x => x.id !== id));
      setRejectingId(null);
      setRejectReason('');
    } catch (err) {
      alert('Error rejecting verification');
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#FF006E' }} />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-1">Artist Verification Requests</h1>
      <p className="text-gray-500 text-sm mb-6">{requests.length} pending claims</p>

      {requests.length === 0 ? (
        <div className="text-center py-12 border border-white/[0.05] rounded-xl text-gray-500">
          <p>No pending verification requests.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <div key={req.id} className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold">{req.dj_name}</h3>
                  <p className="text-gray-600 text-xs mt-1">
                    Requested by <span className="text-gray-400">{req.requester}</span> • {req.email}
                  </p>
                  {req.bio && <p className="text-gray-500 text-xs mt-2">{req.bio}</p>}
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-600 bg-white/[0.03] px-2 py-1 rounded">
                    #{req.id}
                  </span>
                </div>
              </div>

              {req.proof_url && (
                <div className="mb-3">
                  <p className="text-[10px] font-semibold text-gray-500 mb-1">Proof:</p>
                  <a href={req.proof_url} target="_blank" rel="noreferrer" className="text-[#00D9FF] text-xs hover:underline break-all">
                    {req.proof_url}
                  </a>
                </div>
              )}

              {req.message && (
                <div className="mb-3 p-3 bg-white/[0.03] rounded-lg">
                  <p className="text-gray-400 text-xs">{req.message}</p>
                </div>
              )}

              {rejectingId === req.id ? (
                <div className="mb-3 space-y-2">
                  <textarea
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Rejection reason (optional)"
                    className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-xs outline-none focus:border-red-500/50"
                    rows="2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => reject(req.id)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/30"
                    >
                      Confirm Reject
                    </button>
                    <button
                      onClick={() => { setRejectingId(null); setRejectReason(''); }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-gray-400 text-xs font-semibold hover:bg-white/[0.08]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => approve(req.id)}
                    className="flex-1 px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold hover:bg-green-500/30"
                  >
                    ✓ Verify
                  </button>
                  <button
                    onClick={() => setRejectingId(req.id)}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/30"
                  >
                    ✕ Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
