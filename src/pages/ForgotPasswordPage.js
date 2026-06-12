import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white">Forgot your password?</h1>
          <p className="text-gray-500 mt-1 text-sm">Enter your email and we'll send you a reset link.</p>
        </div>

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-7 shadow-2xl backdrop-blur-sm">
          {submitted ? (
            <div className="text-center py-2">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-green-500/15 flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                If that email is registered, you'll receive a reset link shortly. Check your inbox.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full bg-white/[0.04] border border-white/10 focus:border-brand-500 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm outline-none transition-colors duration-200"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-glow"
                >
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-gray-600 text-sm mt-5">
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">← Back to login</Link>
        </p>
      </div>
    </div>
  );
}
