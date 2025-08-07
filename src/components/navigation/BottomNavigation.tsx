'use client'

import React from 'react'
import { cn } from '../../lib/utils'

export interface BottomNavigationItem {
  key: string
  label: string
  icon: React.ReactNode
  onClick?: () => void
  active?: boolean
  disabled?: boolean
  badge?: string | number
}

export interface BottomNavigationProps {
  items: BottomNavigationItem[]
  className?: string
}

export function BottomNavigation({ items, className }: BottomNavigationProps) {
  return (
    <nav 
      className={cn(
        'flex items-center justify-around bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-2 shadow-lg',
        className
      )}
    >
      {items.map((item) => (
        <button
          key={item.key}
          onClick={item.onClick}
          disabled={item.disabled}
          className={cn(
            'flex flex-col items-center justify-center px-3 py-3 rounded-lg text-xs font-medium transition-all duration-200 relative min-w-0 flex-1 touch-target',
            'min-h-[44px]', // Ensure minimum touch target
            item.active 
              ? 'text-primary bg-primary/10 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200',
            item.disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="flex items-center justify-center h-6 w-6 mb-1">
            {item.icon}
          </div>
          <span className="truncate">{item.label}</span>
          
          {item.badge && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-error text-white text-xs rounded-full flex items-center justify-center min-w-[20px] shadow-sm">
              {typeof item.badge === 'number' && item.badge > 9 ? '9+' : item.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  )
}