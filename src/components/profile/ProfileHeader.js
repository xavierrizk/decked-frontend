import React from 'react';
import { Link } from 'react-router-dom';

const SOCIAL_ICONS = {
  instagram:  { label: 'Instagram',  base: 'https://instagram.com/' },
  soundcloud: { label: 'SoundCloud', base: 'https://soundcloud.com/' },
  twitter:    { label: 'X',          base: 'https://x.com/' },
  youtube:    { label: 'YouTube',    base: 'https://youtube.com/' },
  spotify:    { label: 'Spotify',    base: 'https://open.spotify.com/' },
  website:    { label: 'Website',    base: '' },
};

function socialHref(key, val) {
  if (!val) return null;
  if (/^https?:\/\//i.test(val)) return val;
  const base = SOCIAL_ICONS[key].base;
  if (!base) return `https://${val.replace(/^https?:\/\//, '')}`;
  return base + val.replace(/^@/, '');
}

export default function ProfileHeader({
  profile, stats, isOwn, isLoggedIn, friendData, friendLoading,
  onFriend, onCopyLink, onReport, joined,
}) {
  const genres = profile.favorite_genres || [];
  const socialLinks = Object.keys(SOCIAL_ICONS)
    .map(k => ({ key: k, ...SOCIAL_ICONS[k], href: socialHref(k, profile[k]) }))
    .filter(s => s.href);

  const s = stats || {};

  return (
    <div className="relative overflow-hidden border border-white/[0.07] bg-[#0f0f1a] mb-6 rounded-xl">
      {profile.header_image_url ? (
        <div className="w-full h-36 sm:h-44 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${profile.header_image_url})` }}>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1a] via-[#0f0f1a]/30 to-transparent" />
        </div>
      ) : (
        <div className="h-20 w-full relative" style={{ background: 'linear-gradient(135deg, rgba(0,217,255,0.08) 0%, rgba(255,0,110,0.05) 100%)' }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, #00D9FF, #FF006E)' }} />
        </div>
      )}

      <div className={`relative flex flex-col sm:flex-row items-start gap-4 px-5 pb-5 ${profile.header_image_url ? '-mt-12' : '-mt-8'}`}>
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {profile.profile_picture_url ? (
            <img src={profile.profile_picture_url} alt={profile.username}
              className="w-20 h-20 rounded-full object-cover border-4 border-[#0f0f1a]" />
          ) : (
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-extrabold text-white border-4 border-[#0f0f1a]"
              style={{ background: 'linear-gradient(135deg, #5A6470, #252D34)' }}>
              {profile.username?.[0]?.toUpperCase()}
            </div>
          )}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0 pt-2">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white">{profile.username}</h1>
            {profile.dj_verified && (
              <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: 'rgba(0,217,255,0.15)', color: '#00D9FF' }}>
                Verified Artist
              </span>
            )}
          </div>

          {/* Location + joined */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
            {profile.location && <span>📍 {profile.location}</span>}
            {joined && <span>Joined {joined}</span>}
          </div>

          {/* Inline stat pills — Letterboxd-style */}
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm mb-3">
            {[
              { val: s.sets_rated,      label: 'Sets' },
              { val: s.reviews_written, label: 'Reviews' },
              { val: s.following,       label: 'Following' },
              { val: s.friends,         label: 'Friends' },
            ].map(({ val, label }) => (
              <span key={label} className="flex flex-col items-center sm:items-start sm:flex-row sm:gap-1">
                <span className="font-bold text-white text-base leading-none">{val ?? 0}</span>
                <span className="text-gray-600 text-[10px] sm:text-xs sm:leading-none sm:mt-auto">{label}</span>
              </span>
            ))}
            {s.avg_rating_given && (
              <span className="flex flex-col items-center sm:items-start sm:flex-row sm:gap-1">
                <span className="font-bold text-base leading-none" style={{ color: '#FF006E' }}>{Number(s.avg_rating_given).toFixed(1)}</span>
                <span className="text-gray-600 text-[10px] sm:text-xs sm:leading-none sm:mt-auto">Avg</span>
              </span>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-gray-400 text-sm leading-relaxed max-w-lg line-clamp-2 mb-2">{profile.bio}</p>
          )}

          {/* Genre tags */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {genres.map(g => (
                <span key={g} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ color: '#00D9FF', background: 'rgba(0,217,255,0.08)', border: '1px solid rgba(0,217,255,0.2)' }}>
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Social links */}
          {socialLinks.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-1">
              {socialLinks.map(s => (
                <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer"
                  title={s.label}
                  className="text-gray-500 hover:text-white transition-colors text-xs underline underline-offset-2">
                  {s.label}
                </a>
              ))}
            </div>
          )}

          {/* Artist link */}
          {profile.is_dj && profile.dj_id && (
            <Link to={`/artist/${profile.dj_id}`}
              className="inline-flex items-center gap-1 mt-2 text-xs font-semibold transition-colors"
              style={{ color: '#00D9FF' }}>
              View Artist Profile →
            </Link>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0 items-center sm:items-end sm:pt-10">
          {isOwn ? (
            <Link to="/profile/edit"
              className="text-xs font-semibold px-4 py-2 rounded-lg border border-white/10 text-gray-300 hover:border-[#00D9FF]/40 hover:text-white transition-all">
              Edit Profile
            </Link>
          ) : isLoggedIn ? (
            <button onClick={onFriend} disabled={friendLoading}
              className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-all duration-150 disabled:opacity-50 ${
                friendData.status === 'friends'
                  ? 'bg-white/[0.06] border-white/15 text-white hover:bg-red-500/10 hover:border-red-400/30 hover:text-red-300'
                  : friendData.status === 'request_sent'
                  ? 'bg-white/[0.04] border-white/10 text-gray-500'
                  : friendData.status === 'request_received'
                  ? 'bg-[#00D9FF]/10 border-[#00D9FF]/30 text-[#00D9FF]'
                  : 'border-white/10 text-gray-200 hover:border-[#00D9FF]/40 hover:text-white'
              }`}>
              {friendLoading ? '…'
                : friendData.status === 'friends'          ? '✓ Friends'
                : friendData.status === 'request_sent'     ? 'Request Sent'
                : friendData.status === 'request_received' ? '✓ Accept'
                : '+ Add Friend'}
            </button>
          ) : null}
          <button onClick={onCopyLink}
            className="text-xs text-gray-500 hover:text-gray-300 px-3 py-2 rounded-lg border border-white/[0.06] hover:border-white/20 transition-all">
            Copy Link
          </button>
          {!isOwn && isLoggedIn && (
            <button onClick={onReport}
              className="text-xs text-gray-600 hover:text-red-400 px-3 py-2 rounded-lg border border-white/[0.04] hover:border-red-500/20 transition-all">
              Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
