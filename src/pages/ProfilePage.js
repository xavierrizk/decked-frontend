import API_URL from '../api';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { getCurrentUserId } from '../utils/auth';
import Toast, { useToast } from '../components/Toast';
import ReportModal from '../components/ReportModal';
import ReviewDetailModal from '../components/ReviewDetailModal';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileTabs from '../components/profile/ProfileTabs';
import ReviewSection from '../components/profile/ReviewSection';
import ArtistGrid from '../components/profile/DJGrid';
import NetworkGrid from '../components/profile/NetworkGrid';
import ProfileReviewCard from '../components/profile/ProfileReviewCard';
import SetThumbnail from '../components/SetThumbnail';
import { relativeTime } from '../components/profile/helpers';

function getYtThumb(url) {
  if (!url) return null;
  let m = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (!m) m = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (!m) m = url.match(/youtube\.com\/(?:embed|shorts)\/([a-zA-Z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null;
}

// Letterboxd-style recent activity: thumbnail grid of rated sets
function RecentActivityGrid({ activity, loading }) {
  const rated = (activity || []).filter(a => a.type === 'rating').slice(0, 8);

  if (loading) {
    return (
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-video rounded-lg bg-white/[0.04] animate-pulse" />
        ))}
      </div>
    );
  }

  if (!rated.length) return null;

  return (
    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
      {rated.map((item, i) => {
        const thumb = getYtThumb(item.set_video_url) || item.dj_image || null;
        const stars = item.rating ? Math.round(item.rating) : 0;
        return (
          <Link key={i} to={`/set/${item.set_id}`} className="relative group aspect-video rounded-lg overflow-hidden bg-white/[0.04] block">
            {thumb
              ? <img src={thumb} alt={item.set_title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              : <div className="w-full h-full flex items-center justify-center text-gray-700 text-xl">♪</div>
            }
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-1 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[9px] text-yellow-400 leading-none">
                {'★'.repeat(stars)}{'☆'.repeat(Math.max(0, 5 - stars))}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function SectionLabel({ children, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">{children}</p>
      {action && <Link to={action.to} className="text-xs text-gray-600 hover:text-[#00D9FF] transition-colors">{action.label} →</Link>}
    </div>
  );
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

// Compact rail section header — small label + optional count, underlined
function RailHeader({ label, count, action }) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2.5">
      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400">{label}</span>
      {action
        ? <Link to={action.to} className="text-[10px] text-gray-600 hover:text-[#00D9FF] transition-colors uppercase tracking-wider">{action.label}</Link>
        : (count != null && <span className="text-[11px] text-gray-600 tabular-nums">{count}</span>)}
    </div>
  );
}

function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="text-[#00D9FF] text-[10px] leading-none whitespace-nowrap">
      {'★'.repeat(full)}{half ? '½' : ''}
    </span>
  );
}

// DIARY rail — month-grouped list of rated shows (Letterboxd style)
function DiaryRail({ reviews }) {
  const items = (reviews || []).slice(0, 14);
  if (!items.length) return null;
  let lastKey = null;

  return (
    <div>
      <RailHeader label="Diary" count={reviews.length} />
      <div className="space-y-1.5">
        {items.map(r => {
          const d = new Date(r.created_at);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          const showMonth = key !== lastKey;
          lastKey = key;
          return (
            <Link key={r.id} to={`/set/${r.set_id}`} className="flex items-center gap-2.5 group">
              <div className="w-8 flex-shrink-0">
                {showMonth && (
                  <div className="rounded bg-white/[0.05] border border-white/10 text-center py-0.5">
                    <span className="block text-[8px] font-bold uppercase tracking-wide text-gray-400 leading-none">{MONTHS[d.getMonth()]}</span>
                  </div>
                )}
              </div>
              <span className="text-[11px] text-gray-500 tabular-nums w-4 text-right flex-shrink-0">{d.getDate()}</span>
              <span className="text-[12px] text-gray-300 group-hover:text-[#00D9FF] truncate transition-colors flex-1 min-w-0">
                {r.set_title.trim()}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// RATINGS rail — compact distribution bar graph with star ends
function RatingsRail({ reviews }) {
  const rated = (reviews || []).filter(r => r.rating > 0);
  if (!rated.length) return null;
  const buckets = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
  const counts = buckets.map(b => rated.filter(r => Math.round(Number(r.rating) * 2) / 2 === b).length);
  const max = Math.max(...counts, 1);

  return (
    <div>
      <RailHeader label="Ratings" count={rated.length} />
      <div className="flex items-end gap-2">
        <span className="text-[#00D9FF] text-[11px] leading-none pb-0.5">★</span>
        <div className="flex-1 flex items-end gap-[3px] h-12">
          {buckets.map((b, i) => (
            <div
              key={b}
              className="flex-1 rounded-sm transition-all duration-200 hover:brightness-125"
              title={`${b}★ — ${counts[i]} rating${counts[i] !== 1 ? 's' : ''}`}
              style={{
                height: `${Math.max((counts[i] / max) * 100, counts[i] > 0 ? 8 : 3)}%`,
                background: counts[i] > 0 ? '#00D9FF' : 'rgba(255,255,255,0.07)',
              }}
            />
          ))}
        </div>
        <span className="text-[#00D9FF] text-[11px] leading-none pb-0.5 whitespace-nowrap">★★★★★</span>
      </div>
    </div>
  );
}

// ACTIVITY rail — recent-activity timeline (Letterboxd style)
function ActivityRail({ activity, isOwn, username }) {
  const items = (activity || []).slice(0, 6);
  if (!items.length) return null;
  const who = isOwn ? 'You' : (username || 'They');

  return (
    <div>
      <RailHeader label="Activity" />
      <div className="space-y-3">
        {items.map((a, i) => {
          const when = relativeTime(a.ts);
          let body;
          if (a.type === 'rating') {
            body = (
              <>
                {who} {a.has_review ? 'reviewed and rated' : 'rated'}{' '}
                <Link to={`/set/${a.set_id}`} className="text-gray-200 hover:text-[#00D9FF] font-medium transition-colors">{(a.set_title || '').trim()}</Link>
                {a.rating ? <> <Stars rating={Number(a.rating)} /></> : null}
              </>
            );
          } else if (a.type === 'follow') {
            body = <>{who} followed <Link to={`/artist/${a.dj_id}`} className="text-gray-200 hover:text-[#00D9FF] font-medium transition-colors">{a.dj_name}</Link></>;
          } else {
            body = <>{who} became friends with <Link to={`/profile/${a.friend_id}`} className="text-gray-200 hover:text-[#00D9FF] font-medium transition-colors">{a.friend_name}</Link></>;
          }
          return (
            <div key={i} className="flex gap-2.5">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#FF006E]/70 flex-shrink-0" />
              <p className="text-[12px] text-gray-500 leading-snug">
                {body}
                {when && <span className="text-gray-700"> · {when}</span>}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Right-hand rail combining Diary / Ratings / Activity
function ProfileSidebar({ reviews, activity, isOwn, username }) {
  if (!reviews.length && !activity.length) return null;
  return (
    <aside className="w-full lg:w-60 flex-shrink-0 space-y-7">
      <DiaryRail reviews={reviews} />
      <RatingsRail reviews={reviews} />
      <ActivityRail activity={activity} isOwn={isOwn} username={username} />
    </aside>
  );
}

// Bucket List preview strip
function BucketListPreview({ bucketList, userId }) {
  if (!bucketList.length) return null;
  return (
    <div>
      <SectionLabel action={{ to: `/users/${userId}/bucket-list`, label: 'View full list' }}>
        Bucket List ({bucketList.length})
      </SectionLabel>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {bucketList.slice(0, 8).map(dj => (
          <Link key={dj.artist_id} to={`/artist/${dj.artist_id}`} className="flex flex-col items-center text-center group">
            {dj.profile_image_url ? (
              <img src={dj.profile_image_url} alt={dj.name} className="w-12 h-12 rounded-full object-cover mb-1" />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white mb-1"
                style={{ background: 'linear-gradient(135deg, #FF006E, #7c1d4e)' }}
              >
                {dj.name?.[0]?.toUpperCase()}
              </div>
            )}
            <span className="text-gray-500 text-[10px] truncate max-w-full group-hover:text-[#00D9FF] transition-colors">{dj.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Favorite Sets — auto-curated grid of the user's highest-rated sets (4.5★+)
function FavoriteSetsGrid({ reviews, isOwn }) {
  const favorites = (reviews || [])
    .filter(r => Number(r.rating) >= 4.5)
    .sort((a, b) => Number(b.rating) - Number(a.rating))
    .slice(0, 8);

  if (!favorites.length) {
    if (!isOwn) return null;
    return (
      <div>
        <SectionLabel>Favorite Sets</SectionLabel>
        <div className="text-center py-8 border border-white/[0.05] rounded-xl text-gray-600 text-sm">
          Rate a set 4.5★ or higher and it lands here.
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionLabel action={favorites.length >= 8 ? { to: `?tab=reviews`, label: 'All ratings' } : null}>
        Favorite Sets
      </SectionLabel>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {favorites.map(r => {
          const artist = r.dj_name || r.artist_name || null;
          return (
            <Link key={r.set_id} to={`/set/${r.set_id}`} className="group">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-white/[0.04] border border-white/[0.06]">
                <SetThumbnail
                  setId={r.set_id}
                  performanceType={r.performance_type}
                  fallbackImage={r.dj_image}
                  alt={r.set_title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <div className="absolute top-1.5 right-1.5 bg-black/70 backdrop-blur-sm rounded px-1.5 py-0.5 flex items-center gap-1">
                  <span className="text-[#FF006E] text-[10px] leading-none">★</span>
                  <span className="text-white text-[10px] font-bold tabular-nums leading-none">{Number(r.rating).toFixed(1)}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-white text-[11px] font-semibold leading-tight line-clamp-2 group-hover:text-[#00D9FF] transition-colors">{r.set_title.trim()}</p>
                  {artist && <p className="text-gray-400 text-[10px] line-clamp-1 mt-0.5">{artist}</p>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// Dashboard — the default profile tab
function ProfileDashboard({ featuredSets, activity, actLoading, reviews, reviewsLoading, onOpenReview, isOwn, userId, bucketList }) {
  const hasActivity = activity.filter(a => a.type === 'rating').length > 0;
  const recentReviews = reviews.filter(r => r.review_text).slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Featured Sets (user-curated) */}
      {featuredSets.length > 0 && (
        <div>
          <SectionLabel>Featured Sets</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {featuredSets.slice(0, 4).map(s => {
              const thumb = getYtThumb(s.video_url) || s.dj_image || null;
              return (
                <Link key={s.id} to={`/set/${s.id}`} className="relative group aspect-video rounded-lg overflow-hidden bg-white/[0.04]">
                  {thumb
                    ? <img src={thumb} alt={s.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-700 text-2xl">♪</div>
                  }
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-white text-[11px] font-semibold leading-tight line-clamp-1">{s.title}</p>
                    {s.dj_name && <p className="text-gray-400 text-[10px] line-clamp-1">{s.dj_name}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Favorite Sets (auto: 4.5★+) */}
      {!reviewsLoading && <FavoriteSetsGrid reviews={reviews} isOwn={isOwn} />}

      {/* Bucket List */}
      <BucketListPreview bucketList={bucketList} userId={userId} />

      {/* Recent Activity */}
      {hasActivity && (
        <div>
          <SectionLabel action={{ to: `?tab=reviews`, label: 'All ratings' }}>Recent Activity</SectionLabel>
          <RecentActivityGrid activity={activity} loading={actLoading} />
        </div>
      )}

      {/* Recent Reviews */}
      {(reviewsLoading || recentReviews.length > 0) && (
        <div>
          <SectionLabel action={reviews.length > 3 ? { to: `?tab=reviews`, label: 'All reviews' } : null}>
            Recent Reviews
          </SectionLabel>
          {reviewsLoading ? (
            <div className="space-y-3">
              {[0, 1].map(i => <div key={i} className="h-32 rounded-xl bg-white/[0.03] animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {recentReviews.map(r => (
                <ProfileReviewCard key={r.id} review={r} onOpen={onOpenReview} />
              ))}
            </div>
          )}
          {!reviewsLoading && recentReviews.length === 0 && (
            <div className="text-center py-10 border border-white/[0.05] rounded-xl text-gray-600 text-sm">
              No written reviews yet.
              {isOwn && <span> <Link to="/trending" className="text-[#00D9FF]">Find a set to review →</Link></span>}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!featuredSets.length && !hasActivity && !reviewsLoading && !recentReviews.length && (
        <div className="text-center py-16 border border-white/[0.05] rounded-xl text-gray-600">
          <p className="text-3xl mb-3">🎧</p>
          <p className="mb-3">Nothing here yet.</p>
          {isOwn && <Link to="/trending" className="text-[#00D9FF] text-sm">Start rating sets →</Link>}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { userId } = useParams();
  const navigate   = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  const [reviews, setReviews]           = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [following, setFollowing]       = useState([]);
  const [followState, setFollowState]   = useState('idle');
  const [network, setNetwork]           = useState([]);
  const [netState, setNetState]         = useState('idle');
  const [activity, setActivity]         = useState([]);
  const [actState, setActState]         = useState('idle');
  const [featuredSets, setFeaturedSets] = useState([]);
  const [bucketList, setBucketList]     = useState([]);

  const [friendData, setFriendData]     = useState({ status: 'none', friends: false, friendCount: 0 });
  const [friendLoading, setFriendLoading] = useState(false);
  const [reportOpen, setReportOpen]     = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [toast, showToast]              = useToast();

  const currentUserId = getCurrentUserId();
  const isOwn         = parseInt(userId) === currentUserId;
  const isLoggedIn    = !!localStorage.getItem('token');
  const authHeaders   = () => ({ Authorization: 'Bearer ' + localStorage.getItem('token') });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    setLoading(true);
    setReviewsLoading(true);
    setFollowState('idle'); setNetState('idle'); setActState('idle');

    Promise.all([
      axios.get(`${API_URL}/api/users/${userId}`),
      axios.get(`${API_URL}/api/friends/${userId}`, { headers }).catch(() => ({ data: { friends: false, friendCount: 0 } })),
    ]).then(([profileRes, friendRes]) => {
      setProfile(profileRes.data);
      setFriendData(friendRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));

    axios.get(`${API_URL}/api/users/${userId}/reviews`)
      .then(r => setReviews(r.data)).catch(() => {})
      .finally(() => setReviewsLoading(false));

    axios.get(`${API_URL}/api/users/${userId}/featured-sets`)
      .then(r => setFeaturedSets(r.data || [])).catch(() => setFeaturedSets([]));

    axios.get(`${API_URL}/api/users/${userId}/bucket-list`)
      .then(r => setBucketList(r.data?.bucket_list || [])).catch(() => setBucketList([]));

    // Load activity eagerly for the dashboard
    setActState('loading');
    axios.get(`${API_URL}/api/users/${userId}/activity`)
      .then(r => setActivity(r.data)).catch(() => {})
      .finally(() => setActState('loaded'));
  }, [userId]);

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

  const handleTab = useCallback((tab) => {
    setActiveTab(tab);
    if (tab === 'following') ensureFollowing();
    if (tab === 'network')   ensureNetwork();
  }, [ensureFollowing, ensureNetwork]);

  useEffect(() => {
    const valid = ['profile', 'reviews', 'following', 'network'];
    handleTab(valid.includes(tabParam) ? tabParam : 'profile');
  }, [tabParam, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const openReview = (review) => {
    setSelectedReview({
      ...review,
      time_ago: relativeTime(review.created_at),
      user: { id: parseInt(userId), username: profile?.username, profile_picture_url: profile?.profile_picture_url },
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
        showToast(`You and ${profile?.username} are now friends!`);
      } else {
        const res = await axios.post(`${API_URL}/api/friends/${userId}`, {}, { headers: authHeaders() });
        setFriendData(prev => ({ ...prev, status: res.data.status, friends: false }));
        showToast(`Friend request sent to ${profile?.username}`);
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
    { key: 'profile',   label: 'Profile' },
    { key: 'reviews',   label: 'Reviews',   count: stats.sets_rated },
    { key: 'following', label: 'Following',  count: stats.following },
    { key: 'network',   label: 'Network',    count: stats.friends },
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
        stats={stats}
        isOwn={isOwn}
        isLoggedIn={isLoggedIn}
        friendData={friendData}
        friendLoading={friendLoading}
        onFriend={handleFriend}
        onCopyLink={handleCopyLink}
        onReport={() => setReportOpen(true)}
        joined={joined}
      />

      <ProfileTabs tabs={tabs} active={activeTab} onChange={handleTab} />

      {activeTab === 'profile' && (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <ProfileDashboard
              featuredSets={featuredSets}
              activity={activity}
              actLoading={actState === 'loading'}
              reviews={reviews}
              reviewsLoading={reviewsLoading}
              onOpenReview={openReview}
              isOwn={isOwn}
              userId={userId}
              bucketList={bucketList}
            />
          </div>
          <ProfileSidebar
            reviews={reviews}
            activity={activity}
            isOwn={isOwn}
            username={profile.username}
          />
        </div>
      )}

      {activeTab === 'reviews' && (
        <ReviewSection
          heading="All Reviews"
          reviews={reviews}
          loading={reviewsLoading}
          onOpen={openReview}
          empty={{ icon: '🎵', text: 'No reviews yet.', cta: isOwn ? { to: '/trending', label: 'Browse sets to rate' } : null }}
        />
      )}

      {activeTab === 'following' && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-4">
            Following {stats.following ? `(${stats.following})` : ''}
          </p>
          <ArtistGrid djs={following} loading={followState === 'loading'} isOwn={isOwn} />
        </div>
      )}

      {activeTab === 'network' && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-4">
            Network {stats.friends ? `(${stats.friends})` : ''}
          </p>
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
