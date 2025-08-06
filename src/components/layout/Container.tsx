'use client'

import React from 'react'
import { cn } from '../../lib/utils'

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  centerContent?: boolean
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ 
    className, 
    size = 'lg', 
    padding = 'md', 
    centerContent = false,
    children,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: 'max-w-screen-sm', // 640px
      md: 'max-w-screen-md', // 768px
      lg: 'max-w-screen-lg', // 1024px
      xl: 'max-w-screen-xl', // 1280px
      full: 'max-w-none',
    }

    const paddingClasses = {
      none: '',
      sm: 'px-4',
      md: 'px-4 md:px-6',
      lg: 'px-4 md:px-8',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto w-full',
          sizeClasses[size],
          paddingClasses[padding],
          centerContent && 'flex flex-col items-center',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Container.displayName = 'Container'

export { Container }