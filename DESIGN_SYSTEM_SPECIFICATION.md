# Hong Kong Church PWA Design System

## Overview
A comprehensive design system for the Hong Kong Church Progressive Web Application, designed specifically for the Hong Kong Christian community with cultural sensitivity, multilingual support, and modern accessibility standards.

## Design Principles

### 1. Cultural Reverence
- Colors and imagery that respect Christian values
- Traditional and modern balance appealing to diverse age groups
- Hong Kong cultural aesthetics with global accessibility

### 2. Multilingual Excellence
- Optimized typography for Traditional Chinese, Simplified Chinese, and English
- Consistent visual hierarchy across languages
- Cultural context-appropriate spacing and layout

### 3. Mobile-First Community
- PWA-optimized for mobile installation and usage
- Touch-friendly interaction patterns
- Offline-capable design considerations

### 4. Inclusive Accessibility
- WCAG 2.1 AA compliance
- High contrast ratios for aging congregation members
- Clear navigation patterns for varying technical literacy

## Color Palette

### Primary Colors
```css
--primary-50: #f8f7ff    /* Lightest lavender */
--primary-100: #f0edff   /* Light lavender */
--primary-200: #e4dcff   /* Soft lavender */
--primary-300: #d1c4ff   /* Medium lavender */
--primary-400: #b8a3ff   /* Accent lavender */
--primary-500: #9b7ff0   /* Main brand purple - softer than original */
--primary-600: #8366d9   /* Medium purple */
--primary-700: #6b51c2   /* Darker purple */
--primary-800: #5640a6   /* Deep purple */
--primary-900: #432f85   /* Darkest purple */
```

### Spiritual Theme Colors
```css
--devotion-dawn: #fef7e0      /* Warm morning light */
--devotion-lavender: #f3efff   /* Peaceful meditation */
--prayer-gold: #fff8e1        /* Golden hour reflection */
--scripture-sage: #f0f8f4     /* Wisdom and growth */
--worship-rose: #fdf2f8       /* Joy and celebration */
--fellowship-sky: #f0f9ff     /* Community and connection */
```

### Semantic Colors
```css
--success: #16a34a     /* Fresh green for growth */
--warning: #ea580c     /* Warm orange for attention */
--error: #dc2626       /* Clear red for alerts */
--info: #0ea5e9        /* Calm blue for information */
```

### Enhanced Grayscale
```css
--gray-25: #fefefe
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb
--gray-300: #d1d5db
--gray-400: #9ca3af
--gray-500: #6b7280
--gray-600: #4b5563
--gray-700: #374151
--gray-800: #1f2937
--gray-900: #111827
--gray-950: #030712
```

### Dark Mode Adaptations
```css
--dark-bg-primary: #0a0a0b
--dark-bg-secondary: #161618
--dark-bg-card: #1f1f23
--dark-bg-elevated: #27272a
--dark-text-primary: #fafafa
--dark-text-secondary: #a1a1aa
--dark-border: #27272a
```

## Typography System

### Font Stacks
```css
--font-primary: 'Inter', 'Noto Sans HK', -apple-system, BlinkMacSystemFont, sans-serif
--font-display: 'Plus Jakarta Sans', 'Noto Sans HK', var(--font-primary)
--font-chinese: 'Noto Sans HK', 'Microsoft YaHei', '微软雅黑', 'PingFang HK', sans-serif
--font-scripture: 'Crimson Text', 'Noto Serif CJK HK', serif
--font-mono: 'JetBrains Mono', 'SF Mono', Consolas, monospace
```

### Type Scale
```css
/* Display Sizes - for hero sections and major headings */
--text-display-xl: 4.5rem    /* 72px - Hero text */
--text-display-lg: 3.75rem   /* 60px - Page titles */
--text-display-md: 3rem      /* 48px - Section headers */
--text-display-sm: 2.25rem   /* 36px - Card titles */

/* Heading Sizes */
--text-h1: 2.25rem   /* 36px */
--text-h2: 1.875rem  /* 30px */
--text-h3: 1.5rem    /* 24px */
--text-h4: 1.25rem   /* 20px */
--text-h5: 1.125rem  /* 18px */
--text-h6: 1rem      /* 16px */

/* Body Text */
--text-xl: 1.25rem   /* 20px - Large body text */
--text-lg: 1.125rem  /* 18px - Medium body text */
--text-base: 1rem    /* 16px - Standard body text */
--text-sm: 0.875rem  /* 14px - Secondary text */
--text-xs: 0.75rem   /* 12px - Helper text */
```

### Chinese Typography Considerations
- Line height increased by 0.1-0.2em for Chinese text
- Letter spacing optimized for Chinese characters
- Font weight adjustments for better Chinese character rendering

## Component System

### Button Hierarchy

#### Primary Buttons
- Used for main actions (Join Event, Submit Prayer, Read Devotion)
- Purple gradient background with hover elevation
- High contrast text for accessibility

#### Secondary Buttons
- Used for secondary actions (Share, Bookmark, Filter)
- Transparent with purple border
- Maintains visual hierarchy

#### Ghost Buttons
- Used for navigation and subtle actions
- Minimal visual weight
- Clear hover states

#### Spiritual Action Buttons
- Special styling for prayer, worship, and devotion actions
- Gentle gradients reflecting spiritual themes
- Icons integrated meaningfully

