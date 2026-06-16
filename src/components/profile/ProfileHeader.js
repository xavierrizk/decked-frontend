import React from 'react';
import { Link } from 'react-router-dom';

const SOCIAL_META = {
  instagram:  { label: 'Instagram',  icon: '📸', base: 'https://instagram.com/' },
  soundcloud: { label: 'SoundCloud', icon: '🔊', base: 'https://soundcloud.com/' },
  youtube:    { label: 'YouTube',    icon: '▶️', base: 'https://youtube.com/' },
  spotify:    { label: 'Spotify',    icon: '🎧', base: 'https://open.spotify.com/' },
  twitter:    { label: 'X',          icon: '🐦', base: 'https://x.com/' },
  website:    { label: 'Website',    icon: '🌐', base: '' },
};

function socialHref(key, val) {
  if (!val) return null;
  if (/^https?:\/\//i.test(val)) return val;
  const base = SOCIAL_META[key].base;
  if (!base) return `https://${val.replace(/^https?:\/\//, '')}`;
  return base + val.replace(/^@/, '');
}

export default function ProfileHeader({
  profile, isOwn, isLoggedIn, friendData, friendLoading,
  onFriend, onCopyLink, onReport, joined,
}) {
  const genres = profile.favorite_genres || [];
  const socialLinks = Object.keys(SOCIAL_META)
    .map(k => ({ key: k, ...SOCIAL_META[k], href: socialHref(k, profile[k]) }))
    .filter(s => s.href);

  return (
    <div className="relative overflow-hidden border border-white/[0.07] bg-[#0f0f1a] mb-6">
      {/* Header banner */}
      {profile.header_image_url ? (
        <div className="w-full h-40 sm:h-52 bg-cover bg-center"
          style={{ backgroundImage: `url(${profile.header_image_url})` }}>
          <div className="w-full h-full bg-gradient-to-t from-[#0f0f1a] via-transparent to-transparent" />
        </div>
      ) : (
        <>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, #00D9FF, #FF006E)' }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top left, rgba(0,217,255,0.06), transparent 60%)' }} />
        </>
      )}

      <div className={`relative flex flex-col sm:flex-row items-center sm:items-start gap-5 p-6 ${profile.header_image_url ? '-mt-12 sm:-mt-14' : ''}`}>
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {profile.profile_picture_url ? (
            <img src={profile.profile_picture_url} alt={profile.username}
              className="w-20 h-20 rounded-full object-cover border-2 border-white/10" />
          ) : (
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-extrabold text-white"
              style={{ background: 'linear-gradient(135deg, #5A6470, #252D34)' }}>
              {profile.username?.[0]?.toUpperCase()}
            </div>
          )}
          {profile.is_dj && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-black border border-white/10 flex items-center justify-center text-xs" title="DJ">
              🎵
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              {profile.username}
            </h1>
            {profile.dj_verified && <span className="text-base" title="Verified DJ">✅</span>}
          </div>
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-1.5 text-gray-500 text-xs">
            {profile.location && <span>📍 {profile.location}</span>}
            {joined && <span>📅 Since {joined}</span>}
          </div>
          {profile.bio && (
            <p className="text-gray-400 mt-2.5 text-sm leading-relaxed max-w-lg line-clamp-3">{profile.bio}</p>
          )}
          {profile.is_dj && profile.dj_id && (
            <Link to={`/dj/${profile.dj_id}`}
              className="inline-flex items-center gap-1 mt-2 text-xs font-semibold transition-colors"
              style={{ color: '#00D9FF' }}>
              🎧 View DJ Profile →
            </Link>
          )}

          {/* Genre tags */}
          {genres.length > 0 && (
            <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mt-3">
              {genres.map(g => (
                <span key={g} className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                  style={{ color: '#00D9FF', background: 'rgba(0,217,255,0.1)', border: '1px solid rgba(0,217,255,0.25)' }}>
                  {g}
                </span>
              ))}
            </div>
          )}

          {/* Social links */}
          {socialLinks.length > 0 && (
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-3">
              {socialLinks.map(s => (
                <a key={s.key} href={s.href} target="_blank" rel="noopener noreferrer"
                  title={s.label}
                  className="text-gray-500 hover:text-white text-sm transition-colors flex items-center gap-1">
                  <span>{s.icon}</span>
                  <span className="text-xs">{s.label}</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0 items-center sm:items-end">
          {isOwn ? (
            <Link to="/profile/edit"
              className="text-xs font-semibold px-4 py-2 border border-white/10 text-gray-300 hover:border-[#00D9FF]/50 hover:text-white transition-all duration-150">
              Edit Profile
            </Link>
          ) : isLoggedIn ? (
            <button onClick={onFriend} disabled={friendLoading}
              className={`text-xs font-semibold px-4 py-2 border transition-all duration-150 disabled:opacity-50 ${
                friendData.friends
                  ? 'bg-white/[0.06] border-white/15 text-white hover:bg-red-500/15 hover:border-red-400/30 hover:text-red-300'
                  : 'border-white/10 text-gray-200 hover:border-[#00D9FF]/50 hover:text-white'
              }`}>
              {friendLoading ? '…' : friendData.friends ? '🤝 Friends' : '+ Add Friend'}
            </button>
          ) : null}
          <button onClick={onCopyLink}
            className="text-xs text-gray-500 hover:text-gray-300 px-3 py-1.5 border border-white/[0.06] hover:border-white/20 transition-all duration-150">
            🔗 Copy Link
          </button>
          {!isOwn && isLoggedIn && (
            <button onClick={onReport}
              className="text-xs text-gray-600 hover:text-red-400 px-3 py-1.5 border border-white/[0.04] hover:border-red-500/20 transition-all duration-150">
              🚩 Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
