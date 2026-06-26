import React from 'react';
import { fmt } from './helpers';

function StatBox({ value, label, color }) {
  return (
    <div className="bg-[#0f0f1a] border border-white/[0.07] px-3 py-4 text-center transition-colors hover:border-white/[0.14] flex flex-col items-center justify-center gap-1">
      <p className="font-bold leading-none tabular-nums truncate max-w-full px-1"
        style={{ fontSize: 'clamp(18px, 3.5vw, 32px)', color: color || '#00D9FF' }}>
        {value ?? '—'}
      </p>
      <p className="text-gray-500 text-[9px] font-bold uppercase tracking-[0.12em]">{label}</p>
    </div>
  );
}

export default function StatsBlock({ stats, location }) {
  const s = stats || {};
  const avg = s.avg_rating_given ? Number(s.avg_rating_given).toFixed(1) : null;

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-8">
      <StatBox value={fmt(s.sets_rated)}      label="Sets Rated" />
      <StatBox value={fmt(s.reviews_written)} label="Reviews" />
      <StatBox value={avg}                    label="Avg Rating"  color="#FF006E" />
      <StatBox value={fmt(s.following)}       label="Following" />
      <StatBox value={fmt(s.friends)}         label="Friends" />
      <StatBox value={location || null}       label="City"        color="#A020F0" />
    </div>
  );
}
