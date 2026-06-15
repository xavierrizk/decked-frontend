import React from 'react';

export default function SmoothGradient() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(90,100,112,0.12) 0%, transparent 60%)',
        animation: 'smoothPulse 10s ease-in-out infinite',
      }} />
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 80% 100%, rgba(59,130,246,0.07) 0%, transparent 50%)',
        animation: 'smoothPulse 14s ease-in-out infinite reverse',
      }} />
      <style>{`
        @keyframes smoothPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
