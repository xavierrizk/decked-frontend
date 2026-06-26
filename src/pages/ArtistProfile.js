import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Toast, { useToast } from '../components/Toast';
import { StarDisplay } from '../components/StarRating';

function getYtThumb(url) {
  if (!url) return null;
  let m = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (!m) m = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null;
}

// Compact horizontal card — used in Best Rated
function SetRow({ set, rank }) {
  const thumb = getYtThumb(set.video_url);
  const avg   = set.avg_rating ? parseFloat(set.avg_rating) : null;
  const year  = set.recorded_at
    ? new Date(set.recorded_at).getFullYear()
    : set.created_at ? new Date(set.created_at).getFullYear() : null;

  return (
    <Link to={`/set/${set.id}`}
      className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.06] hover:border-white/[0.14] bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-200">
      {rank && (
        <span className="text-gray-700 font-bold text-sm w-5 text-center flex-shrink-0">{rank}</span>
      )}
      <div className="w-12 h-8 rounded-lg overflow-hidden bg-white/[0.05] flex-shrink-0">
        {thumb
          ? <img src={thumb} alt={set.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">♪</div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold leading-tight truncate group-hover:text-[#00D9FF] transition-colors">{set.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {set.genre    && <span className="text-gray-600 text-[10px]">{set.genre}</span>}
          {set.location && <span className="text-gray-700 text-[10px]">· {set.location}</span>}
          {year         && <span className="text-gray-700 text-[10px]">· {year}</span>}
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

// Visual thumbnail card — used in Recent
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
              {set.performance_type.replace('_', ' ')}
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

export default function ArtistProfile() {
  const { id } = useParams();
  const [artist, setArtist]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [toast, showToast]      = useToast();
  const isLoggedIn = !!localStorage.getItem('token');
  const authHeaders = () => ({ Authorization: 'Bearer ' + localStorage.getItem('token') });

  useEffect(() => {
    const headers = isLoggedIn ? authHeaders() : {};
    setLoading(true);
    axios.get(`${API_URL}/api/artists/${id}`, { headers })
      .then(r => {
        setArtist(r.data);
        setFollowing(r.data.following);
        setFollowerCount(r.data.follower_count || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]); // eslint-disable-line

  const handleFollow = async () => {
    if (!isLoggedIn) return;
    setFollowLoading(true);
    try {
      const res = following
        ? await axios.delete(`${API_URL}/api/artists/${id}/follow`, { headers: authHeaders() })
        : await axios.post(`${API_URL}/api/artists/${id}/follow`, {}, { headers: authHeaders() });
      setFollowing(res.data.following);
      setFollowerCount(res.data.count);
      showToast(res.data.following ? `Following ${artist.name}` : `Unfollowed ${artist.name}`);
    } catch (err) { console.error(err); }
    setFollowLoading(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#00D9FF', borderTopColor: 'transparent' }} />
    </div>
  );
  if (!artist) return <div className="text-center py-20 text-gray-600">Artist not found</div>;

  const perfs = artist.performances || [];

  // Best Rated: has ratings, sorted by avg desc
  const bestRated = [...perfs]
    .filter(p => p.rating_count > 0)
    .sort((a, b) => parseFloat(b.avg_rating) - parseFloat(a.avg_rating))
    .slice(0, 5);

  // Recent: all sorted newest first, exclude those already in top 5 if overlapping
  const recentIds = new Set(bestRated.map(p => p.id));
  const recent    = [...perfs]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .filter(p => !recentIds.has(p.id) || bestRated.length === 0)
    .slice(0, 8);

  // If no ratings at all, just show recent
  const showBestRated = bestRated.length > 0;

  const avgRating = perfs.filter(p => p.avg_rating).length > 0
    ? (perfs.reduce((sum, p) => sum + (parseFloat(p.avg_rating) || 0), 0) / perfs.filter(p => p.avg_rating).length).toFixed(1)
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Toast message={toast} />

      {/* Header */}
      <div className="relative overflow-hidden border border-white/[0.07] bg-[#0f0f1a] rounded-xl mb-6">
        {artist.banner_image_url ? (
          <div className="w-full h-36 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${artist.banner_image_url})` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-[#0f0f1a]/20 to-transparent" />
          </div>
        ) : (
          <div className="h-16 w-full" style={{ background: 'linear-gradient(135deg, rgba(255,0,110,0.10) 0%, rgba(168,85,247,0.06) 100%)' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, #FF006E, #A855F7)' }} />
          </div>
        )}

        <div className={`flex flex-col sm:flex-row items-start gap-5 px-5 pb-5 ${artist.banner_image_url ? '-mt-10' : '-mt-4'}`}>
          {/* Avatar */}
          <div className="flex-shrink-0">
            {artist.image_url ? (
              <img src={artist.image_url} alt={artist.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-[#0f0f1a]" />
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black text-white border-4 border-[#0f0f1a]"
                style={{ background: 'linear-gradient(135deg, #FF006E, #7c1d4e)' }}>
                {artist.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-2">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-white">{artist.name}</h1>
              {artist.genre && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ color: '#FF006E', background: 'rgba(255,0,110,0.1)', border: '1px solid rgba(255,0,110,0.25)' }}>
                  {artist.genre}
                </span>
              )}
            </div>

            {/* Inline stats */}
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm mb-2">
              {[
                { val: followerCount,  label: 'Followers' },
                { val: perfs.length,   label: 'Performances' },
                avgRating ? { val: avgRating, label: 'Avg Rating', color: '#FF006E' } : null,
              ].filter(Boolean).map(({ val, label, color }) => (
                <span key={label}>
                  <span className="font-bold text-white text-base" style={color ? { color } : {}}>{val}</span>
                  {' '}<span className="text-gray-600 text-xs">{label}</span>
                </span>
              ))}
            </div>

            {artist.bio && (
              <p className="text-gray-400 text-sm leading-relaxed max-w-lg line-clamp-2">{artist.bio}</p>
            )}

            {artist.location && (
              <p className="text-gray-600 text-xs mt-1">📍 {artist.location}</p>
            )}

            {artist.website && (
              <a href={artist.website} target="_blank" rel="noopener noreferrer"
                className="text-[#00D9FF] text-xs mt-1 inline-block hover:underline">
                {artist.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>

          {/* Follow */}
          <div className="flex-shrink-0 sm:pt-10">
            {isLoggedIn ? (
              <button onClick={handleFollow} disabled={followLoading}
                className={`text-xs font-semibold px-5 py-2 rounded-lg border transition-all duration-150 disabled:opacity-50 ${
                  following
                    ? 'bg-white/[0.06] border-white/15 text-white hover:bg-red-500/10 hover:border-red-400/30 hover:text-red-300'
                    : 'border-[#FF006E] text-black'
                }`}
                style={following ? {} : { background: '#FF006E' }}>
                {followLoading ? '…' : following ? '✓ Following' : '+ Follow'}
              </button>
            ) : (
              <Link to="/login"
                className="text-xs font-semibold px-5 py-2 rounded-lg border border-[#FF006E] text-black block"
                style={{ background: '#FF006E' }}>
                + Follow
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Empty state */}
      {perfs.length === 0 && (
        <div className="text-center py-16 border border-white/[0.05] rounded-xl text-gray-600">
          <p className="text-3xl mb-2">🎶</p>
          <p>No performances yet.</p>
        </div>
      )}

      {/* Two-section layout */}
      {perfs.length > 0 && (
        <div className={showBestRated ? 'grid grid-cols-1 lg:grid-cols-5 gap-6' : ''}>

          {/* Best Rated — left column */}
          {showBestRated && (
            <div className="lg:col-span-2">
              <SectionLabel count={bestRated.length}>Best Rated</SectionLabel>
              <div className="space-y-1.5">
                {bestRated.map((s, i) => (
                  <SetRow key={s.id} set={s} rank={i + 1} />
                ))}
              </div>
            </div>
          )}

          {/* Recent — right column (or full width if no ratings) */}
          <div className={showBestRated ? 'lg:col-span-3' : ''}>
            <SectionLabel count={recent.length}>
              {showBestRated ? 'Recent' : 'All Performances'}
            </SectionLabel>
            {recent.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                {recent.map(s => <SetThumbCard key={s.id} set={s} />)}
              </div>
            ) : (
              <p className="text-gray-600 text-sm py-4">All performances are in the Best Rated list.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
