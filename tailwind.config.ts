import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:  '#5E3088',
          dark:     '#3A1E74',
          yellow:   '#F1C81D',
          pink:     '#EF338D',
          blue:     '#33B0D4',
          gold:     '#E09E2E',
        },
        border:      'var(--border)',
        input:       'var(--input)',
        ring:        'var(--ring)',
        background:  'var(--background)',
        foreground:  'var(--foreground)',
        primary: {
          DEFAULT:   'var(--primary)',
          foreground:'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT:   'var(--secondary)',
          foreground:'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT:   'var(--muted)',
          foreground:'var(--muted-foreground)',
        },
        accent: {
          DEFAULT:   'var(--accent)',
          foreground:'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT:   'var(--destructive)',
          foreground:'var(--destructive-foreground)',
        },
        card: {
          DEFAULT:   'var(--card)',
          foreground:'var(--card-foreground)',
        },
        popover: {
          DEFAULT:   'var(--popover)',
          foreground:'var(--popover-foreground)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
};

export default config;