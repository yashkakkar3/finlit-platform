/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ledger: { DEFAULT: '#16233E', light: '#233657' },
        mint: { DEFAULT: '#2FA88A', light: '#E4F5F0', dark: '#1F7A63' },
        coral: { DEFAULT: '#EF6461', light: '#FDE9E8' },
        gold: { DEFAULT: '#E3B23C', light: '#FBF0D9' },
        paper: '#FAF7F0',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
