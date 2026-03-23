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
        parchment: {
          DEFAULT: '#FCF9F4',
          dim: '#F5F2ED',
        },
        ink: {
          DEFAULT: '#1A2E44',
          muted: '#4A5B6E',
          light: '#7F8E9D',
        },
        gold: {
          DEFAULT: '#B8860B',
          dim: 'rgba(184,134,11,0.1)',
        },
        forest: {
          DEFAULT: '#2D4B33',
          dim: 'rgba(45,75,51,0.1)',
        },
        divider: '#E5E2DD',
        status: {
          green: '#2D4B33',
          red: '#963B3B',
          blue: '#1A2E44',
          gold: '#B8860B',
        }
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        'library': '4px',
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
