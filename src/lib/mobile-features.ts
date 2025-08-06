// Mobile-specific features for Hong Kong Church PWA
'use client';

interface TouchGestureOptions {
  element: HTMLElement;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onPullToRefresh?: () => Promise<void>;
  minSwipeDistance?: number;
  threshold?: number;
}

interface HapticOptions {
  pattern?: number[];
  duration?: number;
  intensity?: 'light' | 'medium' | 'heavy';
}

interface WakeLockOptions {
  type: 'screen';
  reason?: string;
}

class MobileFeaturesService {
  private static instance: MobileFeaturesService;
  private touchStartX = 0;
  private touchStartY = 0;
  private touchEndX = 0;
  private touchEndY = 0;
  private activeGestures = new Map<HTMLElement, TouchGestureOptions>();
  private wakeLock: WakeLockSentinel | null = null;
  private pullToRefreshElement: HTMLElement | null = null;
  private isPullToRefreshActive = false;

  private constructor() {
    this.initializeFeatures();
  }

  static getInstance(): MobileFeaturesService {
    if (!MobileFeaturesService.instance) {
      MobileFeaturesService.instance = new MobileFeaturesService();
    }
    return MobileFeaturesService.instance;
  }

  private initializeFeatures(): void {
    // Initialize mobile-specific event listeners
    if (typeof window !== 'undefined') {
      this.setupViewportHandling();
      this.setupNetworkMonitoring();
      this.setupBatteryMonitoring();
      this.setupOrientationHandling();
    }
  }

  // Touch Gesture Handling
  enableTouchGestures(options: TouchGestureOptions): void {
    const { element } = options;
    this.activeGestures.set(element, options);

    element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
  }

  disableTouchGestures(element: HTMLElement): void {
    this.activeGestures.delete(element);
    element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    element.removeEventListener('touchmove', this.handleTouchMove.bind(this));
  }

  private handleTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  private handleTouchMove(event: TouchEvent): void {
    const target = event.currentTarget as HTMLElement;
    const options = this.activeGestures.get(target);
    
    if (!options) return;

    const touch = event.touches[0];
    const deltaY = touch.clientY - this.touchStartY;

    // Handle pull-to-refresh
    if (options.onPullToRefresh && window.scrollY === 0 && deltaY > 0) {
      event.preventDefault();
      this.handlePullToRefresh(target, deltaY, options.onPullToRefresh);
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    const target = event.currentTarget as HTMLElement;
    const options = this.activeGestures.get(target);
    
    if (!options) return;

    const touch = event.changedTouches[0];
    this.touchEndX = touch.clientX;
    this.touchEndY = touch.clientY;

    this.detectSwipeGesture(options);
    
    // Reset pull-to-refresh
    if (this.isPullToRefreshActive) {
      this.resetPullToRefresh();
    }
  }

  private detectSwipeGesture(options: TouchGestureOptions): void {
    const minDistance = options.minSwipeDistance || 100;
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Determine if it's a horizontal or vertical swipe
    if (absX > absY && absX > minDistance) {
      // Horizontal swipe
      if (deltaX > 0) {
        options.onSwipeRight?.();
        this.triggerHaptic({ intensity: 'light' });
      } else {
        options.onSwipeLeft?.();
        this.triggerHaptic({ intensity: 'light' });
      }
    } else if (absY > absX && absY > minDistance) {
      // Vertical swipe
      if (deltaY > 0) {
        options.onSwipeDown?.();
      } else {
        options.onSwipeUp?.();
      }
    }
  }

  private async handlePullToRefresh(
    element: HTMLElement,
    distance: number,
    refreshHandler: () => Promise<void>
  ): Promise<void> {
    const threshold = 80;
    
    if (distance > threshold && !this.isPullToRefreshActive) {
      this.isPullToRefreshActive = true;
      this.triggerHaptic({ intensity: 'medium' });
      
      // Add visual feedback
      this.showPullToRefreshIndicator(element);
      
      try {
        await refreshHandler();
        this.triggerHaptic({ intensity: 'heavy' });
      } catch (error) {
        console.error('Pull to refresh failed:', error);
      } finally {
        this.resetPullToRefresh();
      }
    }
  }

  private showPullToRefreshIndicator(element: HTMLElement): void {
    const indicator = document.createElement('div');
    indicator.className = 'pull-to-refresh-indicator';
    indicator.innerHTML = `
      <div class="pull-refresh-spinner">
        <div class="spinner"></div>
        <span>Refreshing...</span>
      </div>
    `;
    element.prepend(indicator);
  }

  private resetPullToRefresh(): void {
    this.isPullToRefreshActive = false;
    const indicator = document.querySelector('.pull-to-refresh-indicator');
    indicator?.remove();
  }

  // Haptic Feedback
  triggerHaptic(options: HapticOptions = {}): void {
    if (!('navigator' in window) || !navigator.vibrate) {
      return;
    }

    if (options.pattern) {
      navigator.vibrate(options.pattern);
    } else if (options.intensity) {
      const patterns = {
        light: [50],
        medium: [100],
        heavy: [200]
      };
      navigator.vibrate(patterns[options.intensity]);
    } else if (options.duration) {
      navigator.vibrate(options.duration);
    } else {
      navigator.vibrate(50); // Default light haptic
    }
  }

  // Screen Wake Lock
  async requestWakeLock(options: WakeLockOptions = { type: 'screen' }): Promise<boolean> {
    if (!('wakeLock' in navigator)) {
      console.warn('Screen Wake Lock API not supported');
      return false;
    }

    try {
      this.wakeLock = await navigator.wakeLock.request(options.type);
      
      this.wakeLock.addEventListener('release', () => {
        console.log('Screen wake lock released:', options.reason || 'Unknown');
      });

      console.log('Screen wake lock acquired:', options.reason || 'Unknown');
      return true;
    } catch (error) {
      console.error('Failed to acquire wake lock:', error);
      return false;
    }
  }

  async releaseWakeLock(): Promise<void> {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
    }
  }

