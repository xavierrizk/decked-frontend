import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function CreateSet() {
  const [title, setTitle] = useState('');
  const [djId, setDjId] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [djs, setDjs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/api/djs`).then((res) => setDjs(res.data)).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');

    try {
      const res = await axios.post(
        `${API_URL}/api/sets`,
        { dj_id: djId, title, location, duration: parseInt(duration), video_url: videoUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/set/${res.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create set');
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
        <Link to="/" className="text-brand-400 hover:text-brand-300 text-sm font-medium block mb-4">← Back</Link>
        <h1 className="text-3xl font-bold text-white mb-1">Add a Set</h1>
        <p className="text-gray-400 text-sm mb-6">Log a DJ set for the community to rate</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">Set Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} placeholder="Summer Vibes Mix" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">DJ</label>
            <select value={djId} onChange={(e) => setDjId(e.target.value)} required className={inputClass + ' appearance-none'}>
              <option value="" className="bg-gray-900">Select a DJ</option>
              {djs.map((dj) => (
                <option key={dj.id} value={dj.id} className="bg-gray-900">{dj.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">Location <span className="text-gray-500">(optional)</span></label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} placeholder="Miami Beach" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">Duration (minutes) <span className="text-gray-500">(optional)</span></label>
            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} min="1" className={inputClass} placeholder="60" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">YouTube Video ID <span className="text-gray-500">(optional)</span></label>
            <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className={inputClass} placeholder="dQw4w9WgXcQ" />
            <p className="text-gray-500 text-xs mt-1">The ID at the end of the YouTube URL</p>
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg shadow-brand-900/50"
          >
            {loading ? 'Creating...' : 'Create Set'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateSet;
