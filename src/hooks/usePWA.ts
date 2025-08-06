'use client';

import { useEffect, useState, useCallback } from 'react';
import { pushNotificationService } from '@/lib/push-notifications';
import { mobileFeaturesService } from '@/lib/mobile-features';

interface PWAFeatures {
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  batteryLevel: number | null;
  networkType: string;
  orientation: string;
  canNotify: boolean;
  hasWakeLock: boolean;
}

interface PWAActions {
  requestNotificationPermission: () => Promise<NotificationPermission>;
  subscribeToNotifications: () => Promise<boolean>;
  unsubscribeFromNotifications: () => Promise<boolean>;
  requestWakeLock: (reason?: string) => Promise<boolean>;
  releaseWakeLock: () => Promise<void>;
  shareContent: (data: { title: string; text: string; url?: string }) => Promise<boolean>;
  triggerHaptic: (intensity?: 'light' | 'medium' | 'heavy') => void;
  showInstallPrompt: () => void;
}

export function usePWA() {
  const [features, setFeatures] = useState<PWAFeatures>({
    isOnline: true,
    isInstallable: false,
    isInstalled: false,
    batteryLevel: null,
    networkType: 'unknown',
    orientation: 'portrait-primary',
    canNotify: false,
    hasWakeLock: false,
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize PWA services
  useEffect(() => {
    const initializePWA = async () => {
      try {
        // Initialize push notifications
        const pushInitialized = await pushNotificationService.initialize();
        
        // Setup mobile features
        mobileFeaturesService.setupInstallPrompt();

        // Update initial state
        setFeatures(prev => ({
          ...prev,
          isOnline: navigator.onLine,
          canNotify: pushInitialized && 'Notification' in window,
          hasWakeLock: 'wakeLock' in navigator,
          isInstalled: window.matchMedia('(display-mode: standalone)').matches,
        }));

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize PWA features:', error);
      }
    };

    initializePWA();
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleNetworkChange = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setFeatures(prev => ({
        ...prev,
        isOnline: navigator.onLine,
        networkType: detail.effectiveType || 'unknown'
      }));
    };

    window.addEventListener('networkStatusChange', handleNetworkChange);
    window.addEventListener('online', () => 
      setFeatures(prev => ({ ...prev, isOnline: true }))
    );
    window.addEventListener('offline', () => 
      setFeatures(prev => ({ ...prev, isOnline: false }))
    );

    return () => {
      window.removeEventListener('networkStatusChange', handleNetworkChange);
      window.removeEventListener('online', () => 
        setFeatures(prev => ({ ...prev, isOnline: true }))
      );
      window.removeEventListener('offline', () => 
        setFeatures(prev => ({ ...prev, isOnline: false }))
      );
    };
  }, []);

  // Battery status monitoring
  useEffect(() => {
    const handleBatteryChange = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setFeatures(prev => ({
        ...prev,
        batteryLevel: detail.level
      }));
    };

    window.addEventListener('batteryStatusChange', handleBatteryChange);

    return () => {
      window.removeEventListener('batteryStatusChange', handleBatteryChange);
    };
  }, []);

  // Orientation monitoring
  useEffect(() => {
    const handleOrientationChange = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setFeatures(prev => ({
        ...prev,
        orientation: detail.orientation
      }));
    };

    window.addEventListener('orientationChange', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationChange', handleOrientationChange);
    };
  }, []);

  // Install prompt detection
  useEffect(() => {
    const handleBeforeInstallPrompt = () => {
      setFeatures(prev => ({ ...prev, isInstallable: true }));
    };

    const handleAppInstalled = () => {
      setFeatures(prev => ({ 
        ...prev, 
        isInstalled: true,
        isInstallable: false 
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // PWA Actions
  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    return await pushNotificationService.requestPermission();
  }, []);

  const subscribeToNotifications = useCallback(async (): Promise<boolean> => {
    try {
      const permission = await pushNotificationService.requestPermission();
      if (permission === 'granted') {
        const subscription = await pushNotificationService.subscribeUser();
        return subscription !== null;
      }
      return false;
    } catch (error) {
      console.error('Failed to subscribe to notifications:', error);
      return false;
    }
  }, []);

  const unsubscribeFromNotifications = useCallback(async (): Promise<boolean> => {
    try {
      return await pushNotificationService.unsubscribeUser();
    } catch (error) {
      console.error('Failed to unsubscribe from notifications:', error);
      return false;
    }
  }, []);

  const requestWakeLock = useCallback(async (reason?: string): Promise<boolean> => {
    try {
      const success = await mobileFeaturesService.requestWakeLock({
        type: 'screen',
        reason: reason || 'Reading devotions'
      });
      
      if (success) {
        setFeatures(prev => ({ ...prev, hasWakeLock: true }));
      }
      
      return success;
    } catch (error) {
      console.error('Failed to request wake lock:', error);
      return false;
    }
  }, []);

  const releaseWakeLock = useCallback(async (): Promise<void> => {
    try {
      await mobileFeaturesService.releaseWakeLock();
      setFeatures(prev => ({ ...prev, hasWakeLock: false }));
    } catch (error) {
      console.error('Failed to release wake lock:', error);
    }
  }, []);

  const shareContent = useCallback(async (data: { 
    title: string; 
    text: string; 
    url?: string 
  }): Promise<boolean> => {
    try {
      return await mobileFeaturesService.shareContent(data);
    } catch (error) {
      console.error('Failed to share content:', error);
      return false;
    }
  }, []);

  const triggerHaptic = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'light'): void => {
    mobileFeaturesService.triggerHaptic({ intensity });
  }, []);

  const showInstallPrompt = useCallback((): void => {
    // This will be handled by the beforeinstallprompt event listener
    // in the mobileFeaturesService
    console.log('Install prompt requested');
  }, []);

  const actions: PWAActions = {
    requestNotificationPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    requestWakeLock,
    releaseWakeLock,
    shareContent,
    triggerHaptic,
    showInstallPrompt,
  };

  return {
    features,
    actions,
    isInitialized,
  };
}

// Additional hook for touch gestures
export function useTouchGestures(
  elementRef: React.RefObject<HTMLElement>,
  options: {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    onPullToRefresh?: () => Promise<void>;
  }
) {
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    mobileFeaturesService.enableTouchGestures({
      element,
      ...options,
    });

    return () => {
      mobileFeaturesService.disableTouchGestures(element);
    };
  }, [elementRef, options]);
}

