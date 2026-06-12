import React from 'react';

const ORBS = [
  { size: 300, top: '10%',  left: '5%',   color: '#7c3aed', dur: '8s',  delay: '0s' },
  { size: 200, top: '60%',  left: '80%',  color: '#3b82f6', dur: '11s', delay: '2s' },
  { size: 150, top: '30%',  left: '60%',  color: '#ec4899', dur: '7s',  delay: '1s' },
  { size: 250, top: '75%',  left: '20%',  color: '#7c3aed', dur: '13s', delay: '3s' },
  { size: 120, top: '15%',  left: '45%',  color: '#06b6d4', dur: '9s',  delay: '0.5s' },
  { size: 180, top: '50%',  left: '40%',  color: '#3b82f6', dur: '12s', delay: '4s' },
];

export default function PulsingOrbs() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {ORBS.map((orb, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size, height: orb.size,
            top: orb.top, left: orb.left,
            background: `radial-gradient(circle, ${orb.color}22 0%, transparent 70%)`,
            filter: `blur(40px)`,
            animation: `orbPulse ${orb.dur} ease-in-out infinite`,
            animationDelay: orb.delay,
          }}
        />
      ))}
      <style>{`
        @keyframes orbPulse {
          0%, 100% { transform: scale(1);    opacity: 0.6; }
          50%       { transform: scale(1.3);  opacity: 1; }
        }
      `}</style>
    </div>
  );
}
