import React from 'react';

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  size: 4 + (i % 5) * 3,
  left: `${(i * 17 + 5) % 95}%`,
  delay: `${(i * 0.4) % 5}s`,
  duration: `${8 + (i % 6) * 2}s`,
  color: i % 3 === 0 ? '#7c3aed' : i % 3 === 1 ? '#3b82f6' : '#06b6d4',
}));

export default function GradientParticles() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Animated gradient blobs */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.10) 0%, transparent 50%)',
        animation: 'gradShift 12s ease-in-out infinite alternate',
      }} />
      {/* Floating particles */}
      {PARTICLES.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size, height: p.size,
            left: p.left,
            bottom: '-20px',
            background: p.color,
            opacity: 0.25,
            filter: `blur(1px) drop-shadow(0 0 ${p.size}px ${p.color})`,
            animation: `floatUp ${p.duration} linear infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}
      <style>{`
        @keyframes gradShift {
          0%   { opacity: 0.7; transform: scale(1); }
          100% { opacity: 1;   transform: scale(1.05); }
        }
        @keyframes floatUp {
          0%   { transform: translateY(0) translateX(0);   opacity: 0; }
          10%  { opacity: 0.25; }
          90%  { opacity: 0.15; }
          100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
