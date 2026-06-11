import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { getIsAdmin } from '../utils/auth';
import { useToast } from '../components/Toast';
import Toast from '../components/Toast';

function AnnouncementPreview({ title, message }) {
  if (!title && !message) return null;
  return (
    <div className="mt-3 px-4 py-3 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-xl">
      <p className="text-xs text-amber-300 font-semibold uppercase tracking-wider mb-1">Preview</p>
      <p className="text-white font-bold text-sm">{title || 'Announcement Title'}</p>
      <p className="text-amber-100 text-sm mt-1">{message || 'Announcement message text here…'}</p>
    </div>
  );
}

function AnnouncementForm({ initial, onSave, onCancel }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [message, setMessage] = useState(initial?.message || '');
  const [expiresAt, setExpiresAt] = useState(
    initial?.expires_at ? new Date(initial.expires_at).toISOString().slice(0, 16) : ''
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave({ title, message, expires_at: expiresAt || null });
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-brand-600/30 rounded-2xl p-5 space-y-4 mb-6">
      <h3 className="text-white font-bold">{initial ? 'Edit Announcement' : 'New Announcement'}</h3>
      <div>
        <label className="block text-gray-400 text-sm mb-1.5">Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} required
          placeholder="Announcement title…"
          className="w-full bg-white/[0.04] border border-white/10 focus:border-brand-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm outline-none transition-colors" />
      </div>
      <div>
        <label className="block text-gray-400 text-sm mb-1.5">Message</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={3}
          placeholder="Full announcement message…"
          className="w-full bg-white/[0.04] border border-white/10 focus:border-brand-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm outline-none transition-colors resize-none" />
      </div>
      <div>
        <label className="block text-gray-400 text-sm mb-1.5">Expiry (optional)</label>
        <input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
          className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-colors" />
      </div>
      <AnnouncementPreview title={title} message={message} />
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel}
          className="px-4 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:text-white text-sm font-semibold transition-all">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-sm font-bold transition-all">
          {saving ? '…' : initial ? 'Save Changes' : 'Create Announcement'}
        </button>
      </div>
    </form>
  );
}

export default function AnnouncementsManager() {
  const isAdmin = getIsAdmin();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, showToast] = useToast();

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const r = await axios.get(`${API_URL}/api/admin/announcements`, { headers });
      setAnnouncements(r.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { if (isAdmin) fetchAnnouncements(); }, [isAdmin]); // eslint-disable-line

  if (!isAdmin) return <Navigate to="/" />;

  const handleCreate = async (data) => {
    try {
      await axios.post(`${API_URL}/api/admin/announcements`, data, { headers });
      showToast('Announcement created');
      setShowForm(false);
      fetchAnnouncements();
    } catch (err) { showToast('Failed to create'); }
  };

  const handleUpdate = async (data) => {
    try {
      await axios.patch(`${API_URL}/api/admin/announcements/${editing.id}`, data, { headers });
      showToast('Announcement updated');
      setEditing(null);
      fetchAnnouncements();
    } catch (err) { showToast('Failed to update'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/announcements/${id}`, { headers });
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      showToast('Announcement deleted');
    } catch (err) { showToast('Delete failed'); }
  };

  const isExpired = (a) => a.expires_at && new Date(a.expires_at) < new Date();

  return (
    <div>
      <Toast message={toast} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white mb-0.5">Announcements</h1>
          <p className="text-gray-500 text-sm">Manage platform announcements</p>
        </div>
        {!showForm && !editing && (
          <button onClick={() => setShowForm(true)}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-xl transition-all hover:scale-105 active:scale-95">
            + New Announcement
          </button>
        )}
      </div>

      {(showForm && !editing) && (
        <AnnouncementForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
      )}
      {editing && (
        <AnnouncementForm initial={editing} onSave={handleUpdate} onCancel={() => setEditing(null)} />
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5 animate-pulse h-24" />)}</div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 border border-white/[0.05] rounded-2xl text-gray-600">
          <p className="text-3xl mb-2">📢</p><p>No announcements</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a.id} className={`bg-white/[0.03] border rounded-2xl p-5 ${isExpired(a) ? 'border-white/[0.04] opacity-50' : 'border-white/[0.07]'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-bold">{a.title}</p>
                    {isExpired(a) && (
                      <span className="text-xs px-2 py-0.5 bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-full">expired</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">{a.message}</p>
                  <div className="flex gap-3 mt-2 text-gray-600 text-xs">
                    <span>Created {new Date(a.created_at).toLocaleDateString()}</span>
                    {a.expires_at && <span>Expires {new Date(a.expires_at).toLocaleDateString()}</span>}
                    {a.admin_username && <span>By @{a.admin_username}</span>}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => { setEditing(a); setShowForm(false); }}
                    className="px-3 py-1.5 bg-white/[0.04] border border-white/10 text-gray-300 text-xs font-semibold rounded-xl hover:border-brand-500/40 hover:text-white transition-all">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(a.id)}
                    className="px-3 py-1.5 bg-red-600/20 border border-red-500/30 text-red-300 text-xs font-semibold rounded-xl hover:bg-red-600 hover:text-white transition-all">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
