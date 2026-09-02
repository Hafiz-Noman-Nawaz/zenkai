/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zenkai: {
          bg: '#08090d',
          surface: '#0e1118',
          card: '#131722',
          elevated: '#191f2e',
          border: '#232b3e',
          subtle: '#1b2130',
          accent: '#6366f1',
          'accent-hover': '#4f46e5',
          'accent-light': '#818cf8',
          text: '#f3f4f6',
          muted: '#9ca3af',
          dim: '#6b7280',
        },
        status: {
          watching: '#38bdf8',
          completed: '#10b981',
          plan: '#818cf8',
          onhold: '#f59e0b',
          dropped: '#f43f5e',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        'zenkai-subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'zenkai-card': '0 8px 30px rgba(0, 0, 0, 0.6)',
        'zenkai-hover': '0 12px 40px -4px rgba(99, 102, 241, 0.15)',
        'zenkai-glow': '0 0 35px -5px rgba(99, 102, 241, 0.25)',
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(ellipse at top, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
