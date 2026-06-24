import API_URL from '../api';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { getCurrentUserId } from '../utils/auth';
import Toast, { useToast } from '../components/Toast';
import ReportModal from '../components/ReportModal';
import ReviewDetailModal from '../components/ReviewDetailModal';
import ProfileHeader from '../components/profile/ProfileHeader';
import StatsBlock from '../components/profile/StatsBlock';
import ProfileTabs from '../components/profile/ProfileTabs';
import ReviewSection from '../components/profile/ReviewSection';
import ArtistGrid from '../components/profile/DJGrid';
import NetworkGrid from '../components/profile/NetworkGrid';
import ActivityFeed from '../components/profile/ActivityFeed';
import SetCard from '../components/cards/SetCard';
import { relativeTime } from '../components/profile/helpers';

export default function ProfilePage() {
  const { userId } = useParams();
  const navigate   = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('reviews');

  // Per-section data + loaded flags
  const [reviews, setReviews]       = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [favorites, setFavorites]   = useState([]);
  const [favState, setFavState]     = useState('idle');     // idle | loading | loaded
  const [following, setFollowing]   = useState([]);
  const [followState, setFollowState] = useState('idle');
  const [network, setNetwork]       = useState([]);
  const [netState, setNetState]     = useState('idle');
  const [activity, setActivity]     = useState([]);
  const [actState, setActState]     = useState('idle');
  const [featuredSets, setFeaturedSets] = useState([]);

  const [friendData, setFriendData] = useState({ status: 'none', friends: false, friendCount: 0, commonCount: 0 });
  const [friendLoading, setFriendLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [toast, showToast] = useToast();

  const currentUserId = getCurrentUserId();
  const isOwn         = parseInt(userId) === currentUserId;
  const isLoggedIn    = !!localStorage.getItem('token');
  const authHeaders   = () => ({ Authorization: 'Bearer ' + localStorage.getItem('token') });

  // Initial load: profile + reviews + friend state
  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    setLoading(true);
    setReviewsLoading(true);
    // reset tab caches when viewing a different user
    setFavState('idle'); setFollowState('idle'); setNetState('idle'); setActState('idle');

    Promise.all([
      axios.get(`${API_URL}/api/users/${userId}`),
      axios.get(`${API_URL}/api/friends/${userId}`, { headers }).catch(() => ({ data: { friends: false, friendCount: 0, commonCount: 0 } })),
    ])
      .then(([profileRes, friendRes]) => {
        setProfile(profileRes.data);
        setFriendData(friendRes.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    axios.get(`${API_URL}/api/users/${userId}/reviews`)
      .then(r => setReviews(r.data))
      .catch(() => {})
      .finally(() => setReviewsLoading(false));

    axios.get(`${API_URL}/api/users/${userId}/featured-sets`)
      .then(r => setFeaturedSets(r.data || []))
      .catch(() => setFeaturedSets([]));
  }, [userId]);

  // Lazy-load tab data on first visit
  const ensureFavorites = useCallback(() => {
    if (favState !== 'idle') return;
    setFavState('loading');
    axios.get(`${API_URL}/api/users/${userId}/favorite-reviews`)
      .then(r => setFavorites(r.data)).catch(() => {})
      .finally(() => setFavState('loaded'));
  }, [favState, userId]);

  const ensureFollowing = useCallback(() => {
    if (followState !== 'idle') return;
    setFollowState('loading');
    axios.get(`${API_URL}/api/users/${userId}/following`)
      .then(r => setFollowing(r.data)).catch(() => {})
      .finally(() => setFollowState('loaded'));
  }, [followState, userId]);

  const ensureNetwork = useCallback(() => {
    if (netState !== 'idle') return;
    setNetState('loading');
    axios.get(`${API_URL}/api/users/${userId}/network`)
      .then(r => setNetwork(r.data)).catch(() => {})
      .finally(() => setNetState('loaded'));
  }, [netState, userId]);

  const ensureActivity = useCallback(() => {
    if (actState !== 'idle') return;
    setActState('loading');
    axios.get(`${API_URL}/api/users/${userId}/activity`)
      .then(r => setActivity(r.data)).catch(() => {})
      .finally(() => setActState('loaded'));
  }, [actState, userId]);

  const handleTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'favorites') ensureFavorites();
    if (tab === 'following') ensureFollowing();
    if (tab === 'network')   ensureNetwork();
    if (tab === 'activity')  ensureActivity();
  };

  // Honor ?tab= query param (e.g. from navbar dropdown links)
  useEffect(() => {
    const valid = ['reviews', 'favorites', 'activity', 'following', 'network'];
    const tab = valid.includes(tabParam) ? tabParam : 'reviews';
    handleTab(tab);
  }, [tabParam, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const openReview = (review) => {
    // ReviewDetailModal expects a `user` object + time_ago
    setSelectedReview({
      ...review,
      time_ago: relativeTime(review.created_at),
      user: {
        id: parseInt(userId),
        username: profile?.username,
        profile_picture_url: profile?.profile_picture_url,
      },
    });
  };

  const handleFriend = async () => {
    if (!isLoggedIn) return;
    setFriendLoading(true);
    try {
      const { status } = friendData;
      if (status === 'friends') {
        if (!window.confirm(`Remove ${profile?.username} as a friend?`)) { setFriendLoading(false); return; }
        const res = await axios.delete(`${API_URL}/api/friends/${userId}`, { headers: authHeaders() });
        setFriendData(prev => ({ ...prev, status: 'none', friends: false, friendCount: res.data.count }));
        showToast(`Removed ${profile?.username} as a friend`);
      } else if (status === 'request_sent') {
        const res = await axios.delete(`${API_URL}/api/friends/${userId}`, { headers: authHeaders() });
        setFriendData(prev => ({ ...prev, status: 'none', friends: false, friendCount: res.data.count }));
        showToast('Friend request cancelled');
      } else if (status === 'request_received') {
        const res = await axios.post(`${API_URL}/api/friends/${userId}/accept`, {}, { headers: authHeaders() });
        setFriendData(prev => ({ ...prev, status: 'friends', friends: true, friendCount: res.data.count }));
        showToast(`You and ${profile?.username} are now friends! 🎉`);
      } else {
        const res = await axios.post(`${API_URL}/api/friends/${userId}`, {}, { headers: authHeaders() });
        setFriendData(prev => ({ ...prev, status: res.data.status, friends: false }));
        showToast(`Friend request sent to ${profile?.username} 🤝`);
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

  const stats = profile.stats || {};
  const tabs = [
    { key: 'reviews',   label: 'Reviews',   count: stats.sets_rated },
    { key: 'favorites', label: 'Favorites' },
    { key: 'activity',  label: 'Activity' },
    { key: 'following', label: 'Following', count: stats.following },
    { key: 'network',   label: 'Network',   count: stats.friends },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
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
        onEdit={isOwn && selectedReview ? () => { setSelectedReview(null); navigate(`/review/set/${selectedReview.set_id}`); } : null}
        onDelete={null}
        currentUserId={currentUserId}
      />

      <ProfileHeader
        profile={profile}
        isOwn={isOwn}
        isLoggedIn={isLoggedIn}
        friendData={friendData}
        friendLoading={friendLoading}
        onFriend={handleFriend}
        onCopyLink={handleCopyLink}
        onReport={() => setReportOpen(true)}
        joined={joined}
      />

      {/* THE VISUAL HERO */}
      <StatsBlock stats={stats} />

      {/* Featured sets — only if the user picked any */}
      {featuredSets.length > 0 && (
        <div className="mb-10">
          <p className="section-label mb-4">⭐ Featured Sets</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-3">
            {featuredSets.map(s => <SetCard key={s.id} set={s} />)}
          </div>
        </div>
      )}

      <ProfileTabs tabs={tabs} active={activeTab} onChange={handleTab} />

      {activeTab === 'reviews' && (
        <ReviewSection
          heading="Recent Reviews"
          reviews={reviews}
          loading={reviewsLoading}
          onOpen={openReview}
          empty={{ icon: '🎵', text: 'No reviews yet.', cta: isOwn ? { to: '/trending', label: 'Browse sets to rate' } : null }}
        />
      )}

      {activeTab === 'favorites' && (
        <ReviewSection
          heading="⭐ Favorite Reviews"
          reviews={favorites}
          loading={favState === 'loading'}
          onOpen={openReview}
          empty={{ icon: '⭐', text: 'No favorite reviews yet.', cta: null }}
        />
      )}

      {activeTab === 'activity' && (
        <div>
          <p className="section-label mb-4">Recent Activity</p>
          <ActivityFeed activity={activity} loading={actState === 'loading'} />
        </div>
      )}

      {activeTab === 'following' && (
        <div>
          <p className="section-label mb-4">Following {stats.following ? `(${stats.following})` : ''}</p>
          <ArtistGrid djs={following} loading={followState === 'loading'} isOwn={isOwn} />
        </div>
      )}

      {activeTab === 'network' && (
        <div>
          <p className="section-label mb-4">Network {stats.friends ? `(${stats.friends})` : ''}</p>
          <NetworkGrid friends={network} loading={netState === 'loading'} />
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00D9FF', borderTopColor: 'transparent' }} />
    </div>
  );
}
