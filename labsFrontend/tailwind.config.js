/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'cursive'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        pixel: {
          dark: '#1a1a2e',
          darker: '#0f0f1a',
          primary: '#e94560',
          secondary: '#533483',
          accent: '#0f3460',
          gold: '#f5c518',
          green: '#00d474',
          blue: '#4fc3f7',
          purple: '#ab47bc',
          orange: '#ff9800',
          pink: '#f06292',
          cyan: '#00e5ff',
        },
      },
      boxShadow: {
        pixel: '4px 4px 0px 0px rgba(0,0,0,0.8)',
        'pixel-sm': '2px 2px 0px 0px rgba(0,0,0,0.8)',
        'pixel-lg': '6px 6px 0px 0px rgba(0,0,0,0.8)',
        'pixel-glow': '0 0 20px rgba(233,69,96,0.5)',
        'pixel-gold': '4px 4px 0px 0px rgba(245,197,24,0.8)',
      },
      keyframes: {
        'bounce-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pixel-pulse': {
          '0%, 100%': { boxShadow: '0 0 0px rgba(233,69,96,0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(233,69,96,0.8)' },
        },
        'count-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'bounce-in': 'bounce-in 0.5s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'pixel-pulse': 'pixel-pulse 2s infinite',
        'count-up': 'count-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
