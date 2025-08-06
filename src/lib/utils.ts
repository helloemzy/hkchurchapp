import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes with proper precedence
 * Uses clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date for display in Hong Kong locale
 */
export function formatDate(date: Date, locale: string = 'en-HK'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/**
 * Format time for display in Hong Kong locale
 */
export function formatTime(date: Date, locale: string = 'en-HK'): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * Generate a random ID for components
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

/**
 * Check if device is mobile based on user agent
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | undefined
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(null, args), wait)
  }
}

/**
 * Theme-related utilities
 */
export const theme = {
  /**
   * Get the current theme preference
   */
  getTheme(): 'light' | 'dark' | 'system' {
    if (typeof window === 'undefined') return 'system'
    return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system'
  },

  /**
   * Set theme preference
   */
  setTheme(theme: 'light' | 'dark' | 'system'): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('theme', theme)
    applyTheme(theme)
  },

  /**
   * Toggle between light and dark themes
   */
  toggle(): void {
    const current = this.getTheme()
    const next = current === 'light' ? 'dark' : 'light'
    this.setTheme(next)
  },
}

/**
 * Apply theme to document
 */
function applyTheme(theme: 'light' | 'dark' | 'system'): void {
  if (typeof window === 'undefined') return

  const root = document.documentElement
  root.classList.remove('light', 'dark')

  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    root.classList.add(systemTheme)
    root.setAttribute('data-theme', systemTheme)
  } else {
    root.classList.add(theme)
    root.setAttribute('data-theme', theme)
  }
}