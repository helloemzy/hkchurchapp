import { Noto_Sans_SC, Noto_Sans_TC, Noto_Serif_SC, Noto_Serif_TC } from 'next/font/google';

// Traditional Chinese fonts (for Hong Kong)
export const notoSansTc = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  preload: true,
  variable: '--font-chinese-sans',
  fallback: [
    'PingFang TC',
    'Microsoft JhengHei',
    'Heiti TC',
    'Apple LiGothic',
    'sans-serif'
  ],
});

export const notoSerifTc = Noto_Serif_TC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: false, // Only load when needed
  variable: '--font-chinese-serif',
  fallback: [
    'PingFang TC',
    'Microsoft JhengHei',
    'Heiti TC',
    'Apple LiGothic',
    'serif'
  ],
});

// Simplified Chinese fonts (backup)
export const notoSansSc = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  preload: false,
  variable: '--font-chinese-sans-sc',
  fallback: [
    'PingFang SC',
    'Microsoft YaHei',
    'SimHei',
    'Heiti SC',
    'sans-serif'
  ],
});

export const notoSerifSc = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: false,
  variable: '--font-chinese-serif-sc',
  fallback: [
    'PingFang SC',
    'Microsoft YaHei',
    'SimHei',
    'Heiti SC',
    'serif'
  ],
});

// Font loading optimization utility
export class ChineseFontLoader {
  private static instance: ChineseFontLoader;
  private loadedFonts = new Set<string>();
  private loadingPromises = new Map<string, Promise<void>>();

  static getInstance(): ChineseFontLoader {
    if (!this.instance) {
      this.instance = new ChineseFontLoader();
    }
    return this.instance;
  }

  // Preload critical Chinese fonts
  preloadCriticalFonts(): void {
    if (typeof window === 'undefined') return;

    // Preload Traditional Chinese (primary for Hong Kong)
    this.preloadFont('Noto Sans TC', '400');
    this.preloadFont('Noto Sans TC', '500');
  }

  // Lazy load additional font weights/styles
  async loadFontWeight(family: string, weight: string): Promise<void> {
    const fontKey = `${family}-${weight}`;
    
    if (this.loadedFonts.has(fontKey)) {
      return;
    }

    if (this.loadingPromises.has(fontKey)) {
      return this.loadingPromises.get(fontKey);
    }

    const loadPromise = this.loadFont(family, weight);
    this.loadingPromises.set(fontKey, loadPromise);
    
    try {
      await loadPromise;
      this.loadedFonts.add(fontKey);
    } finally {
      this.loadingPromises.delete(fontKey);
    }
  }

  private preloadFont(family: string, weight: string): void {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    
    // Google Fonts URL for Chinese fonts
    const url = this.buildFontUrl(family, weight);
    link.href = url;
    
    document.head.appendChild(link);
  }

  private async loadFont(family: string, weight: string): Promise<void> {
    if (typeof window === 'undefined' || !('FontFace' in window)) {
      return;
    }

    try {
      const url = this.buildFontUrl(family, weight);
      const fontFace = new FontFace(family, `url(${url})`, {
        weight,
        style: 'normal',
        display: 'swap',
      });

      await fontFace.load();
      document.fonts.add(fontFace);
      
      console.log(`Loaded Chinese font: ${family} ${weight}`);
    } catch (error) {
      console.warn(`Failed to load Chinese font: ${family} ${weight}`, error);
    }
  }

  private buildFontUrl(family: string, weight: string): string {
    const baseUrl = 'https://fonts.gstatic.com/s/';
    const familyPath = family.toLowerCase().replace(/\s+/g, '');
    
    // This is a simplified URL - in production, you'd want to use the actual Google Fonts URLs
    return `${baseUrl}${familyPath}/v${this.getFontVersion(family)}/${familyPath}-${weight}.woff2`;
  }

  private getFontVersion(family: string): number {
    // Font versions for Noto fonts (these would need to be kept updated)
    const versions: Record<string, number> = {
      'Noto Sans TC': 35,
      'Noto Sans SC': 36,
      'Noto Serif TC': 20,
      'Noto Serif SC': 21,
    };
    
    return versions[family] || 1;
  }
}

// Utility functions for font optimization
export function optimizeChineseFonts(): void {
  if (typeof window === 'undefined') return;

  const fontLoader = ChineseFontLoader.getInstance();
  
  // Preload critical fonts immediately
  fontLoader.preloadCriticalFonts();
  
  // Load additional weights when page is idle
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      fontLoader.loadFontWeight('Noto Sans TC', '600');
      fontLoader.loadFontWeight('Noto Sans TC', '700');
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      fontLoader.loadFontWeight('Noto Sans TC', '600');
      fontLoader.loadFontWeight('Noto Sans TC', '700');
    }, 2000);
  }
}

// Font subsetting utility (for future use)
export function getChineseCharacterSubset(text: string): string {
  // Extract unique Chinese characters from text
  const chineseChars = new Set<string>();
  
  for (const char of text) {
    // Check if character is Chinese (simplified or traditional)
    const code = char.codePointAt(0);
    if (code && (
      (code >= 0x4E00 && code <= 0x9FFF) ||  // CJK Unified Ideographs
      (code >= 0x3400 && code <= 0x4DBF) ||  // CJK Extension A
      (code >= 0x20000 && code <= 0x2A6DF) || // CJK Extension B
      (code >= 0x2A700 && code <= 0x2B73F) || // CJK Extension C
      (code >= 0x2B740 && code <= 0x2B81F) || // CJK Extension D
      (code >= 0x2B820 && code <= 0x2CEAF)    // CJK Extension E
    )) {
      chineseChars.add(char);
    }
  }
  
  return Array.from(chineseChars).join('');
}

// Performance monitoring for font loading
export function monitorFontLoading(): void {
  if (typeof window === 'undefined' || !window.performance) return;

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'resource' && entry.name.includes('fonts.gstatic.com')) {
        const resource = entry as PerformanceResourceTiming;
        
        console.log(`Font loaded: ${resource.name}`, {
          duration: resource.duration,
          size: resource.transferSize,
          encoded: resource.encodedBodySize,
        });
        
        // Send to analytics if font loading is slow
        if (resource.duration > 1000) {
          if (window.va) {
            window.va('track', 'Slow Font Loading', {
              font: resource.name,
              duration: Math.round(resource.duration),
              size: resource.transferSize,
            });
          }
        }
      }
    });
  });

  observer.observe({ entryTypes: ['resource'] });
}