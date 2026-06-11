import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { StarDisplay } from '../components/StarRating';
import { getCurrentUserId } from '../utils/auth';
import Toast, { useToast } from '../components/Toast';

export default function DJProfile() {
  const { id } = useParams();
  const [dj, setDJ]         = useState(null);
  const [sets, setSets]     = useState([]);
  const [stats, setStats]   = useState(null);
  const [follow, setFollow] = useState({ count: 0, following: false });
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [toast, showToast] = useToast();
  const currentUserId = getCurrentUserId();
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    Promise.all([
      axios.get(`${API_URL}/api/djs/${id}`),
      axios.get(`${API_URL}/api/sets/dj/${id}`),
      axios.get(`${API_URL}/api/djs/${id}/stats`),
      axios.get(`${API_URL}/api/follows/${id}`, { headers }),
    ]).then(([djRes, setsRes, statsRes, followRes]) => {
      setDJ(djRes.data);
      setSets(setsRes.data);
      setStats(statsRes.data);
      setFollow(followRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleFollow = async () => {
    if (!isLoggedIn) return;
    if (follow.following) {
      if (!window.confirm(`Unfollow ${dj?.name}?`)) return;
    }
    setFollowLoading(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      if (follow.following) {
        const res = await axios.delete(`${API_URL}/api/follows/${id}`, { headers });
        setFollow(res.data);
        showToast(`Unfollowed ${dj?.name}`);
      } else {
        const res = await axios.post(`${API_URL}/api/follows/${id}`, {}, { headers });
        setFollow(res.data);
        showToast(`You're now following ${dj?.name}! 🎵`);
      }
    } catch (err) { console.error(err); }
    setFollowLoading(false);
  };

  if (loading) return <Spinner />;
  if (!dj) return <div className="text-center py-20 text-gray-600">DJ not found</div>;

  const isOwnDj = dj.user_id === currentUserId;

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <Toast message={toast} />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-900/60 to-black border border-white/[0.07] rounded-2xl p-8 mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/10 to-indigo-600/10 pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-4xl flex-shrink-0 shadow-glow">
            🎧
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-3xl font-extrabold text-white">{dj.name}</h1>
              <span className="text-lg" title="DJ">🎵</span>
              {stats?.verified && (
                <span className="flex items-center gap-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold px-2.5 py-1 rounded-full">
                  ✅ Verified
                </span>
              )}
            </div>
            <p className="text-gray-400 mt-1 max-w-lg">{dj.bio || 'No bio available'}</p>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
              <Stat label="Followers" value={follow.count} />
              <Stat label="Sets" value={stats?.total_sets || sets.length} />
              {stats?.avg_rating && <Stat label="Avg Rating" value={`${stats.avg_rating}/5`} />}
            </div>
          </div>

          {/* Follow button */}
          {isLoggedIn && !isOwnDj && (
            <button onClick={handleFollow} disabled={followLoading}
              className={`flex-shrink-0 px-7 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 ${
                follow.following
                  ? 'bg-white/10 border border-white/20 text-white hover:bg-red-500/20 hover:border-red-400/30 hover:text-red-300'
                  : 'bg-brand-600 hover:bg-brand-500 text-white shadow-glow text-base'
              }`}>
              {followLoading ? '…' : follow.following ? '✓ Following' : '+ Follow'}
            </button>
          )}
          {!isLoggedIn && (
            <Link to="/login"
              className="flex-shrink-0 px-7 py-3 rounded-xl text-sm font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all duration-200 hover:scale-105">
              Follow
            </Link>
          )}
        </div>
      </div>

      {/* Top sets */}
      {stats?.top_sets?.length > 0 && (
        <div className="mb-6">
          <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest mb-3">🔥 Top Sets</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {stats.top_sets.map((s) => (
              <Link key={s.id} to={`/set/${s.id}`}
                className="bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-brand-500/30 rounded-xl p-4 transition-all group">
                <p className="text-white font-semibold text-sm group-hover:text-brand-400 transition-colors truncate">{s.title}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span>❤️ {s.like_count}</span>
                  {s.avg_rating && <span>⭐ {s.avg_rating}</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All sets */}
      <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest mb-4">All Sets</p>
      {sets.length === 0 ? (
        <Empty label="No sets yet" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sets.map((set) => (
            <Link key={set.id} to={`/set/${set.id}`}
              className="group bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.07] hover:border-brand-500/40 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-sm">
              <h3 className="text-white font-bold text-base group-hover:text-brand-400 transition-colors">{set.title}</h3>
              <div className="flex gap-4 mt-2 text-gray-500 text-sm">
                {set.location && <span>📍 {set.location}</span>}
                {set.duration  && <span>⏱️ {set.duration} mins</span>}
              </div>
              <span className="mt-3 inline-block text-brand-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">View Set →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="text-center sm:text-left">
      <p className="text-white font-bold text-lg leading-none">{value}</p>
      <p className="text-gray-500 text-xs">{label}</p>
    </div>
  );
}
function Spinner() {
  return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>;
}
function Empty({ label }) {
  return <div className="text-center py-16 border border-white/[0.05] rounded-2xl text-gray-600"><p className="text-3xl mb-2">🎵</p><p>{label}</p></div>;
}
