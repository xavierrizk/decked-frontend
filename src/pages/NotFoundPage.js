import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative text-center max-w-md w-full">
        {/* Big 404 */}
        <p className="text-[120px] md:text-[160px] font-black leading-none bg-gradient-to-b from-white/20 to-white/5 bg-clip-text text-transparent select-none">
          404
        </p>

        {/* Icon */}
        <div className="text-5xl mb-4 -mt-4">🎧</div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
          This set doesn't exist
        </h1>
        <p className="text-gray-500 text-base mb-8 leading-relaxed">
          The page you're looking for has been dropped, never uploaded, or maybe the DJ forgot to save it.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl border border-white/10 text-gray-300 hover:border-white/30 hover:text-white text-sm font-semibold transition-all duration-200"
          >
            ← Go Back
          </button>
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
