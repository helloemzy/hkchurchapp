import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

// Loading component for dynamic imports
const DynamicLoadingComponent = () => (
  <div className="flex items-center justify-center p-8">
    <LoadingSpinner size="lg" />
  </div>
);

// Error component for failed dynamic imports
const DynamicErrorComponent = ({ error }: { error?: Error }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="text-4xl mb-2">⚠️</div>
      <p className="text-gray-600">Failed to load component</p>
      {process.env.NODE_ENV === 'development' && error && (
        <p className="text-xs text-red-500 mt-2">{error.message}</p>
      )}
    </div>
  </div>
);

// Configuration for different types of components
const importConfigs = {
  // Heavy components that should be loaded on demand
  heavy: {
    loading: DynamicLoadingComponent,
    ssr: false, // Client-side only for heavy components
  },
  // Critical components that need SSR but can be lazy-loaded
  critical: {
    loading: DynamicLoadingComponent,
    ssr: true,
  },
  // Non-critical components that can be fully deferred
  deferred: {
    loading: DynamicLoadingComponent,
    ssr: false,
    suspense: true,
  },
  // Interactive components that need immediate loading
  interactive: {
    loading: DynamicLoadingComponent,
    ssr: false,
  },
};

// Generic dynamic import wrapper with performance monitoring
export function createDynamicImport<T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: {
    type?: keyof typeof importConfigs;
    name?: string;
    preload?: boolean;
  } = {}
) {
  const { type = 'heavy', name = 'Unknown Component', preload = false } = options;
  const config = importConfigs[type];

  // Monitor import performance
  const monitoredImportFn = async () => {
    const startTime = performance.now();
    
    try {
      const module = await importFn();
      const loadTime = performance.now() - startTime;
      
      // Log slow imports
      if (loadTime > 1000) {
        console.warn(`Slow dynamic import: ${name} took ${loadTime.toFixed(2)}ms`);
        
        // Send to analytics
        if (typeof window !== 'undefined' && window.va) {
          window.va('track', 'Slow Dynamic Import', {
            component: name,
            loadTime: Math.round(loadTime),
            type,
          });
        }
      }
      
      return module;
    } catch (error) {
      console.error(`Failed to load dynamic component: ${name}`, error);
      
      // Send error to analytics
      if (typeof window !== 'undefined' && window.va) {
        window.va('track', 'Dynamic Import Error', {
          component: name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      
      throw error;
    }
  };

  // Create the dynamic component
  const DynamicComponent = dynamic(monitoredImportFn, {
    ...config,
    loading: ({ error }) => {
      if (error) {
        return <DynamicErrorComponent error={error} />;
      }
      return <DynamicLoadingComponent />;
    },
  });

  // Preload if requested
  if (preload && typeof window !== 'undefined') {
    // Use requestIdleCallback to preload during idle time
    const preloadFn = () => {
      importFn().catch(console.error);
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(preloadFn, { timeout: 2000 });
    } else {
      setTimeout(preloadFn, 100);
    }
  }

  return DynamicComponent;
}

// Specific dynamic imports for common heavy components

// Performance Dashboard (heavy charts and data visualization)
export const DynamicPerformanceDashboard = createDynamicImport(
  () => import('../../components/performance/PerformanceDashboard'),
  { type: 'heavy', name: 'Performance Dashboard' }
);

// Settings/Admin panels (complex forms and configurations)
export const DynamicSettingsPanel = createDynamicImport(
  () => import('../../components/settings/SettingsPanel').then(mod => ({ default: mod.default || mod })),
  { type: 'deferred', name: 'Settings Panel' }
);

// Rich text editor for content creation
export const DynamicRichTextEditor = createDynamicImport(
  () => import('../../components/editor/RichTextEditor').then(mod => ({ default: mod.default || mod })),
  { type: 'heavy', name: 'Rich Text Editor' }
);

// Calendar/date picker components
export const DynamicCalendar = createDynamicImport(
  () => import('../../components/calendar/Calendar').then(mod => ({ default: mod.default || mod })),
  { type: 'interactive', name: 'Calendar' }
);

// Charts and data visualization
export const DynamicCharts = createDynamicImport(
  () => import('../../components/charts/Charts').then(mod => ({ default: mod.default || mod })),
  { type: 'heavy', name: 'Charts' }
);

// Image gallery with lightbox
export const DynamicImageGallery = createDynamicImport(
  () => import('../../components/gallery/ImageGallery').then(mod => ({ default: mod.default || mod })),
  { type: 'interactive', name: 'Image Gallery' }
);

// Video player component
export const DynamicVideoPlayer = createDynamicImport(
  () => import('../../components/media/VideoPlayer').then(mod => ({ default: mod.default || mod })),
  { type: 'heavy', name: 'Video Player' }
);

// Audio player for sermons/worship
export const DynamicAudioPlayer = createDynamicImport(
  () => import('../../components/media/AudioPlayer').then(mod => ({ default: mod.default || mod })),
  { type: 'interactive', name: 'Audio Player' }
);

// Chat/messaging components
export const DynamicChat = createDynamicImport(
  () => import('../../components/chat/Chat').then(mod => ({ default: mod.default || mod })),
  { type: 'interactive', name: 'Chat', preload: true }
);

// Social sharing components
export const DynamicSocialShare = createDynamicImport(
  () => import('../../components/social/SocialShare').then(mod => ({ default: mod.default || mod })),
  { type: 'deferred', name: 'Social Share' }
);

// Route-based dynamic imports for page-level components

// Admin dashboard page
export const DynamicAdminDashboard = createDynamicImport(
  () => import('../../app/admin/page').then(mod => ({ default: mod.default })),
  { type: 'heavy', name: 'Admin Dashboard' }
);

// User profile page
export const DynamicUserProfile = createDynamicImport(
  () => import('../../app/profile/page').then(mod => ({ default: mod.default })),
  { type: 'critical', name: 'User Profile' }
);

// Helper function to preload components based on user interaction
export function preloadComponent(
  importFn: () => Promise<any>,
  trigger: 'hover' | 'focus' | 'intersection' = 'hover'
) {
  let isPreloaded = false;

  const preload = () => {
    if (!isPreloaded) {
      isPreloaded = true;
      importFn().catch(console.error);
    }
  };

  return {
    preload,
    onMouseEnter: trigger === 'hover' ? preload : undefined,
    onFocus: trigger === 'focus' ? preload : undefined,
    'data-preload-trigger': trigger,
  };
}

// Intersection Observer-based preloading
export function useIntersectionPreload(
  importFn: () => Promise<any>,
  options: IntersectionObserverInit = { rootMargin: '200px' }
) {
  return (element: HTMLElement | null) => {
    if (!element || typeof window === 'undefined') return;

    let isPreloaded = false;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isPreloaded) {
          isPreloaded = true;
          importFn().catch(console.error);
          observer.disconnect();
        }
      });
    }, options);

    observer.observe(element);

    return () => observer.disconnect();
  };
}