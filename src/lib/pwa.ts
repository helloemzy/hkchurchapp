// PWA utilities and hooks for Hong Kong Church PWA

/**
 * Check if the app is running in standalone mode (installed as PWA)
 */
export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any)?.standalone ||
    document.referrer.includes('android-app://')
  )
}

/**
 * Check if the device supports PWA installation
 */
export function supportsPWA(): boolean {
  if (typeof window === 'undefined') return false
  
  return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window
}

/**
 * Register service worker for PWA functionality
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })

    console.log('Service Worker registered successfully:', registration.scope)

    // Handle service worker updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available, prompt user to refresh
            if (window.confirm('New version available! Reload to update?')) {
              window.location.reload()
            }
          }
        })
      }
    })

    return registration
  } catch (error) {
    console.error('Service Worker registration failed:', error)
    return null
  }
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration) {
      const result = await registration.unregister()
      console.log('Service Worker unregistered:', result)
      return result
    }
    return false
  } catch (error) {
    console.error('Service Worker unregistration failed:', error)
    return false
  }
}

/**
 * Check for app updates
 */
export async function checkForUpdates(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration) {
      await registration.update()
      return true
    }
    return false
  } catch (error) {
    console.error('Failed to check for updates:', error)
    return false
  }
}

/**
 * Get PWA display mode
 */
export function getDisplayMode(): 'browser' | 'standalone' | 'minimal-ui' | 'fullscreen' {
  if (typeof window === 'undefined') return 'browser'

  if (window.matchMedia('(display-mode: fullscreen)').matches) {
    return 'fullscreen'
  }
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return 'standalone'
  }
  if (window.matchMedia('(display-mode: minimal-ui)').matches) {
    return 'minimal-ui'
  }
  return 'browser'
}

/**
 * Share content using Web Share API or fallback
 */
export async function shareContent(data: {
  title?: string
  text?: string
  url?: string
}): Promise<boolean> {
  if (typeof window === 'undefined') return false

  // Use Web Share API if available
  if (navigator.share) {
    try {
      await navigator.share(data)
      return true
    } catch (error) {
      console.error('Web Share API failed:', error)
    }
  }

  // Fallback to clipboard
  if (navigator.clipboard && data.url) {
    try {
      await navigator.clipboard.writeText(data.url)
      // Show toast notification (would need to implement toast system)
      console.log('Link copied to clipboard')
      return true
    } catch (error) {
      console.error('Clipboard write failed:', error)
    }
  }

  return false
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission === 'denied') {
    return 'denied'
  }

  const permission = await Notification.requestPermission()
  return permission
}

/**
 * Show local notification
 */
export function showNotification(title: string, options?: NotificationOptions): Notification | null {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted')
    return null
  }

  const defaultOptions: NotificationOptions = {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'hk-church',
    requireInteraction: false,
    ...options,
  }

  return new Notification(title, defaultOptions)
}

/**
 * Add to home screen prompt for iOS
 */
export function showIOSInstallPrompt(): boolean {
  if (typeof window === 'undefined') return false

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const isInStandaloneMode = (window.navigator as any)?.standalone

  if (isIOS && !isInStandaloneMode) {
    // Show iOS-specific install instructions
    // This would typically be handled by a modal or banner component
    console.log('Show iOS install instructions')
    return true
  }

  return false
}

/**
 * Check if device is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * Get device type
 */
export function getDeviceType(): 'desktop' | 'tablet' | 'mobile' {
  if (typeof window === 'undefined') return 'desktop'

  const userAgent = navigator.userAgent

  if (/iPad/.test(userAgent) || (/Android/.test(userAgent) && !/Mobile/.test(userAgent))) {
    return 'tablet'
  }

  if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    return 'mobile'
  }

  return 'desktop'
}

/**
 * Cache key management for offline functionality
 */
export class CacheManager {
  private static readonly CACHE_PREFIX = 'hk-church'
  private static readonly VERSION = 'v1'

  static getCacheName(name: string): string {
    return `${this.CACHE_PREFIX}-${name}-${this.VERSION}`
  }

  static async clearOldCaches(): Promise<void> {
    if (typeof window === 'undefined' || !('caches' in window)) return

    const cacheNames = await caches.keys()
    const oldCaches = cacheNames.filter(name => 
      name.startsWith(this.CACHE_PREFIX) && !name.includes(this.VERSION)
    )

    await Promise.all(oldCaches.map(name => caches.delete(name)))
  }

  static async cacheResources(cacheName: string, resources: string[]): Promise<void> {
    if (typeof window === 'undefined' || !('caches' in window)) return

    const cache = await caches.open(this.getCacheName(cacheName))
    await cache.addAll(resources)
  }

  static async getCachedResource(cacheName: string, url: string): Promise<Response | undefined> {
    if (typeof window === 'undefined' || !('caches' in window)) return undefined

    const cache = await caches.open(this.getCacheName(cacheName))
    return cache.match(url)
  }
}

/**
 * Background sync utilities
 */
export class BackgroundSync {
  private static readonly SYNC_TAG_PREFIX = 'hk-church'

  static async register(tag: string, data?: any): Promise<void> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    try {
      const registration = await navigator.serviceWorker.ready
      if ('sync' in registration) {
        await (registration as any).sync.register(`${this.SYNC_TAG_PREFIX}-${tag}`)
        
        // Store data for sync if provided
        if (data) {
          localStorage.setItem(`sync-${tag}`, JSON.stringify(data))
        }
      }
    } catch (error) {
      console.error('Background sync registration failed:', error)
    }
  }

  static getSyncData(tag: string): any {
    if (typeof window === 'undefined') return null

    const data = localStorage.getItem(`sync-${tag}`)
    return data ? JSON.parse(data) : null
  }

  static clearSyncData(tag: string): void {
    if (typeof window === 'undefined') return

    localStorage.removeItem(`sync-${tag}`)
  }
}