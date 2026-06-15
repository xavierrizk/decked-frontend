import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import PulsingOrbs from '../components/backgrounds/PulsingOrbs';
import SetCard from '../components/cards/SetCard';
import Toast, { useToast } from '../components/Toast';

export default function ArtistProfile() {
  const { id } = useParams();
  const [artist, setArtist]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [toast, showToast] = useToast();
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
      showToast(res.data.following ? `Following ${artist.name} 🎤` : `Unfollowed ${artist.name}`);
    } catch (err) { console.error(err); }
    setFollowLoading(false);
  };

  if (loading) return <Spinner />;
  if (!artist) return <div className="text-center py-20 text-gray-600">Artist not found</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <PulsingOrbs />
      <Toast message={toast} />

      {/* Header */}
      <div className="relative overflow-hidden border border-white/[0.07] bg-[#0f0f1a] mb-6">
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, #FF006E, #A855F7)' }} />
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-6">
          <div className="flex-shrink-0">
            {artist.image_url ? (
              <img src={artist.image_url} alt={artist.name} className="w-24 h-24 rounded-full object-cover border-2 border-white/10" />
            ) : (
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black text-white"
                style={{ background: 'linear-gradient(135deg, #FF006E, #7c1d4e)' }}>
                {artist.name?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: '#FF006E', background: 'rgba(255,0,110,0.12)', border: '1px solid rgba(255,0,110,0.3)' }}>
                🎤 Artist
              </span>
              {artist.genre && <span className="text-gray-500 text-xs">{artist.genre}</span>}
            </div>
            <h1 className="text-2xl font-bold text-white mt-1.5" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>{artist.name}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-sm">
              <span className="text-gray-400"><span className="text-white font-bold stat-number">{followerCount}</span> followers</span>
              <span className="text-gray-400"><span className="text-white font-bold stat-number">{artist.performances?.length || 0}</span> performances</span>
            </div>
            {artist.bio && <p className="text-gray-400 mt-2.5 text-sm leading-relaxed">{artist.bio}</p>}
          </div>
          {isLoggedIn && (
            <button onClick={handleFollow} disabled={followLoading}
              className={`text-xs font-semibold px-4 py-2 border transition-all duration-150 disabled:opacity-50 flex-shrink-0 ${
                following
                  ? 'bg-white/[0.06] border-white/15 text-white hover:bg-red-500/15 hover:border-red-400/30 hover:text-red-300'
                  : 'text-black border-[#FF006E]'
              }`}
              style={following ? {} : { background: '#FF006E' }}>
              {followLoading ? '…' : following ? '✓ Following' : '+ Follow'}
            </button>
          )}
        </div>
      </div>

      {/* Performances */}
      <p className="section-label mb-4">Performances</p>
      {artist.performances?.length === 0 ? (
        <div className="text-center py-16 border border-white/[0.05] text-gray-600">
          <p className="text-3xl mb-2">🎶</p>
          <p>No performances yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-3">
          {artist.performances.map(s => <SetCard key={s.id} set={s} />)}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center min-h-[40vh]"><div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>;
}
