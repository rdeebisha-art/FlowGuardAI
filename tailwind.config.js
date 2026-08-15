/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cc: {
          bg: '#050816',
          panel: '#0a1024',
          cyan: '#22d3ee',
          blue: '#38bdf8',
          emerald: '#34d399',
          amber: '#f59e0b',
          rose: '#f43f5e',
          violet: '#a78bfa',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'fade-in': 'pageEnter 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};
