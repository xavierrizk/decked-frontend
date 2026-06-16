import API_URL from '../api';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function CreateDJ() {
  const [name, setName]       = useState('');
  const [bio, setBio]         = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await axios.post(`${API_URL}/api/djs`, { name, bio },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create DJ');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-gray-500 hover:text-brand-400 text-sm transition-colors block mb-6">← Back</Link>
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7 shadow-2xl backdrop-blur-sm">
          <h1 className="text-2xl font-extrabold text-white mb-1">Add a DJ</h1>
          <p className="text-gray-500 text-sm mb-6">Create a new DJ profile on DECK'D</p>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="DJ Name" type="text" value={name} onChange={setName} placeholder="DJ Example" required />
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                Bio <span className="text-gray-700 normal-case tracking-normal font-normal">(optional)</span>
              </label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 focus:border-brand-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm outline-none transition-colors duration-200 resize-none h-28"
                placeholder="Tell us about this DJ…" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full btn-primary disabled:opacity-40  font-semibold py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-glow">
              {loading ? 'Creating…' : 'Create DJ'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder}
        className="w-full bg-white/[0.04] border border-white/10 focus:border-brand-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm outline-none transition-colors duration-200" />
    </div>
  );
}
