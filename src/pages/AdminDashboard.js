import API_URL from '../api';
import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import NeonGridBackground from '../components/backgrounds/NeonGridBackground';
import { getIsAdmin } from '../utils/auth';
import DeleteModal from '../components/DeleteModal';
import Toast, { useToast } from '../components/Toast';
import AdminAnalyticsDashboard from './AdminAnalyticsDashboard';
import ReportsModeration from './ReportsModeration';
import BanManager from './BanManager';
import AnnouncementsManager from './AnnouncementsManager';
import CommentModerationQueue from './CommentModerationQueue';
import AdminSubmissionsPage from './AdminSubmissionsPage';

const STATUS_TABS = ['pending', 'approved', 'rejected'];
const NAV = [
  { id: 'overview',      icon: '📊', label: 'Overview' },
  { id: 'submissions',   icon: '📝', label: 'Set Submissions' },
  { id: 'dj-requests',   icon: '🎧', label: 'Artist Requests' },
  { id: 'verifications', icon: '✅', label: 'Verifications' },
  { id: 'manage-djs',    icon: '🗑️', label: 'Manage Artists' },
  { id: 'manage-sets',   icon: '🎵', label: 'Manage Sets' },
  { id: 'reports',       icon: '🚩', label: 'Reports & Moderation' },
  { id: 'ban-users',     icon: '🔒', label: 'Ban Users' },
  { id: 'announcements', icon: '📢', label: 'Announcements' },
  { id: 'comments',      icon: '💬', label: 'Comment Queue' },
  { id: 'audit-log',     icon: '📋', label: 'Audit Log' },
];

