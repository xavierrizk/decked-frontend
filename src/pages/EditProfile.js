import API_URL from '../api';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { getCurrentUserId } from '../utils/auth';

const GENRES = [
  'House', 'Techno', 'Drum & Bass', 'Trance', 'Dubstep', 'Hardstyle',
  'Rock', 'Pop', 'Hip-Hop', 'Indie', 'Metal', 'R&B',
  'Jazz', 'Country', 'Latin', 'Punk', 'Funk', 'Reggae',
];

const SOCIALS = [
  { key: 'instagram',  label: 'Instagram',  ph: 'username or URL' },
  { key: 'soundcloud', label: 'SoundCloud', ph: 'username or URL' },
  { key: 'youtube',    label: 'YouTube',    ph: 'channel URL' },
  { key: 'spotify',    label: 'Spotify',    ph: 'artist/profile URL' },
  { key: 'twitter',    label: 'X / Twitter', ph: '@handle or URL' },
  { key: 'website',    label: 'Website',    ph: 'https://…' },
];

export default function EditProfile() {
  const [bio, setBio]                     = useState('');
  const [location, setLocation]           = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [headerUrl, setHeaderUrl]         = useState('');
  const [socials, setSocials]             = useState({});
  const [genres, setGenres]               = useState([]);
  const [mySets, setMySets]               = useState([]);
  const [featured, setFeatured]           = useState([]); // set ids, max 3
  const [headerUploading, setHeaderUploading] = useState(false);
  const [loading, setLoading]             = useState(false);
  const [fetching, setFetching]           = useState(true);
  const [error, setError]                 = useState('');
  const [success, setSuccess]             = useState('');
  const headerInputRef = useRef(null);
  const navigate = useNavigate();
  const userId   = getCurrentUserId();

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      axios.get(`${API_URL}/api/users/${userId}`),
      axios.get(`${API_URL}/api/users/${userId}/reviews`).catch(() => ({ data: [] })),
    ]).then(([res, reviewsRes]) => {
      const d = res.data;
      setBio(d.bio || '');
      setLocation(d.location || '');
      setProfilePicUrl(d.profile_picture_url || '');
      setHeaderUrl(d.header_image_url || '');
      setSocials(SOCIALS.reduce((acc, s) => ({ ...acc, [s.key]: d[s.key] || '' }), {}));
      setGenres(d.favorite_genres || []);
      setFeatured(d.featured_set_ids || []);
      // de-dup user's rated sets for the featured picker
      const seen = new Set();
      const sets = [];
      (reviewsRes.data || []).forEach(r => {
        if (r.set_id && !seen.has(r.set_id)) { seen.add(r.set_id); sets.push({ id: r.set_id, title: r.set_title, dj_name: r.dj_name }); }
      });
      setMySets(sets);
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [userId]);

  const toggleGenre = (g) =>
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const toggleFeatured = (id) =>
    setFeatured(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });

  const handleHeaderUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Header must be an image'); return; }
    setHeaderUploading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await axios.post(`${API_URL}/api/users/upload-image`, fd, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' },
      });
      setHeaderUrl(res.data.url);
    } catch { setError('Header upload failed'); }
    setHeaderUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      await axios.post(`${API_URL}/api/users/${userId}/profile`, {
        bio, location, profile_picture_url: profilePicUrl,
        header_image_url: headerUrl || null,
        ...SOCIALS.reduce((acc, s) => ({ ...acc, [s.key]: socials[s.key]?.trim() || null }), {}),
        featured_set_ids: featured,
        favorite_genres: genres,
      }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setSuccess('Profile saved!');
      setTimeout(() => navigate(`/profile/${userId}`), 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile');
      setLoading(false);
    }
  };

  if (fetching) return <Spinner />;

  const inp = "w-full bg-white/[0.04] border border-white/10 focus:border-[#00D9FF] rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm outline-none transition-colors duration-200";
  const label = "block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5";

  return (
    <div className="min-h-[85vh] flex items-start justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <Link to={`/profile/${userId}`} className="text-gray-500 hover:text-[#00D9FF] text-sm transition-colors block mb-6">← Back to profile</Link>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7 shadow-2xl backdrop-blur-sm">
          <h1 className="text-2xl font-extrabold text-white mb-1">Edit Profile</h1>
          <p className="text-gray-500 text-sm mb-6">Customise how others see you on DECK'D</p>

          {error && <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}
          {success && <div className="mb-5 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2"><span>✓</span> {success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header banner */}
            <div>
              <label className={label}>Header Image</label>
              <div
                className="relative w-full h-28 overflow-hidden border border-white/10 cursor-pointer group"
                style={headerUrl
                  ? { backgroundImage: `url(${headerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : { background: 'linear-gradient(135deg, #5A6470, #00D9FF, #FF006E)' }}
                onClick={() => headerInputRef.current?.click()}
              >
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm font-semibold">{headerUploading ? 'Uploading…' : 'Click to upload'}</span>
                </div>
              </div>
              <input ref={headerInputRef} type="file" accept="image/*" className="hidden" onChange={handleHeaderUpload} />
            </div>

            {/* Avatar + basics */}
            <div>
              <label className={label}>Profile Picture URL <span className="text-gray-700 normal-case tracking-normal font-normal">(optional)</span></label>
              <input type="url" value={profilePicUrl} onChange={e => setProfilePicUrl(e.target.value)} placeholder="https://example.com/photo.jpg" className={inp} />
            </div>
            <div>
              <label className={label}>Location <span className="text-gray-700 normal-case tracking-normal font-normal">(optional)</span></label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="London, UK" className={inp} />
            </div>
            <div>
              <label className={label}>Bio <span className="text-gray-700 normal-case tracking-normal font-normal">(optional)</span></label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} className={inp + ' resize-none h-24'} placeholder="House music lover, based in…" />
            </div>

            {/* Genres */}
            <div>
              <label className={label}>Favourite Genres</label>
              <div className="flex flex-wrap gap-1.5">
                {GENRES.map(g => (
                  <button key={g} type="button" onClick={() => toggleGenre(g)}
                    className={`px-3 py-1.5 text-xs font-medium border transition-all duration-150 ${
                      genres.includes(g) ? 'text-black border-[#00D9FF]' : 'border-white/[0.08] text-gray-400 hover:border-white/20 hover:text-white'
                    }`}
                    style={genres.includes(g) ? { background: '#00D9FF' } : {}}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Socials */}
            <div>
              <label className={label}>Social Links <span className="text-gray-700 normal-case tracking-normal font-normal">(all optional)</span></label>
              <div className="space-y-2">
                {SOCIALS.map(s => (
                  <div key={s.key} className="flex items-center gap-2">
                    <span className="text-gray-500 text-xs w-20 flex-shrink-0">{s.label}</span>
                    <input type="text" value={socials[s.key] || ''} onChange={e => setSocials(p => ({ ...p, [s.key]: e.target.value }))}
                      placeholder={s.ph} className={inp + ' py-1.5'} />
                  </div>
                ))}
              </div>
            </div>

            {/* Featured sets */}
            <div>
              <label className={label}>Featured Sets <span className="text-gray-700 normal-case tracking-normal font-normal">(up to 3)</span></label>
              {mySets.length === 0 ? (
                <p className="text-gray-600 text-xs">Rate some sets to feature them here.</p>
              ) : (
                <>
                  <p className="text-xs mb-2" style={{ color: featured.length >= 3 ? '#FF006E' : '#00D9FF' }}>{featured.length}/3 selected</p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {mySets.map(s => {
                      const on = featured.includes(s.id);
                      const disabled = !on && featured.length >= 3;
                      return (
                        <button key={s.id} type="button" onClick={() => toggleFeatured(s.id)} disabled={disabled}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-left border transition-all duration-150 ${
                            on ? 'border-[#00D9FF] bg-[#00D9FF]/10' : disabled ? 'border-white/[0.05] opacity-40' : 'border-white/[0.08] hover:border-white/20'
                          }`}>
                          <span className={`w-4 h-4 border flex items-center justify-center text-[10px] flex-shrink-0 ${on ? 'border-[#00D9FF] text-[#00D9FF]' : 'border-white/20'}`}>{on ? '✓' : ''}</span>
                          <span className="text-white text-sm truncate">{s.title}</span>
                          {s.dj_name && <span className="text-gray-600 text-xs ml-auto flex-shrink-0">{s.dj_name}</span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <button type="submit" disabled={loading || headerUploading}
              className="w-full btn-primary disabled:opacity-40 font-semibold py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-glow">
              {loading ? 'Saving…' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>;
}
