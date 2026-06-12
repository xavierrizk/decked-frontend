import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../api';
import { getTokenPayload } from '../utils/auth';

export default function EmailVerificationBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [resendStatus, setResendStatus] = useState(null); // null | 'sending' | 'sent' | 'error'

  const payload = getTokenPayload();
  const isLoggedIn = !!localStorage.getItem('token');

  // Only show if logged in and email not verified
  if (!isLoggedIn || !payload || payload.emailVerified === true || dismissed) {
    return null;
  }

  const handleResend = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setResendStatus('sending');
    try {
      await axios.post(`${API_URL}/api/auth/resend-verification`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResendStatus('sent');
    } catch {
      setResendStatus('error');
    }
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-amber-300 text-sm flex-1 min-w-0">
        <span className="shrink-0">⚠️</span>
        <span className="truncate">
          Please verify your email address. Check your inbox or{' '}
          {resendStatus === 'sent' ? (
            <span className="font-semibold text-green-400">Email sent!</span>
          ) : resendStatus === 'error' ? (
            <span className="text-red-400">Failed to send. Try again later.</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendStatus === 'sending'}
              className="underline font-semibold hover:text-amber-200 disabled:opacity-50 transition-colors"
            >
              {resendStatus === 'sending' ? 'Sending…' : 'resend the link'}
            </button>
          )}
          .
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 text-amber-400/60 hover:text-amber-300 transition-colors p-1 rounded"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
