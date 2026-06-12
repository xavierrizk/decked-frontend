import React from 'react';

const DOTS = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: 2 + (i % 3),
  top:  `${(i * 23 + 7) % 90}%`,
  left: `${(i * 19 + 11) % 92}%`,
  dur:  `${2.5 + (i % 4) * 0.5}s`,
  delay: `${(i * 0.3) % 3}s`,
}));

export default function MinimalDots() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {DOTS.map(d => (
        <div
          key={d.id}
          className="absolute rounded-full bg-blue-800"
          style={{
            width: d.size, height: d.size,
            top: d.top, left: d.left,
            animation: `dotFade ${d.dur} ease-in-out infinite`,
            animationDelay: d.delay,
          }}
        />
      ))}
      <style>{`
        @keyframes dotFade {
          0%, 100% { opacity: 0.05; transform: scale(1); }
          50%       { opacity: 0.25; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}
