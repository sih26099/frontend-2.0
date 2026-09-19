/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0B1420',
          900: '#0F1B2D',
          800: '#152538',
          700: '#1D3149',
          600: '#28405C',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          sunk: '#F5F6F8',
          page: '#EEF0F3',
        },
        ink: {
          900: '#151B23',
          700: '#3A4552',
          500: '#66717D',
          300: '#A2ACB6',
          200: '#D6DBE1',
          100: '#E8EBEE',
        },
        signal: {
          conflict: '#C2410C',
          conflictBg: '#FDF1EA',
          good: '#166534',
          goodBg: '#EDF7EF',
          bad: '#991B1B',
          badBg: '#FCEEEE',
          pending: '#9A6700',
          pendingBg: '#FDF6E3',
          info: '#1D4E89',
          infoBg: '#EAF1FA',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.1rem' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem' }],
      },
      boxShadow: {
        none: 'none',
        panel: '0 1px 2px 0 rgba(15, 27, 45, 0.06)',
        card: '0 1px 2px 0 rgba(15, 27, 45, 0.04), 0 1px 6px -1px rgba(15, 27, 45, 0.06)',
        'card-hover': '0 4px 10px -2px rgba(15, 27, 45, 0.10), 0 2px 4px -2px rgba(15, 27, 45, 0.06)',
        'card-lg': '0 8px 24px -6px rgba(15, 27, 45, 0.12), 0 2px 6px -2px rgba(15, 27, 45, 0.06)',
        nav: '2px 0 12px -4px rgba(11, 20, 32, 0.25)',
        'inner-line': 'inset 0 -1px 0 0 rgba(15, 27, 45, 0.06)',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        250: '250ms',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmerSweep: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeOutRight: {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(16px)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fadeIn 0.4s ease both',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'shimmer-sweep': 'shimmerSweep 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}