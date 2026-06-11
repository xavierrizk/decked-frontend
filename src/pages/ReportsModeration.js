import API_URL from '../api';
import React, { useState, useEffect, useCallback } from 'react';
import { getIsAdmin } from '../utils/auth';
import { Navigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import Toast from '../components/Toast';
import axios from 'axios';

const STATUS_TABS = ['all', 'pending', 'reviewed', 'resolved'];
const TYPE_OPTIONS = ['all', 'set', 'comment', 'user'];

const STATUS_STYLE = {
  pending:  'bg-red-500/20 text-red-300 border-red-500/30',
  reviewed: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  resolved: 'bg-green-500/20 text-green-300 border-green-500/30',
};

const TYPE_STYLE = {
  set:     'bg-brand-600/20 text-brand-300 border-brand-600/30',
  comment: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  user:    'bg-orange-500/20 text-orange-300 border-orange-500/30',
};

const PAGE_SIZE = 20;

export default function ReportsModeration() {
  const isAdmin = getIsAdmin();
  const [reports, setReports] = useState([]);
  const [tab, setTab] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [toast, showToast] = useToast();

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = tab !== 'all' ? `?status=${tab}` : '';
      const r = await axios.get(`${API_URL}/api/admin/reports${params}`, { headers });
      setReports(r.data);
      setPage(1);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [tab]); // eslint-disable-line

  useEffect(() => { if (isAdmin) fetchReports(); }, [tab, isAdmin]); // eslint-disable-line

  if (!isAdmin) return <Navigate to="/" />;

  const filtered = typeFilter === 'all' ? reports : reports.filter(r => r.report_type === typeFilter);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API_URL}/api/admin/reports/${id}/status`, { status }, { headers });
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      showToast(`Marked as ${status}`);
    } catch (err) { console.error(err); }
  };

  const deleteReport = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/admin/reports/${id}`, { headers });
      setReports(prev => prev.filter(r => r.id !== id));
      showToast('Report deleted');
    } catch (err) { console.error(err); }
  };

  const deleteContent = async (report) => {
    if (!window.confirm(`Delete this ${report.report_type} (ID: ${report.target_id})?`)) return;
    try {
      if (report.report_type === 'set') {
        await axios.delete(`${API_URL}/api/admin/sets/${report.target_id}`, { headers });
        showToast('Set deleted');
      } else if (report.report_type === 'comment') {
        await axios.delete(`${API_URL}/api/admin/comments/${report.target_id}`, { headers });
        showToast('Comment deleted');
      }
      await updateStatus(report.id, 'resolved');
    } catch (err) {
      showToast(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div>
      <Toast message={toast} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white mb-0.5">Reports & Moderation</h1>
          <p className="text-gray-500 text-sm">Review user-submitted reports</p>
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="bg-white/[0.04] border border-white/10 text-white text-sm rounded-xl px-3 py-2 outline-none">
          {TYPE_OPTIONS.map(t => <option key={t} value={t} className="bg-[#0d0d0f]">{t === 'all' ? 'All Types' : t}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1 mb-5 w-fit">
        {STATUS_TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
              tab === t ? 'bg-brand-600/20 text-brand-300' : 'text-gray-500 hover:text-white'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5 animate-pulse h-24" />)}</div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-16 border border-white/[0.05] rounded-2xl text-gray-600">
          <p className="text-3xl mb-2">🚩</p><p>No {tab !== 'all' ? tab : ''} reports</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map(r => (
            <div key={r.id} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${TYPE_STYLE[r.report_type] || 'bg-white/10 text-gray-300 border-white/20'}`}>
                      {r.report_type}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${STATUS_STYLE[r.status] || 'bg-white/10 text-gray-300 border-white/20'}`}>
                      {r.status}
                    </span>
                    <span className="text-gray-500 text-xs">Target ID: {r.target_id}</span>
                  </div>
                  <p className="text-white font-semibold text-sm">{r.reason}</p>
                  {r.description && <p className="text-gray-400 text-sm mt-1">{r.description}</p>}
                  <div className="flex gap-3 mt-1 text-gray-600 text-xs">
                    <span>Reporter: <span className="text-gray-400">@{r.reporter_username || 'deleted'}</span></span>
                    <span>{new Date(r.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  {r.status !== 'reviewed' && (
                    <button onClick={() => updateStatus(r.id, 'reviewed')}
                      className="text-xs px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 rounded-lg hover:bg-yellow-500/20 transition-all font-semibold">
                      Mark Reviewed
                    </button>
                  )}
                  {r.status !== 'resolved' && (
                    <button onClick={() => updateStatus(r.id, 'resolved')}
                      className="text-xs px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-300 rounded-lg hover:bg-green-500/20 transition-all font-semibold">
                      Mark Resolved
                    </button>
                  )}
                  {(r.report_type === 'set' || r.report_type === 'comment') && (
                    <button onClick={() => deleteContent(r)}
                      className="text-xs px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/20 transition-all font-semibold">
                      Delete Content
                    </button>
                  )}
                  <button onClick={() => deleteReport(r.id)}
                    className="text-xs px-3 py-1.5 bg-white/[0.04] border border-white/10 text-gray-400 rounded-lg hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/20 transition-all font-semibold">
                    Delete Report
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 text-sm rounded-xl border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 transition-all">
            ← Prev
          </button>
          <span className="text-gray-500 text-sm">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-4 py-2 text-sm rounded-xl border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 transition-all">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
