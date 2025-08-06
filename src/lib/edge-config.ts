import { get } from '@vercel/edge-config';

export interface FeatureFlags {
  // Authentication Features
  enableGoogleAuth: boolean;
  enableAppleAuth: boolean;
  enableEmailAuth: boolean;
  
  // Bible Features
  enableOfflineReading: boolean;
  enableTextToSpeech: boolean;
  enableSearchHighlight: boolean;
  enableBookmarks: boolean;
  enableNoteTaking: boolean;
  
  // Community Features
  enableEvents: boolean;
  enableGroups: boolean;
  enableDiscussions: boolean;
  enableLiveStreaming: boolean;
  
  // PWA Features
  enablePushNotifications: boolean;
  enableOfflineSync: boolean;
  enableInstallPrompt: boolean;
  
  // Advanced Features
  enableAIAssistant: boolean;
  enableAnalytics: boolean;
  enablePerformanceMonitoring: boolean;
  
  // Regional Features
  enableDonations: boolean;
  enableMultiChurch: boolean;
  enableCalendarSync: boolean;
  
  // Debug Features
  enableDebugMode: boolean;
  enableBetaFeatures: boolean;
}

export const defaultFeatureFlags: FeatureFlags = {
  // Authentication Features
  enableGoogleAuth: true,
  enableAppleAuth: true,
  enableEmailAuth: true,
  
  // Bible Features
  enableOfflineReading: true,
  enableTextToSpeech: false,
  enableSearchHighlight: true,
  enableBookmarks: true,
  enableNoteTaking: true,
  
  // Community Features
  enableEvents: false, // Phase 1
  enableGroups: false, // Phase 1
  enableDiscussions: false, // Phase 1
  enableLiveStreaming: false, // Phase 2
  
  // PWA Features
  enablePushNotifications: true,
  enableOfflineSync: true,
  enableInstallPrompt: true,
  
  // Advanced Features
  enableAIAssistant: false, // Phase 2
  enableAnalytics: true,
  enablePerformanceMonitoring: true,
  
  // Regional Features
  enableDonations: false, // Phase 2
  enableMultiChurch: false, // Phase 1
  enableCalendarSync: false, // Phase 1
  
  // Debug Features
  enableDebugMode: process.env.NODE_ENV === 'development',
  enableBetaFeatures: false,
};

/**
 * Get feature flags from Vercel Edge Config
 * Falls back to environment variables and then defaults
 */
export async function getFeatureFlags(): Promise<FeatureFlags> {
  try {
    // Try to get from Edge Config first
    const edgeConfigFlags = await get('featureFlags') as Partial<FeatureFlags>;
    
    if (edgeConfigFlags) {
      return { ...defaultFeatureFlags, ...edgeConfigFlags };
    }
  } catch (error) {
    console.warn('Failed to fetch feature flags from Edge Config:', error);
  }

  // Fallback to environment variables
  const envFlags: Partial<FeatureFlags> = {
    enableGoogleAuth: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === 'true',
    enableAppleAuth: process.env.NEXT_PUBLIC_ENABLE_APPLE_AUTH === 'true',
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enablePushNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
    enableOfflineSync: process.env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE === 'true',
    enableDebugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
  };

  // Remove undefined values
  const cleanEnvFlags = Object.fromEntries(
    Object.entries(envFlags).filter(([, value]) => value !== undefined)
  ) as Partial<FeatureFlags>;

  return { ...defaultFeatureFlags, ...cleanEnvFlags };
}

/**
 * Get a specific feature flag
 */
export async function getFeatureFlag<K extends keyof FeatureFlags>(
  flagName: K
): Promise<FeatureFlags[K]> {
  try {
    const flag = await get(flagName);
    if (flag !== undefined) {
      return flag as FeatureFlags[K];
    }
  } catch (error) {
    console.warn(`Failed to fetch feature flag "${flagName}" from Edge Config:`, error);
  }

  // Fallback to getting all flags and returning the specific one
  const allFlags = await getFeatureFlags();
  return allFlags[flagName];
}

/**
 * Check if a feature is enabled
 * This is a convenience function for boolean flags
 */
export async function isFeatureEnabled(flagName: keyof FeatureFlags): Promise<boolean> {
  const flag = await getFeatureFlag(flagName);
  return Boolean(flag);
}

/**
 * Edge Config initialization data structure
 * This should be uploaded to Vercel Edge Config manually or via API
 */
export const initialEdgeConfig = {
  featureFlags: {
    // MVP Phase flags (enabled)
    enableGoogleAuth: true,
    enableAppleAuth: true,
    enableEmailAuth: true,
    enableOfflineReading: true,
    enableSearchHighlight: true,
    enableBookmarks: true,
    enableNoteTaking: true,
    enablePushNotifications: true,
    enableOfflineSync: true,
    enableInstallPrompt: true,
    enableAnalytics: true,
    enablePerformanceMonitoring: true,
    
    // Phase 1 flags (disabled for now)
    enableEvents: false,
    enableGroups: false,
    enableDiscussions: false,
    enableMultiChurch: false,
    enableCalendarSync: false,
    
    // Phase 2 flags (disabled for now)
    enableAIAssistant: false,
    enableLiveStreaming: false,
    enableDonations: false,
    
    // Advanced features
    enableTextToSpeech: false,
    enableBetaFeatures: false,
    enableDebugMode: false,
  },
  
  // Application configuration
  appConfig: {
    maintenanceMode: false,
    maxUsersPerChurch: 1000,
    maxEventsPerMonth: 50,
    supportedLanguages: ['en', 'zh-TW', 'zh-CN'],
    defaultLanguage: 'en',
    apiRateLimits: {
      authenticated: 1000,
      anonymous: 100,
    },
  },
  
  // Regional settings
  regionalConfig: {
    hongKong: {
      timezone: 'Asia/Hong_Kong',
      currency: 'HKD',
      supportedPaymentMethods: ['stripe', 'alipay', 'wechat'],
      localFeatures: {
        enableCantonese: true,
        enableTraditionalChinese: true,
      },
    },
  },
};