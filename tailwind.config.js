// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'], // Enable dark mode with class and data attribute strategy
  theme: {
    extend: {
      // Design System Typography
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        display: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      
      // Unified Color System
      colors: {
        // Niger-inspired colors
        'niger-orange': '#ff8c00',
        'niger-orange-light': '#ffb347',
        'niger-orange-dark': '#e67e00',
        'niger-green': '#228b22',
        'niger-green-light': '#32cd32',
        'niger-green-dark': '#006400',
        'niger-white': '#ffffff',
        'niger-cream': '#faf8f5',
        
        // Primary brand colors
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Main brand color
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        
        // Secondary colors
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        
        // Semantic colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        info: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
      },
      
      // Spacing system (8px grid)
      spacing: {
        '0.5': '0.125rem',   // 2px
        '1.5': '0.375rem',   // 6px
        '2.5': '0.625rem',   // 10px
        '3.5': '0.875rem',   // 14px
        '18': '4.5rem',      // 72px
        '22': '5.5rem',      // 88px
        '26': '6.5rem',      // 104px
        '30': '7.5rem',      // 120px
        '112': '28rem',      // 448px
        '128': '32rem',      // 512px
      },
      
      // Border radius system
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      
      // Box shadow system
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 25px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 8px 30px -5px rgba(0, 0, 0, 0.15), 0 15px 35px -5px rgba(0, 0, 0, 0.08)',
        'colored': '0 8px 30px -5px rgba(14, 165, 233, 0.15)',
        'neumorph': '8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.7)',
        'neumorph-inset': 'inset 8px 8px 16px rgba(0, 0, 0, 0.1), inset -8px -8px 16px rgba(255, 255, 255, 0.7)',
        'neumorph-dark': '8px 8px 16px rgba(0, 0, 0, 0.3), -8px -8px 16px rgba(255, 255, 255, 0.05)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
      },
      
      // Enhanced animations
      keyframes: {
        // Existing animations
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "fade-out": {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
        "slide-in-from-top": {
          "0%": { transform: "translateY(-10%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-out-to-top": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-10%)" },
        },
        'subtle-ring': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' }
        },
        'subtle-fade': {
          '0%': { opacity: '0.8' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.8' }
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        // New animations
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        },
      },
      animation: {
        // Existing animations
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        "fade-in": "fade-in 0.3s ease-in-out",
        "fade-out": "fade-out 0.3s ease-in-out",
        "slide-in-from-top": "slide-in-from-top 0.3s ease-out",
        "slide-out-to-top": "slide-out-to-top 0.3s ease-in",
        'subtle-ring': 'subtle-ring 3s ease-in-out infinite',
        'subtle-fade': 'subtle-fade 3s ease-in-out infinite',
        'fade-in-down': 'fade-in-down 0.2s ease-out',
        // New animations
        'slide-up': 'slide-up 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
      },
      
      // Z-index system
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'toast': '1080',
      },
    },
  },
  plugins: [
    // Custom plugin for design system utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Text gradients
        '.text-gradient-primary': {
          'background': `linear-gradient(135deg, ${theme('colors.primary.500')}, ${theme('colors.primary.700')})`,
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.text-gradient-secondary': {
          'background': `linear-gradient(135deg, ${theme('colors.secondary.500')}, ${theme('colors.secondary.700')})`,
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        
        // Hover effects
        '.hover-lift': {
          'transition': 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            'transform': 'translateY(-2px)',
            'box-shadow': theme('boxShadow.medium'),
          },
        },
        '.hover-scale': {
          'transition': 'transform 0.3s ease',
          '&:hover': {
            'transform': 'scale(1.02)',
          },
        },
        
        // Focus styles for accessibility
        '.focus-ring': {
          '&:focus': {
            'outline': 'none',
            'box-shadow': `0 0 0 3px ${theme('colors.primary.500')}33`,
          },
        },
      };
      
      addUtilities(newUtilities);
    },
  ],
};