import React, { useState, useEffect, useCallback } from 'react';
import API_URL from '../api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const STATUS_TABS = [
  { key: 'pending',  label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all',      label: 'All' },
];

const REJECTION_TEMPLATES = [
  'Duplicate submission',
  'Low quality recording',
  'Needs clarification',
  'Not a real event',
  'Incorrect venue/date',
];

export default function AdminSubmissionsPage() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending');
  const [search, setSearch] = useState('');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [bulkRejecting, setBulkRejecting] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState('');

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/submissions/admin/pending`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: { status, search },
      });
      setSubmissions(res.data);
      setSelected(new Set());
    } catch (err) {
      console.error('Error fetching submissions:', err);
      if (err.response?.status === 403) navigate('/');
    } finally {
      setLoading(false);
    }
  }, [status, search, navigate]);

  useEffect(() => {
    const t = setTimeout(fetchSubmissions, 300);
    return () => clearTimeout(t);
  }, [fetchSubmissions]);

  const approve = async (id) => {
    try {
      await axios.patch(`${API_URL}/api/submissions/admin/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSubmissions(s => s.filter(x => x.id !== id));
    } catch (err) {
      alert('Error approving submission');
    }
  };

  const reject = async (id) => {
    try {
      await axios.patch(`${API_URL}/api/submissions/admin/${id}/reject`,
        { reason: rejectReason || undefined },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSubmissions(s => s.filter(x => x.id !== id));
      setRejectingId(null);
      setRejectReason('');
    } catch (err) {
      alert('Error rejecting submission');
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === submissions.length) setSelected(new Set());
    else setSelected(new Set(submissions.map(s => s.id)));
  };

  const bulkApprove = async () => {
    if (selected.size === 0) return;
    try {
      await axios.patch(`${API_URL}/api/submissions/admin/bulk-approve`,
        { ids: Array.from(selected) },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSubmissions(s => s.filter(x => !selected.has(x.id)));
      setSelected(new Set());
    } catch (err) {
      alert('Error bulk approving');
    }
  };

  const bulkReject = async () => {
    if (selected.size === 0) return;
    try {
      await axios.patch(`${API_URL}/api/submissions/admin/bulk-reject`,
        { ids: Array.from(selected), reason: bulkRejectReason || undefined },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSubmissions(s => s.filter(x => !selected.has(x.id)));
      setSelected(new Set());
      setBulkRejecting(false);
      setBulkRejectReason('');
    } catch (err) {
      alert('Error bulk rejecting');
    }
  };

  const isPending = status === 'pending' || status === 'all';

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-1">Set Submissions</h1>
      <p className="text-gray-500 text-sm mb-6">{submissions.length} {status === 'all' ? 'total' : status}</p>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {STATUS_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setStatus(t.key)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              status === t.key
                ? 'bg-brand-500/30 border border-brand-500/50 text-white'
                : 'bg-white/[0.05] border border-white/[0.07] text-gray-400 hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by DJ, venue, or submitter..."
          className="ml-auto px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-xs outline-none focus:border-[#00D9FF]/50 min-w-[220px]"
        />
      </div>

      {/* Bulk action bar */}
      {submissions.length > 0 && isPending && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-white/[0.02] border border-white/[0.07] rounded-lg">
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.size === submissions.length && submissions.length > 0}
              onChange={selectAll}
              className="accent-[#00D9FF]"
            />
            Select all
          </label>
          {selected.size > 0 && (
            <>
              <span className="text-xs text-gray-500">{selected.size} selected</span>
              <div className="ml-auto flex gap-2">
                <button
                  onClick={bulkApprove}
                  className="px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold hover:bg-green-500/30"
                >
                  Approve Selected
                </button>
                <button
                  onClick={() => setBulkRejecting(true)}
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/30"
                >
                  Reject Selected
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {bulkRejecting && (
        <div className="mb-4 p-3 bg-white/[0.02] border border-red-500/20 rounded-lg space-y-2">
          <select
            value={bulkRejectReason}
            onChange={e => setBulkRejectReason(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-xs outline-none focus:border-red-500/50"
          >
            <option value="">Select a reason (optional)</option>
            {REJECTION_TEMPLATES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={bulkReject} className="flex-1 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/30">
              Confirm Reject {selected.size} Submission{selected.size !== 1 ? 's' : ''}
            </button>
            <button onClick={() => { setBulkRejecting(false); setBulkRejectReason(''); }} className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.1] text-gray-400 text-xs font-semibold hover:bg-white/[0.08]">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#FF006E' }} />
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-12 border border-white/[0.05] rounded-xl text-gray-500">
          <p>No {status === 'all' ? '' : status} submissions{search ? ' matching your search' : ''}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map(sub => (
            <div
              key={sub.id}
              className={`bg-white/[0.02] border rounded-xl p-4 ${
                sub.is_possible_duplicate ? 'border-yellow-500/40' : 'border-white/[0.07]'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {sub.status === 'pending' && (
                    <input
                      type="checkbox"
                      checked={selected.has(sub.id)}
                      onChange={() => toggleSelect(sub.id)}
                      className="mt-1 accent-[#00D9FF] flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-semibold">{sub.dj_name}</h3>
                      {sub.is_possible_duplicate && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 rounded">
                          Possible Duplicate
                        </span>
                      )}
                      {sub.status !== 'pending' && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          sub.status === 'approved' ? 'text-green-400 bg-green-500/10 border border-green-500/30' : 'text-red-400 bg-red-500/10 border border-red-500/30'
                        }`}>
                          {sub.status}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm">{sub.venue_name}, {sub.city} • {new Date(sub.date).toLocaleDateString()}</p>
                    <p className="text-gray-600 text-xs mt-1">Submitted by <span className="text-gray-400">{sub.username}</span></p>
                    {sub.rejection_reason && (
                      <p className="text-red-400/80 text-xs mt-1">Reason: {sub.rejection_reason}</p>
                    )}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-600 bg-white/[0.03] px-2 py-1 rounded flex-shrink-0">
                  ID: {sub.id}
                </span>
              </div>

              <div className="mb-3 p-3 bg-white/[0.03] rounded-lg">
                <a
                  href={sub.youtube_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#00D9FF] text-xs hover:underline break-all"
                >
                  {sub.youtube_url}
                </a>
              </div>

              {sub.status === 'pending' && (
                rejectingId === sub.id ? (
                  <div className="mb-3 space-y-2">
                    <select
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-xs outline-none focus:border-red-500/50"
                    >
                      <option value="">Select a reason (optional)</option>
                      {REJECTION_TEMPLATES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <textarea
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder="Or write a custom reason"
                      className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-white text-xs outline-none focus:border-red-500/50"
                      rows="2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => reject(sub.id)}
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
                      onClick={() => approve(sub.id)}
                      className="flex-1 px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-semibold hover:bg-green-500/30"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectingId(sub.id)}
                      className="flex-1 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/30"
                    >
                      Reject
                    </button>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
