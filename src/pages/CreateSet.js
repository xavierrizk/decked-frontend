import API_URL from '../api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Create a Set</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Set Title: </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>DJ: </label>
          <select
            value={djId}
            onChange={(e) => setDjId(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">Select a DJ</option>
            {djs.map((dj) => (
              <option key={dj.id} value={dj.id}>{dj.name}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Location: </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Duration (minutes): </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="1"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>YouTube Video ID: </label>
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="e.g. dQw4w9WgXcQ"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          {loading ? 'Creating...' : 'Create Set'}
        </button>
      </form>
    </div>
  );
}

export default CreateSet;
