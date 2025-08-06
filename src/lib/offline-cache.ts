// Offline caching utilities for Bible and devotion content

const CACHE_NAME = 'hong-kong-church-v1';
const DEVOTIONS_CACHE_KEY = 'devotions-cache';
const BIBLE_CACHE_KEY = 'bible-cache';
const USER_DATA_CACHE_KEY = 'user-data-cache';

export interface CachedDevotion {
  id: string;
  title: string;
  title_zh: string | null;
  content: string;
  content_zh: string | null;
  scripture_reference: string;
  scripture_text: string;
  scripture_text_zh: string | null;
  date: string;
  author: string;
  reflection_questions: string[];
  reflection_questions_zh: string[] | null;
  tags: string[];
  image_url: string | null;
  cached_at: string;
}

export interface CachedBibleChapter {
  book: string;
  chapter: number;
  verses: {
    verse: number;
    text: string;
    text_zh?: string;
  }[];
  cached_at: string;
}

export interface CachedUserData {
  bookmarks: any[];
  progress: any[];
  cached_at: string;
}

class OfflineCache {
  private isSupported = false;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'indexedDB' in window;
  }

  // Initialize the cache
  async init(): Promise<void> {
    if (!this.isSupported) return;

    try {
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.ready;
      }
    } catch (error) {
      console.error('Error initializing offline cache:', error);
    }
  }

  // Devotions caching
  async cacheWeeklyDevotions(): Promise<void> {
    if (!this.isSupported) return;

    try {
      // Get the next 7 days of devotions
      const today = new Date();
      const weekDevotions: CachedDevotion[] = [];

      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toLocaleDateString('en-CA');

        try {
          // Try to fetch devotion for this date
          const response = await fetch(`/api/devotions?date=${dateString}&limit=1`);
          if (response.ok) {
            const data = await response.json();
            if (data.devotions && data.devotions.length > 0) {
              const devotion = data.devotions[0];
              weekDevotions.push({
                ...devotion,
                cached_at: new Date().toISOString(),
              });
            }
          }
        } catch (error) {
          console.error(`Error caching devotion for ${dateString}:`, error);
        }
      }

      // Store in localStorage as fallback
      localStorage.setItem(DEVOTIONS_CACHE_KEY, JSON.stringify(weekDevotions));
    } catch (error) {
      console.error('Error caching weekly devotions:', error);
    }
  }

  async getCachedDevotion(date: string): Promise<CachedDevotion | null> {
    if (!this.isSupported) return null;

    try {
      const cached = localStorage.getItem(DEVOTIONS_CACHE_KEY);
      if (cached) {
        const devotions: CachedDevotion[] = JSON.parse(cached);
        const devotion = devotions.find(d => d.date === date);
        
        if (devotion) {
          // Check if cache is still valid (less than 24 hours old)
          const cacheAge = Date.now() - new Date(devotion.cached_at).getTime();
          const oneDay = 24 * 60 * 60 * 1000;
          
          if (cacheAge < oneDay) {
            return devotion;
          }
        }
      }
    } catch (error) {
      console.error('Error getting cached devotion:', error);
    }

    return null;
  }

  async getTodaysDevotion(): Promise<CachedDevotion | null> {
    const today = new Date().toLocaleDateString('en-CA');
    return this.getCachedDevotion(today);
  }

  // Bible content caching
  async cacheBibleChapter(book: string, chapter: number): Promise<void> {
    if (!this.isSupported) return;

    try {
      // In a real implementation, this would fetch from a Bible API
      // For now, we'll store sample content
      const verses = this.generateSampleVerses(book, chapter);
      
      const cachedChapter: CachedBibleChapter = {
        book,
        chapter,
        verses,
        cached_at: new Date().toISOString(),
      };

      const cacheKey = `${BIBLE_CACHE_KEY}-${book}-${chapter}`;
      localStorage.setItem(cacheKey, JSON.stringify(cachedChapter));
    } catch (error) {
      console.error('Error caching Bible chapter:', error);
    }
  }

  async getCachedBibleChapter(book: string, chapter: number): Promise<CachedBibleChapter | null> {
    if (!this.isSupported) return null;

    try {
      const cacheKey = `${BIBLE_CACHE_KEY}-${book}-${chapter}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        const chapter: CachedBibleChapter = JSON.parse(cached);
        
        // Bible content doesn't expire, but check if it's reasonable fresh
        const cacheAge = Date.now() - new Date(chapter.cached_at).getTime();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        
        if (cacheAge < oneWeek) {
          return chapter;
        }
      }
    } catch (error) {
      console.error('Error getting cached Bible chapter:', error);
    }

    return null;
  }

  // User data caching
  async cacheUserData(bookmarks: any[], progress: any[]): Promise<void> {
    if (!this.isSupported) return;

    try {
      const userData: CachedUserData = {
        bookmarks,
        progress,
        cached_at: new Date().toISOString(),
      };

      localStorage.setItem(USER_DATA_CACHE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error caching user data:', error);
    }
  }

  async getCachedUserData(): Promise<CachedUserData | null> {
    if (!this.isSupported) return null;

    try {
      const cached = localStorage.getItem(USER_DATA_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.error('Error getting cached user data:', error);
    }

    return null;
  }

  // Network status utilities
  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  // Background sync utilities
  async scheduleBackgroundSync(tag: string): Promise<void> {
    if (!this.isSupported || !('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
    } catch (error) {
      console.error('Error scheduling background sync:', error);
    }
  }

  async syncDevotionProgress(devotionId: string, progressData: any): Promise<void> {
    if (!this.isSupported) return;

    try {
      // Store pending sync data
      const pendingSync = localStorage.getItem('pending-sync') || '[]';
      const pending = JSON.parse(pendingSync);
      
      pending.push({
        type: 'devotion-progress',
        devotionId,
        data: progressData,
        timestamp: new Date().toISOString(),
      });

      localStorage.setItem('pending-sync', JSON.stringify(pending));
      
      // Schedule background sync
      await this.scheduleBackgroundSync('devotion-progress-sync');
    } catch (error) {
      console.error('Error syncing devotion progress:', error);
    }
  }

  async syncPrayerData(prayerData: any): Promise<void> {
    if (!this.isSupported) return;

    try {
      // Store pending sync data
      const pendingSync = localStorage.getItem('pending-sync') || '[]';
      const pending = JSON.parse(pendingSync);
      
      pending.push({
        type: 'prayer-data',
        data: prayerData,
        timestamp: new Date().toISOString(),
      });

      localStorage.setItem('pending-sync', JSON.stringify(pending));
      
      // Schedule background sync
      await this.scheduleBackgroundSync('prayer-data-sync');
    } catch (error) {
      console.error('Error syncing prayer data:', error);
    }
  }

  // Clear cache utilities
  async clearExpiredCache(): Promise<void> {
    if (!this.isSupported) return;

    try {
      const now = Date.now();
      const oneWeek = 7 * 24 * 60 * 60 * 1000;

      // Clear expired devotions
      const devotions = localStorage.getItem(DEVOTIONS_CACHE_KEY);
      if (devotions) {
        const parsed: CachedDevotion[] = JSON.parse(devotions);
        const valid = parsed.filter(d => {
          const age = now - new Date(d.cached_at).getTime();
          return age < oneWeek;
        });
        localStorage.setItem(DEVOTIONS_CACHE_KEY, JSON.stringify(valid));
      }

      // Clear expired Bible chapters
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(BIBLE_CACHE_KEY)) {
          try {
            const cached = localStorage.getItem(key);
            if (cached) {
              const chapter: CachedBibleChapter = JSON.parse(cached);
              const age = now - new Date(chapter.cached_at).getTime();
              if (age > oneWeek) {
                localStorage.removeItem(key);
              }
            }
          } catch (error) {
            // Remove corrupted cache entries
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  }

  // Helper method to generate sample verses (would be replaced with real Bible API)
  private generateSampleVerses(book: string, chapter: number) {
    if (book === 'Psalms' && chapter === 23) {
      return [
        { verse: 1, text: 'The Lord is my shepherd, I lack nothing.', text_zh: '耶和華是我的牧者，我必不致缺乏。' },
        { verse: 2, text: 'He makes me lie down in green pastures, he leads me beside quiet waters,', text_zh: '他使我躺臥在青草地上，領我在可安歇的水邊。' },
        { verse: 3, text: 'he refreshes my soul. He guides me along the right paths for his name\'s sake.', text_zh: '他使我的靈魂甦醒，為自己的名引導我走義路。' },
        { verse: 4, text: 'Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.', text_zh: '我雖然行過死蔭的幽谷，也不怕遭害，因為你與我同在；你的杖，你的竿，都安慰我。' },
        { verse: 5, text: 'You prepare a table before me in the presence of my enemies. You anoint my head with oil; my cup overflows.', text_zh: '在我敵人面前，你為我擺設筵席；你用油膏了我的頭，使我的福杯滿溢。' },
        { verse: 6, text: 'Surely your goodness and love will follow me all the days of my life, and I will dwell in the house of the Lord forever.', text_zh: '我一生一世必有恩惠慈愛隨著我；我且要住在耶和華的殿中，直到永遠。' }
      ];
    }

    // Generate placeholder verses for other chapters
    const verseCount = Math.floor(Math.random() * 20) + 5;
    return Array.from({ length: verseCount }, (_, i) => ({
      verse: i + 1,
      text: `This is verse ${i + 1} of ${book} chapter ${chapter}. In a real implementation, this would contain the actual Bible text from a reliable source.`,
      text_zh: `這是${book}第${chapter}章第${i + 1}節。在實際實現中，這將包含來自可靠來源的實際聖經文本。`
    }));
  }
}

// Export singleton instance
export const offlineCache = new OfflineCache();