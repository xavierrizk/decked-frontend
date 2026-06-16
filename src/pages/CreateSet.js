import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const TYPES = [
  { value: 'dj_set',       label: 'DJ Set' },
  { value: 'concert',      label: 'Concert' },
  { value: 'live_band',    label: 'Live Band' },
  { value: 'festival_set', label: 'Festival Set' },
  { value: 'rave',         label: 'Rave' },
  { value: 'other',        label: 'Other' },
];

export default function CreateSet() {
  const [perfType, setPerfType] = useState('dj_set');
  const [title, setTitle]       = useState('');
  const [artistName, setArtistName] = useState('');
  const [djId, setDjId]         = useState('');
  const [genre, setGenre]       = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [myDjs, setMyDjs]       = useState([]);
  const [loadingDjs, setLoadingDjs] = useState(true);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isDjSet = perfType === 'dj_set';

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${API_URL}/api/dj-requests/my-djs`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setMyDjs(res.data);
        const preselect = searchParams.get('dj');
        if (preselect) setDjId(preselect);
        else if (res.data.length === 1) setDjId(String(res.data[0].id));
        setLoadingDjs(false);
      })
      .catch(() => setLoadingDjs(false));
  }, []); // eslint-disable-line

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload = {
        performance_type: perfType,
        title,
        genre: genre || null,
        location: location || null,
        duration: duration ? parseInt(duration) : null,
        video_url: videoUrl || null,
      };
      if (isDjSet) payload.dj_id = djId;
      else payload.artist_name = artistName;

      const res = await axios.post(`${API_URL}/api/sets`, payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      navigate(`/set/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create');
      setLoading(false);
    }
  };

  const inp = "w-full bg-white/[0.04] border border-white/10 focus:border-brand-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm outline-none transition-colors duration-200";

  // DJ-set with no owned DJ profiles → must create one first
  const blockedNoDj = isDjSet && !loadingDjs && myDjs.length === 0;

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link to="/my-djs" className="text-gray-500 hover:text-brand-400 text-sm transition-colors block mb-6">← My DJs</Link>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7 shadow-2xl backdrop-blur-sm">
          <h1 className="text-2xl font-extrabold text-white mb-1">Add Live Music</h1>
          <p className="text-gray-500 text-sm mb-6">Add a performance for the community to rate</p>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Performance type */}
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Type</label>
              <select value={perfType} onChange={e => setPerfType(e.target.value)} className={inp + ' appearance-none'}>
                {TYPES.map(t => <option key={t.value} value={t.value} className="bg-[#111]">{t.label}</option>)}
              </select>
            </div>

            <Field label="Title" inp={inp} value={title} onChange={setTitle}
              placeholder={isDjSet ? 'Summer Vibes Mix' : 'Eras Tour — Night 3'} required />

            {/* DJ set → DJ picker; otherwise → artist name */}
            {isDjSet ? (
              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">DJ</label>
                {loadingDjs ? (
                  <div className="h-10 bg-white/[0.04] border border-white/10 rounded-xl animate-pulse" />
                ) : myDjs.length === 0 ? (
                  <p className="text-gray-500 text-sm">No DJ profiles yet.</p>
                ) : (
                  <select value={djId} onChange={e => setDjId(e.target.value)} required className={inp + ' appearance-none'}>
                    <option value="" className="bg-[#111]">Select a DJ</option>
                    {myDjs.map(dj => (
                      <option key={dj.id} value={dj.id} className="bg-[#111]">{dj.name}{dj.verified ? ' ✅' : ''}</option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <Field label="Artist / Band Name" inp={inp} value={artistName} onChange={setArtistName}
                placeholder="Taylor Swift" required />
            )}

            <Field label="Genre" inp={inp} value={genre} onChange={setGenre} placeholder="Pop, Techno, Rock…" optional />
            <Field label="Location / Venue" inp={inp} value={location} onChange={setLocation} placeholder="Madison Square Garden" optional />
            <Field label="Duration (minutes)" inp={inp} type="number" value={duration} onChange={setDuration} placeholder="90" optional />

            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                YouTube Video ID <span className="text-gray-700 normal-case tracking-normal font-normal">(optional)</span>
              </label>
              <input type="text" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="dQw4w9WgXcQ" className={inp} />
              <p className="text-gray-700 text-xs mt-1">The part after youtube.com/watch?v=</p>
            </div>

            {blockedNoDj ? (
              <div className="text-center py-2">
                <p className="text-gray-400 text-sm mb-3">You need a DJ profile to add a DJ set. Adding a concert or other live show? Switch the Type above.</p>
                <Link to="/request-dj"
                  className="inline-block px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-sm transition-all duration-200 hover:scale-105 shadow-glow">
                  Request a DJ Profile
                </Link>
              </div>
            ) : (
              <button type="submit" disabled={loading}
                className="w-full btn-primary disabled:opacity-40 font-semibold py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-glow">
                {loading ? 'Creating…' : 'Add to DECK'D'}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, inp, type = 'text', value, onChange, placeholder, required, optional }) {
  return (
    <div>
      <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
        {label}{optional && <span className="text-gray-700 normal-case tracking-normal font-normal ml-1">(optional)</span>}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required} className={inp} />
    </div>
  );
}
