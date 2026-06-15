import React from 'react';
import { fmt } from './helpers';

function StatBox({ value, label }) {
  return (
    <div className="bg-[#0f0f1a] border border-white/[0.07] px-4 py-5 text-center transition-colors hover:border-white/[0.14]">
      <p className="stat-number font-bold leading-none" style={{ fontSize: 'clamp(28px, 5vw, 40px)', color: '#00D9FF' }}>
        {fmt(value)}
      </p>
      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.15em] mt-2">{label}</p>
    </div>
  );
}

export default function StatsBlock({ stats }) {
  const s = stats || {};
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
      <StatBox value={s.sets_rated}      label="Sets Rated" />
      <StatBox value={s.reviews_written} label="Reviews" />
      <StatBox value={s.following}       label="DJs Following" />
      <StatBox value={s.friends}         label="Friends" />
    </div>
  );
}