  // App Installation
  setupInstallPrompt(): void {
    let deferredPrompt: BeforeInstallPromptEvent | null = null;

    window.addEventListener('beforeinstallprompt', (event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      event.preventDefault();
      deferredPrompt = event as BeforeInstallPromptEvent;
      
      // Show custom install UI after user interaction
      this.showContextAwareInstallPrompt(deferredPrompt);
    });

    window.addEventListener('appinstalled', (event) => {
      console.log('App was installed');
      this.trackInstallation();
    });
  }

  private showContextAwareInstallPrompt(deferredPrompt: BeforeInstallPromptEvent): void {
    // Show install prompt based on user engagement
    const engagement = this.calculateUserEngagement();
    
    if (engagement.score > 0.7) {
      setTimeout(() => {
        this.showInstallBanner(deferredPrompt);
      }, 3000);
    }
  }

  private calculateUserEngagement(): { score: number; factors: string[] } {
    const factors = [];
    let score = 0;

    // Check various engagement factors
    const pageViews = parseInt(localStorage.getItem('pageViews') || '0');
    const sessionTime = parseInt(localStorage.getItem('totalSessionTime') || '0');
    const devotionsRead = parseInt(localStorage.getItem('devotionsRead') || '0');
    const prayersSubmitted = parseInt(localStorage.getItem('prayersSubmitted') || '0');

    if (pageViews >= 5) { score += 0.2; factors.push('multiple page views'); }
    if (sessionTime >= 300000) { score += 0.3; factors.push('long session time'); } // 5 minutes
    if (devotionsRead >= 3) { score += 0.3; factors.push('engaged with devotions'); }
    if (prayersSubmitted >= 1) { score += 0.2; factors.push('submitted prayers'); }

    return { score, factors };
  }

