import API_URL from '../api';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function CreateDJ() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');

    try {
      await axios.post(
        `${API_URL}/api/djs`,
        { name, bio },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create DJ');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl">
        <Link to="/" className="text-brand-400 hover:text-brand-300 text-sm font-medium block mb-4">← Back</Link>
        <h1 className="text-3xl font-bold text-white mb-1">Add a DJ</h1>
        <p className="text-gray-400 text-sm mb-6">Create a new DJ profile on Decked</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">DJ Name</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
              placeholder="DJ Example"
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-1">Bio <span className="text-gray-500">(optional)</span></label>
            <textarea
              value={bio} onChange={(e) => setBio(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors resize-none h-28"
              placeholder="Tell us about this DJ..."
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-all shadow-lg shadow-brand-900/50"
          >
            {loading ? 'Creating...' : 'Create DJ'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateDJ;
