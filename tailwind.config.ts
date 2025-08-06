import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      // Hong Kong Church Color Palette
      colors: {
        primary: {
          50: '#f3e8ff',
          100: '#e9d5ff', 
          200: '#d9bfff',
          300: '#c4a3ff',
          400: '#a78bfa',
          500: '#7c3aed', // Main brand color
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#3c1361',
        },
        // Semantic colors
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
        },
        // Event categories
        event: {
          worship: '#7c3aed',
          fellowship: '#10b981',
          study: '#f59e0b',
          service: '#3b82f6',
        },
        // Special purpose colors
        devotion: {
          lavender: '#e6e6fa',
        },
        prayer: {
          gold: '#fef3c7',
        },
        scripture: {
          blue: '#dbeafe',
        },
        // Enhanced gray scale
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Background colors
        background: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          card: 'var(--bg-card)',
          hover: 'var(--bg-card-hover)',
        },
      },
      
      // Typography
      fontFamily: {
        sans: ['var(--font-primary)'],
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
        chinese: ['var(--font-chinese)'],
      },
      
      fontSize: {
        'display-1': ['3.75rem', { lineHeight: '1.25' }], // 60px
        'display-2': ['3rem', { lineHeight: '1.25' }],    // 48px
        'h1': ['2.25rem', { lineHeight: '1.25' }],        // 36px
        'h2': ['1.875rem', { lineHeight: '1.3' }],        // 30px
        'h3': ['1.5rem', { lineHeight: '1.4' }],          // 24px
        'h4': ['1.25rem', { lineHeight: '1.4' }],         // 20px
        'h5': ['1.125rem', { lineHeight: '1.5' }],        // 18px
        'h6': ['1rem', { lineHeight: '1.5' }],            // 16px
      },
      
      fontWeight: {
        light: '300',
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      
      // Spacing scale
      spacing: {
        '0': '0',
        '1': '0.25rem',  // 4px
        '2': '0.5rem',   // 8px
        '3': '0.75rem',  // 12px
        '4': '1rem',     // 16px
        '5': '1.25rem',  // 20px
        '6': '1.5rem',   // 24px
        '8': '2rem',     // 32px
        '10': '2.5rem',  // 40px
        '12': '3rem',    // 48px
        '16': '4rem',    // 64px
        '20': '5rem',    // 80px
      },
      
      // Border radius
      borderRadius: {
        'none': '0',
        'sm': '0.25rem',   // 4px
        'md': '0.5rem',    // 8px
        'lg': '0.75rem',   // 12px
        'xl': '1rem',      // 16px
        '2xl': '1.25rem',  // 20px
        'full': '9999px',
      },
      
      // Box shadow
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        'card': '0 4px 15px rgba(0, 0, 0, 0.1)',
        'hover': '0 10px 30px rgba(0, 0, 0, 0.15)',
      },
      
      // Animation & Transitions
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '350ms',
      },
      
      transitionTimingFunction: {
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'out': 'cubic-bezier(0, 0, 0.2, 1)',
        'in': 'cubic-bezier(0.4, 0, 1, 1)',
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      
      // Background images for gradients
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #A8E6F5 0%, #D4A5FF 100%)',
        'gradient-devotion': 'linear-gradient(135deg, #E9D5FF 0%, #FDE68A 50%, #A8E6F5 100%)',
        'gradient-accent': 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
      },
      
      // Container widths
      containers: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      
      // Responsive breakpoints
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      
      // Animation keyframes
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        shimmer: {
          '0%': {
            backgroundPosition: '-200% 0',
          },
          '100%': {
            backgroundPosition: '200% 0',
          },
        },
      },
      
      animation: {
        'fade-in-up': 'fadeInUp 250ms ease-out',
        'shimmer': 'shimmer 2s infinite',
      },
    },
  },
  plugins: [
    // Plugin for enhanced form styling
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    // Plugin for custom component classes
    function({ addComponents, theme }) {
      addComponents({
        // Button components
        '.btn': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: theme('borderRadius.lg'),
          fontWeight: theme('fontWeight.medium'),
          fontSize: theme('fontSize.base'),
          transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          userSelect: 'none',
          '&:focus': {
            outline: '2px solid transparent',
            outlineOffset: '2px',
            boxShadow: `0 0 0 3px ${theme('colors.primary.500')}33`,
          },
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed',
          },
        },
        '.btn-primary': {
          backgroundColor: theme('colors.primary.500'),
          color: 'white',
          padding: '0.75rem 1.5rem',
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.primary.600'),
            transform: 'translateY(-2px)',
            boxShadow: theme('boxShadow.lg'),
          },
        },
        '.btn-secondary': {
          backgroundColor: 'transparent',
          color: theme('colors.primary.500'),
          border: `1px solid ${theme('colors.primary.500')}`,
          padding: '0.75rem 1.5rem',
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.primary.50'),
          },
        },
        '.btn-ghost': {
          backgroundColor: 'transparent',
          color: theme('colors.gray.700'),
          padding: '0.75rem 1.5rem',
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.gray.100'),
          },
        },
        '.btn-destructive': {
          backgroundColor: theme('colors.error.500'),
          color: 'white',
          padding: '0.75rem 1.5rem',
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.error.600'),
            transform: 'translateY(-2px)',
            boxShadow: theme('boxShadow.lg'),
          },
        },
        '.btn-sm': {
          padding: '0.5rem 1rem',
          fontSize: theme('fontSize.sm'),
        },
        '.btn-lg': {
          padding: '1rem 2rem',
          fontSize: theme('fontSize.lg'),
        },
        
        // Card components
        '.card': {
          backgroundColor: 'var(--bg-card)',
          borderRadius: theme('borderRadius.xl'),
          padding: theme('spacing.5'),
          boxShadow: 'var(--shadow-card)',
          transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 'var(--shadow-hover)',
          },
        },
        '.card-devotion': {
          backgroundColor: theme('colors.devotion.lavender'),
          borderRadius: theme('borderRadius.2xl'),
        },
        '.card-event': {
          border: `1px solid ${theme('colors.gray.200')}`,
          borderRadius: theme('borderRadius.xl'),
        },
        
        // Form elements
        '.input': {
          backgroundColor: 'var(--bg-primary)',
          border: `1px solid ${theme('colors.gray.300')}`,
          borderRadius: theme('borderRadius.lg'),
          padding: '0.75rem 1rem',
          fontSize: theme('fontSize.base'),
          transition: 'border-color 150ms ease-in-out, box-shadow 150ms ease-in-out',
          '&:focus': {
            borderColor: theme('colors.primary.500'),
            outline: '2px solid transparent',
            outlineOffset: '2px',
            boxShadow: `0 0 0 3px ${theme('colors.primary.500')}1A`,
          },
        },
      });
    },
  ],
}

export default config