// Hook for managing devotion reading state
export function useDevotionReading() {
  const { actions, features } = usePWA();
  const [isReading, setIsReading] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  const startReading = useCallback(async () => {
    setIsReading(true);
    
    // Request wake lock to keep screen on
    if (features.hasWakeLock) {
      const success = await actions.requestWakeLock('Reading devotional content');
      setWakeLockActive(success);
    }

    // Track reading session
    const startTime = Date.now();
    localStorage.setItem('readingSessionStart', startTime.toString());
  }, [actions, features.hasWakeLock]);

  const stopReading = useCallback(async () => {
    setIsReading(false);
    
    // Release wake lock
    if (wakeLockActive) {
      await actions.releaseWakeLock();
      setWakeLockActive(false);
    }

    // Track reading session duration
    const startTime = localStorage.getItem('readingSessionStart');
    if (startTime) {
      const duration = Date.now() - parseInt(startTime);
      const totalTime = parseInt(localStorage.getItem('totalReadingTime') || '0') + duration;
      localStorage.setItem('totalReadingTime', totalTime.toString());
      localStorage.removeItem('readingSessionStart');

      // Update devotions read counter
      const devotionsRead = parseInt(localStorage.getItem('devotionsRead') || '0') + 1;
      localStorage.setItem('devotionsRead', devotionsRead.toString());
    }
  }, [actions, wakeLockActive]);

  return {
    isReading,
    wakeLockActive,
    startReading,
    stopReading,
  };
}