/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lpl: {
          DEFAULT: '#4f6ef7',
          glow: '#6b86f9',
          dim: '#3b57d4',
          bg: '#f0f3ff'
        },
        ivl: {
          DEFAULT: '#e06c2b',
          glow: '#f08040',
          dim: '#c45820',
          bg: '#fff8f3'
        },
        midnight: {
          DEFAULT: '#ffffff',
          surface: '#f8f9fa',
          card: '#ffffff',
          border: '#e5e7eb',
          text: '#111827',
          muted: '#6b7280'
        }
      },
      boxShadow: {
        'lpl-glow': '0 0 20px rgba(57, 255, 20, 0.3), 0 0 40px rgba(57, 255, 20, 0.1)',
        'ivl-glow': '0 0 20px rgba(220, 20, 60, 0.3), 0 0 40px rgba(220, 20, 60, 0.1)',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-lpl': 'pulseLpl 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-ivl': 'pulseIvl 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        pulseLpl: {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 20px rgba(57, 255, 20, 0.3)' },
          '50%': { opacity: 0.8, boxShadow: '0 0 30px rgba(57, 255, 20, 0.5)' },
        },
        pulseIvl: {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 20px rgba(220, 20, 60, 0.3)' },
          '50%': { opacity: 0.8, boxShadow: '0 0 30px rgba(220, 20, 60, 0.5)' },
        },
      }
    },
  },
  plugins: [],
}