  private showInstallBanner(deferredPrompt: BeforeInstallPromptEvent): void {
    const banner = document.createElement('div');
    banner.className = 'install-app-banner';
    banner.innerHTML = `
      <div class="install-banner-content">
        <div class="install-banner-icon">⛪</div>
        <div class="install-banner-text">
          <h3>Install Hong Kong Church</h3>
          <p>Get quick access to devotions, prayers, and events</p>
        </div>
        <div class="install-banner-actions">
          <button class="install-btn-primary" id="installBtn">Install</button>
          <button class="install-btn-close" id="closeBtn">×</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Handle install action
    document.getElementById('installBtn')?.addEventListener('click', async () => {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      deferredPrompt = null;
      banner.remove();
    });

    // Handle close action
    document.getElementById('closeBtn')?.addEventListener('click', () => {
      banner.remove();
      // Don't show again for this session
      sessionStorage.setItem('installPromptDismissed', 'true');
    });

    // Auto-hide after 10 seconds
    setTimeout(() => {
      if (banner.parentNode) {
        banner.remove();
      }
    }, 10000);
  }

  private trackInstallation(): void {
    // Track successful installation
    fetch('/api/analytics/install', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        platform: navigator.platform
      }),
    }).catch(error => {
      console.error('Failed to track installation:', error);
    });
  }

  // Network Status Monitoring
  private setupNetworkMonitoring(): void {
    const updateNetworkStatus = () => {
      const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
      const status = {
        online: navigator.onLine,
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0,
        saveData: connection?.saveData || false
      };

      // Dispatch custom event for network changes
      window.dispatchEvent(new CustomEvent('networkStatusChange', { detail: status }));

      // Store in localStorage for offline access
      localStorage.setItem('lastKnownNetworkStatus', JSON.stringify(status));
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    // Initial check
    updateNetworkStatus();
  }

  // Battery Status Monitoring
  private async setupBatteryMonitoring(): Promise<void> {
    try {
      const battery = await (navigator as Navigator & { getBattery?: () => Promise<BatteryManager> }).getBattery?.();
      
      if (battery) {
        const updateBatteryStatus = () => {
          const status = {
            level: battery.level,
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime
          };

          // Dispatch custom event for battery changes
          window.dispatchEvent(new CustomEvent('batteryStatusChange', { detail: status }));

          // Optimize app behavior based on battery level
          this.optimizeForBattery(status);
        };

        battery.addEventListener('chargingchange', updateBatteryStatus);
        battery.addEventListener('levelchange', updateBatteryStatus);
        
        // Initial check
        updateBatteryStatus();
      }
    } catch (error) {
      console.log('Battery API not supported or available');
    }
  }

  private optimizeForBattery(status: { level: number; charging: boolean }): void {
    // Reduce animations and background tasks when battery is low
    if (status.level < 0.2 && !status.charging) {
      document.body.classList.add('battery-saver');
      
      // Reduce refresh intervals
      window.dispatchEvent(new CustomEvent('enableBatterySaver'));
    } else {
      document.body.classList.remove('battery-saver');
      window.dispatchEvent(new CustomEvent('disableBatterySaver'));
    }
  }

  // Viewport Handling
  private setupViewportHandling(): void {
    // Handle viewport changes for better mobile experience
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    
    if (viewportMeta) {
      // Dynamic viewport adjustment based on orientation
      const updateViewport = () => {
        const orientation = screen.orientation?.type || 'portrait-primary';
        
        if (orientation.includes('landscape')) {
          viewportMeta.setAttribute('content', 
            'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
        } else {
          viewportMeta.setAttribute('content', 
            'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
        }
      };

      screen.orientation?.addEventListener('change', updateViewport);
      updateViewport();
    }
  }

  // Orientation Handling
  private setupOrientationHandling(): void {
    if (screen.orientation) {
      const handleOrientationChange = () => {
        const orientation = screen.orientation.type;
        document.body.setAttribute('data-orientation', orientation);
        
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('orientationChange', { 
          detail: { orientation, angle: screen.orientation.angle }
        }));
      };

      screen.orientation.addEventListener('change', handleOrientationChange);
      handleOrientationChange(); // Initial setup
    }
  }

  // Share API Integration
  async shareContent(shareData: { title: string; text: string; url?: string }): Promise<boolean> {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        this.triggerHaptic({ intensity: 'light' });
        return true;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing content:', error);
        }
        return false;
      }
    } else {
      // Fallback to clipboard
      try {
        const textToShare = `${shareData.title}\n${shareData.text}${shareData.url ? '\n' + shareData.url : ''}`;
        await navigator.clipboard.writeText(textToShare);
        this.triggerHaptic({ intensity: 'light' });
        return true;
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        return false;
      }
    }
  }

  // Cleanup
  destroy(): void {
    this.activeGestures.clear();
    this.releaseWakeLock();
  }
}

// CSS for mobile features
const mobileFeaturesCSS = `
  .pull-to-refresh-indicator {
    position: fixed;
    top: -60px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    padding: 16px 24px;
    border-radius: 0 0 12px 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition: top 0.3s ease;
    z-index: 1000;
  }

  .pull-to-refresh-indicator.active {
    top: 0;
  }

  .pull-refresh-spinner {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--primary-blue, #2563eb);
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .install-app-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-top: 1px solid #e5e7eb;
    box-shadow: 0 -4px 12px rgba(0,0,0,0.1);
    z-index: 1000;
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  .install-banner-content {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    gap: 12px;
  }

  .install-banner-icon {
    font-size: 24px;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--primary-blue, #2563eb);
    color: white;
    border-radius: 8px;
  }

  .install-banner-text {
    flex: 1;
  }

  .install-banner-text h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 4px;
    color: #1f2937;
  }

  .install-banner-text p {
    font-size: 14px;
    margin: 0;
    color: #6b7280;
  }

  .install-banner-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .install-btn-primary {
    background: var(--primary-blue, #2563eb);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  }

  .install-btn-close {
    background: none;
    border: none;
    color: #6b7280;
    font-size: 20px;
    cursor: pointer;
    padding: 4px;
    line-height: 1;
  }

  body.battery-saver * {
    animation-duration: 0s !important;
    transition-duration: 0s !important;
  }

  body[data-orientation^="landscape"] {
    /* Landscape-specific styles */
  }

  body[data-orientation^="portrait"] {
    /* Portrait-specific styles */
  }

  @media (max-width: 480px) {
    .install-banner-content {
      padding: 12px 16px;
    }
    
    .install-banner-text h3 {
      font-size: 14px;
    }
    
    .install-banner-text p {
      font-size: 12px;
    }
  }
`;

// Inject CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = mobileFeaturesCSS;
  document.head.appendChild(style);
}

// Export singleton instance
export const mobileFeaturesService = MobileFeaturesService.getInstance();
export type { TouchGestureOptions, HapticOptions, WakeLockOptions };