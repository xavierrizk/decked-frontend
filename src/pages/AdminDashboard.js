import API_URL from '../api';
import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import { getIsAdmin } from '../utils/auth';

const STATUS_TABS = ['pending', 'approved', 'rejected'];
const SECTIONS = ['DJ Requests', 'Verifications'];

export default function AdminDashboard() {
  const isAdmin = getIsAdmin();
  const [stats, setStats]             = useState(null);
  const [requests, setRequests]       = useState([]);
  const [djRequests, setDjRequests]   = useState([]);
  const [tab, setTab]                 = useState('pending');
  const [djTab, setDjTab]             = useState('pending');
  const [section, setSection]         = useState('DJ Requests');
  const [searchQ, setSearchQ]         = useState('');
  const [loading, setLoading]         = useState(true);
  const [actionId, setActionId]       = useState(null);
  const [rejectNotes, setRejectNotes] = useState({});
  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [statsRes, reqRes, djReqRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/dashboard`, { headers }),
        axios.get(`${API_URL}/api/admin/verification-requests?status=${tab}`, { headers }),
        axios.get(`${API_URL}/api/admin/dj-requests?status=${djTab}`, { headers }),
      ]);
      setStats(statsRes.data);
      setRequests(reqRes.data);
      setDjRequests(djReqRes.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [tab, djTab, isAdmin]); // eslint-disable-line

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (!isAdmin) return <Navigate to="/" />;

  const approve = async (id) => {
    setActionId(id);
    try {
      await axios.patch(`${API_URL}/api/admin/verification-requests/${id}/approve`, {}, { headers });
      await fetchAll();
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
    setActionId(null);
  };

  const reject = async (id) => {
    setActionId(id);
    try {
      await axios.patch(`${API_URL}/api/admin/verification-requests/${id}/reject`,
        { admin_notes: rejectNotes[id] || '' }, { headers });
      await fetchAll();
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
    setActionId(null);
  };

  const approveDjReq = async (id) => {
    setActionId(id);
    try {
      await axios.patch(`${API_URL}/api/admin/dj-requests/${id}/approve`, {}, { headers });
      await fetchAll();
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
    setActionId(null);
  };

  const rejectDjReq = async (id) => {
    setActionId(id);
    try {
      await axios.patch(`${API_URL}/api/admin/dj-requests/${id}/reject`,
        { admin_notes: rejectNotes[id] || '' }, { headers });
      await fetchAll();
    } catch (err) { alert(err.response?.data?.error || 'Error'); }
    setActionId(null);
  };

  const filtered = requests.filter(r =>
    !searchQ || r.dj_name?.toLowerCase().includes(searchQ.toLowerCase()) ||
    r.username?.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">⚙️ Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Manage verifications and monitor platform health</p>
        </div>
        <span className="text-xs bg-red-500/20 border border-red-500/30 text-red-300 font-bold px-3 py-1.5 rounded-full">Admin Only</span>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {[
            ['👥', 'Users',    stats.total_users],
            ['🎧', 'DJs',      stats.total_djs],
            ['🎵', 'Sets',     stats.total_sets],
            ['✅', 'Verified', stats.verified_djs],
            ['⏳', 'Pending',  stats.pending_requests, stats.pending_requests > 0],
          ].map(([icon, label, val, highlight]) => (
            <div key={label} className={`rounded-2xl border p-4 text-center ${highlight ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-white/[0.03] border-white/[0.07]'}`}>
              <p className="text-2xl mb-1">{icon}</p>
              <p className={`text-2xl font-extrabold ${highlight ? 'text-yellow-300' : 'text-white'}`}>{val}</p>
              <p className="text-gray-500 text-xs">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Section switcher */}
      <div className="flex gap-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1 mb-6 w-fit">
        {SECTIONS.map(s => (
          <button key={s} onClick={() => setSection(s)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${section === s ? 'bg-brand-600 text-white' : 'text-gray-500 hover:text-white'}`}>
            {s === 'DJ Requests' ? '🎧' : '✅'} {s}
          </button>
        ))}
      </div>

      {/* DJ Profile Requests Section */}
      {section === 'DJ Requests' && (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
            <div className="flex gap-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1">
              {STATUS_TABS.map(t => (
                <button key={t} onClick={() => setDjTab(t)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
                    djTab === t
                      ? t === 'pending' ? 'bg-yellow-500/20 text-yellow-300'
                      : t === 'approved' ? 'bg-green-500/20 text-green-300'
                      : 'bg-red-500/20 text-red-300'
                      : 'text-gray-500 hover:text-white'
                  }`}>
                  {t === 'pending' ? '⏳' : t === 'approved' ? '✅' : '❌'} {t}
                </button>
              ))}
            </div>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Filter…"
              className="bg-white/[0.04] border border-white/10 focus:border-brand-500 rounded-xl px-4 py-2 text-white placeholder-gray-600 text-sm outline-none transition-colors w-full sm:w-64" />
          </div>
          {loading ? <Skeletons /> : (() => {
            const filtered = djRequests.filter(r => !searchQ || r.dj_name?.toLowerCase().includes(searchQ.toLowerCase()) || r.username?.toLowerCase().includes(searchQ.toLowerCase()));
            return filtered.length === 0
              ? <Empty label={`No ${djTab} DJ requests`} icon={djTab === 'pending' ? '⏳' : djTab === 'approved' ? '✅' : '❌'} />
              : <div className="space-y-4">{filtered.map(r => <DjRequestCard key={r.id} r={r} tab={djTab} onApprove={() => approveDjReq(r.id)} onReject={() => rejectDjReq(r.id)} actionId={actionId} note={rejectNotes[r.id] || ''} onNoteChange={v => setRejectNotes(prev => ({ ...prev, [r.id]: v }))} />)}</div>;
          })()}
        </>
      )}

      {/* Verification Section */}
      {section === 'Verifications' && (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
            <div className="flex gap-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1">
              {STATUS_TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
                    tab === t
                      ? t === 'pending' ? 'bg-yellow-500/20 text-yellow-300'
                      : t === 'approved' ? 'bg-green-500/20 text-green-300'
                      : 'bg-red-500/20 text-red-300'
                      : 'text-gray-500 hover:text-white'
                  }`}>
                  {t === 'pending' ? '⏳' : t === 'approved' ? '✅' : '❌'} {t}
                </button>
              ))}
            </div>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Filter…"
              className="bg-white/[0.04] border border-white/10 focus:border-brand-500 rounded-xl px-4 py-2 text-white placeholder-gray-600 text-sm outline-none transition-colors w-full sm:w-64" />
          </div>
          {loading ? <Skeletons /> : (() => {
            const filtered = requests.filter(r => !searchQ || r.dj_name?.toLowerCase().includes(searchQ.toLowerCase()) || r.username?.toLowerCase().includes(searchQ.toLowerCase()));
            return filtered.length === 0
              ? <Empty label={`No ${tab} verification requests`} icon={tab === 'pending' ? '⏳' : tab === 'approved' ? '✅' : '❌'} />
              : <div className="space-y-4">{filtered.map(r => <RequestCard key={r.id} r={r} tab={tab} onApprove={() => approve(r.id)} onReject={() => reject(r.id)} actionId={actionId} note={rejectNotes[r.id] || ''} onNoteChange={v => setRejectNotes(prev => ({ ...prev, [r.id]: v }))} />)}</div>;
          })()}
        </>
      )}
    </div>
  );
}

function Skeletons() {
  return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5 animate-pulse h-28" />)}</div>;
}
function Empty({ label, icon }) {
  return <div className="text-center py-16 border border-white/[0.05] rounded-2xl text-gray-600"><p className="text-3xl mb-2">{icon}</p><p>{label}</p></div>;
}

function DjRequestCard({ r, tab, onApprove, onReject, actionId, note, onNoteChange }) {
  const [showReject, setShowReject] = useState(false);
  const busy = actionId === r.id;

  return (
    <div className={`bg-white/[0.03] border rounded-2xl p-5 ${tab === 'pending' ? 'border-yellow-500/20' : tab === 'approved' ? 'border-green-500/20' : 'border-red-500/20'}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {r.profile_picture_url
            ? <img src={r.profile_picture_url} alt={r.username} className="w-11 h-11 rounded-full object-cover border border-white/10 flex-shrink-0" />
            : <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">{r.username?.[0]?.toUpperCase()}</div>
          }
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="text-white font-extrabold">{r.dj_name}</p>
              <span className="text-gray-500 text-sm">requested by</span>
              <Link to={`/profile/${r.user_id}`} className="text-gray-400 hover:text-brand-400 text-sm transition-colors">@{r.username}</Link>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
              <span>📅 {new Date(r.created_at).toLocaleDateString()}</span>
              {r.reviewed_at && <span>· Reviewed {new Date(r.reviewed_at).toLocaleDateString()}</span>}
            </div>
            {r.bio && <p className="text-gray-400 text-sm mb-2 line-clamp-2">{r.bio}</p>}
            {r.soundcloud_url && (
              <a href={r.soundcloud_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-orange-300 hover:text-orange-200 transition-colors mb-1">
                🎵 SoundCloud →
              </a>
            )}
            {r.instagram_url && (
              <a href={r.instagram_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-pink-300 hover:text-pink-200 transition-colors ml-3 mb-1">
                📸 Instagram →
              </a>
            )}
            {r.why_decked && (
              <div className="mt-2 bg-black/30 rounded-xl px-3 py-2">
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider mb-1">Why Decked?</p>
                <p className="text-gray-300 text-sm">{r.why_decked}</p>
              </div>
            )}
            {r.admin_notes && (
              <div className="mt-2 bg-red-500/5 border border-red-500/20 rounded-xl px-3 py-2">
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider mb-1">Rejection reason</p>
                <p className="text-red-300 text-sm">{r.admin_notes}</p>
              </div>
            )}
          </div>
        </div>
        {tab === 'pending' && (
          <div className="flex flex-col gap-2 flex-shrink-0 min-w-[140px]">
            <button onClick={onApprove} disabled={busy}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95">
              {busy ? '…' : '✅ Approve'}
            </button>
            <button onClick={() => setShowReject(v => !v)}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 text-sm font-bold rounded-xl transition-all duration-200">
              ❌ Reject
            </button>
            {showReject && (
              <div className="space-y-2 mt-1">
                <textarea value={note} onChange={e => onNoteChange(e.target.value)} placeholder="Rejection reason…" rows={3}
                  className="w-full bg-white/[0.04] border border-red-500/20 focus:border-red-400/50 rounded-xl px-3 py-2 text-white placeholder-gray-600 text-xs outline-none resize-none" />
                <button onClick={onReject} disabled={busy}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-all">
                  {busy ? '…' : 'Confirm Reject'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RequestCard({ r, tab, onApprove, onReject, actionId, note, onNoteChange }) {
  const [showReject, setShowReject] = useState(false);
  const busy = actionId === r.id;

  return (
    <div className={`bg-white/[0.03] border rounded-2xl p-5 transition-all ${
      tab === 'pending' ? 'border-yellow-500/20' : tab === 'approved' ? 'border-green-500/20' : 'border-red-500/20'
    }`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Avatar + basic info */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {r.profile_picture_url
            ? <img src={r.profile_picture_url} alt={r.username} className="w-12 h-12 rounded-full object-cover border border-white/10 flex-shrink-0" />
            : <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">{r.username?.[0]?.toUpperCase()}</div>
          }
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <Link to={`/dj/${r.dj_id}`} className="text-white font-extrabold hover:text-brand-400 transition-colors">{r.dj_name}</Link>
              <span className="text-gray-500 text-sm">by</span>
              <Link to={`/profile/${r.user_id}`} className="text-gray-400 hover:text-brand-400 transition-colors text-sm">@{r.username}</Link>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
              <span>🎵 {r.set_count} sets</span>
              <span>👥 {r.follower_count} followers</span>
              <span>📅 {new Date(r.requested_at).toLocaleDateString()}</span>
            </div>
            {r.dj_bio && <p className="text-gray-500 text-sm line-clamp-2 mb-2">{r.dj_bio}</p>}

            {r.why_verify && (
              <div className="bg-black/30 rounded-xl px-3 py-2 mb-2">
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider mb-1">Why they want verification</p>
                <p className="text-gray-300 text-sm">{r.why_verify}</p>
              </div>
            )}
            {r.social_links && (
              <div className="bg-black/30 rounded-xl px-3 py-2 mb-2">
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider mb-1">Social Links</p>
                <p className="text-gray-300 text-sm whitespace-pre-line">{r.social_links}</p>
              </div>
            )}
            {r.admin_notes && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl px-3 py-2">
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider mb-1">Rejection reason</p>
                <p className="text-red-300 text-sm">{r.admin_notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons — only for pending */}
        {tab === 'pending' && (
          <div className="flex flex-col gap-2 flex-shrink-0 min-w-[140px]">
            <button onClick={onApprove} disabled={busy}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95">
              {busy ? '…' : '✅ Approve'}
            </button>
            <button onClick={() => setShowReject(v => !v)}
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 text-sm font-bold rounded-xl transition-all duration-200">
              ❌ Reject
            </button>
            {showReject && (
              <div className="space-y-2 mt-1">
                <textarea
                  value={note} onChange={e => onNoteChange(e.target.value)}
                  placeholder="Rejection reason (shown to DJ)…"
                  rows={3}
                  className="w-full bg-white/[0.04] border border-red-500/20 focus:border-red-400/50 rounded-xl px-3 py-2 text-white placeholder-gray-600 text-xs outline-none transition-colors resize-none"
                />
                <button onClick={onReject} disabled={busy}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-all duration-200">
                  {busy ? '…' : 'Confirm Reject'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