export default function AdminDashboard() {
  const isAdmin = getIsAdmin();
  const [section, setSection]         = useState('overview');
  const [stats, setStats]             = useState(null);
  // Verifications
  const [verifRequests, setVerifRequests] = useState([]);
  const [verifTab, setVerifTab]           = useState('pending');
  // DJ requests
  const [djRequests, setDjRequests]   = useState([]);
  const [djReqTab, setDjReqTab]       = useState('pending');
  // Manage
  const [allDjs, setAllDjs]           = useState([]);
  const [allSets, setAllSets]         = useState([]);
  const [auditLog, setAuditLog]       = useState([]);
  // Search
  const [searchQ, setSearchQ]         = useState('');
  // Loading / actions
  const [loading, setLoading]         = useState(false);
  const [actionId, setActionId]       = useState(null);
  const [rejectNotes, setRejectNotes] = useState({});
  // Delete modal
  const [deleteModal, setDeleteModal] = useState({ open: false, type: null, item: null, stats: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, showToast]            = useToast();

  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchSection = useCallback(async (sec) => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      if (sec === 'overview') {
        const r = await axios.get(`${API_URL}/api/admin/dashboard`, { headers });
        setStats(r.data);
      } else if (sec === 'dj-requests') {
        const r = await axios.get(`${API_URL}/api/admin/dj-requests?status=${djReqTab}`, { headers });
        setDjRequests(r.data);
      } else if (sec === 'verifications') {
        const r = await axios.get(`${API_URL}/api/admin/verification-requests?status=${verifTab}`, { headers });
        setVerifRequests(r.data);
      } else if (sec === 'manage-djs') {
        const r = await axios.get(`${API_URL}/api/admin/djs`, { headers });
        setAllDjs(r.data);
      } else if (sec === 'manage-sets') {
        const r = await axios.get(`${API_URL}/api/admin/sets`, { headers });
        setAllSets(r.data);
      } else if (sec === 'audit-log') {
        const r = await axios.get(`${API_URL}/api/admin/audit-log`, { headers });
        setAuditLog(r.data);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  }, [section, djReqTab, verifTab, isAdmin]); // eslint-disable-line

  useEffect(() => { fetchSection(section); }, [section, djReqTab, verifTab]); // eslint-disable-line

  // Also fetch overview stats on mount for the sidebar badges
  useEffect(() => {
    if (isAdmin) axios.get(`${API_URL}/api/admin/dashboard`, { headers }).then(r => setStats(r.data)).catch(() => {});
  }, [isAdmin]); // eslint-disable-line

  // ── Approve / Reject helpers ──────────────────────────────
  const act = async (url, method, body = {}) => {
    await axios({ method, url: `${API_URL}${url}`, data: body, headers });
    fetchSection(section);
  };

  const approveDjReq = async (id) => { setActionId(id); try { await act(`/api/admin/dj-requests/${id}/approve`, 'patch'); showToast('Artist profile approved!'); } catch {} setActionId(null); };
  const rejectDjReq  = async (id) => { setActionId(id); try { await act(`/api/admin/dj-requests/${id}/reject`, 'patch', { admin_notes: rejectNotes[id] || '' }); showToast('Request rejected'); } catch {} setActionId(null); };
  const approveVerif = async (id) => { setActionId(id); try { await act(`/api/admin/verification-requests/${id}/approve`, 'patch'); showToast('Verification approved! ✅'); } catch {} setActionId(null); };
  const rejectVerif  = async (id) => { setActionId(id); try { await act(`/api/admin/verification-requests/${id}/reject`, 'patch', { admin_notes: rejectNotes[id] || '' }); showToast('Verification rejected'); } catch {} setActionId(null); };

  // ── Delete helpers ────────────────────────────────────────
  const openDeleteDj = async (dj) => {
    const r = await axios.get(`${API_URL}/api/admin/djs/${dj.id}/stats`, { headers });
    setDeleteModal({ open: true, type: 'dj', item: dj, stats: r.data });
  };

  const openDeleteSet = (set) => {
    setDeleteModal({ open: true, type: 'set', item: set, stats: null });
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      const { type, item } = deleteModal;
      if (type === 'dj') {
        await axios.delete(`${API_URL}/api/admin/djs/${item.id}`, { headers });
        showToast(`Deleted Artist "${item.name}" and all their sets`);
        setAllDjs(prev => prev.filter(d => d.id !== item.id));
      } else {
        await axios.delete(`${API_URL}/api/admin/sets/${item.id}`, { headers });
        showToast(`Deleted set "${item.title}"`);
        setAllSets(prev => prev.filter(s => s.id !== item.id));
      }
      setDeleteModal({ open: false });
    } catch (err) { alert(err.response?.data?.error || 'Delete failed'); }
    setDeleteLoading(false);
  };

  if (!isAdmin) return <Navigate to="/" />;

  const filtered = (arr, keys) =>
    !searchQ ? arr : arr.filter(item => keys.some(k => item[k]?.toString().toLowerCase().includes(searchQ.toLowerCase())));

  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      <NeonGridBackground />
      <Toast message={toast} />
      <DeleteModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false })}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title={deleteModal.type === 'dj'
          ? `Delete Artist "${deleteModal.item?.name}"?`
          : `Delete "${deleteModal.item?.title}"?`}
        warning={deleteModal.type === 'dj'
          ? `This will permanently delete this Artist and ALL their sets, ratings, comments, and likes. This cannot be undone.`
          : `This will permanently delete this set and all its ratings, comments, and likes. This cannot be undone.`}
        stats={deleteModal.type === 'dj' && deleteModal.stats ? [
          { label: 'Sets',      value: deleteModal.stats.set_count },
          { label: 'Followers', value: deleteModal.stats.follower_count },
          { label: 'Ratings',   value: deleteModal.stats.rating_count },
        ] : deleteModal.type === 'set' && deleteModal.item ? [
          { label: 'Ratings',  value: deleteModal.item.rating_count },
          { label: 'Comments', value: deleteModal.item.comment_count },
          { label: 'Likes',    value: deleteModal.item.like_count },
        ] : []}
      />

      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-white/[0.06] bg-black/40 py-6 px-3 hidden sm:block">
        <p className="text-gray-600 text-xs font-bold uppercase tracking-widest px-3 mb-3">Admin</p>
        <nav className="space-y-0.5">
          {NAV.map(n => (
            <button key={n.id} onClick={() => { setSection(n.id); setSearchQ(''); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${
                section === n.id ? 'bg-brand-600/20 text-brand-300 border border-brand-600/30' : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
              }`}>
              <span>{n.icon}</span>
              <span>{n.label}</span>
              {n.id === 'dj-requests' && stats?.pending_requests > 0 && (
                <span className="ml-auto text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-1.5 py-0.5 rounded-full font-bold">{stats.pending_requests}</span>
              )}
              {n.id === 'reports' && stats?.active_reports > 0 && (
                <span className="ml-auto text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-1.5 py-0.5 rounded-full font-bold">{stats.active_reports}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile nav */}
      <div className="sm:hidden w-full fixed bottom-0 left-0 z-30 bg-black/90 border-t border-white/[0.06] flex">
        {NAV.map(n => (
          <button key={n.id} onClick={() => setSection(n.id)}
            className={`flex-1 py-3 text-xs font-semibold flex flex-col items-center gap-0.5 transition-colors ${section === n.id ? 'text-brand-400' : 'text-gray-600'}`}>
            <span>{n.icon}</span>
            <span>{n.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 px-6 py-8 pb-20 sm:pb-8 overflow-auto">
        {/* Overview — Analytics Dashboard */}
        {section === 'overview' && <AdminAnalyticsDashboard />}

        {/* Set Submissions */}
        {section === 'submissions' && <AdminSubmissionsPage />}

        {/* Reports & Moderation */}
        {section === 'reports' && <ReportsModeration />}

        {/* Ban Users */}
        {section === 'ban-users' && <BanManager />}

        {/* Announcements */}
        {section === 'announcements' && <AnnouncementsManager />}

        {/* Comment Queue */}
        {section === 'comments' && <CommentModerationQueue />}

        {/* DJ Requests */}
        {section === 'dj-requests' && (
          <div>
            <SectionHeader title="🎧 Artist Requests" subtitle="Review and approve Artist profile requests" />
            <Toolbar tabs={STATUS_TABS} active={djReqTab} onChange={t => { setDjReqTab(t); setSearchQ(''); }} searchQ={searchQ} onSearch={setSearchQ} placeholder="Filter by Artist name or user…" />
            {loading ? <Skeletons /> : (() => {
              const rows = filtered(djRequests, ['dj_name', 'username']);
              return rows.length === 0 ? <Empty label={`No ${djReqTab} Artist requests`} icon={STATUS_ICON[djReqTab]} />
                : <div className="space-y-4">{rows.map(r => <DjRequestCard key={r.id} r={r} tab={djReqTab} actionId={actionId} onApprove={() => approveDjReq(r.id)} onReject={() => rejectDjReq(r.id)} note={rejectNotes[r.id] || ''} onNoteChange={v => setRejectNotes(p => ({...p,[r.id]:v}))} />)}</div>;
            })()}
          </div>
        )}

        {/* Verifications */}
        {section === 'verifications' && (
          <div>
            <SectionHeader title="✅ Verifications" subtitle="Badge requests from Artists" />
            <Toolbar tabs={STATUS_TABS} active={verifTab} onChange={t => { setVerifTab(t); setSearchQ(''); }} searchQ={searchQ} onSearch={setSearchQ} placeholder="Filter by Artist name…" />
            {loading ? <Skeletons /> : (() => {
              const rows = filtered(verifRequests, ['dj_name', 'username']);
              return rows.length === 0 ? <Empty label={`No ${verifTab} verification requests`} icon={STATUS_ICON[verifTab]} />
                : <div className="space-y-4">{rows.map(r => <VerifCard key={r.id} r={r} tab={verifTab} actionId={actionId} onApprove={() => approveVerif(r.id)} onReject={() => rejectVerif(r.id)} note={rejectNotes[r.id] || ''} onNoteChange={v => setRejectNotes(p => ({...p,[r.id]:v}))} />)}</div>;
            })()}
          </div>
        )}

        {/* Manage DJs */}
        {section === 'manage-djs' && (
          <div>
            <SectionHeader title="🗑️ Manage Artists" subtitle="Delete Artist profiles and all associated content" danger />
            <Toolbar searchQ={searchQ} onSearch={setSearchQ} placeholder="Search Artists…" />
            {loading ? <Skeletons /> : (() => {
              const rows = filtered(allDjs, ['name']);
              return rows.length === 0 ? <Empty label="No Artists found" icon="🎧" />
                : (
                  <div className="space-y-2">
                    {rows.map(dj => (
                      <div key={dj.id} className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.07] hover:border-white/10 rounded-2xl px-5 py-4 transition-all">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-xl flex-shrink-0">🎧</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link to={`/artist/${dj.id}`} className="text-white font-bold hover:text-brand-400 transition-colors truncate">{dj.name}</Link>
                            {dj.verified && <span className="text-xs">✅</span>}
                          </div>
                          <p className="text-gray-500 text-xs mt-0.5">
                            🎵 {dj.set_count} sets · 👥 {dj.follower_count} followers · ⭐ {dj.rating_count} ratings
                          </p>
                        </div>
                        <button onClick={() => openDeleteDj(dj)}
                          className="flex-shrink-0 px-4 py-2 bg-red-600/20 hover:bg-red-600 border border-red-500/30 hover:border-red-500 text-red-300 hover:text-white text-xs font-bold rounded-xl transition-all duration-200 hover:scale-105">
                          🗑️ Delete
                        </button>
                      </div>
                    ))}
                  </div>
                );
            })()}
          </div>
        )}

        {/* Manage Sets */}
        {section === 'manage-sets' && (
          <div>
            <SectionHeader title="🎵 Manage Sets" subtitle="Delete individual sets" danger />
            <Toolbar searchQ={searchQ} onSearch={setSearchQ} placeholder="Search by title or Artist…" />
            {loading ? <Skeletons /> : (() => {
              const rows = filtered(allSets, ['title', 'dj_name']);
              return rows.length === 0 ? <Empty label="No sets found" icon="🎵" />
                : (
                  <div className="space-y-2">
                    {rows.map(set => (
                      <div key={set.id} className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.07] hover:border-white/10 rounded-2xl px-5 py-4 transition-all">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <Link to={`/set/${set.id}`} className="text-white font-bold hover:text-brand-400 transition-colors truncate">{set.title}</Link>
                          </div>
                          <p className="text-gray-500 text-xs">
                            by <span className="text-brand-400">{set.dj_name}</span> · ❤️ {set.like_count} · ⭐ {set.rating_count} ratings · 💬 {set.comment_count} comments
                            · {new Date(set.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button onClick={() => openDeleteSet(set)}
                          className="flex-shrink-0 px-4 py-2 bg-red-600/20 hover:bg-red-600 border border-red-500/30 hover:border-red-500 text-red-300 hover:text-white text-xs font-bold rounded-xl transition-all duration-200 hover:scale-105">
                          🗑️ Delete
                        </button>
                      </div>
                    ))}
                  </div>
                );
            })()}
          </div>
        )}

        {/* Audit Log */}
        {section === 'audit-log' && (
          <div>
            <SectionHeader title="📋 Audit Log" subtitle="Admin actions history" />
            {loading ? <Skeletons /> : auditLog.length === 0 ? <Empty label="No actions yet" icon="📋" /> : (
              <div className="space-y-2">
                {auditLog.map(log => (
                  <div key={log.id} className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                    <span className="text-lg flex-shrink-0">{log.action.includes('delete') ? '🗑️' : log.action.includes('approve') ? '✅' : '❌'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        <span className="text-brand-400">@{log.admin_username}</span>{' '}
                        <span className="text-gray-400">{log.action.replace('_', ' ')}</span>{' '}
                        <span className="text-white font-bold">{log.target_name}</span>
                      </p>
                      <p className="text-gray-600 text-xs mt-0.5">{new Date(log.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────

const STATUS_ICON = { pending: '⏳', approved: '✅', rejected: '❌' };

function SectionHeader({ title, subtitle, danger }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-extrabold text-white mb-0.5">{title}</h1>
      <p className={`text-sm ${danger ? 'text-red-400/70' : 'text-gray-500'}`}>{subtitle}</p>
      {danger && <div className="mt-2 inline-flex items-center gap-1.5 text-xs bg-red-500/10 border border-red-500/20 text-red-300 px-3 py-1 rounded-full">⚠️ Danger Zone — deletions are permanent</div>}
    </div>
  );
}

function Toolbar({ tabs, active, onChange, searchQ, onSearch, placeholder }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-5">
      {tabs && (
        <div className="flex gap-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1 flex-shrink-0">
          {tabs.map(t => (
            <button key={t} onClick={() => onChange(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${active === t
                ? t === 'pending' ? 'bg-yellow-500/20 text-yellow-300' : t === 'approved' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                : 'text-gray-500 hover:text-white'}`}>
              {STATUS_ICON[t]} {t}
            </button>
          ))}
        </div>
      )}
      <input value={searchQ} onChange={e => onSearch(e.target.value)} placeholder={placeholder}
        className="bg-white/[0.04] border border-white/10 focus:border-brand-500 rounded-xl px-4 py-2 text-white placeholder-gray-600 text-sm outline-none transition-colors w-full sm:w-72" />
    </div>
  );
}

