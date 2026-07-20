import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { getCurrentUserId } from '../utils/auth';
import Toast, { useToast } from '../components/Toast';
import ArtistVerificationModal from '../components/ArtistVerificationModal';
import AddToBucketListButton from '../components/AddToBucketListButton';

function getYtThumb(url) {
  if (!url) return null;
  let m = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (!m) m = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null;
}

// Ranked list row — Best Rated
function SetRow({ set, rank }) {
  const thumb = getYtThumb(set.video_url);
  const avg   = set.avg_rating ? parseFloat(set.avg_rating) : null;
  const year  = set.recorded_at
    ? new Date(set.recorded_at).getFullYear()
    : set.created_at ? new Date(set.created_at).getFullYear() : null;

  return (
    <Link to={`/set/${set.id}`}
      className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06] hover:border-white/[0.14] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200">
      <span className="text-gray-700 font-bold text-sm w-5 text-center flex-shrink-0">{rank}</span>
      <div className="w-12 h-8 rounded-lg overflow-hidden bg-white/[0.05] flex-shrink-0">
        {thumb
          ? <img src={thumb} alt={set.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">♪</div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold leading-tight truncate group-hover:text-[#00D9FF] transition-colors">{set.title}</p>
        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-600">
          {set.genre    && <span>{set.genre}</span>}
          {set.location && <span>· {set.location}</span>}
          {year         && <span>· {year}</span>}
        </div>
      </div>
      <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
        {avg ? (
          <>
            <span className="text-white font-bold text-sm tabular-nums">{avg.toFixed(1)}</span>
            <span className="text-gray-600 text-[10px]">{set.rating_count} rating{set.rating_count !== 1 ? 's' : ''}</span>
          </>
        ) : (
          <span className="text-gray-700 text-[10px]">Unrated</span>
        )}
      </div>
    </Link>
  );
}

// Thumbnail card — Recent
function SetThumbCard({ set }) {
  const thumb = getYtThumb(set.video_url);
  const avg   = set.avg_rating ? parseFloat(set.avg_rating) : null;
  const venue = set.venue_name || set.festival_name || set.location || null;
  const year  = set.recorded_at
    ? new Date(set.recorded_at).getFullYear()
    : set.created_at ? new Date(set.created_at).getFullYear() : null;

  return (
    <Link to={`/set/${set.id}`}
      className="group block rounded-xl overflow-hidden border border-white/[0.06] hover:border-white/[0.14] bg-white/[0.02] transition-all duration-200">
      <div className="relative aspect-video bg-white/[0.04] overflow-hidden">
        {thumb
          ? <img src={thumb} alt={set.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          : <div className="w-full h-full flex items-center justify-center text-gray-700 text-3xl">♪</div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {avg && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-0.5 flex items-center gap-1">
            <span className="text-yellow-400 text-[10px]">★</span>
            <span className="text-white text-xs font-bold">{avg.toFixed(1)}</span>
          </div>
        )}
        {set.performance_type && (
          <div className="absolute top-2 left-2">
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide"
              style={{ background: 'rgba(0,217,255,0.2)', color: '#00D9FF', border: '1px solid rgba(0,217,255,0.3)' }}>
              {set.performance_type.replace(/_/g, ' ')}
            </span>
          </div>
        )}
      </div>
      <div className="px-3 py-2.5">
        <p className="text-white text-sm font-semibold leading-tight truncate group-hover:text-[#00D9FF] transition-colors">{set.title}</p>
        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-gray-600">
          {venue && <span className="truncate">{venue}</span>}
          {year  && <span className="flex-shrink-0">{venue ? `· ${year}` : year}</span>}
        </div>
      </div>
    </Link>
  );
}

function SectionLabel({ children, count }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">{children}</p>
      {count != null && <span className="text-gray-700 text-[10px]">({count})</span>}
    </div>
  );
}

export default function ArtistProfilePage() {
  const { id } = useParams();
  const [artistProfile, setArtistProfile] = useState(null);
  const [sets, setSets]         = useState([]);
  const [stats, setStats]       = useState(null);
  const [follow, setFollow]     = useState({ count: 0, following: false });
  const [verifStatus, setVerifStatus] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [toast, showToast]      = useToast();
  const currentUserId = getCurrentUserId();
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const verifPromise = token
      ? axios.get(`${API_URL}/api/verification/status`, { headers }).catch(() => ({ data: null }))
      : Promise.resolve({ data: null });

    Promise.all([
      axios.get(`${API_URL}/api/artist-profiles/${id}`),
      axios.get(`${API_URL}/api/sets/dj/${id}`),
      axios.get(`${API_URL}/api/artist-profiles/${id}/stats`),
      axios.get(`${API_URL}/api/follows/${id}`, { headers }),
      verifPromise,
    ]).then(([djRes, setsRes, statsRes, followRes, verifRes]) => {
      setArtistProfile(djRes.data);
      setSets(setsRes.data);
      setStats(statsRes.data);
      setFollow(followRes.data);
      setVerifStatus(verifRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleFollow = async () => {
    if (!isLoggedIn) return;
    if (follow.following && !window.confirm(`Unfollow ${artistProfile?.name}?`)) return;
    setFollowLoading(true);
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    try {
      if (follow.following) {
        const res = await axios.delete(`${API_URL}/api/follows/${id}`, { headers });
        setFollow(res.data);
        showToast(`Unfollowed ${artistProfile?.name}`);
      } else {
        const res = await axios.post(`${API_URL}/api/follows/${id}`, {}, { headers });
        setFollow(res.data);
        showToast(`Now following ${artistProfile?.name}`);
      }
    } catch (err) { console.error(err); }
    setFollowLoading(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00D9FF', borderTopColor: 'transparent' }} />
    </div>
  );
  if (!artistProfile) return <div className="text-center py-20 text-gray-600">Artist not found</div>;

  const isOwnDj = artistProfile.user_id === currentUserId;

  // Best Rated: rated sets sorted by avg desc
  const bestRated = [...sets]
    .filter(s => s.rating_count > 0)
    .sort((a, b) => parseFloat(b.avg_rating) - parseFloat(a.avg_rating))
    .slice(0, 5);

  const bestRatedIds = new Set(bestRated.map(s => s.id));

  // Recent: newest first, exclude best-rated ones
  const recent = [...sets]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .filter(s => !bestRatedIds.has(s.id))
    .slice(0, 9);

  const showBestRated = bestRated.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Toast message={toast} />

      {/* Hero */}
      <div className="relative bg-[#0f0f1a] border border-white/[0.07] rounded-xl mb-6 overflow-hidden">
        <div className="relative z-0 h-36 sm:h-48">
          {artistProfile.banner_image_url ? (
            <img src={artistProfile.banner_image_url} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, rgba(0,217,255,0.10) 0%, rgba(168,85,247,0.06) 100%)' }}>
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, #00D9FF, #A855F7)' }} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-transparent to-transparent" />
          {isOwnDj && (
            <Link to={`/artist/${id}/edit`}
              className="absolute top-3 right-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold rounded-lg hover:bg-black/80 transition-colors">
              Edit Profile
            </Link>
          )}
        </div>

        <div className="relative z-10 px-5 pb-5">
          <div className="flex items-end gap-4 -mt-10 mb-4">
            <div className="w-20 h-20 rounded-xl border-4 border-[#0f0f1a] overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#00D9FF]/30 to-[#A855F7]/20 flex items-center justify-center shadow-xl">
              {artistProfile.profile_image_url
                ? <img src={artistProfile.profile_image_url} alt={artistProfile.name} className="w-full h-full object-cover" />
                : <span className="text-2xl">🎧</span>
              }
            </div>
            <div className="pb-1 ml-auto flex items-center gap-2">
              {!isOwnDj && (
                isLoggedIn ? (
                  <button onClick={handleFollow} disabled={followLoading}
                    className={`text-sm font-semibold px-5 py-2 rounded-lg border transition-all disabled:opacity-50 ${
                      follow.following
                        ? 'bg-white/[0.06] border-white/15 text-white hover:bg-red-500/10 hover:border-red-400/30 hover:text-red-300'
                        : 'border-[#00D9FF]/40 text-[#00D9FF] hover:bg-[#00D9FF]/10'
                    }`}>
                    {followLoading ? '…' : follow.following ? '✓ Following' : '+ Follow'}
                  </button>
                ) : (
                  <Link to="/login" className="text-sm font-semibold px-5 py-2 rounded-lg border border-[#00D9FF]/40 text-[#00D9FF] hover:bg-[#00D9FF]/10 transition-all">
                    + Follow
                  </Link>
                )
              )}
              {!isOwnDj && <AddToBucketListButton artistId={id} isLoggedIn={isLoggedIn} onToast={showToast} />}
            </div>

            {/* Verify button */}
            {!isOwnDj && isLoggedIn && !artistProfile.is_verified && (
              <button
                onClick={() => setVerificationModalOpen(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 transition-all ml-2"
              >
                ✓ Verify
              </button>
            )}
          </div>

          {/* Name + badges */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white">{artistProfile.name}</h1>
            {stats?.verified && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,217,255,0.12)', color: '#00D9FF', border: '1px solid rgba(0,217,255,0.3)' }}>
                Verified
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
            {artistProfile.genre    && <span style={{ color: '#00D9FF' }}>{artistProfile.genre}</span>}
            {artistProfile.location && <span>📍 {artistProfile.location}</span>}
            {artistProfile.website  && (
              <a href={artistProfile.website} target="_blank" rel="noreferrer" className="text-[#00D9FF] hover:underline">
                {artistProfile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>

          {artistProfile.bio && (
            <p className="text-gray-400 text-sm leading-relaxed mb-3 max-w-xl line-clamp-2">{artistProfile.bio}</p>
          )}

          {/* Verification status */}
          {isOwnDj && (
            <div className="mb-3">
              {verifStatus?.request?.status === 'pending' && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 px-3 py-1 rounded-full">
                  ⏳ Verification under review
                </span>
              )}
              {verifStatus?.request?.status === 'approved' && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-green-500/10 border border-green-500/30 text-green-300 px-3 py-1 rounded-full">
                  ✅ Verified Artist
                </span>
              )}
              {(!verifStatus?.request || verifStatus?.request?.status === 'rejected') && (
                <Link to="/verification"
                  className="inline-flex items-center gap-1.5 text-xs bg-white/[0.05] border border-white/10 text-gray-400 hover:text-white hover:border-[#00D9FF]/40 px-3 py-1 rounded-full transition-all">
                  Request Verification
                </Link>
              )}
            </div>
          )}

          {/* Inline stats */}
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
            {[
              { val: follow.count,               label: 'Followers' },
              { val: stats?.total_sets || sets.length, label: 'Sets' },
              stats?.avg_rating ? { val: `${stats.avg_rating}`, label: 'Avg Rating', color: '#FF006E' } : null,
            ].filter(Boolean).map(({ val, label, color }) => (
              <span key={label}>
                <span className="font-bold text-white text-base" style={color ? { color } : {}}>{val}</span>
                {' '}<span className="text-gray-600 text-xs">{label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Sets */}
      {sets.length === 0 ? (
        <div className="text-center py-16 border border-white/[0.05] rounded-xl text-gray-600">
          <p className="text-3xl mb-2">🎵</p>
          <p>No sets yet.</p>
        </div>
      ) : (
        <div className={showBestRated ? 'grid grid-cols-1 lg:grid-cols-5 gap-6' : ''}>

          {/* Best Rated */}
          {showBestRated && (
            <div className="lg:col-span-2">
              <SectionLabel count={bestRated.length}>Best Rated</SectionLabel>
              <div className="space-y-1.5">
                {bestRated.map((s, i) => <SetRow key={s.id} set={s} rank={i + 1} />)}
              </div>
            </div>
          )}

          {/* Recent */}
          <div className={showBestRated ? 'lg:col-span-3' : ''}>
            <SectionLabel count={showBestRated ? recent.length : sets.length}>
              {showBestRated ? 'Recent' : 'All Sets'}
            </SectionLabel>
            {(showBestRated ? recent : sets).length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(showBestRated ? recent : sets).map(s => <SetThumbCard key={s.id} set={s} />)}
              </div>
            ) : (
              <p className="text-gray-600 text-sm py-4">All sets are in the Best Rated list.</p>
            )}
          </div>
        </div>
      )}

      <ArtistVerificationModal
        open={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        djName={artistProfile?.name}
        djId={parseInt(id)}
      />
    </div>
  );
}
