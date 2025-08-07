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
      // Warm Earthy Cultural Color Palette - Grounded Faith Community
      colors: {
        primary: {
          25: '#FDF6E3',
          50: '#F4E4BC',
          100: '#E6D3A3',
          200: '#D8C28A',
          300: '#CAB171',
          400: '#BC9F58',
          500: '#D2691E', // Warm terracotta - earthy & welcoming
          600: '#B8611A',
          700: '#9E5416',
          800: '#844712',
          900: '#6A3A0E',
          950: '#3C2108',
        },
        // Earthy Chinese Canadian Cultural Heritage Colors
        chinese: {
          red: '#B22222',      // 中国红 - Clay red, grounded celebration
          gold: '#DAA520',     // 金色 - Golden harvest, warm prosperity
          jade: '#7BA428',     // 玉绿 - Jade earth, natural harmony
          crimson: '#A0252F',  // 深红 - Earthy deep devotion
          amber: '#CC7A00',    // 琥珀 - Burnt amber, natural warmth
          emerald: '#9CAF88',  // 翡翠 - Sage green, grounded hope
        },
        // Earthy Canadian Heritage Colors
        canadian: {
          red: '#B22222',      // Canadian red - Earthy national identity
          cream: '#FDF6E3',    // Warm cream - Natural purity
          maple: '#8B4513',    // Maple brown - Deep grounding, Stability
        },
        // Earthy Generational Bridge Colors
        elder: {
          wisdom: '#8B4513',   // Deep brown - Wisdom, Experience
          respect: '#DAA520',  // Golden harvest - Honor, Reverence
          peace: '#8B7355',    // Mushroom - Natural tranquility
        },
        youth: {
          energy: '#D2691E',   // Terracotta - Grounded vitality
          innovation: '#3C5F41', // Deep forest - Natural future
          connection: '#9CAF88', // Sage green - Organic community growth
        },
        // Earthy Cultural Festival Colors
        festival: {
          spring: '#C08081',   // Dusty rose - Spring Festival warmth
          autumn: '#CC7A00',   // Burnt orange - Mid-Autumn earth
          dragon: '#B22222',   // Clay red - Dragon Boat strength
          lantern: '#DAA520',  // Golden harvest - Lantern Festival glow
        },
        // Earthy semantic colors
        success: {
          50: '#F0F8F4',
          100: '#E8F5E8',
          200: '#D4E4D0',
          300: '#B4C7A0',
          400: '#9CAF88',
          500: '#7BA428',
          600: '#6D9324',
          700: '#5F821F',
          800: '#51711B',
          900: '#436016',
        },
        warning: {
          50: '#FDF6E3',
          100: '#F4E4BC',
          200: '#E6D3A3',
          300: '#D8C28A',
          400: '#DAA520',
          500: '#CC7A00',
          600: '#B86A00',
          700: '#A45A00',
          800: '#904A00',
          900: '#7C3A00',
        },
        error: {
          50: '#F5E6E6',
          100: '#EBCCCC',
          200: '#D7A0A0',
          300: '#C37373',
          400: '#B84747',
          500: '#B22222',
          600: '#9F1F1F',
          700: '#8C1B1B',
          800: '#791818',
          900: '#661414',
        },
        info: {
          50: '#E8F5E8',
          100: '#D1EAD1',
          200: '#A3D5A3',
          300: '#75C075',
          400: '#5BA05B',
          500: '#3C5F41',
          600: '#36553A',
          700: '#304B33',
          800: '#2A412C',
          900: '#243725',
        },
        // Earthy event categories
        event: {
          worship: '#D2691E',
          fellowship: '#9CAF88',
          study: '#DAA520',
          service: '#8B4513',
        },
        // Earthy spiritual theme colors
        devotion: {
          dawn: '#F4E4BC',
          earth: '#E6D3A3',
        },
        prayer: {
          gold: '#FDF6E3',
        },
        scripture: {
          sage: '#E8F5E8',
        },
        worship: {
          clay: '#F0E6D2',
        },
        fellowship: {
          warm: '#F5E6CA',
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
      
      // Earthy Box Shadow System with Natural Colors
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(139, 69, 19, 0.08)',
        'md': '0 4px 6px -1px rgba(139, 69, 19, 0.12)',
        'lg': '0 10px 15px -3px rgba(139, 69, 19, 0.15)',
        'xl': '0 20px 25px -5px rgba(139, 69, 19, 0.18)',
        '2xl': '0 25px 50px -12px rgba(139, 69, 19, 0.25)',
        'card': '0 4px 15px rgba(139, 69, 19, 0.12)',
        'hover': '0 10px 30px rgba(139, 69, 19, 0.2)',
        
        // Earthy Natural Colored Shadows
        'terracotta': '0 8px 25px rgba(210, 105, 30, 0.25)',
        'sage': '0 8px 25px rgba(156, 175, 136, 0.25)',
        'forest': '0 8px 25px rgba(60, 95, 65, 0.25)',
        'harvest': '0 8px 25px rgba(218, 165, 32, 0.25)',
        'clay': '0 8px 25px rgba(178, 34, 34, 0.25)',
        'mushroom': '0 8px 25px rgba(139, 115, 85, 0.25)',
        
        // Backward compatibility with natural equivalents
        'purple': '0 8px 25px rgba(139, 115, 85, 0.25)',
        'blue': '0 8px 25px rgba(60, 95, 65, 0.25)',
        'green': '0 8px 25px rgba(156, 175, 136, 0.25)',
        'orange': '0 8px 25px rgba(204, 122, 0, 0.25)',
        'pink': '0 8px 25px rgba(192, 128, 129, 0.25)',
        'red': '0 8px 25px rgba(178, 34, 34, 0.25)',
        
        // Earthy Glowing Effects
        'glow-terracotta': '0 0 20px rgba(210, 105, 30, 0.4)',
        'glow-sage': '0 0 20px rgba(156, 175, 136, 0.4)',
        'glow-forest': '0 0 20px rgba(60, 95, 65, 0.4)',
        'glow-soft': '0 0 30px rgba(139, 69, 19, 0.2)',
        
        // Backward compatibility with earthy equivalents  
        'glow-purple': '0 0 20px rgba(139, 115, 85, 0.4)',
        'glow-blue': '0 0 20px rgba(60, 95, 65, 0.4)',
        'glow-green': '0 0 20px rgba(156, 175, 136, 0.4)',
        
        // Earthy Cultural Shadow Effects
        'chinese-red': '0 8px 25px rgba(178, 34, 34, 0.3)',
        'jade-earth': '0 8px 25px rgba(123, 164, 40, 0.3)',
        'golden-harvest': '0 8px 25px rgba(218, 165, 32, 0.3)',
        
        // Backward compatibility
        'jade-green': '0 8px 25px rgba(123, 164, 40, 0.3)',
        'gold': '0 8px 25px rgba(218, 165, 32, 0.3)',
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
      
      // Warm Earthy Chinese Canadian Cultural Gradients
      backgroundImage: {
        // Heritage Fusion Earthy Gradients
        'gradient-heritage': 'linear-gradient(135deg, #FDF6E3 0%, #F4E4BC 30%, #E8F5E8 70%, #F0E6D2 100%)',
        'gradient-cultural': 'linear-gradient(135deg, #F4E4BC 0%, #E6D3A3 30%, #F0E6D2 70%, #E8F5E8 100%)',
        'gradient-celebration': 'linear-gradient(135deg, #F5E6CA 0%, #FDF6E3 50%, #E8F5E8 100%)',
        
        // Natural Earth Tone Gradients  
        'gradient-terracotta': 'linear-gradient(135deg, #D2691E 0%, #E67A2E 50%, #F08A3E 100%)',
        'gradient-sage': 'linear-gradient(135deg, #9CAF88 0%, #A8BB94 50%, #B4C7A0 100%)',
        'gradient-forest': 'linear-gradient(135deg, #3C5F41 0%, #4A6B4F 50%, #58775D 100%)',
        'gradient-harvest': 'linear-gradient(135deg, #DAA520 0%, #E6B832 50%, #F2CB44 100%)',
        'gradient-clay': 'linear-gradient(135deg, #B22222 0%, #C73E3E 50%, #DC5A5A 100%)',
        'gradient-mushroom': 'linear-gradient(135deg, #8B7355 0%, #9B8365 50%, #AB9375 100%)',
        
        // Earthy Generational Bridge Gradients
        'gradient-elder-wisdom': 'linear-gradient(135deg, #F4E4BC 0%, #E6D3A3 100%)',
        'gradient-youth-energy': 'linear-gradient(135deg, #E8F5E8 0%, #D4E4D0 50%, #F0E6D2 100%)',
        'gradient-family-unity': 'linear-gradient(135deg, #FDF6E3 0%, #F4E4BC 25%, #E8F5E8 50%, #F0E6D2 75%, #F5E6CA 100%)',
        
        // Earthy Festival Themed Gradients
        'gradient-spring-festival': 'linear-gradient(135deg, #F5E6CA 0%, #FDF6E3 50%, #C0808130 100%)',
        'gradient-mid-autumn': 'linear-gradient(135deg, #F4E4BC 0%, #CC7A0030 50%, #8B451330 100%)',
        'gradient-dragon-boat': 'linear-gradient(135deg, #E8F5E8 0%, #B2222230 50%, #7BA42830 100%)',
        'gradient-lantern': 'linear-gradient(135deg, #FDF6E3 0%, #DAA52030 100%)',
        
        // Cultural Heritage Earthy Gradients
        'gradient-chinese-tea': 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #CD853F 100%)',
        'gradient-jade-earth': 'linear-gradient(135deg, #7BA428 0%, #9CAF88 50%, #B4C7A0 100%)',
        'gradient-golden-harvest': 'linear-gradient(135deg, #DAA520 0%, #E6B832 50%, #F2CB44 100%)',
        
        // Updated earthy gradients for compatibility
        'gradient-primary': 'linear-gradient(135deg, #FDF6E3 0%, #F4E4BC 50%, #E6D3A3 100%)',
        'gradient-devotion': 'linear-gradient(135deg, #F4E4BC 0%, #E6D3A3 50%, #FDF6E3 100%)',
        'gradient-worship': 'linear-gradient(135deg, #F0E6D2 0%, #E8D5B7 50%, #F5E6CA 100%)',
        'gradient-prayer': 'linear-gradient(135deg, #FDF6E3 0%, #F4E4BC 100%)',
        'gradient-scripture': 'linear-gradient(135deg, #E8F5E8 0%, #D4E4D0 100%)',
        'gradient-accent': 'linear-gradient(135deg, #D2691E 0%, #DAA520 100%)',
        'gradient-hero': 'linear-gradient(135deg, #FDF6E3 0%, #F4E4BC 30%, #E8F5E8 50%, #F0E6D2 80%, #F5E6CA 100%)',
        'gradient-dark': 'linear-gradient(135deg, #3C2414 0%, #4A2D1A 50%, #5E3921 100%)',
        
        // Earthy Natural-Inspired Gradients
        'gradient-vibrant-terracotta': 'linear-gradient(135deg, #D2691E 0%, #E67A2E 50%, #F08A3E 100%)',
        'gradient-vibrant-sage': 'linear-gradient(135deg, #9CAF88 0%, #A8BB94 50%, #B4C7A0 100%)',
        'gradient-vibrant-forest': 'linear-gradient(135deg, #3C5F41 0%, #4A6B4F 50%, #58775D 100%)',
        'gradient-vibrant-harvest': 'linear-gradient(135deg, #DAA520 0%, #E6B832 50%, #F2CB44 100%)',
        'gradient-vibrant-clay': 'linear-gradient(135deg, #B22222 0%, #C73E3E 50%, #DC5A5A 100%)',
        'gradient-vibrant-mushroom': 'linear-gradient(135deg, #8B7355 0%, #9B8365 50%, #AB9375 100%)',
        
        // Keep some natural purple/blue but with earthy tones
        'gradient-vibrant-purple': 'linear-gradient(135deg, #8B7355 0%, #9B8365 50%, #AB9375 100%)',
        'gradient-vibrant-blue': 'linear-gradient(135deg, #3C5F41 0%, #4A6B4F 50%, #58775D 100%)',
        'gradient-vibrant-green': 'linear-gradient(135deg, #9CAF88 0%, #A8BB94 50%, #B4C7A0 100%)',
        'gradient-vibrant-orange': 'linear-gradient(135deg, #CC7A00 0%, #D88C1A 50%, #E49E34 100%)',
        'gradient-vibrant-pink': 'linear-gradient(135deg, #C08081 0%, #CC9192 50%, #D8A2A3 100%)',
        'gradient-vibrant-red': 'linear-gradient(135deg, #B22222 0%, #C73E3E 50%, #DC5A5A 100%)',
        
        // Organic Earthy Flow Gradients 
        'gradient-organic-flow': 'linear-gradient(135deg, #D2691E 0%, #C08081 25%, #DAA520 50%, #9CAF88 75%, #3C5F41 100%)',
        'gradient-soft-wave': 'linear-gradient(135deg, #FDF6E3 0%, #F4E4BC 25%, #E8F5E8 50%, #F0E6D2 75%, #F5E6CA 100%)',
        
        // Cultural Heritage Earthy Gradients
        'gradient-chinese-celebration': 'linear-gradient(135deg, #B22222 0%, #DAA520 50%, #CC7A00 100%)',
        'gradient-jade-prosperity': 'linear-gradient(135deg, #7BA428 0%, #9CAF88 50%, #A8BB94 100%)',
        'gradient-festival-joy': 'linear-gradient(135deg, #C08081 0%, #DAA520 50%, #B22222 100%)',
        'gradient-wisdom-bridge': 'linear-gradient(135deg, #8B4513 0%, #CC7A00 50%, #DAA520 100%)',
        
        // Tea ceremony and natural elements
        'gradient-tea-ceremony': 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #CD853F 100%)',
        'gradient-autumn-leaves': 'linear-gradient(135deg, #CC7A00 0%, #D2691E 50%, #DAA520 100%)',
        
        // Interactive Earthy Shimmer Effects
        'shimmer': 'linear-gradient(90deg, transparent, rgba(253,246,227,0.6), transparent)',
        'shimmer-gold': 'linear-gradient(90deg, transparent, rgba(218,165,32,0.4), transparent)',
        'shimmer-terracotta': 'linear-gradient(90deg, transparent, rgba(210,105,30,0.4), transparent)',
        'shimmer-sage': 'linear-gradient(90deg, transparent, rgba(156,175,136,0.4), transparent)',
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