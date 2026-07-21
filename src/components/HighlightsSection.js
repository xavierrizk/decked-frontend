import API_URL from '../api';
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SetThumbnail from './SetThumbnail';

/* ── helpers ─────────────────────────────────────────── */
function getYouTubeId(url) {
  if (!url) return null;
  let m = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];
  m = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];
  m = url.match(/youtube\.com\/(?:embed|shorts)\/([a-zA-Z0-9_-]{11})/);
  if (m) return m[1];
  return null;
}

function Avatar({ src, name, size = 32 }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return (
      <img
        src={src} alt={name} onError={() => setErr(true)}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-[10px]"
      style={{
        width: size, height: size,
        background: 'linear-gradient(135deg,#00D9FF22,#FF006E22)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {name ? name.slice(0, 2).toUpperCase() : '?'}
    </div>
  );
}

function Stars({ rating }) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  return (
    <span className="text-[#FF006E] text-xs tracking-tight">
      {'★'.repeat(full)}{half ? '½' : ''}
    </span>
  );
}

/* ── horizontal scroll row ───────────────────────────── */
function ScrollRow({ children }) {
  const ref = useRef(null);
  return (
    <div
      ref={ref}
      className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {children}
    </div>
  );
}

/* ── section wrapper ─────────────────────────────────── */
function Section({ label, icon, to, children, loading }) {
  return (
    <div className="mb-7">
      <div className="flex items-center justify-between mb-3">
        <Link
          to={to}
          className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
        >
          <span>{icon}</span> {label} →
        </Link>
      </div>
      {loading ? (
        <div className="h-24 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[#00D9FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : children}
    </div>
  );
}

/* ── set thumbnail card (horizontal carousel) ─────────── */
function SetThumb({ set }) {
  return (
    <Link
      to={`/set/${set.set_id}`}
      className="flex-shrink-0 w-36 group"
    >
      <div className="w-36 h-20 rounded-lg overflow-hidden bg-[#111114] mb-1.5 relative">
        <SetThumbnail
          setId={set.set_id}
          performanceType={set.performance_type}
          fallbackImage={set.dj_image}
          alt={set.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {set.new_ratings_this_week > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-black/70 text-[#00D9FF] text-[9px] font-bold px-1.5 py-0.5 rounded">
            +{set.new_ratings_this_week}
          </span>
        )}
      </div>
      <p className="text-white text-[11px] font-medium leading-tight line-clamp-1 group-hover:text-[#00D9FF] transition-colors">
        {set.title.trim()}
      </p>
      <p className="text-gray-600 text-[10px] mt-0.5 truncate">{set.artist_name}</p>
      {set.avg_rating > 0 && (
        <p className="text-[#FF006E] text-[10px] font-bold mt-0.5 tabular-nums">{set.avg_rating.toFixed(1)}</p>
      )}
    </Link>
  );
}

/* ── artist pill card (horizontal carousel) ──────────── */
function ArtistPill({ artist }) {
  return (
    <Link
      to={`/artist/${artist.artist_id}`}
      className="flex-shrink-0 flex flex-col items-center gap-1.5 group w-20"
    >
      <div className="relative">
        <Avatar src={artist.profile_image_url} name={artist.name} size={52} />
        {artist.new_ratings_this_week > 0 && (
          <span className="absolute -bottom-0.5 -right-0.5 bg-[#00D9FF] text-black text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
            {artist.new_ratings_this_week > 9 ? '9+' : artist.new_ratings_this_week}
          </span>
        )}
      </div>
      <p className="text-white text-[10px] font-semibold text-center leading-tight line-clamp-2 group-hover:text-[#00D9FF] transition-colors">
        {artist.name}
      </p>
      {artist.avg_rating > 0 && (
        <p className="text-[#FF006E] text-[9px] font-bold tabular-nums">{artist.avg_rating.toFixed(1)}</p>
      )}
    </Link>
  );
}

/* ── review card (Letterboxd style) ─────────────────── */
function SetThumbSmall({ review }) {
  const ytId = getYouTubeId(review.video_url);
  const ytThumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null;
  return (
    <div className="w-14 h-20 rounded flex-shrink-0 overflow-hidden bg-[#1a1a1f]">
      <SetThumbnail
        setId={review.set_id}
        performanceType={review.performance_type}
        fallbackImage={ytThumb || review.dj_image || null}
        alt={review.set_title}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function ReviewCard({ review, last }) {
  return (
    <Link
      to={`/set/${review.set_id}`}
      className={`flex gap-3 group py-4 ${!last ? 'border-b border-white/[0.06]' : ''}`}
    >
      <SetThumbSmall review={review} />
      <div className="flex-1 min-w-0">
        {/* User header */}
        <div className="flex items-center gap-2 mb-1">
          <Avatar src={review.user_avatar} name={review.username} size={22} />
          <span className="text-white text-xs font-semibold">{review.username}</span>
        </div>
        {/* Set title + rating */}
        <p className="text-white text-sm font-bold leading-tight line-clamp-1 group-hover:text-[#00D9FF] transition-colors mb-1">
          {review.set_title.trim()}
          {review.artist_name && (
            <span className="text-gray-500 font-normal text-xs ml-1.5">{review.artist_name}</span>
          )}
        </p>
        <Stars rating={review.rating} />
        {/* Review text */}
        {review.review_text && (
          <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mt-1.5">
            {review.review_text}
          </p>
        )}
      </div>
    </Link>
  );
}

/* ── friend activity row ─────────────────────────────── */
function FriendRow({ item, last }) {
  const ago = (() => {
    const d = (Date.now() - new Date(item.created_at)) / 1000;
    if (d < 3600)  return `${Math.floor(d / 60)}m ago`;
    if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
    return `${Math.floor(d / 86400)}d ago`;
  })();

  return (
    <Link
      to={`/set/${item.set_id}`}
      className={`flex items-center gap-3 py-2.5 hover:bg-white/[0.03] rounded-lg px-2 -mx-2 transition-colors group ${!last ? 'border-b border-white/[0.05]' : ''}`}
    >
      <Avatar src={item.friend_avatar} name={item.friend_name} size={30} />
      <div className="flex-1 min-w-0">
        <p className="text-white text-[11px] leading-snug">
          <span className="font-semibold">{item.friend_name}</span>
          <span className="text-gray-500"> rated </span>
          <span className="text-gray-300 group-hover:text-[#00D9FF] transition-colors truncate">{item.set_title.trim()}</span>
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Stars rating={item.rating} />
          <span className="text-gray-700 text-[10px]">{ago}</span>
        </div>
      </div>
    </Link>
  );
}

/* ── main export ─────────────────────────────────────── */
export default function HighlightsSection({ isLoggedIn }) {
  const [newSets,     setNewSets]      = useState([]);
  const [trendSets,    setTrendSets]    = useState([]);
  const [risingArt,   setRisingArt]    = useState([]);
  const [hotRevs,     setHotRevs]      = useState([]);
  const [friendAct,   setFriendAct]    = useState([]);
  const [loadingNs,   setLoadingNs]    = useState(true);
  const [loadingTs,   setLoadingTs]    = useState(true);
  const [loadingRa,   setLoadingRa]    = useState(true);
  const [loadingHr,   setLoadingHr]    = useState(true);
  const [loadingFa,   setLoadingFa]    = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/api/highlights/new-sets`)
      .then(r => setNewSets(r.data)).catch(() => {}).finally(() => setLoadingNs(false));
    axios.get(`${API_URL}/api/highlights/trending-sets`)
      .then(r => setTrendSets(r.data)).catch(() => {}).finally(() => setLoadingTs(false));
    axios.get(`${API_URL}/api/highlights/rising-artists`)
      .then(r => setRisingArt(r.data)).catch(() => {}).finally(() => setLoadingRa(false));
    axios.get(`${API_URL}/api/highlights/hot-reviews`)
      .then(r => setHotRevs(r.data)).catch(() => {}).finally(() => setLoadingHr(false));
  }, []);

  useEffect(() => {
    if (!isLoggedIn) { setLoadingFa(false); return; }
    const token = localStorage.getItem('token');
    axios.get(`${API_URL}/api/highlights/friend-activity`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => setFriendAct(r.data)).catch(() => {}).finally(() => setLoadingFa(false));
  }, [isLoggedIn]);

  const hasAnything = newSets.length > 0 || trendSets.length > 0 || risingArt.length > 0 || hotRevs.length > 0;
  if (!loadingNs && !loadingTs && !loadingRa && !loadingHr && !hasAnything) return null;

  return (
    <div className="mb-4">
      {/* Divider */}
      <div className="border-t border-white/[0.05] mb-7" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
        {/* LEFT column: carousels */}
        <div>
          {/* Just added */}
          <Section label="Just Added" icon="✨" to="/sets" loading={loadingNs}>
            {newSets.length > 0 ? (
              <ScrollRow>
                {newSets.map(s => <SetThumb key={s.set_id} set={s} />)}
              </ScrollRow>
            ) : (
              <p className="text-gray-700 text-xs">No sets yet.</p>
            )}
          </Section>

          {/* Trending sets */}
          <Section label="Trending This Week" icon="🔥" to="/trending" loading={loadingTs}>
            {trendSets.length > 0 ? (
              <ScrollRow>
                {trendSets.map(s => <SetThumb key={s.set_id} set={s} />)}
              </ScrollRow>
            ) : (
              <p className="text-gray-700 text-xs">No activity this week yet.</p>
            )}
          </Section>

          {/* Rising artists */}
          <Section label="Rising Artists" icon="📈" to="/leaderboards" loading={loadingRa}>
            {risingArt.length > 0 ? (
              <ScrollRow>
                {risingArt.map(a => <ArtistPill key={a.artist_id} artist={a} />)}
              </ScrollRow>
            ) : (
              <p className="text-gray-700 text-xs">No new activity yet.</p>
            )}
          </Section>
        </div>

        {/* RIGHT column: lists */}
        <div>
          {/* Hot reviews */}
          <Section label="Hot Reviews" icon="⭐" to="/reviews" loading={loadingHr}>
            {hotRevs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                {hotRevs.map((r, i) => (
                  <ReviewCard key={r.review_id} review={r} last={i >= hotRevs.length - 2} />
                ))}
              </div>
            ) : (
              <p className="text-gray-700 text-xs">No reviews yet. Be the first!</p>
            )}
          </Section>

          {/* Friend activity */}
          {isLoggedIn && (
            <Section label="Friend Activity" icon="👥" to="/community" loading={loadingFa}>
              {friendAct.length > 0 ? (
                <div>
                  {friendAct.map((f, i) => (
                    <FriendRow key={`${f.friend_id}-${f.set_id}-${i}`} item={f} last={i === friendAct.length - 1} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-700 text-xs">
                  Add friends to see their activity. →{' '}
                  <Link to="/community" className="text-[#00D9FF] hover:underline">Community</Link>
                </p>
              )}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
