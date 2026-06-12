/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          purple: '#A855F7',
          'purple-dark': '#7C3AED',
          'purple-deep': '#4C1D95',
          cyan: '#00D9FF',
          'cyan-dark': '#06B6D4',
          pink: '#F472B6',
          'pink-hot': '#EC4899',
          gold: '#FBBF24',
          black: '#0A0A0A',
          'black-blue': '#0F0F1E',
          offwhite: '#F5F5F5',
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(139,92,246,0.35)',
        'glow-sm': '0 0 10px rgba(139,92,246,0.25)',
        'glow-purple': '0 0 20px rgba(168,85,247,0.4)',
        'glow-cyan': '0 0 15px rgba(0,217,255,0.3)',
        'glow-pink': '0 0 20px rgba(244,114,182,0.4)',
        'glow-gold': '0 0 15px rgba(251,191,36,0.3)',
      },
    },
  },
  plugins: [],
};