### Card System

#### Devotion Cards
- Warm gradient backgrounds (dawn/lavender theme)
- Scripture verse highlights
- Reading time indicators
- Progress tracking visual elements

#### Event Cards
- Category-based color coding
- Clear date/time information
- Attendance counters
- Registration status indicators

#### Prayer Cards
- Gentle gold/cream backgrounds
- Anonymous/named toggle options
- Prayer count displays
- Community connection indicators

#### Group/Fellowship Cards
- Community-focused imagery spaces
- Member count and leader information
- Language and age group indicators
- Join/request buttons

### Navigation Patterns

#### Top Navigation
- Minimal, church-appropriate branding
- Language switcher prominent
- Dark mode toggle
- Search functionality

#### Bottom Navigation (Mobile)
- Five main sections: Home, Devotions, Events, Groups, Prayer
- Custom icons with spiritual context
- Notification badges for updates
- Smooth transitions between sections

#### Breadcrumb Navigation
- Clear path indication for deeper content
- Cultural sensitivity in naming conventions
- Easy back navigation patterns

## Layout Patterns

### Mobile-First Grid System
```css
/* Container sizes */
--container-xs: 100%      /* <475px */
--container-sm: 640px     /* ≥640px */
--container-md: 768px     /* ≥768px */
--container-lg: 1024px    /* ≥1024px */
--container-xl: 1280px    /* ≥1280px */

/* Grid columns */
.grid-devotion { grid-template-columns: 1fr; }
.grid-events { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
.grid-groups { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }

/* Responsive breakpoints */
@media (min-width: 768px) {
  .grid-devotion { grid-template-columns: 2fr 1fr; }
  .grid-dashboard { grid-template-columns: repeat(12, 1fr); }
}
```

### Page Layout Structures

#### Home Dashboard
- Hero section with spiritual imagery/gradients
- Quick action cards for main features
- Community activity feed
- Upcoming events preview
- Today's devotion highlight

#### Devotions Page
- Daily devotion featured prominently
- Calendar view for historical devotions
- Progress tracking
- Scripture reference integration
- Sharing and bookmarking features

#### Events Page
- Category filters (Worship, Fellowship, Study, Service)
- Calendar/list view toggle
- Event cards with clear hierarchy
- Registration flow integration
- Past events archive

#### Prayer Page
- Anonymous prayer request submission
- Community prayer wall
- Prayer categories (Health, Family, Ministry, etc.)
- "Prayed for this" interaction
- Personal prayer journal

#### Groups Directory
- Filter by age group, language, meeting time
- Visual cards with group photos
- Leader information
- Meeting details and location
- Join request workflow

## Accessibility Standards

### WCAG 2.1 AA Compliance
- Minimum 4.5:1 contrast ratio for normal text
- Minimum 3:1 contrast ratio for large text
- Focus indicators clearly visible
- Keyboard navigation support

### Cultural Accessibility
- Text size scaling for aging congregation
- High contrast mode support
- Clear iconography with text labels
- Multi-language context switching

### Touch Accessibility
- Minimum 44px touch targets
- Adequate spacing between interactive elements
- Swipe gestures for content navigation
- Haptic feedback for important actions

## Animation and Interaction

### Micro-interactions
```css
/* Standard transitions */
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1)

/* Spiritual motion */
--transition-gentle: 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94)
--transition-reverent: 600ms cubic-bezier(0.23, 1, 0.32, 1)
```

### Loading States
- Shimmer effects for content loading
- Progressive image loading with placeholders
- Skeleton screens for major content areas
- Offline state indicators

### Page Transitions
- Smooth fade transitions between pages
- Contextual slide animations for related content
- Respect user's reduced motion preferences

## Implementation Guidelines

### Code Standards
- Component-based architecture with TypeScript
- Consistent naming conventions (BEM methodology)
- Comprehensive prop interfaces
- Extensive accessibility attributes

### Performance Considerations
- Lazy loading for images and heavy content
- Code splitting for optimal bundle sizes
- Service worker caching strategies
- Critical CSS inlining

### Responsive Implementation
- Mobile-first CSS development
- Container queries where supported
- Flexible typography scaling
- Touch-friendly interaction areas

## Cultural Considerations for Hong Kong Christians

### Visual Elements
- Subtle cross motifs in borders and decorations
- Dove symbols for peace and Holy Spirit
- Light/dawn imagery for spiritual awakening
- Community-focused photography and illustrations

### Color Psychology
- Purple: Royalty of Christ, spiritual depth
- Gold: Divine glory, precious faith
- Green: Growth, new life in Christ
- Blue: Peace, trust, heavenly hope
- Warm grays: Humility, wisdom, reverence

### Content Presentation
- Scripture verses prominently featured
- Prayer request sensitivity and privacy
- Community event emphasis on fellowship
- Respectful handling of different Christian denominations

### Hong Kong Specific Elements
- Traditional and simplified Chinese support
- Local church culture references
- Hong Kong Christian calendar integration
- Local ministry and outreach focus

This design system provides the foundation for transforming the Hong Kong Church PWA from a prototype into a production-ready application that serves the Hong Kong Christian community with cultural sensitivity, modern design principles, and excellent user experience across all devices and languages.