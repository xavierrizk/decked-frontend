import API_URL from '../api';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Signup({ setIsLoggedIn }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await axios.post(API_URL + '/api/auth/signup', { username, email, password });
      localStorage.setItem('token', res.data.token);
      setIsLoggedIn(true);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white">Join Decked</h1>
          <p className="text-gray-500 mt-1 text-sm">Start rating DJ sets today</p>
        </div>

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7 shadow-2xl backdrop-blur-sm">
          {error && (
            <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Username" type="text"     value={username} onChange={setUsername} placeholder="djmaster" />
            <Field label="Email"    type="email"    value={email}    onChange={setEmail}    placeholder="you@example.com" />
            <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
            <button type="submit" disabled={loading}
              className="w-full mt-1 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-glow">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-sm mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">{label}</label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} required placeholder={placeholder}
        className="w-full bg-white/[0.04] border border-white/10 focus:border-brand-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm outline-none transition-colors duration-200"
      />
    </div>
  );
}
