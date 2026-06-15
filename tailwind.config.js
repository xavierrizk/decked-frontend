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
          // Primary: Dark grey scale
          50:  '#f0f2f4',
          100: '#d8dde2',
          200: '#b8c0c8',
          300: '#9BA6B3',
          400: '#7D8A97',
          500: '#6B7582',
          600: '#5A6470',  // PRIMARY GREY
          700: '#48545F',
          800: '#363F48',
          900: '#252D34',
          // Named semantic tokens
          grey: '#5A6470',
          'grey-light': '#7D8A97',
          'grey-dark': '#363F48',
          cyan: '#00D9FF',      // SECONDARY
          'cyan-dark': '#00B8D9',
          pink: '#FF006E',      // ACCENT
          'pink-light': '#FF3D8F',
          gold: '#FBBF24',
          black: '#0A0A0A',
          'black-blue': '#0F0F1A',
          offwhite: '#F5F5F5',
        },
      },
      borderRadius: {
        // Force sharp corners on card-like radii
        xl:  '0px',
        '2xl': '0px',
        '3xl': '0px',
      },
      boxShadow: {
        glow:       '0 0 20px rgba(90,100,112,0.5)',
        'glow-sm':  '0 0 10px rgba(90,100,112,0.35)',
        'glow-grey':'0 0 20px rgba(90,100,112,0.5)',
        'glow-cyan':'0 0 15px rgba(0,217,255,0.4)',
        'glow-pink':'0 0 20px rgba(255,0,110,0.45)',
        'glow-gold':'0 0 15px rgba(251,191,36,0.3)',
      },
    },
  },
  plugins: [],
};
