import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function CreateSet() {
  const [title, setTitle]     = useState('');
  const [djId, setDjId]       = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [djs, setDjs]         = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/api/djs`).then((res) => setDjs(res.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API_URL}/api/sets`,
        { dj_id: djId, title, location, duration: duration ? parseInt(duration) : null, video_url: videoUrl },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      navigate(`/set/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create set');
      setLoading(false);
    }
  };

  const inp = "w-full bg-white/[0.04] border border-white/10 focus:border-brand-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm outline-none transition-colors duration-200";

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-gray-500 hover:text-brand-400 text-sm transition-colors block mb-6">← Back</Link>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7 shadow-2xl backdrop-blur-sm">
          <h1 className="text-2xl font-extrabold text-white mb-1">Add a Set</h1>
          <p className="text-gray-500 text-sm mb-6">Log a DJ set for the community to rate</p>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Set Title" inp={inp} value={title} onChange={setTitle} placeholder="Summer Vibes Mix" required />

            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">DJ</label>
              <select value={djId} onChange={(e) => setDjId(e.target.value)} required className={inp + ' appearance-none'}>
                <option value="" className="bg-[#111]">Select a DJ</option>
                {djs.map((dj) => (
                  <option key={dj.id} value={dj.id} className="bg-[#111]">{dj.name}</option>
                ))}
              </select>
            </div>

            <Field label="Location" inp={inp} value={location} onChange={setLocation} placeholder="Miami Beach" optional />
            <Field label="Duration (minutes)" inp={inp} type="number" value={duration} onChange={setDuration} placeholder="60" optional />

            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                YouTube Video ID <span className="text-gray-700 normal-case tracking-normal font-normal">(optional)</span>
              </label>
              <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="dQw4w9WgXcQ" className={inp} />
              <p className="text-gray-700 text-xs mt-1">The part after youtube.com/watch?v=</p>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-glow">
              {loading ? 'Creating…' : 'Create Set'}
            </button>
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
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className={inp} />
    </div>
  );
}
