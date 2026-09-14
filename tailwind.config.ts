import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803D', // Primary Brand Green
          800: '#166534',
          900: '#14532D', // Dark Green Accent
          950: '#052e16',
        },
        surface: {
          bg: '#F8FAF8',       // Page Background
          card: '#FFFFFF',
          cardSubtle: '#F1F5F1',
          border: '#E2E8E2',
          borderLight: '#EDF2ED',
        },
        status: {
          drop: '#16A34A',     // Price Drop Badge
          dropBg: '#ECFDF5',
          spike: '#DC2626',    // Price Spike Badge
          spikeBg: '#FEF2F2',
          warning: '#D97706',  // Calculator & Warnings
          warningBg: '#FFFBEB',
          stable: '#4B5563',
          stableBg: '#F3F4F6',
        },
        content: {
          main: '#17211B',     // Main text
          muted: '#647067',    // Muted text
          light: '#9CA3AF',
        }
      },
      fontFamily: {
        bangla: ['var(--font-bangla)', 'Noto Sans Bengali', 'sans-serif'],
        english: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'card-subtle': '0 1px 3px 0 rgba(20, 83, 45, 0.05), 0 1px 2px -1px rgba(20, 83, 45, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(21, 128, 61, 0.1), 0 8px 10px -6px rgba(21, 128, 61, 0.05)',
        'float': '0 20px 35px -10px rgba(20, 83, 45, 0.15)',
      }
    },
  },
  plugins: [],
};
export default config;
