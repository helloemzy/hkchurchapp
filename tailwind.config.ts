import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Clean Design System Colors - Apple/Stripe Inspired
      colors: {
        primary: {
          50: '#F3F4F6',
          100: '#E5E7EB',
          200: '#D1D5DB',
          300: '#9CA3AF',
          400: '#6B7280',
          500: '#5B21B6', // Main brand color - deep purple
          600: '#4C1D95', // Darker purple for hover states
          700: '#3B0764',
          800: '#2E0651',
          900: '#1E0535',
        },
        // Semantic colors - only when needed
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981', // Green - success states only
          600: '#059669',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B', // Amber - warnings only
          600: '#D97706',
        },
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444', // Red - errors only
          600: '#DC2626',
        },
        // Clean grayscale system
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        // Background colors
        background: '#FFFFFF',
        surface: '#F9FAFB',
        border: '#E5E7EB',
      },
      
      // Typography
      fontFamily: {
        sans: ['Inter', 'Noto Sans HK', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        chinese: ['Noto Sans HK', 'Microsoft YaHei', '微软雅黑', 'PingFang HK', '蘋方-港', 'sans-serif'],
      },
      
      // Clean shadow system
      boxShadow: {
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'button': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      
      // Border radius - 8px default for Apple-like feel
      borderRadius: {
        'sm': '0.375rem', // 6px
        'md': '0.5rem',   // 8px 
        'lg': '0.75rem',  // 12px
        'xl': '1rem',     // 16px
      },
      
      // Animation & Transitions
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
      },
      
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      
      // Simple keyframes - no complex animations
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      
      animation: {
        'fade-in': 'fadeIn 300ms ease-out',
        'slide-in': 'slideIn 300ms ease-out',
      },
    },
  },
  plugins: [
    // Plugin for enhanced form styling
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
}

export default config