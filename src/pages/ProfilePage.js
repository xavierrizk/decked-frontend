import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SmoothGradient from '../components/backgrounds/SmoothGradient';
import { StarDisplay } from '../components/StarRating';
import { getCurrentUserId } from '../utils/auth';
import Toast, { useToast } from '../components/Toast';
import ReportModal from '../components/ReportModal';
import ReviewDetailModal from '../components/ReviewDetailModal';

export default function ProfilePage() {
  const { userId }              = useParams();
  const navigate                = useNavigate();
  const [profile, setProfile]   = useState(null);
  const [ratings, setRatings]   = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('reviews');
  const [friendData, setFriendData] = useState({ friends: false, friendCount: 0, commonCount: 0 });
  const [friendLoading, setFriendLoading] = useState(false);
  const [loading, setLoading]   = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [toast, showToast]      = useToast();
  const currentUserId           = getCurrentUserId();
  const isOwn                   = parseInt(userId) === currentUserId;
  const isLoggedIn              = !!localStorage.getItem('token');

  const authHeaders = () => ({ Authorization: 'Bearer ' + localStorage.getItem('token') });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    Promise.all([
      axios.get(`${API_URL}/api/users/${userId}`),
      axios.get(`${API_URL}/api/users/${userId}/ratings`),
      axios.get(`${API_URL}/api/friends/${userId}`, { headers }),
    ])
      .then(([profileRes, ratingsRes, friendRes]) => {
        setProfile(profileRes.data);
        setRatings(ratingsRes.data);
        setFriendData(friendRes.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  const fetchFavorites = async () => {
    if (!isOwn) return;
    setFavLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/user/favorite-reviews`, { headers: authHeaders() });
      setFavorites(res.data);
    } catch (err) {
      console.error(err);
    }
    setFavLoading(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'favorites' && favorites.length === 0) {
      fetchFavorites();
    }
  };

  const handleFriend = async () => {
    if (!isLoggedIn) return;
    if (friendData.friends) {
      if (!window.confirm(`Remove ${profile?.username} as a friend?`)) return;
    }
    setFriendLoading(true);
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      if (friendData.friends) {
        const res = await axios.delete(`${API_URL}/api/friends/${userId}`, { headers });
        setFriendData(prev => ({ ...prev, friends: false, friendCount: res.data.count }));
        showToast(`Removed ${profile?.username} as a friend`);
      } else {
        const res = await axios.post(`${API_URL}/api/friends/${userId}`, {}, { headers });
        setFriendData(prev => ({ ...prev, friends: true, friendCount: res.data.count }));
        showToast(`You and ${profile?.username} are now friends! 🤝`);
      }
    } catch (err) { console.error(err); }
    setFriendLoading(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Profile link copied!');
  };

  if (loading) return <Spinner />;
  if (!profile) return <div className="text-center py-20 text-gray-600">User not found</div>;

  const joined = profile.member_since
    ? new Date(profile.member_since).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <SmoothGradient />
      <Toast message={toast} />
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        reportType="user"
        targetId={parseInt(userId)}
        targetName={profile.username}
      />
      <ReviewDetailModal
        review={selectedReview}
        open={!!selectedReview}
        onClose={() => setSelectedReview(null)}
        onLikeToggle={null}
        onEdit={selectedReview ? () => { setSelectedReview(null); navigate(`/review/set/${selectedReview.set_id}`); } : null}
        onDelete={null}
        currentUserId={currentUserId}
      />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-900/50 to-black border border-white/[0.07] rounded-2xl p-8 mb-8">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-600 via-indigo-500 to-purple-400 rounded-t-2xl" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600/5 to-brand-700/5 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {profile.profile_picture_url ? (
              <img src={profile.profile_picture_url} alt={profile.username}
                className="w-24 h-24 rounded-full object-cover border-2 border-[#00D9FF]/50 shadow-lg" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-brand-700 flex items-center justify-center text-4xl font-extrabold text-white shadow-lg">
                {profile.username?.[0]?.toUpperCase()}
              </div>
            )}
            {profile.is_dj && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-black border border-white/10 flex items-center justify-center text-sm" title="DJ">
                🎵
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-2xl font-extrabold text-white">{profile.username}</h1>
              {profile.is_dj && <span className="text-base" title="DJ">🎵</span>}
              {profile.dj_verified && <span className="text-base" title="Verified DJ">✅</span>}
            </div>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-1 text-gray-500 text-sm">
              {profile.location && <span>📍 {profile.location}</span>}
              {joined && <span>📅 Since {joined}</span>}
            </div>
            {profile.bio && (
              <p className="text-gray-300 mt-3 text-sm max-w-md">{profile.bio}</p>
            )}
            {profile.is_dj && profile.dj_id && (
              <Link to={`/dj/${profile.dj_id}`}
                className="inline-flex items-center gap-1 mt-2 text-[#00D9FF] hover:text-[#00D9FF] text-xs font-semibold transition-colors">
                🎧 View DJ Profile →
              </Link>
            )}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
              <StatPill label="Friends" value={friendData.friendCount} />
              <StatPill label="Sets Rated" value={ratings.length} />
              {!isOwn && friendData.commonCount > 0 && (
                <StatPill label="In Common" value={`${friendData.commonCount} friend${friendData.commonCount !== 1 ? 's' : ''}`} highlight />
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 flex-shrink-0 items-end">
            {isOwn ? (
              <Link to="/profile/edit"
                className="text-sm font-semibold px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:border-[#00D9FF]/50 hover:text-white transition-all duration-200">
                Edit Profile
              </Link>
            ) : isLoggedIn ? (
              <button onClick={handleFriend} disabled={friendLoading}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 ${
                  friendData.friends
                    ? 'bg-white/10 border border-white/20 text-white hover:bg-red-500/20 hover:border-red-400/30 hover:text-red-300'
                    : 'bg-white/[0.08] border border-white/10 text-gray-200 hover:border-[#00D9FF]/50 hover:text-white'
                }`}>
                {friendLoading ? '…' : friendData.friends ? '🤝 Friends' : '+ Add Friend'}
              </button>
            ) : null}
            <button onClick={handleCopyLink}
              className="text-xs text-gray-500 hover:text-gray-300 px-3 py-1.5 rounded-lg border border-white/[0.06] hover:border-white/20 transition-all duration-200">
              🔗 Copy Link
            </button>
            {!isOwn && isLoggedIn && (
              <button onClick={() => setReportOpen(true)}
                className="text-xs text-gray-600 hover:text-red-400 px-3 py-1.5 rounded-lg border border-white/[0.04] hover:border-red-500/20 transition-all duration-200">
                🚩 Report
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6">
        <button
          onClick={() => handleTabChange('reviews')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
            activeTab === 'reviews'
              ? 'bg-brand-600/20 border border-brand-600/30 text-[#00D9FF]'
              : 'text-gray-500 hover:text-gray-300 border border-transparent'
          }`}
        >
          Reviews ({ratings.length})
        </button>
        {isOwn && (
          <button
            onClick={() => handleTabChange('favorites')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-300'
                : 'text-gray-500 hover:text-gray-300 border border-transparent'
            }`}
          >
            ⭐ Favorites
          </button>
        )}
      </div>

      {/* Reviews tab */}
      {activeTab === 'reviews' && (
        <>
          <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest mb-4">
            Reviews by {profile.username}
          </p>
          {ratings.length === 0 ? (
            <div className="text-center py-14 border border-white/[0.05] rounded-2xl text-gray-600">
              <p className="text-3xl mb-2">🎵</p>
              <p>No reviews yet</p>
              {isOwn && (
                <Link to="/trending" className="inline-block mt-3 text-[#00D9FF] hover:text-[#00D9FF] text-sm font-medium transition-colors">
                  Browse sets to rate →
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {ratings.map((r) => (
                <Link key={r.id} to={`/set/${r.set_id}`}
                  className="group block bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-[#00D9FF]/30 rounded-2xl p-4 transition-all duration-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm group-hover:text-[#00D9FF] transition-colors truncate">
                        {r.set_title}
                      </p>
                      {r.review_title && (
                        <p className="text-gray-400 text-sm mt-0.5 font-medium truncate">{r.review_title}</p>
                      )}
                      {r.review && !r.review_title && (
                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{r.review}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                      <StarDisplay value={r.score} size={14} />
                      <span className="text-gray-600 text-xs">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* Favorites tab */}
      {activeTab === 'favorites' && isOwn && (
        <>
          <p className="text-gray-600 text-xs font-semibold uppercase tracking-widest mb-4">
            Favorited Reviews
          </p>
          {favLoading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-7 h-7 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-14 border border-white/[0.05] rounded-2xl text-gray-600">
              <p className="text-3xl mb-2">⭐</p>
              <p>No favorited reviews yet</p>
              <p className="text-gray-700 text-xs mt-1">Mark a review as a favorite when writing it</p>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((r) => (
                <div key={r.id}
                  onClick={() => setSelectedReview(r)}
                  className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] hover:border-yellow-500/30 rounded-2xl p-4 transition-all duration-200 cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-yellow-400 text-xs">⭐</span>
                        <p className="text-white font-semibold text-sm group-hover:text-yellow-400 transition-colors truncate">
                          {r.set_title || 'Unknown Set'}
                        </p>
                        {r.dj_name && <span className="text-gray-600 text-xs">by {r.dj_name}</span>}
                      </div>
                      {r.review_title && (
                        <p className="text-gray-300 text-sm font-medium truncate">{r.review_title}</p>
                      )}
                      {r.review_text && (
                        <p className="text-gray-500 text-xs mt-1 line-clamp-2">{r.review_text}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                      <StarDisplay value={r.rating} size={14} />
                      <span className="text-gray-600 text-xs">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatPill({ label, value, highlight }) {
  return (
    <div className={`border rounded-xl px-4 py-2 text-center ${highlight ? 'bg-brand-600/10 border-brand-600/30' : 'bg-white/[0.05] border-white/[0.08]'}`}>
      <p className={`font-bold text-lg ${highlight ? 'text-[#00D9FF]' : 'text-white'}`}>{value}</p>
      <p className="text-gray-500 text-xs">{label}</p>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
