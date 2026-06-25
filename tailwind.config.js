/** @type {import('tailwindcss').Config} */
// GOTHAM TERMINAL palette — Vantablack, bone, one gold leaf, Arkham channels.
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ─── CRIMSON PROTOCOL — neon-red blood palette ─────────────
        // 060303 · 380705 · 450808 · D73423 · D62516
        gotham: {
          navy: '#060303', // base black
          cyan: '#450808', // panel maroon
          slate: '#9c5248', // muted dusty-red text/lines
          rust: '#D73423', // primary accent / CTA / active
          blood: '#D62516', // alerts / arkham / neon outline
        },
        // Re-pointed semantic tokens so the whole OS shifts at once.
        void: {
          DEFAULT: '#060303', // near-black
          soft: '#180605',
          card: '#220706', // 380705-ish panel
          raised: '#2f0908', // 450808-ish raised
        },
        rule: { DEFAULT: '#5a100b', soft: '#380705' }, // dim red lines
        bone: { DEFAULT: '#f2dad6', dim: '#cf9a92' }, // warm light text
        ash: { DEFAULT: '#9c5248', dim: '#4a1410' }, // dusty-red muted
        gold: { DEFAULT: '#D73423', dim: '#8a1c12', bright: '#ff5638' }, // → primary accent (CTA)
        blood: { DEFAULT: '#D62516', soft: '#b51f12', dim: '#450808' }, // alerts / destructive
        acid: { DEFAULT: '#c0392b', soft: '#a83020', dim: '#5a140d' }, // retired → mid red
        chaos: { DEFAULT: '#8a2be2', dim: '#4a1f6e' }, // Joker purple, kept sparingly
        batblue: '#9c5248',
        hud: { DEFAULT: '#D62516', dim: '#5a100b' }, // neon-red HUD / outlines
        neon: '#ff3422', // hot neon-red for glowing outlines

        // ─── THE BILLIONAIRE'S FACADE — Wayne Mode penthouse palette ──
        wayne: {
          base: '#fefefe', // blinding white background
          surface: '#f9f6f2', // expensive ivory cards
          border: '#e2e2e4', // subtle dividers / glass borders
          muted: '#e1dbd6', // disabled / background text
          dark: '#d1d1d3', // metallic silver — text & active icons
          ink: '#4a4a4f', // (added) readable graphite for body copy
        },

        // ─── ARKHAM MUTATION debuff hues ──────────────────────────
        mutate: {
          freeze: '#7ad7ff', // Mr. Freeze ice-blue
          riddler: '#39ff14', // Riddler neon green
          scarecrow: '#c9a73a', // Scarecrow sickly yellow-brown
        },
      },
      fontFamily: {
        // Tactical HUD: angular display + technical condensed + data mono.
        display: ['"Chakra Petch"', 'monospace'],
        tech: ['"Rajdhani"', '"Chakra Petch"', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', '"Courier New"', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 40px -12px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.04)',
        gold: '0 0 24px -4px rgba(215,52,35,0.5)',
        arkham: '0 0 28px -2px rgba(214,37,22,0.6)',
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
        'scan-sweep': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        'hud-pulse': {
          '0%,100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        'boot-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)', filter: 'blur(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
        // GCPD Dispatch — a rust laser sweeping the active hour
        'laser-scan': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '20%': { opacity: '1' },
          '80%': { opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        'slot-glow': {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(214,37,22,0)' },
          '50%': { boxShadow: '0 0 22px -2px rgba(255,52,34,0.85), inset 0 0 16px -6px rgba(214,37,22,0.7)' },
        },
        // Scarecrow fear-toxin jump-scare — violent shake + hue lurch
        'scare-glitch': {
          '0%,100%': { transform: 'translate(0,0)', filter: 'none' },
          '10%': { transform: 'translate(-8px,4px) skewX(3deg)', filter: 'hue-rotate(40deg) saturate(2.4)' },
          '30%': { transform: 'translate(7px,-5px)', filter: 'hue-rotate(-30deg) saturate(3) contrast(1.3)' },
          '50%': { transform: 'translate(-5px,6px) skewX(-2deg)', filter: 'hue-rotate(60deg)' },
          '70%': { transform: 'translate(6px,-3px)', filter: 'hue-rotate(-20deg) saturate(2)' },
          '90%': { transform: 'translate(-3px,2px)', filter: 'none' },
        },
      },
      animation: {
        'arkham-pulse': 'arkham-pulse 2s ease-in-out infinite',
        'fear-toxin': 'fear-toxin 1.2s ease-out',
        flicker: 'flicker 3s ease-in-out infinite',
        'scan-sweep': 'scan-sweep 6s linear infinite',
        'hud-pulse': 'hud-pulse 2.4s ease-in-out infinite',
        'boot-in': 'boot-in 0.6s ease-out both',
        'laser-scan': 'laser-scan 2.6s ease-in-out infinite',
        'slot-glow': 'slot-glow 2.2s ease-in-out infinite',
        'scare-glitch': 'scare-glitch 0.7s ease-in-out',
      },
    },
  },
  plugins: [],
}
