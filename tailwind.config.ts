import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark-disabled"]'], // Dark mode disabled for warm church experience
  theme: {
    extend: {
      // Chinese Canadian Cultural Color Palette - Where Heritage Meets Faith
      colors: {
        primary: {
          25: '#f8f7ff',
          50: '#f0edff',
          100: '#e4dcff',
          200: '#d1c4ff',
          300: '#b8a3ff',
          400: '#A855F7',
          500: '#7C3AED', // Faith purple - continuity with existing
          600: '#6D28D9',
          700: '#5B21B6',
          800: '#4C1D95',
          900: '#3B1F7A',
          950: '#1a0f35',
        },
        // Chinese Canadian Cultural Heritage Colors
        chinese: {
          red: '#C8102E',      // 中国红 - Celebrations, Blessings, Joy
          gold: '#FFD700',     // 金色 - Prosperity, Success, Honor
          jade: '#00A86B',     // 玉绿 - Harmony, Peace, Growth
          crimson: '#DC143C',  // 深红 - Deep devotion, Love
          amber: '#FFBF00',    // 琥珀 - Wisdom, Warmth
          emerald: '#50C878',  // 翡翠 - New life, Hope
        },
        // Canadian Heritage Colors
        canadian: {
          red: '#FF0000',      // Canadian red - National identity
          white: '#FFFFFF',    // Purity, Peace
          maple: '#8B4513',    // Maple brown - Grounding, Stability
        },
        // Generational Bridge Colors
        elder: {
          wisdom: '#8B4513',   // Deep brown - Wisdom, Experience
          respect: '#DAA520',  // Golden rod - Honor, Reverence
          peace: '#708090',    // Slate gray - Tranquility
        },
        youth: {
          energy: '#FF6347',   // Tomato - Vitality, Passion
          innovation: '#4169E1', // Royal blue - Technology, Future
          connection: '#32CD32', // Lime green - Community, Growth
        },
        // Cultural Festival Colors
        festival: {
          spring: '#FF69B4',   // Hot pink - Spring Festival energy
          autumn: '#FF8C00',   // Dark orange - Mid-Autumn warmth
          dragon: '#B22222',   // Fire brick - Dragon Boat strength
          lantern: '#FFD700',  // Gold - Lantern Festival light
        },
        // Enhanced semantic colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
          800: '#14532d',
          900: '#14532d',
        },
        warning: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ea580c',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#dc2626',
          600: '#b91c1c',
          700: '#991b1b',
          800: '#7f1d1d',
          900: '#7f1d1d',
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
        },
        // Event categories
        event: {
          worship: '#7c3aed',
          fellowship: '#10b981',
          study: '#f59e0b',
          service: '#3b82f6',
        },
        // Spiritual theme colors
        devotion: {
          dawn: '#fef7e0',
          lavender: '#f3efff',
        },
        prayer: {
          gold: '#fff8e1',
        },
        scripture: {
          sage: '#f0f8f4',
        },
        worship: {
          rose: '#fdf2f8',
        },
        fellowship: {
          sky: '#f0f9ff',
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
      
      // Enhanced Box Shadow System with Vibrant Colors
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'card': '0 4px 15px rgba(0, 0, 0, 0.1)',
        'hover': '0 10px 30px rgba(0, 0, 0, 0.15)',
        
        // Vibrant Colored Shadows - Reference 29377 Inspired
        'purple': '0 8px 25px rgba(124, 58, 237, 0.25)',
        'blue': '0 8px 25px rgba(59, 130, 246, 0.25)',
        'green': '0 8px 25px rgba(16, 185, 129, 0.25)',
        'orange': '0 8px 25px rgba(245, 158, 11, 0.25)',
        'pink': '0 8px 25px rgba(236, 72, 153, 0.25)',
        'red': '0 8px 25px rgba(239, 68, 68, 0.25)',
        
        // Glowing Effects
        'glow-purple': '0 0 20px rgba(124, 58, 237, 0.4)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.4)',
        'glow-soft': '0 0 30px rgba(124, 58, 237, 0.2)',
        
        // Cultural Shadow Effects
        'chinese-red': '0 8px 25px rgba(220, 38, 38, 0.3)',
        'jade-green': '0 8px 25px rgba(5, 150, 105, 0.3)',
        'gold': '0 8px 25px rgba(245, 158, 11, 0.3)',
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
      
      // Enhanced Chinese Canadian Cultural Gradients + Vibrant UX Patterns
      backgroundImage: {
        // Heritage Fusion Gradients
        'gradient-heritage': 'linear-gradient(135deg, #f8f7ff 0%, #fff8e1 30%, #f0f9ff 70%, #f3efff 100%)',
        'gradient-cultural': 'linear-gradient(135deg, #fef7e0 0%, #f3efff 30%, #fff0f0 70%, #f0f8f4 100%)',
        'gradient-celebration': 'linear-gradient(135deg, #fff5f5 0%, #fff8e1 50%, #f0fff0 100%)',
        
        // Generational Bridge Gradients
        'gradient-elder-wisdom': 'linear-gradient(135deg, #faf5e4 0%, #f5f3f0 100%)',
        'gradient-youth-energy': 'linear-gradient(135deg, #f0f8ff 0%, #f0fff0 50%, #fff8f0 100%)',
        'gradient-family-unity': 'linear-gradient(135deg, #f8f7ff 0%, #fff8e1 25%, #f0f9ff 50%, #f0fff0 75%, #fff0f0 100%)',
        
        // Festival Themed Gradients
        'gradient-spring-festival': 'linear-gradient(135deg, #fff0f0 0%, #fff8e1 50%, #ff69b420 100%)',
        'gradient-mid-autumn': 'linear-gradient(135deg, #fff8e1 0%, #ffa50020 50%, #8b451320 100%)',
        'gradient-dragon-boat': 'linear-gradient(135deg, #f0f8ff 0%, #b2222220 50%, #00a86b20 100%)',
        'gradient-lantern': 'linear-gradient(135deg, #fff8e1 0%, #ffd70020 100%)',
        
        // Original gradients maintained for compatibility
        'gradient-primary': 'linear-gradient(135deg, #f8f7ff 0%, #e4dcff 50%, #d1c4ff 100%)',
        'gradient-devotion': 'linear-gradient(135deg, #fef7e0 0%, #f3efff 50%, #fff8e1 100%)',
        'gradient-worship': 'linear-gradient(135deg, #fdf2f8 0%, #f0f9ff 50%, #f0f8f4 100%)',
        'gradient-prayer': 'linear-gradient(135deg, #fff8e1 0%, #f3efff 100%)',
        'gradient-scripture': 'linear-gradient(135deg, #f0f8f4 0%, #f0f9ff 100%)',
        'gradient-accent': 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
        'gradient-hero': 'linear-gradient(135deg, #f8f7ff 0%, #fff8e1 30%, #f0f9ff 50%, #f0fff0 80%, #f3efff 100%)',
        'gradient-dark': 'linear-gradient(135deg, #27272a 0%, #2a2a2e 50%, #3f3f46 100%)',
        
        // NEW: Vibrant Reference-Inspired Gradients
        'gradient-vibrant-purple': 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 50%, #C084FC 100%)',
        'gradient-vibrant-blue': 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 50%, #93C5FD 100%)',
        'gradient-vibrant-green': 'linear-gradient(135deg, #10B981 0%, #34D399 50%, #6EE7B7 100%)',
        'gradient-vibrant-orange': 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #FCD34D 100%)',
        'gradient-vibrant-pink': 'linear-gradient(135deg, #EC4899 0%, #F472B6 50%, #F9A8D4 100%)',
        'gradient-vibrant-red': 'linear-gradient(135deg, #EF4444 0%, #F87171 50%, #FCA5A5 100%)',
        
        // Organic Flow Gradients (Reference 51438 Style)
        'gradient-organic-flow': 'linear-gradient(135deg, #A855F7 0%, #EC4899 25%, #F59E0B 50%, #10B981 75%, #3B82F6 100%)',
        'gradient-soft-wave': 'linear-gradient(135deg, #E0E7FF 0%, #F3E8FF 25%, #FEF3E2 50%, #F0FDF4 75%, #EFF6FF 100%)',
        
        // Cultural Heritage Vibrant Gradients
        'gradient-chinese-celebration': 'linear-gradient(135deg, #DC2626 0%, #F59E0B 50%, #EAB308 100%)',
        'gradient-jade-prosperity': 'linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)',
        'gradient-festival-joy': 'linear-gradient(135deg, #EC4899 0%, #F59E0B 50%, #DC2626 100%)',
        'gradient-wisdom-bridge': 'linear-gradient(135deg, #92400E 0%, #D97706 50%, #F59E0B 100%)',
        
        // Interactive Shimmer Effects
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        'shimmer-gold': 'linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)',
        'shimmer-purple': 'linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)',
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
      
      // Enhanced Animation Keyframes
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
        // Vibrant Interactive Animations
        vibrantGlow: {
          '0%, 100%': { 
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1), 0 0 0 rgba(124, 58, 237, 0)' 
          },
          '50%': { 
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15), 0 0 30px rgba(124, 58, 237, 0.3)' 
          },
        },
        colorfulPulse: {
          '0%': { 
            backgroundPosition: '0% 50%',
            transform: 'scale(1)',
          },
          '50%': { 
            backgroundPosition: '100% 50%',
            transform: 'scale(1.02)',
          },
          '100%': { 
            backgroundPosition: '0% 50%',
            transform: 'scale(1)',
          },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        floatingOrb: {
          '0%, 100%': { 
            transform: 'translateY(0px) rotate(0deg)',
            opacity: '0.7',
          },
          '33%': { 
            transform: 'translateY(-10px) rotate(120deg)',
            opacity: '0.9',
          },
          '66%': { 
            transform: 'translateY(-5px) rotate(240deg)',
            opacity: '0.8',
          },
        },
        gentleFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        slideInRight: {
          '0%': {
            opacity: '0',
            transform: 'translateX(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        scaleIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.9)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },
      
      animation: {
        'fade-in-up': 'fadeInUp 250ms ease-out',
        'shimmer': 'shimmer 2s infinite',
        'vibrant-glow': 'vibrantGlow 2s ease-in-out infinite',
        'colorful-pulse': 'colorfulPulse 4s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease-in-out infinite',
        'floating-orb': 'floatingOrb 6s ease-in-out infinite',
        'gentle-float': 'gentleFloat 3s ease-in-out infinite',
        'slide-in-right': 'slideInRight 300ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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