import React from 'react';

export default function WaveformBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        style={{ height: '30vh', opacity: 0.08 }}
      >
        <path fill="none" stroke="url(#waveGrad1)" strokeWidth="2"
          d="M0,100 C180,60 360,140 540,100 C720,60 900,140 1080,100 C1260,60 1380,120 1440,100" >
          <animate attributeName="d"
            values="M0,100 C180,60 360,140 540,100 C720,60 900,140 1080,100 C1260,60 1380,120 1440,100;
                    M0,100 C180,140 360,60 540,100 C720,140 900,60 1080,100 C1260,140 1380,80 1440,100;
                    M0,100 C180,60 360,140 540,100 C720,60 900,140 1080,100 C1260,60 1380,120 1440,100"
            dur="6s" repeatCount="indefinite" />
        </path>
        <path fill="none" stroke="url(#waveGrad2)" strokeWidth="1.5"
          d="M0,120 C120,80 240,160 440,120 C640,80 840,160 1040,120 C1240,80 1360,130 1440,120">
          <animate attributeName="d"
            values="M0,120 C120,80 240,160 440,120 C640,80 840,160 1040,120 C1240,80 1360,130 1440,120;
                    M0,120 C120,160 240,80 440,120 C640,160 840,80 1040,120 C1240,160 1360,110 1440,120;
                    M0,120 C120,80 240,160 440,120 C640,80 840,160 1040,120 C1240,80 1360,130 1440,120"
            dur="8s" repeatCount="indefinite" />
        </path>
        <path fill="none" stroke="url(#waveGrad1)" strokeWidth="1"
          d="M0,80 C200,110 400,50 600,80 C800,110 1000,50 1200,80 C1340,100 1400,70 1440,80">
          <animate attributeName="d"
            values="M0,80 C200,110 400,50 600,80 C800,110 1000,50 1200,80 C1340,100 1400,70 1440,80;
                    M0,80 C200,50 400,110 600,80 C800,50 1000,110 1200,80 C1340,60 1400,90 1440,80;
                    M0,80 C200,110 400,50 600,80 C800,110 1000,50 1200,80 C1340,100 1400,70 1440,80"
            dur="10s" repeatCount="indefinite" />
        </path>
        <defs>
          <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed"/>
            <stop offset="100%" stopColor="#06b6d4"/>
          </linearGradient>
          <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4"/>
            <stop offset="100%" stopColor="#7c3aed"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
