import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [resendStatus, setResendStatus] = useState(null); // null | 'sending' | 'sent' | 'error'

  const token = searchParams.get('token');
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    axios.get(`${API_URL}/api/auth/verify-email?token=${token}`)
      .then(res => {
        // Store fresh token so emailVerified=true is reflected immediately
        if (res.data.token) localStorage.setItem('token', res.data.token);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  }, [token]);

  const handleResend = async () => {
    const authToken = localStorage.getItem('token');
    if (!authToken) return;
    setResendStatus('sending');
    try {
      await axios.post(`${API_URL}/api/auth/resend-verification`, {}, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setResendStatus('sent');
    } catch {
      setResendStatus('error');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-[#111114] border border-white/[0.07] rounded-2xl p-8 shadow-2xl text-center">
          {status === 'loading' && (
            <>
              <div className="flex justify-center mb-5">
                <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
              </div>
              <p className="text-gray-400 text-base">Verifying your email…</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-extrabold text-white mb-2">Email Verified!</h1>
              <p className="text-gray-400 text-sm mb-7">Your account is now active. Welcome to DECK'D.</p>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Go to DECK'D →
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <h1 className="text-2xl font-extrabold text-white mb-2">Link expired or invalid</h1>
              <p className="text-gray-400 text-sm mb-7">Verification links expire after 24 hours.</p>

              {isLoggedIn ? (
                <>
                  {resendStatus === 'sent' ? (
                    <p className="text-green-400 text-sm font-medium">Verification email sent! Check your inbox.</p>
                  ) : resendStatus === 'error' ? (
                    <p className="text-red-400 text-sm">Failed to resend. Please try again later.</p>
                  ) : (
                    <button
                      onClick={handleResend}
                      disabled={resendStatus === 'sending'}
                      className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {resendStatus === 'sending' ? 'Sending…' : 'Resend Verification Email'}
                    </button>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="block w-full text-center bg-white/[0.06] hover:bg-white/[0.1] text-gray-300 font-semibold py-2.5 rounded-xl transition-all duration-200"
                >
                  Log in to resend
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
