import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFF0F1',
          100: '#FFE0E3',
          200: '#FFC7CC',
          300: '#FFA0A8',
          400: '#FF6B78',
          500: '#C8102E',
          600: '#A30D24',
          700: '#8A0B1E',
          800: '#700919',
          900: '#5C0815',
          950: '#33040B',
          DEFAULT: '#C8102E',
        },
        secondary: {
          50: '#F7F9FA',
          100: '#E8ECF0',
          200: '#D1D5DB',
          300: '#AAB8C2',
          400: '#8899A6',
          500: '#536471',
          600: '#3D4D57',
          700: '#2C3640',
          800: '#1C252D',
          900: '#0F1419',
          950: '#080B0E',
          DEFAULT: '#0F1419',
        },
      },
      fontFamily: {
        sans: ['Inter', 'var(--font-roboto)', 'Roboto', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'elevated': '0 4px 16px -2px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        'hover': '0 8px 24px -4px rgba(0, 0, 0, 0.10), 0 2px 8px -2px rgba(0, 0, 0, 0.06)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
    },
  },
  plugins: [],
};
export default config;
