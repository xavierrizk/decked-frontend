import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import API_URL from '../api';

const GENRES = [
  // Electronic
  'House', 'Techno', 'Drum & Bass', 'Trance', 'Dubstep', 'Hardstyle',
  // Live / mainstream
  'Rock', 'Pop', 'Hip-Hop', 'Indie', 'Metal', 'R&B',
  'Jazz', 'Country', 'Latin', 'Punk', 'Funk', 'Reggae',
];

const CONTENT_TYPES = [
  { value: 'concerts',   label: '🎤 Concerts' },
  { value: 'festivals',  label: '🎪 Festivals' },
  { value: 'dj_sets',    label: '🎧 DJ Sets' },
  { value: 'live_bands', label: '🎸 Live Bands' },
  { value: 'raves',      label: '🔊 Raves' },
];

const TOTAL = 3;

/* ─── Progress bar ────────────────────────────── */
function Bar({ step }) {
  return (
    <div className="w-full h-0.5 bg-white/[0.07] mb-10">
      <div
        className="h-full transition-all duration-500 ease-out"
        style={{ width: `${(step / TOTAL) * 100}%`, background: '#00D9FF' }}
      />
    </div>
  );
}

/* ─── Pill label above heading ────────────────── */
function StepPill({ step }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
      style={{ color: 'rgba(0,217,255,0.55)' }}>
      Step {step} of {TOTAL}
    </p>
  );
}

