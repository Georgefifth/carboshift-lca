/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#0B0F17',
        surface: '#131B2A',
        'surface-elevated': '#1B2438',
        'border-subtle': '#1F293D',
        'text-primary': '#F8FAFC',
        'text-muted': '#94A3B8',
        'accent-green': '#10B981',
        'debt-amber': '#F59E0B',
        'burn-red': '#EF4444',
        'candidate-cyan': '#0EA5E9',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        'crisp': '4px',
        'card': '6px',
      }
    },
  },
  plugins: [],
}
