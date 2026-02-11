/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lab: {
          bg: '#0a0a0f',
          surface: '#12121a',
          card: '#1a1a2e',
          border: '#2a2a3e',
          primary: '#6c5ce7',
          'primary-light': '#a29bfe',
          secondary: '#00cec9',
          accent: '#fd79a8',
          gold: '#fdcb6e',
          text: '#e2e8f0',
          'text-muted': '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'chest-glow': 'chestGlow 1.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.1)' },
        },
        chestGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(253, 203, 110, 0.3), 0 0 40px rgba(108, 92, 231, 0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(253, 203, 110, 0.6), 0 0 80px rgba(108, 92, 231, 0.3)' },
        },
      },
    },
  },
  plugins: [],
};
