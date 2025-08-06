'use client'

import React from 'react'
import { Button } from '../ui/Button'

export interface BackButtonProps {
  onClick?: () => void
  disabled?: boolean
  className?: string
  variant?: 'default' | 'ghost' | 'outline'
}

export function BackButton({ 
  onClick, 
  disabled, 
  className, 
  variant = 'ghost' 
}: BackButtonProps) {
  return (
    <Button
      variant={variant}
      size="icon"
      onClick={onClick}
      disabled={disabled}
      className={className}
      aria-label="Go back"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </Button>
  )
}