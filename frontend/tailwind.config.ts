import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4A843',
          light: '#E8C470',
          dim: 'rgba(212,168,67,0.12)',
        },
        ink: {
          DEFAULT: '#0B0C0F',
          2: '#13141A',
          3: '#1A1B22',
          card: '#16171E',
        },
        cream: {
          DEFAULT: '#F2ECD8',
          mid: '#C8BFA8',
          dim: '#9A9080',
        },
        status: {
          green: '#3ECF8E',
          red: '#F06060',
          blue: '#5B9CF6',
          purple: '#A78BFA',
        }
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease both',
        'pulse-dot': 'pulse 2s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
