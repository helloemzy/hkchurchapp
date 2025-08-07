'use client'

import React from 'react'
import { cn } from '../../lib/utils'
import { Header, type HeaderProps } from './Header'
import { Container } from './Container'

export interface MobileLayoutProps {
  children: React.ReactNode
  header?: HeaderProps
  showBottomNav?: boolean
  bottomNavContent?: React.ReactNode
  className?: string
  contentClassName?: string
  fullHeight?: boolean
  safeArea?: boolean
}

const MobileLayout = React.forwardRef<HTMLDivElement, MobileLayoutProps>(
  ({ 
    children,
    header,
    showBottomNav = false,
    bottomNavContent,
    className,
    contentClassName,
    fullHeight = true,
    safeArea = true,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full bg-background',
          fullHeight && 'min-h-screen',
          safeArea && 'safe-area-inset',
          className
        )}
        {...props}
      >
        {/* Header */}
        {header && <Header {...header} />}
        
        {/* Main Content */}
        <main 
          className={cn(
            'relative flex-1',
            header && 'pt-0', // Header is sticky, no additional padding needed
            showBottomNav && 'pb-16', // Space for bottom navigation
            contentClassName
          )}
        >
          {children}
        </main>
        
        {/* Bottom Navigation */}
        {showBottomNav && bottomNavContent && (
          <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border safe-area-bottom">
            <div className="px-4 py-2">
              {bottomNavContent}
            </div>
          </nav>
        )}
      </div>
    )
  }
)
MobileLayout.displayName = 'MobileLayout'

export { MobileLayout }