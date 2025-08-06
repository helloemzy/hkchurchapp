/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    localeDetection: true,
  },
  /** 
   * Traditional Chinese (Hong Kong) language configuration
   * Using 'zh' as the locale code with Hong Kong regional settings
   */
  fallbackLng: {
    'zh-HK': ['zh', 'en'],
    'zh-TW': ['zh', 'en'],
    'zh': ['en'],
    default: ['en']
  },
  
  debug: process.env.NODE_ENV === 'development',
  
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  
  /**
   * Custom locale path for Hong Kong specific content
   */
  localePath: './public/locales',
  
  /**
   * Namespace configuration for different content types
   */
  ns: [
    'common',        // Common UI elements, navigation
    'auth',          // Authentication related
    'devotions',     // Daily devotions content  
    'events',        // Church events
    'groups',        // Small groups
    'prayer',        // Prayer requests
    'profile',       // User profile
    'bible',         // Bible reading
    'notifications'  // Push notifications
  ],
  
  defaultNS: 'common',
  
  /**
   * Load all namespaces for each page to avoid loading delays
   */
  load: 'currentOnly',
  
  /**
   * Preload all languages on client side for faster switching
   */
  preload: ['en', 'zh'],
  
  /**
   * Client-side language detection configuration
   */
  detection: {
    order: [
      'localStorage',      // User's saved preference
      'navigator',         // Browser language
      'htmlTag',          // HTML lang attribute
      'path',             // URL path
      'subdomain',        // Subdomain
      'cookie'            // Cookie
    ],
    
    // Cache user language preference
    caches: ['localStorage', 'cookie'],
    
    // Exclude certain paths from language detection
    excludeCacheFor: ['cimode'],
    
    // Cookie settings for language preference
    cookieMinutes: 60 * 24 * 30, // 30 days
    cookieDomain: process.env.NODE_ENV === 'production' ? '.hkchurch.app' : 'localhost',
    cookieSecure: process.env.NODE_ENV === 'production',
    cookieSameSite: 'lax',
  },
  
  /**
   * Backend options for server-side rendering
   */
  backend: {
    loadPath: './public/locales/{{lng}}/{{ns}}.json',
  },
  
  /**
   * Interpolation configuration for dynamic content
   */
  interpolation: {
    escapeValue: false, // React already escapes
    formatSeparator: ',',
    format: function(value, format, lng) {
      // Custom formatters for Hong Kong specific formatting
      if (format === 'currency') {
        return new Intl.NumberFormat(lng === 'zh' ? 'zh-HK' : 'en-HK', {
          style: 'currency',
          currency: 'HKD'
        }).format(value);
      }
      
      if (format === 'date') {
        return new Intl.DateTimeFormat(lng === 'zh' ? 'zh-HK' : 'en-HK', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(new Date(value));
      }
      
      if (format === 'time') {
        return new Intl.DateTimeFormat(lng === 'zh' ? 'zh-HK' : 'en-HK', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).format(new Date(value));
      }
      
      if (format === 'relative') {
        const rtf = new Intl.RelativeTimeFormat(lng === 'zh' ? 'zh-HK' : 'en-HK');
        const diffInHours = (new Date(value) - new Date()) / (1000 * 60 * 60);
        
        if (Math.abs(diffInHours) < 24) {
          return rtf.format(Math.round(diffInHours), 'hour');
        } else {
          const diffInDays = Math.round(diffInHours / 24);
          return rtf.format(diffInDays, 'day');
        }
      }
      
      return value;
    }
  },
  
  /**
   * React specific configuration
   */
  react: {
    bindI18n: 'languageChanged',
    bindI18nStore: '',
    transEmptyNodeValue: '',
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em', 'span'],
    useSuspense: false, // Set to false for SSR
  },
  
  /**
   * Serialization configuration
   */
  serialization: {
    format: 'json',
  },
  
  /**
   * Custom resource loading for church-specific content
   */
  resources: {
    en: {
      common: {
        appName: 'Hong Kong Church',
        loading: 'Loading...',
        error: 'Something went wrong',
        retry: 'Try again',
        ok: 'OK',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',
        next: 'Next',
        previous: 'Previous',
        home: 'Home',
        back: 'Back'
      }
    },
    zh: {
      common: {
        appName: '香港教會',
        loading: '載入中...',
        error: '發生錯誤',
        retry: '重試',
        ok: '確定',
        cancel: '取消', 
        save: '儲存',
        delete: '刪除',
        edit: '編輯',
        close: '關閉',
        next: '下一個',
        previous: '上一個',
        home: '主頁',
        back: '返回'
      }
    }
  }
};