/* ─── Genre chip ──────────────────────────────── */
function GenreChip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium border transition-all duration-150 select-none ${
        selected
          ? 'text-black border-[#00D9FF]'
          : 'border-white/[0.08] text-gray-400 hover:border-white/20 hover:text-white'
      }`}
      style={selected ? { background: '#00D9FF' } : {}}
    >
      {label}
    </button>
  );
}

/* ─── DJ card ─────────────────────────────────── */
function DJPickCard({ dj, selected, disabled, onClick }) {
  const bg = dj.profile_image_url
    ? `url(${dj.profile_image_url})`
    : `linear-gradient(135deg, #2a2a35, #1a1a22)`;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled && !selected}
      className={`relative overflow-hidden aspect-square flex flex-col items-end justify-end p-2.5 border-2 transition-all duration-150 ${
        selected
          ? 'border-[#00D9FF]'
          : disabled
          ? 'border-white/[0.04] opacity-40 cursor-not-allowed'
          : 'border-white/[0.07] hover:border-white/20'
      }`}
      style={{
        backgroundImage: bg,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent" />
      {selected && (
        <div
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-xs font-bold z-10"
          style={{ background: '#00D9FF', color: '#0a0a0a' }}
        >
          ✓
        </div>
      )}
      {dj.verified && !selected && (
        <div className="absolute top-2 right-2 text-sm z-10">✅</div>
      )}
      <p className="relative z-10 text-white text-xs font-bold text-left w-full leading-tight truncate">
        {dj.name}
      </p>
    </button>
  );
}

/* ─── Main onboarding component ───────────────── */
export default function OnboardingFlow({ onComplete }) {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [step,       setStep]       = useState(1);
  const [dir,        setDir]        = useState(1);
  const [animating,  setAnimating]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');

  // Step 1
  const [genres, setGenres] = useState([]);
  const [contentTypes, setContentTypes] = useState([]);

  // Step 2 — mix of DJs + artists
  const [djList,  setDjList]   = useState([]);
  const [artistList, setArtistList] = useState([]);
  const [picks,   setPicks]    = useState([]); // [{ type: 'dj'|'artist', id }]
  const [djsLoading, setDjsLoading] = useState(false);

  // Step 3
  const [bio,        setBio]        = useState('');
  const [location,   setLocation]   = useState('');
  const [avatarUrl,  setAvatarUrl]  = useState(null);
  const [uploading,  setUploading]  = useState(false);
  const [uploadErr,  setUploadErr]  = useState('');
  const fileInputRef = useRef(null);

  // Load progress + DJs on mount
  useEffect(() => {
    // Restore any saved progress
    axios.get(`${API_URL}/api/auth/onboarding/progress`, { headers })
      .then(r => {
        if (r.data.favorite_genres?.length)         setGenres(r.data.favorite_genres);
        if (r.data.favorite_content_types?.length)  setContentTypes(r.data.favorite_content_types);
        const restored = [
          ...(r.data.favorite_djs || []).map(id => ({ type: 'dj', id })),
          ...(r.data.favorite_artists || []).map(id => ({ type: 'artist', id })),
        ];
        if (restored.length) setPicks(restored);
        if (r.data.bio)                        setBio(r.data.bio);
        if (r.data.location)                   setLocation(r.data.location);
        if (r.data.profile_picture_url)        setAvatarUrl(r.data.profile_picture_url);
      })
      .catch(() => {});

    // Load DJs + artists for step 2
    setDjsLoading(true);
    Promise.all([
      axios.get(`${API_URL}/api/artist-profiles?limit=30`).catch(() => ({ data: [] })),
      axios.get(`${API_URL}/api/artists`).catch(() => ({ data: [] })),
    ])
      .then(([djRes, artRes]) => {
        const djs = Array.isArray(djRes.data) ? djRes.data : (djRes.data.djs || []);
        setDjList(djs.slice(0, 24));
        setArtistList((artRes.data || []).slice(0, 24));
      })
      .finally(() => setDjsLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = useCallback((next, forward = true) => {
    if (animating) return;
    setDir(forward ? 1 : -1);
    setError('');
    setAnimating(true);
    setTimeout(() => { setStep(next); setAnimating(false); }, 220);
  }, [animating]);

  const toggleGenre = (g) =>
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const toggleContentType = (t) =>
    setContentTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const isPicked = (type, id) => picks.some(p => p.type === type && p.id === id);

  const togglePick = (type, id) => {
    setPicks(prev => {
      if (prev.some(p => p.type === type && p.id === id))
        return prev.filter(p => !(p.type === type && p.id === id));
      if (prev.length >= 3) return prev;
      return [...prev, { type, id }];
    });
  };

  /* ── Step 1 → 2 ────────────────────────────── */
  const handleStep1 = async () => {
    if (genres.length === 0) { setError('Select at least 1 genre'); return; }
    setSaving(true);
    try {
      await axios.patch(`${API_URL}/api/auth/onboarding/step1`, { favorite_genres: genres, favorite_content_types: contentTypes }, { headers });
      goTo(2, true);
    } catch {
      setError('Could not save. Try again.');
    }
    setSaving(false);
  };

  /* ── Step 2 → 3 ────────────────────────────── */
  const handleStep2 = async () => {
    if (picks.length !== 3) { setError('Select exactly 3 favourites'); return; }
    setSaving(true);
    try {
      await axios.patch(`${API_URL}/api/auth/onboarding/step2`, {
        favorite_djs:     picks.filter(p => p.type === 'dj').map(p => p.id),
        favorite_artists: picks.filter(p => p.type === 'artist').map(p => p.id),
      }, { headers });
      goTo(3, true);
    } catch {
      setError('Could not save. Try again.');
    }
    setSaving(false);
  };

  /* ── Step 3 complete ────────────────────────── */
  const handleComplete = async () => {
    setSaving(true);
    try {
      await axios.patch(`${API_URL}/api/auth/onboarding/step3`, { bio, location, profile_picture_url: avatarUrl }, { headers });
      await axios.patch(`${API_URL}/api/auth/onboarding/complete`, {}, { headers });
      if (onComplete) onComplete();
    } catch {
      setError('Could not save. Try again.');
    }
    setSaving(false);
  };

  /* ── Avatar upload ──────────────────────────── */
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setUploadErr('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setUploadErr('File too large (max 5MB).'); return; }

    setUploading(true);
    setUploadErr('');
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await axios.post(`${API_URL}/api/auth/onboarding/upload-avatar`, fd, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      });
      setAvatarUrl(res.data.profile_picture_url);
    } catch {
      setUploadErr('Upload failed. Try again.');
    }
    setUploading(false);
  };

  const slideStyle = {
    opacity:   animating ? 0 : 1,
    transform: animating
      ? `translateX(${dir > 0 ? '20px' : '-20px'})`
      : 'translateX(0)',
    transition: 'opacity 0.22s ease, transform 0.22s ease',
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full mx-4 bg-[#0c0c0e] border border-white/[0.07] flex flex-col overflow-hidden"
        style={{ maxWidth: '520px', maxHeight: '92vh' }}
      >
        {/* Progress */}
        <div className="px-10 pt-10 flex-shrink-0">
          <Bar step={step} />
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-10 pb-4">
          <div style={slideStyle}>

            {/* ── STEP 1: Genres ─────────────────── */}
            {step === 1 && (
              <div>
                <StepPill step={1} />
                <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                  What live music do you love?
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Concerts, festivals, DJ sets, raves — pick your genres. Select at least 1.
                </p>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map(g => (
                    <GenreChip
                      key={g}
                      label={g}
                      selected={genres.includes(g)}
                      onClick={() => { toggleGenre(g); setError(''); }}
                    />
                  ))}
                </div>
                {genres.length > 0 && (
                  <p className="mt-3 text-xs" style={{ color: '#00D9FF' }}>
                    {genres.length} selected
                  </p>
                )}

                {/* Content types */}
                <p className="text-gray-400 text-sm mt-7 mb-3 font-medium">What do you go to?</p>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_TYPES.map(ct => (
                    <button
                      key={ct.value}
                      type="button"
                      onClick={() => toggleContentType(ct.value)}
                      className={`px-4 py-2.5 text-sm font-medium border transition-all duration-150 select-none ${
                        contentTypes.includes(ct.value)
                          ? 'text-black border-[#00D9FF]'
                          : 'border-white/[0.08] text-gray-400 hover:border-white/20 hover:text-white'
                      }`}
                      style={contentTypes.includes(ct.value) ? { background: '#00D9FF' } : {}}
                    >
                      {ct.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 2: favourite DJs + artists ─── */}
            {step === 2 && (
              <div>
                <StepPill step={2} />
                <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                  Pick 3 favourite artists
                </h2>
                <p className="text-gray-500 text-sm mb-2">
                  Any mix of DJs and live artists — select exactly 3.
                </p>
                <p className="text-sm mb-6 font-semibold" style={{ color: picks.length === 3 ? '#00D9FF' : 'rgba(255,255,255,0.4)' }}>
                  {picks.length}/3 selected
                </p>
                {djsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-[#00D9FF] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    {djList.length > 0 && (
                      <>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">DJs</p>
                        <div className="grid grid-cols-3 gap-2 mb-6">
                          {djList.map(dj => (
                            <DJPickCard
                              key={`dj-${dj.id}`}
                              dj={dj}
                              selected={isPicked('dj', dj.id)}
                              disabled={picks.length >= 3}
                              onClick={() => { togglePick('dj', dj.id); setError(''); }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                    {artistList.length > 0 && (
                      <>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">Artists & Bands</p>
                        <div className="grid grid-cols-3 gap-2">
                          {artistList.map(a => (
                            <DJPickCard
                              key={`artist-${a.id}`}
                              dj={{ id: a.id, name: a.name, profile_image_url: a.image_url }}
                              selected={isPicked('artist', a.id)}
                              disabled={picks.length >= 3}
                              onClick={() => { togglePick('artist', a.id); setError(''); }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── STEP 3: Profile ────────────────── */}
            {step === 3 && (
              <div>
                <StepPill step={3} />
                <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                  Create your profile
                </h2>
                <p className="text-gray-500 text-sm mb-8">
                  Add a photo and tell us about yourself. All fields optional.
                </p>

                {/* Avatar */}
                <div className="flex flex-col items-center mb-8">
                  <div
                    className="w-24 h-24 rounded-full overflow-hidden border-2 mb-4 cursor-pointer relative group"
                    style={{ borderColor: avatarUrl ? '#00D9FF' : 'rgba(255,255,255,0.1)' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#1a1a22] flex items-center justify-center text-3xl text-gray-700">
                        👤
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-semibold">{uploading ? '…' : 'Change'}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="text-xs font-semibold px-4 py-1.5 border border-white/[0.08] text-gray-400 hover:text-white hover:border-white/20 transition-colors disabled:opacity-40"
                  >
                    {uploading ? 'Uploading…' : avatarUrl ? 'Change photo' : 'Upload photo'}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {uploadErr && <p className="text-red-400 text-xs mt-2">{uploadErr}</p>}
                </div>

                {/* Bio */}
                <div className="mb-5">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value.slice(0, 500))}
                    rows={4}
                    placeholder="Tell us about your music taste, favourite venues, etc."
                    className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#00D9FF] text-white placeholder-gray-700 text-sm px-4 py-3 outline-none resize-none transition-colors"
                  />
                  <p className="text-gray-700 text-xs mt-1 text-right">{bio.length} / 500</p>
                </div>

                {/* Location */}
                <div className="mb-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Los Angeles, Berlin, London"
                    className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-[#00D9FF] text-white placeholder-gray-700 text-sm px-4 py-3 outline-none transition-colors"
                  />
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="px-10 pb-10 pt-5 flex-shrink-0 border-t border-white/[0.05] flex items-center justify-between gap-3">
          {/* Back */}
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => goTo(step - 1, false)}
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                ← Back
              </button>
            )}
          </div>

          <div className="flex flex-col items-end gap-1">
            {/* Error */}
            {error && <p className="text-red-400 text-xs">{error}</p>}

            {/* Primary CTA */}
            {step === 1 && (
              <button
                type="button"
                onClick={handleStep1}
                disabled={genres.length === 0 || saving}
                className="btn-primary disabled:opacity-40 px-8 py-2.5 text-sm font-semibold"
              >
                {saving ? 'Saving…' : 'Continue →'}
              </button>
            )}
            {step === 2 && (
              <button
                type="button"
                onClick={handleStep2}
                disabled={picks.length !== 3 || saving}
                className="btn-primary disabled:opacity-40 px-8 py-2.5 text-sm font-semibold"
              >
                {saving ? 'Saving…' : 'Continue →'}
              </button>
            )}
            {step === 3 && (
              <button
                type="button"
                onClick={handleComplete}
                disabled={saving || uploading}
                className="btn-primary disabled:opacity-40 px-8 py-2.5 text-sm font-semibold"
              >
                {saving ? 'Saving…' : 'Complete →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