function Skeletons({ count = 4 }) {
  return <div className="space-y-3">{[...Array(count)].map((_, i) => <div key={i} className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5 animate-pulse h-20" />)}</div>;
}

function Empty({ label, icon }) {
  return <div className="text-center py-16 border border-white/[0.05] rounded-2xl text-gray-600"><p className="text-3xl mb-2">{icon}</p><p>{label}</p></div>;
}

function ActionButtons({ tab, onApprove, onReject, actionId, id, note, onNoteChange }) {
  const [showReject, setShowReject] = useState(false);
  const busy = actionId === id;
  if (tab !== 'pending') return null;
  return (
    <div className="flex flex-col gap-2 flex-shrink-0 min-w-[140px]">
      <button onClick={onApprove} disabled={busy} className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-all hover:scale-105 active:scale-95">
        {busy ? '…' : '✅ Approve'}
      </button>
      <button onClick={() => setShowReject(v => !v)} className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 text-sm font-bold rounded-xl transition-all">
        ❌ Reject
      </button>
      {showReject && (
        <div className="space-y-2">
          <textarea value={note} onChange={e => onNoteChange(e.target.value)} placeholder="Reason…" rows={3}
            className="w-full bg-white/[0.04] border border-red-500/20 rounded-xl px-3 py-2 text-white placeholder-gray-600 text-xs outline-none resize-none" />
          <button onClick={onReject} disabled={busy} className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-sm font-bold rounded-xl transition-all">
            {busy ? '…' : 'Confirm'}
          </button>
        </div>
      )}
    </div>
  );
}

function CardShell({ children, tab }) {
  const border = tab === 'pending' ? 'border-yellow-500/20' : tab === 'approved' ? 'border-green-500/20' : 'border-red-500/20';
  return <div className={`bg-white/[0.03] border ${border} rounded-2xl p-5`}>{children}</div>;
}

function DjRequestCard({ r, tab, actionId, onApprove, onReject, note, onNoteChange }) {
  return (
    <CardShell tab={tab}>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {r.profile_picture_url
            ? <img src={r.profile_picture_url} alt="" className="w-11 h-11 rounded-full object-cover border border-white/10 flex-shrink-0" />
            : <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">{r.username?.[0]?.toUpperCase()}</div>
          }
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="text-white font-extrabold">{r.dj_name}</p>
              <span className="text-gray-500 text-sm">by</span>
              <Link to={`/profile/${r.user_id}`} className="text-gray-400 hover:text-brand-400 text-sm">@{r.username}</Link>
            </div>
            <p className="text-gray-500 text-xs mb-2">📅 {new Date(r.created_at).toLocaleDateString()}</p>
            {r.bio && <p className="text-gray-400 text-sm mb-2 line-clamp-2">{r.bio}</p>}
            <div className="flex gap-3 flex-wrap">
              {r.soundcloud_url && <a href={r.soundcloud_url} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-300 hover:text-orange-200">🎵 SoundCloud →</a>}
              {r.instagram_url  && <a href={r.instagram_url}  target="_blank" rel="noopener noreferrer" className="text-xs text-pink-300  hover:text-pink-200">📸 Instagram →</a>}
            </div>
            {r.why_decked && <div className="mt-2 bg-black/30 rounded-xl px-3 py-2"><p className="text-gray-600 text-xs font-semibold uppercase tracking-wider mb-1">Why DECK'D?</p><p className="text-gray-300 text-sm">{r.why_decked}</p></div>}
            {r.admin_notes && <div className="mt-2 bg-red-500/5 border border-red-500/20 rounded-xl px-3 py-2"><p className="text-red-300 text-sm">{r.admin_notes}</p></div>}
          </div>
        </div>
        <ActionButtons tab={tab} id={r.id} actionId={actionId} onApprove={onApprove} onReject={onReject} note={note} onNoteChange={onNoteChange} />
      </div>
    </CardShell>
  );
}

function VerifCard({ r, tab, actionId, onApprove, onReject, note, onNoteChange }) {
  return (
    <CardShell tab={tab}>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {r.profile_picture_url
            ? <img src={r.profile_picture_url} alt="" className="w-11 h-11 rounded-full object-cover border border-white/10 flex-shrink-0" />
            : <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">{r.username?.[0]?.toUpperCase()}</div>
          }
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Link to={`/artist/${r.dj_id}`} className="text-white font-extrabold hover:text-brand-400 transition-colors">{r.dj_name}</Link>
              <span className="text-gray-500 text-sm">by @{r.username}</span>
            </div>
            <p className="text-gray-500 text-xs mb-2">👥 {r.follower_count} followers · 🎵 {r.set_count} sets · 📅 {new Date(r.requested_at).toLocaleDateString()}</p>
            {r.why_verify && <div className="bg-black/30 rounded-xl px-3 py-2 mb-2"><p className="text-gray-600 text-xs font-semibold uppercase tracking-wider mb-1">Why verify?</p><p className="text-gray-300 text-sm">{r.why_verify}</p></div>}
            {r.social_links && <p className="text-gray-500 text-xs">{r.social_links}</p>}
            {r.admin_notes && <div className="mt-2 bg-red-500/5 border border-red-500/20 rounded-xl px-3 py-2"><p className="text-red-300 text-sm">{r.admin_notes}</p></div>}
          </div>
        </div>
        <ActionButtons tab={tab} id={r.id} actionId={actionId} onApprove={onApprove} onReject={onReject} note={note} onNoteChange={onNoteChange} />
      </div>
    </CardShell>
  );
}
