'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card'
import { X, Download, Smartphone } from 'lucide-react'
import { cn } from '../../lib/utils'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

export interface InstallPromptProps {
  className?: string
  onInstall?: () => void
  onDismiss?: () => void
  autoShow?: boolean
  showDelay?: number
}

const InstallPrompt: React.FC<InstallPromptProps> = ({
  className,
  onInstall,
  onDismiss,
  autoShow = true,
  showDelay = 3000,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if app is already installed or running in standalone mode
    const checkInstallStatus = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any)?.standalone || 
        document.referrer.includes('android-app://')
      
      setIsStandalone(isStandaloneMode)
      setIsInstalled(isStandaloneMode)
    }

    checkInstallStatus()

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      if (autoShow && !isInstalled) {
        setTimeout(() => setShowPrompt(true), showDelay)
      }
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
      onInstall?.()
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [autoShow, showDelay, isInstalled, onInstall])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt')
        onInstall?.()
      } else {
        console.log('User dismissed the install prompt')
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error('Error during install prompt:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    onDismiss?.()
    
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Don't show if already installed, no deferred prompt, or dismissed in this session
  if (
    isInstalled ||
    !deferredPrompt ||
    !showPrompt ||
    sessionStorage.getItem('pwa-install-dismissed')
  ) {
    return null
  }

  return (
    <Card className={cn('fixed bottom-4 left-4 right-4 z-50 shadow-xl', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Smartphone className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <CardTitle className="text-base">Install Hong Kong Church</CardTitle>
              <CardDescription className="text-sm">
                Get quick access to devotions, events, and community updates
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="p-1 h-auto text-gray-400 hover:text-gray-600"
            aria-label="Dismiss install prompt"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Button
            onClick={handleInstallClick}
            className="flex-1"
            leftIcon={<Download className="h-4 w-4" />}
          >
            Install App
          </Button>
          <Button
            variant="ghost"
            onClick={handleDismiss}
            className="px-4"
          >
            Not now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Hook for managing PWA install state
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    const checkInstallStatus = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any)?.standalone || 
        document.referrer.includes('android-app://')
      
      setIsInstalled(isStandaloneMode)
    }

    checkInstallStatus()

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      setCanInstall(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) return false

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      setDeferredPrompt(null)
      setCanInstall(false)
      
      return choiceResult.outcome === 'accepted'
    } catch (error) {
      console.error('Error during install prompt:', error)
      return false
    }
  }

  return {
    isInstalled,
    canInstall,
    promptInstall,
  }
}

// Standalone install button component
export interface InstallButtonProps {
  className?: string
  children?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const InstallButton: React.FC<InstallButtonProps> = ({
  className,
  children = 'Install App',
  variant = 'primary',
  size = 'md',
}) => {
  const { isInstalled, canInstall, promptInstall } = useInstallPrompt()

  if (isInstalled || !canInstall) {
    return null
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={promptInstall}
      className={className}
      leftIcon={<Download className="h-4 w-4" />}
    >
      {children}
    </Button>
  )
}

export default InstallPrompt