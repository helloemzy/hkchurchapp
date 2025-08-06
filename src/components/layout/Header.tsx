'use client'

import React from 'react'
import { cn } from '../../lib/utils'
import { Container } from './Container'
import { Button } from '../ui/Button'

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  title?: string
  subtitle?: string
  showBackButton?: boolean
  onBack?: () => void
  rightContent?: React.ReactNode
  transparent?: boolean
  sticky?: boolean
  bordered?: boolean
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ 
    className,
    title,
    subtitle,
    showBackButton = false,
    onBack,
    rightContent,
    transparent = false,
    sticky = true,
    bordered = true,
    children,
    ...props 
  }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          'w-full z-50 transition-all duration-200',
          sticky && 'sticky top-0',
          !transparent && 'bg-white/95 backdrop-blur-md',
          bordered && !transparent && 'border-b border-gray-200',
          className
        )}
        {...props}
      >
        <Container size="xl" padding="md">
          <div className="flex items-center justify-between h-16">
            {/* Left section */}
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="-ml-2"
                  aria-label="Go back"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
              )}
              
              {(title || subtitle) && (
                <div className="flex flex-col">
                  {title && (
                    <h1 className="text-lg font-display font-semibold text-gray-900">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-sm text-gray-600">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}
              
              {children && (
                <div className="flex items-center">
                  {children}
                </div>
              )}
            </div>

            {/* Right section */}
            {rightContent && (
              <div className="flex items-center space-x-2">
                {rightContent}
              </div>
            )}
          </div>
        </Container>
      </header>
    )
  }
)
Header.displayName = 'Header'

export { Header }