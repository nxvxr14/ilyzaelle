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
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(108, 92, 231, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(108, 92, 231, 0.8), 0 0 40px rgba(108, 92, 231, 0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
