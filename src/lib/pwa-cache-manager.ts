// PWA cache management for Bible and devotional content

interface CacheConfig {
  name: string;
  maxEntries: number;
  maxAgeSeconds: number;
}

const CACHE_CONFIGS: Record<string, CacheConfig> = {
  devotions: {
    name: 'devotions-v1',
    maxEntries: 50,
    maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
  },
  bible: {
    name: 'bible-chapters-v1',
    maxEntries: 100,
    maxAgeSeconds: 30 * 24 * 60 * 60, // 1 month
  },
  prayers: {
    name: 'prayers-v1',
    maxEntries: 100,
    maxAgeSeconds: 24 * 60 * 60, // 1 day
  },
  userdata: {
    name: 'user-data-v1',
    maxEntries: 20,
    maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
  },
};

export class PWACacheManager {
  private isSupported: boolean;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'caches' in window;
  }

  async init(): Promise<void> {
    if (!this.isSupported) return;

    // Register service worker message listeners
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', this.handleSWMessage.bind(this));
    }

    // Schedule initial cache preload
    setTimeout(() => {
      this.preloadEssentialContent();
    }, 2000);
  }

  private handleSWMessage(event: MessageEvent) {
    if (event.data?.type === 'CACHE_UPDATED') {
      // Notify app of cache updates
      window.dispatchEvent(new CustomEvent('cacheUpdated', {
        detail: event.data
      }));
    }
  }

  // Preload essential content for offline use
  async preloadEssentialContent(): Promise<void> {
    if (!this.isSupported || !navigator.onLine) return;

    try {
      // Preload today's and tomorrow's devotions
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      await Promise.all([
        this.cacheDevotionForDate(today.toLocaleDateString('en-CA')),
        this.cacheDevotionForDate(tomorrow.toLocaleDateString('en-CA')),
      ]);

      // Cache popular Bible chapters
      const popularChapters = [
        { book: 'Psalms', chapter: 23 },
        { book: 'John', chapter: 3 },
        { book: 'Romans', chapter: 8 },
        { book: 'Matthew', chapter: 5 },
        { book: '1 Corinthians', chapter: 13 },
      ];

      await Promise.all(
        popularChapters.map(({ book, chapter }) =>
          this.cacheBibleChapter(book, chapter)
        )
      );
    } catch (error) {
      console.error('Error preloading essential content:', error);
    }
  }

  // Cache specific devotion
  async cacheDevotionForDate(date: string): Promise<void> {
    if (!this.isSupported) return;

    try {
      const url = `/api/devotions/today?lang=en&date=${date}`;
      const cache = await caches.open(CACHE_CONFIGS.devotions.name);
      
      // Check if already cached and fresh
      const cachedResponse = await cache.match(url);
      if (cachedResponse) {
        const cacheDate = cachedResponse.headers.get('sw-cache-date');
        if (cacheDate) {
          const age = Date.now() - new Date(cacheDate).getTime();
          if (age < CACHE_CONFIGS.devotions.maxAgeSeconds * 1000) {
            return; // Still fresh
          }
        }
      }

      // Fetch and cache
      const response = await fetch(url);
      if (response.ok) {
        const clonedResponse = response.clone();
        // Add custom headers for cache management
        const responseWithHeaders = new Response(clonedResponse.body, {
          status: clonedResponse.status,
          statusText: clonedResponse.statusText,
          headers: {
            ...Object.fromEntries(clonedResponse.headers.entries()),
            'sw-cache-date': new Date().toISOString(),
            'sw-cache-type': 'devotion',
          },
        });
        await cache.put(url, responseWithHeaders);
      }
    } catch (error) {
      console.error(`Error caching devotion for ${date}:`, error);
    }
  }

  // Cache Bible chapter
  async cacheBibleChapter(book: string, chapter: number): Promise<void> {
    if (!this.isSupported) return;

    try {
      const cache = await caches.open(CACHE_CONFIGS.bible.name);
      const cacheKey = `bible-${book}-${chapter}`;
      
      // For now, store sample content since we don't have a real Bible API
      const sampleContent = this.generateSampleBibleChapter(book, chapter);
      
      const response = new Response(JSON.stringify(sampleContent), {
        headers: {
          'Content-Type': 'application/json',
          'sw-cache-date': new Date().toISOString(),
          'sw-cache-type': 'bible-chapter',
        },
      });

      await cache.put(cacheKey, response);
    } catch (error) {
      console.error(`Error caching Bible chapter ${book} ${chapter}:`, error);
    }
  }

  // Get cached Bible chapter
  async getCachedBibleChapter(book: string, chapter: number): Promise<any | null> {
    if (!this.isSupported) return null;

    try {
      const cache = await caches.open(CACHE_CONFIGS.bible.name);
      const cacheKey = `bible-${book}-${chapter}`;
      const cachedResponse = await cache.match(cacheKey);

      if (cachedResponse) {
        return await cachedResponse.json();
      }
    } catch (error) {
      console.error(`Error getting cached Bible chapter:`, error);
    }

    return null;
  }

  // Cache user data (bookmarks, progress)
  async cacheUserData(userId: string, type: 'bookmarks' | 'progress', data: any): Promise<void> {
    if (!this.isSupported || !userId) return;

    try {
      const cache = await caches.open(CACHE_CONFIGS.userdata.name);
      const cacheKey = `user-${userId}-${type}`;
      
      const response = new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'sw-cache-date': new Date().toISOString(),
          'sw-cache-type': `user-${type}`,
        },
      });

      await cache.put(cacheKey, response);
    } catch (error) {
      console.error(`Error caching user ${type}:`, error);
    }
  }

  // Get cached user data
  async getCachedUserData(userId: string, type: 'bookmarks' | 'progress'): Promise<any | null> {
    if (!this.isSupported || !userId) return null;

    try {
      const cache = await caches.open(CACHE_CONFIGS.userdata.name);
      const cacheKey = `user-${userId}-${type}`;
      const cachedResponse = await cache.match(cacheKey);

      if (cachedResponse) {
        const cacheDate = cachedResponse.headers.get('sw-cache-date');
        if (cacheDate) {
          const age = Date.now() - new Date(cacheDate).getTime();
          // Check if still fresh
          if (age < CACHE_CONFIGS.userdata.maxAgeSeconds * 1000) {
            return await cachedResponse.json();
          }
        }
      }
    } catch (error) {
      console.error(`Error getting cached user ${type}:`, error);
    }

    return null;
  }

  // Background sync for offline actions
  async queueOfflineAction(action: {
    type: string;
    endpoint: string;
    method: string;
    data: any;
  }): Promise<void> {
    if (!this.isSupported) return;

    try {
      // Store in IndexedDB or localStorage for background sync
      const offlineActions = JSON.parse(localStorage.getItem('offline-actions') || '[]');
      offlineActions.push({
        ...action,
        timestamp: new Date().toISOString(),
        id: Date.now().toString(),
      });
      localStorage.setItem('offline-actions', JSON.stringify(offlineActions));

      // Schedule background sync if available
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('offline-actions-sync');
      }
    } catch (error) {
      console.error('Error queuing offline action:', error);
    }
  }

  // Sync offline actions when back online
  async syncOfflineActions(): Promise<void> {
    if (!this.isSupported || !navigator.onLine) return;

    try {
      const offlineActions = JSON.parse(localStorage.getItem('offline-actions') || '[]');
      if (offlineActions.length === 0) return;

      const results = await Promise.allSettled(
        offlineActions.map(async (action: any) => {
          const response = await fetch(action.endpoint, {
            method: action.method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(action.data),
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          return action.id;
        })
      );

      // Remove successfully synced actions
      const successfulIds = results
        .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
        .map(result => result.value);

      if (successfulIds.length > 0) {
        const remainingActions = offlineActions.filter(
          (action: any) => !successfulIds.includes(action.id)
        );
        localStorage.setItem('offline-actions', JSON.stringify(remainingActions));
      }

      // Log failed syncs
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        console.warn(`${failures.length} offline actions failed to sync`);
      }
    } catch (error) {
      console.error('Error syncing offline actions:', error);
    }
  }

  // Network status monitoring
  setupNetworkListeners(): void {
    if (!this.isSupported) return;

    window.addEventListener('online', () => {
      console.log('Back online - syncing offline actions');
      this.syncOfflineActions();
    });

    window.addEventListener('offline', () => {
      console.log('Gone offline - queuing actions for later sync');
    });
  }

  // Clean up expired cache entries
  async cleanupExpiredCache(): Promise<void> {
    if (!this.isSupported) return;

    try {
      const cacheNames = await caches.keys();
      
      await Promise.all(
        cacheNames.map(async (cacheName) => {
          const cache = await caches.open(cacheName);
          const requests = await cache.keys();
          
          await Promise.all(
            requests.map(async (request) => {
              const response = await cache.match(request);
              if (response) {
                const cacheDate = response.headers.get('sw-cache-date');
                if (cacheDate) {
                  const age = Date.now() - new Date(cacheDate).getTime();
                  const config = Object.values(CACHE_CONFIGS).find(c => 
                    cacheName.includes(c.name.split('-')[0])
                  );
                  
                  if (config && age > config.maxAgeSeconds * 1000) {
                    await cache.delete(request);
                  }
                }
              }
            })
          );
        })
      );
    } catch (error) {
      console.error('Error cleaning up expired cache:', error);
    }
  }

  // Generate sample Bible content (would be replaced with real API)
  private generateSampleBibleChapter(book: string, chapter: number) {
    if (book === 'Psalms' && chapter === 23) {
      return {
        book: 'Psalms',
        chapter: 23,
        verses: [
          { verse: 1, text: 'The Lord is my shepherd, I lack nothing.', text_zh: '耶和華是我的牧者，我必不致缺乏。' },
          { verse: 2, text: 'He makes me lie down in green pastures, he leads me beside quiet waters,', text_zh: '他使我躺臥在青草地上，領我在可安歇的水邊。' },
          { verse: 3, text: 'he refreshes my soul. He guides me along the right paths for his name\'s sake.', text_zh: '他使我的靈魂甦醒，為自己的名引導我走義路。' },
          { verse: 4, text: 'Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.', text_zh: '我雖然行過死蔭的幽谷，也不怕遭害，因為你與我同在；你的杖，你的竿，都安慰我。' },
          { verse: 5, text: 'You prepare a table before me in the presence of my enemies. You anoint my head with oil; my cup overflows.', text_zh: '在我敵人面前，你為我擺設筵席；你用油膏了我的頭，使我的福杯滿溢。' },
          { verse: 6, text: 'Surely your goodness and love will follow me all the days of my life, and I will dwell in the house of the Lord forever.', text_zh: '我一生一世必有恩惠慈愛隨著我；我且要住在耶和華的殿中，直到永遠。' }
        ]
      };
    }

    // Generate placeholder verses for other chapters
    const verseCount = Math.floor(Math.random() * 20) + 5;
    return {
      book,
      chapter,
      verses: Array.from({ length: verseCount }, (_, i) => ({
        verse: i + 1,
        text: `This is verse ${i + 1} of ${book} chapter ${chapter}. In a real implementation, this would contain the actual Bible text.`,
        text_zh: `這是${book}第${chapter}章第${i + 1}節。在實際實現中，這將包含實際的聖經文本。`
      }))
    };
  }
}

// Export singleton instance
export const pwaCacheManager = new PWACacheManager();