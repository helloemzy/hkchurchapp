'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium text-base transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:-translate-y-1 hover:scale-[1.02] hover:shadow-purple active:translate-y-0 active:scale-[0.98] shadow-md',
        secondary:
          'border-2 border-primary-500 bg-transparent text-primary-500 hover:bg-primary-50 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md dark:hover:bg-primary-900/10',
        ghost:
          'bg-transparent text-gray-700 hover:bg-gray-100 hover:-translate-y-0.5 hover:scale-[1.02] dark:text-gray-300 dark:hover:bg-gray-800',
        destructive:
          'bg-gradient-to-r from-red-500 to-red-600 text-white hover:-translate-y-1 hover:scale-[1.02] hover:shadow-red active:translate-y-0 active:scale-[0.98] shadow-md',
        outline:
          'border border-gray-300 bg-white/80 text-gray-700 hover:bg-gray-50 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 backdrop-blur-sm',
        link: 'text-primary-500 underline-offset-4 hover:underline hover:text-primary-600',
        // New vibrant variants inspired by references
        vibrant: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white hover:-translate-y-1 hover:scale-[1.05] hover:shadow-xl shadow-lg font-bold',
        cultural: 'bg-gradient-chinese-celebration text-white hover:-translate-y-1 hover:scale-[1.02] hover:shadow-chinese-red shadow-md font-bold',
        jade: 'bg-gradient-jade-prosperity text-white hover:-translate-y-1 hover:scale-[1.02] hover:shadow-jade-green shadow-md font-bold',
        festival: 'bg-gradient-festival-joy text-white hover:-translate-y-1 hover:scale-[1.02] hover:shadow-pink shadow-md font-bold',
        organic: 'bg-gradient-organic-flow text-white hover:-translate-y-1 hover:scale-[1.03] hover:shadow-xl shadow-lg font-bold animate-gradient-shift',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6',
        lg: 'h-13 px-8 text-lg',
        icon: 'h-11 w-11',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, loading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading
    
    const isVibrantVariant = variant && ['vibrant', 'cultural', 'jade', 'festival', 'organic'].includes(variant)
    
    const content = (
      <>
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && leftIcon && (
          <span className="mr-2 flex-shrink-0 relative z-10">{leftIcon}</span>
        )}
        <span className={cn('relative z-10', loading ? 'opacity-0' : '')}>{children}</span>
        {!loading && rightIcon && (
          <span className="ml-2 flex-shrink-0 relative z-10">{rightIcon}</span>
        )}
        {/* Shimmer effect for vibrant buttons */}
        {isVibrantVariant && !loading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
        )}
      </>
    )

    if (asChild) {
      return (
        <div
          className={cn(buttonVariants({ variant, size, fullWidth, className }))}
          {...props}
        >
          {content}
        </div>
      )
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }), 'group')}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {content}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }

// Pre-configured button variants for common use cases
export const PrimaryButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button variant="primary" ref={ref} {...props} />
)
PrimaryButton.displayName = 'PrimaryButton'

export const SecondaryButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button variant="secondary" ref={ref} {...props} />
)
SecondaryButton.displayName = 'SecondaryButton'

export const GhostButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button variant="ghost" ref={ref} {...props} />
)
GhostButton.displayName = 'GhostButton'

export const DestructiveButton = React.forwardRef<HTMLButtonElement, Omit<ButtonProps, 'variant'>>(
  (props, ref) => <Button variant="destructive" ref={ref} {...props} />
)
DestructiveButton.displayName = 'DestructiveButton'