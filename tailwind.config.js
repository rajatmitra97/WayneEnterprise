/** @type {import('tailwindcss').Config} */
// GOTHAM TERMINAL palette — Vantablack, bone, one gold leaf, Arkham channels.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: '#050505',
          soft: '#0a0a0f',
          card: '#0f0f17',
          raised: '#15151f',
        },
        rule: { DEFAULT: '#1d1d2a', soft: '#15151f' },
        bone: { DEFAULT: '#e6e0d0', dim: '#a8a395' },
        ash: { DEFAULT: '#6a6759', dim: '#3a382f' },
        gold: { DEFAULT: '#c9a24e', dim: '#8b6f33', bright: '#f0c668' },
        blood: { DEFAULT: '#b30000', soft: '#8e2030', dim: '#5a1622' },
        acid: { DEFAULT: '#00ff41', soft: '#6cb04a', dim: '#3f6b29' },
        chaos: { DEFAULT: '#8a2be2', dim: '#4a1f6e' },
        batblue: '#3a4a6e',
      },
      fontFamily: {
        display: ['VT323', 'monospace'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', '"Courier New"', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 40px -12px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.04)',
        gold: '0 0 24px -4px rgba(201,162,78,0.45)',
        arkham: '0 0 28px -2px rgba(179,0,0,0.55)',
      },
      keyframes: {
        'arkham-pulse': {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(179,0,0,0.0), inset 0 0 18px -8px rgba(179,0,0,0.6)' },
          '50%': { boxShadow: '0 0 24px -4px rgba(179,0,0,0.7), inset 0 0 24px -6px rgba(179,0,0,0.85)' },
        },
        'fear-toxin': {
          '0%,100%': { filter: 'none' },
          '20%': { filter: 'hue-rotate(20deg) saturate(2) contrast(1.2)' },
          '50%': { filter: 'hue-rotate(-30deg) saturate(3)' },
        },
        flicker: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.82' },
        },
      },
      animation: {
        'arkham-pulse': 'arkham-pulse 2s ease-in-out infinite',
        'fear-toxin': 'fear-toxin 1.2s ease-out',
        flicker: 'flicker 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
