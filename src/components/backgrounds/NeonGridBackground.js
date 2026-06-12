import React from 'react';

export default function NeonGridBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(rgba(0,255,200,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,200,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        animation: 'gridPulse 6s ease-in-out infinite',
      }} />
      {/* Glow spots */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full" style={{
        background: 'radial-gradient(circle, rgba(0,255,200,0.05) 0%, transparent 70%)',
        animation: 'gridGlow 8s ease-in-out infinite',
      }} />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full" style={{
        background: 'radial-gradient(circle, rgba(0,200,255,0.04) 0%, transparent 70%)',
        animation: 'gridGlow 10s ease-in-out infinite reverse',
      }} />
      <style>{`
        @keyframes gridPulse {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 1; }
        }
        @keyframes gridGlow {
          0%, 100% { transform: scale(1) translate(0,0); }
          50%       { transform: scale(1.2) translate(20px, -20px); }
        }
      `}</style>
    </div>
  );
}
