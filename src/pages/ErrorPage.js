import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function ErrorPage({ message }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative text-center max-w-md w-full">
        <p className="text-[120px] md:text-[160px] font-black leading-none bg-gradient-to-b from-red-500/30 to-red-500/5 bg-clip-text text-transparent select-none">
          500
        </p>

        <div className="text-5xl mb-4 -mt-4">⚡</div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
          Something went wrong
        </h1>
        <p className="text-gray-500 text-base mb-3 leading-relaxed">
          {message || "We hit a technical issue on our end. It's not you — the booth is having a moment."}
        </p>
        <p className="text-gray-600 text-sm mb-8">
          Try refreshing the page. If it keeps happening, the issue will resolve soon.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl border border-white/10 text-gray-300 hover:border-white/30 hover:text-white text-sm font-semibold transition-all duration-200"
          >
            ↺ Refresh
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl border border-white/10 text-gray-300 hover:border-white/30 hover:text-white text-sm font-semibold transition-all duration-200"
          >
            ← Go Back
          </button>
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Home
          </Link>
        </div>
        <p className="text-gray-700 text-xs mt-6">
          Need help?{' '}
          <Link to="/help" className="text-gray-500 hover:text-gray-300 underline underline-offset-2 transition-colors">
            Check the FAQ
          </Link>
        </p>
      </div>
    </div>
  );
}
