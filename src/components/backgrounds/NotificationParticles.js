import React from 'react';

const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  size: 3 + (i % 3),
  left: `${(i * 13 + 8) % 90}%`,
  dur: `${5 + (i % 4) * 1.5}s`,
  delay: `${(i * 0.5) % 5}s`,
  color: i % 2 === 0 ? '#7c3aed' : '#3b82f6',
}));

export default function NotificationParticles() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {PARTICLES.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size, height: p.size,
            left: p.left, bottom: '-10px',
            background: p.color,
            filter: `blur(0.5px)`,
            animation: `riseUp ${p.dur} linear infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}
      <style>{`
        @keyframes riseUp {
          0%   { transform: translateY(0) translateX(0);   opacity: 0; }
          15%  { opacity: 0.4; }
          85%  { opacity: 0.2; }
          100% { transform: translateY(-100vh) translateX(15px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
