import API_URL from '../api';
import React, { useState, useEffect, useRef } from 'react';
import { Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import { getIsAdmin } from '../utils/auth';
import { useToast } from '../components/Toast';
import Toast from '../components/Toast';

const PAGE_SIZE = 20;

export default function CommentModerationQueue() {
  const isAdmin = getIsAdmin();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [toast, showToast] = useToast();
  const undoTimersRef = useRef({});

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    axios.get(`${API_URL}/api/admin/comments/pending`, { headers })
      .then(r => setComments(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAdmin]); // eslint-disable-line

  if (!isAdmin) return <Navigate to="/" />;

  const paginated = comments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(comments.length / PAGE_SIZE);

  const handleDelete = (commentId) => {
    // Optimistic removal
    setComments(prev => prev.filter(c => c.id !== commentId));
    showToast('Comment deleted. Undo in 3s…');

    const timer = setTimeout(async () => {
      try {
        await axios.delete(`${API_URL}/api/admin/comments/${commentId}`, { headers });
      } catch (err) {
        console.error(err);
      }
      delete undoTimersRef.current[commentId];
    }, 3000);

    undoTimersRef.current[commentId] = { timer, commentId };
  };

  return (
    <div>
      <Toast message={toast} />
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white mb-0.5">Comment Queue</h1>
        <p className="text-gray-500 text-sm">Review and moderate recent comments</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-5 animate-pulse h-20" />)}</div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-16 border border-white/[0.05] rounded-2xl text-gray-600">
          <p className="text-3xl mb-2">💬</p><p>No comments to review</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map(c => (
            <div key={c.id} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 flex items-start gap-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {c.profile_picture_url
                  ? <img src={c.profile_picture_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                  : c.username?.[0]?.toUpperCase()
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white font-semibold text-sm">@{c.username}</span>
                  <span className="text-gray-600 text-xs">on</span>
                  <Link to={`/set/${c.set_id}`} className="text-brand-400 hover:text-brand-300 text-xs font-medium transition-colors truncate max-w-[150px]">
                    {c.set_title}
                  </Link>
                  <span className="text-gray-600 text-xs">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-300 text-sm">{c.text}</p>
              </div>
              <button onClick={() => handleDelete(c.id)}
                className="flex-shrink-0 px-3 py-1.5 bg-red-600/20 hover:bg-red-600 border border-red-500/30 hover:border-red-500 text-red-300 hover:text-white text-xs font-bold rounded-xl transition-all duration-200">
                Delete
              </button>
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
