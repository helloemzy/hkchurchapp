'use client'

import React from 'react'
import { cn } from '../../lib/utils'

export interface MobileNavItem {
  key: string
  label: string
  labelChinese?: string
  icon: React.ReactNode
  onClick?: () => void
  active?: boolean
  disabled?: boolean
  badge?: string | number
}

export interface MobileNavigationBarProps {
  items: MobileNavItem[]
  className?: string
}

export function MobileNavigationBar({ items, className }: MobileNavigationBarProps) {
  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 px-2 py-2 sm:hidden',
      className
    )}>
      <nav className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={item.onClick}
            disabled={item.disabled}
            className={cn(
              'flex flex-col items-center justify-center px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 relative min-w-0 flex-1 group',
              item.active 
                ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50',
              item.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {/* Icon with subtle animation */}
            <div className={cn(
              'flex items-center justify-center h-7 w-7 mb-1 transition-transform duration-200',
              item.active ? 'scale-110' : 'group-hover:scale-105'
            )}>
              {item.icon}
            </div>
            
            {/* Labels */}
            <div className="text-center">
              <span className={cn(
                'block font-medium truncate max-w-12',
                item.active ? 'text-primary-700 dark:text-primary-300' : ''
              )}>
                {item.label}
              </span>
              {item.labelChinese && (
                <span className={cn(
                  'block text-[10px] chinese-text truncate max-w-12 opacity-75',
                  item.active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-500'
                )}>
                  {item.labelChinese}
                </span>
              )}
            </div>
            
            {/* Badge indicator */}
            {item.badge && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-error-500 text-white text-[10px] rounded-full flex items-center justify-center font-semibold shadow-sm">
                {typeof item.badge === 'number' && item.badge > 9 ? '9+' : item.badge}
              </span>
            )}
            
            {/* Active indicator */}
            {item.active && (
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full" />
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}

// Predefined spiritual icons for common church navigation
export const ChurchIcons = {
  home: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  devotions: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  bible: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  events: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  prayer: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  groups: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  profile: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

// Default navigation items for Hong Kong Church PWA
export const createChurchNavigation = (activeView: string, setActiveView: (view: string) => void): MobileNavItem[] => [
  {
    key: 'home',
    label: 'Home',
    labelChinese: '主頁',
    icon: ChurchIcons.home,
    onClick: () => setActiveView('home'),
    active: activeView === 'home'
  },
  {
    key: 'devotions',
    label: 'Devotions',
    labelChinese: '靈修',
    icon: ChurchIcons.devotions,
    onClick: () => setActiveView('devotion'),
    active: activeView === 'devotion'
  },
  {
    key: 'events',
    label: 'Events',
    labelChinese: '活動',
    icon: ChurchIcons.events,
    onClick: () => setActiveView('events'),
    active: activeView === 'events',
    badge: 3 // Example: 3 upcoming events
  },
  {
    key: 'prayer',
    label: 'Prayer',
    labelChinese: '禱告',
    icon: ChurchIcons.prayer,
    onClick: () => setActiveView('prayer'),
    active: activeView === 'prayer',
    badge: 5 // Example: 5 new prayer requests
  },
  {
    key: 'bible',
    label: 'Bible',
    labelChinese: '聖經',
    icon: ChurchIcons.bible,
    onClick: () => setActiveView('bible'),
    active: activeView === 'bible'
  }
]