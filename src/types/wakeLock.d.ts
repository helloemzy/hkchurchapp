// Wake Lock API TypeScript declarations
// These types may not be available in the standard DOM types yet

interface WakeLockSentinel extends EventTarget {
  readonly type: 'screen';
  release(): Promise<void>;
  addEventListener(
    type: 'release',
    listener: (event: Event) => void,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener(
    type: 'release', 
    listener: (event: Event) => void,
    options?: boolean | EventListenerOptions
  ): void;
}

interface Navigator {
  wakeLock?: {
    request(type: 'screen'): Promise<WakeLockSentinel>;
  };
}

// Vibration API (may not be in standard types)
interface Navigator {
  vibrate?(pattern: number | number[]): boolean;
}

// Network Information API
interface NetworkInformation extends EventTarget {
  readonly effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  readonly downlink: number;
  readonly rtt: number;
  readonly saveData: boolean;
  addEventListener(type: 'change', listener: EventListener): void;
  removeEventListener(type: 'change', listener: EventListener): void;
}

interface Navigator {
  connection?: NetworkInformation;
}

// Battery Status API
interface BatteryManager extends EventTarget {
  readonly level: number;
  readonly charging: boolean;
  readonly chargingTime: number;
  readonly dischargingTime: number;
  addEventListener(type: 'chargingchange' | 'levelchange', listener: EventListener): void;
  removeEventListener(type: 'chargingchange' | 'levelchange', listener: EventListener): void;
}

interface Navigator {
  getBattery?(): Promise<BatteryManager>;
}

// Share API
interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}

interface Navigator {
  share?(data: ShareData): Promise<void>;
}

// Viewport segments API (for foldable devices)
interface VisualViewport {
  segments?: DOMRect[];
}

// App installation events
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: ReadonlyArray<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
  preventDefault(): void;
}

interface WindowEventMap {
  'beforeinstallprompt': BeforeInstallPromptEvent;
  'appinstalled': Event;
}

// Custom events for PWA features
interface WindowEventMap {
  'networkStatusChange': CustomEvent<{
    online: boolean;
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  }>;
  'batteryStatusChange': CustomEvent<{
    level: number;
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
  }>;
  'orientationChange': CustomEvent<{
    orientation: string;
    angle: number;
  }>;
  'enableBatterySaver': CustomEvent;
  'disableBatterySaver': CustomEvent;
}