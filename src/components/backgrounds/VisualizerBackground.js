import React from 'react';

export default function VisualizerBackground() {
  const bars = Array.from({ length: 28 });
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-1 px-4" style={{ height: '35vh' }}>
        {bars.map((_, i) => (
          <div
            key={i}
            className="flex-1 max-w-[18px] rounded-t-sm opacity-[0.12]"
            style={{
              background: `hsl(${260 + (i * 8)}deg, 80%, 65%)`,
              animation: `vizBar ${0.8 + (i % 7) * 0.18}s ease-in-out infinite alternate`,
              animationDelay: `${(i * 0.07) % 1.2}s`,
              height: `${20 + (i % 5) * 15}%`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes vizBar {
          0%   { transform: scaleY(0.15); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
