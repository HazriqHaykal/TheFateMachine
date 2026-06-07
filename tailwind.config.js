/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Orbitron"', 'sans-serif'],
        body: ['"Rajdhani"', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'monospace'],
      },
      colors: {
        void: '#050509',
        panel: '#0d0d1a',
        'panel-light': '#12122a',
        cyan: {
          neon: '#00f5ff',
          dim: '#00b8c4',
          glow: 'rgba(0,245,255,0.15)',
        },
        red: {
          neon: '#ff003c',
          dim: '#cc0030',
          glow: 'rgba(255,0,60,0.15)',
        },
        gold: {
          neon: '#ffd700',
          dim: '#ccac00',
          glow: 'rgba(255,215,0,0.15)',
        },
        purple: {
          neon: '#9b5de5',
          dim: '#7a49b4',
        },
      },
      boxShadow: {
        'neon-cyan': '0 0 10px rgba(0,245,255,0.4), 0 0 30px rgba(0,245,255,0.2)',
        'neon-cyan-lg': '0 0 20px rgba(0,245,255,0.6), 0 0 60px rgba(0,245,255,0.3)',
        'neon-red': '0 0 10px rgba(255,0,60,0.4), 0 0 30px rgba(255,0,60,0.2)',
        'neon-red-lg': '0 0 20px rgba(255,0,60,0.7), 0 0 60px rgba(255,0,60,0.4)',
        'neon-gold': '0 0 10px rgba(255,215,0,0.4), 0 0 30px rgba(255,215,0,0.2)',
        'neon-gold-lg': '0 0 20px rgba(255,215,0,0.7), 0 0 80px rgba(255,215,0,0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        glitch: 'glitch 0.4s steps(1) infinite',
        scanline: 'scanline 8s linear infinite',
        heartbeat: 'heartbeat 1s ease-in-out infinite',
        flicker: 'flicker 0.15s steps(1) infinite',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { clipPath: 'inset(0 0 95% 0)', transform: 'translate(-2px,0)' },
          '25%': { clipPath: 'inset(30% 0 60% 0)', transform: 'translate(3px,0)' },
          '50%': { clipPath: 'inset(70% 0 20% 0)', transform: 'translate(-1px,0)' },
          '75%': { clipPath: 'inset(10% 0 80% 0)', transform: 'translate(2px,0)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.08)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(1)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
    },
  },
  plugins: [],
}
