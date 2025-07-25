import { useEffect } from 'react';

// Cache Optimizer - Implements long cache lifetimes for static resources and API responses
export function CacheOptimizer() {
  useEffect(() => {
    implementCacheStrategy();
    setupServiceWorkerCaching();
    optimizeAPIResponseCaching();
    implementLocalStorageCaching();
    
    return () => {
      cleanup();
    };
  }, []);

  // Implement comprehensive caching strategy
  const implementCacheStrategy = () => {
    // Set cache headers for static resources
    setCacheHeaders();
    
    // Implement browser cache optimizations
    optimizeBrowserCache();
    
    // Setup resource versioning for cache busting
    setupResourceVersioning();
    
    console.debug('Cache optimization strategy implemented');
  };

  // Set optimal cache headers for different resource types
  const setCacheHeaders = () => {
    // Override fetch to add cache headers for API requests
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      const options = { ...init };
      
      // Add cache headers based on resource type
      if (url.includes('/api/')) {
        options.headers = {
          ...options.headers,
          'Cache-Control': getCacheHeaderForAPI(url),
        };
      }
      
      try {
        const response = await originalFetch(input, options);
        
        // Cache successful responses in browser cache
        if (response.ok && shouldCacheResponse(url)) {
          cacheResponse(url, response.clone());
        }
        
        return response;
      } catch (error) {
        // Try to serve from cache if network fails
        const cachedResponse = await getCachedResponse(url);
        if (cachedResponse) {
          console.debug(`Serving ${url} from cache due to network error`);
          return cachedResponse;
        }
        throw error;
      }
    };
  };

  // Get appropriate cache header for API endpoints
  const getCacheHeaderForAPI = (url: string): string => {
    // Static content - cache for 1 year
    if (url.includes('/api/placeholder/') || 
        url.includes('/api/gallery') ||
        url.includes('/api/services')) {
      return 'public, max-age=31536000, immutable'; // 1 year
    }
    
    // Semi-static content - cache for 1 hour
    if (url.includes('/api/settings') || 
        url.includes('/api/seo/') ||
        url.includes('/api/amenities')) {
      return 'public, max-age=3600, stale-while-revalidate=86400'; // 1 hour, stale for 1 day
    }
    
    // Dynamic content - cache for 5 minutes
    if (url.includes('/api/blog-posts') || 
        url.includes('/api/custom-scripts')) {
      return 'public, max-age=300, stale-while-revalidate=3600'; // 5 minutes, stale for 1 hour
    }
    
    // Analytics and user-specific - no cache
    if (url.includes('/api/analytics') || 
        url.includes('/api/admin/')) {
      return 'no-cache, no-store, must-revalidate';
    }
    
    // Default - cache for 5 minutes
    return 'public, max-age=300, stale-while-revalidate=1800';
  };

  // Optimize browser cache usage
  const optimizeBrowserCache = () => {
    // Add cache-friendly resource hints
    const resourceHints = [
      // Preload critical cached resources
      { href: '/api/settings', as: 'fetch', crossOrigin: 'anonymous' },
      { href: '/api/services', as: 'fetch', crossOrigin: 'anonymous' },
      { href: '/api/seo/home', as: 'fetch', crossOrigin: 'anonymous' },
    ];

    resourceHints.forEach(hint => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = hint.href;
      link.as = hint.as;
      if (hint.crossOrigin) link.crossOrigin = hint.crossOrigin;
      
      // Add cache control for preloaded resources
      link.addEventListener('load', () => {
        console.debug(`Preloaded and cached: ${hint.href}`);
      });
      
      document.head.appendChild(link);
    });
  };

  // Setup resource versioning for cache busting when needed
  const setupResourceVersioning = () => {
    // Add version parameter to resources that need cache busting
    const versionedResources = document.querySelectorAll('script[src], link[href]');
    const version = getResourceVersion();
    
    versionedResources.forEach(resource => {
      const element = resource as HTMLScriptElement | HTMLLinkElement;
      let url: string;
      
      if (element.tagName === 'SCRIPT') {
        url = (element as HTMLScriptElement).src;
      } else {
        url = (element as HTMLLinkElement).href;
      }
      
      // Only version our own resources, not external ones
      if (url && url.startsWith('/') && !url.includes('?v=')) {
        const separator = url.includes('?') ? '&' : '?';
        const versionedUrl = `${url}${separator}v=${version}`;
        
        if (element.tagName === 'SCRIPT') {
          (element as HTMLScriptElement).src = versionedUrl;
        } else {
          (element as HTMLLinkElement).href = versionedUrl;
        }
      }
    });
  };

  // Get current resource version (based on app version or build time)
  const getResourceVersion = (): string => {
    // Use build timestamp or app version for cache busting
    return Date.now().toString(36); // Base36 for shorter URLs
  };

  // Setup Service Worker caching for offline support
  const setupServiceWorkerCaching = () => {
    if ('serviceWorker' in navigator) {
      // Enhanced service worker with aggressive caching
      const swCode = `
        const CACHE_NAME = 'farmfeast-v1';
        const STATIC_CACHE_NAME = 'farmfeast-static-v1';
        const API_CACHE_NAME = 'farmfeast-api-v1';
        
        // Resources to cache immediately
        const STATIC_RESOURCES = [
          '/',
          '/services',
          '/gallery',
          '/contact',
          '/api/settings',
          '/api/services',
          '/api/amenities',
          '/api/seo/home'
        ];
        
        // Install event - cache static resources
        self.addEventListener('install', (event) => {
          event.waitUntil(
            Promise.all([
              caches.open(STATIC_CACHE_NAME).then(cache => 
                cache.addAll(STATIC_RESOURCES)
              ),
              caches.open(API_CACHE_NAME)
            ])
          );
          self.skipWaiting();
        });
        
        // Fetch event - serve from cache with network fallback
        self.addEventListener('fetch', (event) => {
          const { request } = event;
          const url = new URL(request.url);
          
          // Handle API requests with stale-while-revalidate
          if (url.pathname.startsWith('/api/')) {
            event.respondWith(staleWhileRevalidate(request));
          }
          // Handle static resources with cache-first
          else {
            event.respondWith(cacheFirst(request));
          }
        });
        
        // Cache-first strategy for static resources
        async function cacheFirst(request) {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          
          try {
            const networkResponse = await fetch(request);
            if (networkResponse.ok) {
              const cache = await caches.open(STATIC_CACHE_NAME);
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          } catch (error) {
            // Return offline fallback if available
            return new Response('Offline', { status: 503 });
          }
        }
        
        // Stale-while-revalidate for API requests
        async function staleWhileRevalidate(request) {
          const cache = await caches.open(API_CACHE_NAME);
          const cachedResponse = await cache.match(request);
          
          // Start network request in background
          const networkResponsePromise = fetch(request).then(response => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
          
          // Return cached version immediately if available
          if (cachedResponse) {
            // Update cache in background
            networkResponsePromise.catch(() => {
              console.debug('Background update failed for:', request.url);
            });
            return cachedResponse;
          }
          
          // Wait for network if no cache available
          return networkResponsePromise;
        }
      `;
      
      // Register service worker with enhanced caching
      const blob = new Blob([swCode], { type: 'application/javascript' });
      const swUrl = URL.createObjectURL(blob);
      
      navigator.serviceWorker.register(swUrl)
        .then(registration => {
          console.debug('Service Worker registered with caching strategy');
          
          // Update service worker when new version available
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New service worker available - refresh for updates');
                }
              });
            }
          });
        })
        .catch(error => {
          console.debug('Service Worker registration failed:', error);
        });
    }
  };

  // Optimize API response caching with localStorage
  const optimizeAPIResponseCaching = () => {
    // Cache API responses in localStorage for faster subsequent loads
    const cachedEndpoints = [
      '/api/settings',
      '/api/services', 
      '/api/amenities',
      '/api/seo/home',
      '/api/reviews/seo'
    ];
    
    cachedEndpoints.forEach(endpoint => {
      // Check if we have cached data
      const cacheKey = `api_cache_${endpoint.replace(/\//g, '_')}`;
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
      
      if (cachedData && cacheTimestamp) {
        const age = Date.now() - parseInt(cacheTimestamp);
        const maxAge = endpoint.includes('settings') ? 3600000 : 300000; // 1 hour vs 5 minutes
        
        if (age < maxAge) {
          // Serve from localStorage cache immediately
          console.debug(`Serving ${endpoint} from localStorage cache`);
          
          // Dispatch cached data to any listening components
          window.dispatchEvent(new CustomEvent('api-cache-hit', {
            detail: { endpoint, data: JSON.parse(cachedData) }
          }));
        } else {
          // Remove expired cache
          localStorage.removeItem(cacheKey);
          localStorage.removeItem(`${cacheKey}_timestamp`);
        }
      }
    });
  };

  // Implement localStorage caching for API responses
  const implementLocalStorageCaching = () => {
    // Listen for successful API responses to cache them
    window.addEventListener('fetch-success', ((event: CustomEvent) => {
      const { url, data } = event.detail;
      
      if (shouldCacheInLocalStorage(url)) {
        const cacheKey = `api_cache_${url.replace(/\//g, '_')}`;
        
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data));
          localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
          console.debug(`Cached ${url} in localStorage`);
        } catch (error) {
          // Handle localStorage quota exceeded
          console.debug('localStorage cache failed, clearing old entries');
          clearOldCacheEntries();
        }
      }
    }) as EventListener);
  };

  // Check if response should be cached
  const shouldCacheResponse = (url: string): boolean => {
    // Don't cache analytics or admin endpoints
    if (url.includes('/api/analytics') || 
        url.includes('/api/admin/') ||
        url.includes('POST') ||
        url.includes('PUT') ||
        url.includes('DELETE')) {
      return false;
    }
    
    return true;
  };

  // Check if response should be cached in localStorage
  const shouldCacheInLocalStorage = (url: string): boolean => {
    const cachableEndpoints = [
      '/api/settings',
      '/api/services',
      '/api/amenities', 
      '/api/seo/',
      '/api/reviews/seo',
      '/api/gallery'
    ];
    
    return cachableEndpoints.some(endpoint => url.includes(endpoint));
  };

  // Cache response in memory/browser cache
  const cacheResponse = async (url: string, response: Response) => {
    try {
      if ('caches' in window) {
        const cache = await caches.open('api-responses-v1');
        await cache.put(url, response);
      }
    } catch (error) {
      console.debug('Failed to cache response:', error);
    }
  };

  // Get cached response
  const getCachedResponse = async (url: string): Promise<Response | null> => {
    try {
      if ('caches' in window) {
        const cache = await caches.open('api-responses-v1');
        const cachedResponse = await cache.match(url);
        return cachedResponse || null;
      }
    } catch (error) {
      console.debug('Failed to get cached response:', error);
    }
    return null;
  };

  // Clear old cache entries to prevent storage quota issues
  const clearOldCacheEntries = () => {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith('api_cache_'));
    
    // Remove oldest entries if we have too many
    if (cacheKeys.length > 50) {
      const timestampKeys = keys.filter(key => key.endsWith('_timestamp'));
      const sortedByAge = timestampKeys
        .map(key => ({
          key: key.replace('_timestamp', ''),
          timestamp: parseInt(localStorage.getItem(key) || '0')
        }))
        .sort((a, b) => a.timestamp - b.timestamp);
      
      // Remove oldest 25% of entries
      const toRemove = sortedByAge.slice(0, Math.floor(sortedByAge.length * 0.25));
      toRemove.forEach(({ key }) => {
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}_timestamp`);
      });
    }
  };

  // Cleanup function
  const cleanup = () => {
    // Restore original fetch if needed
    console.debug('Cache optimizer cleanup completed');
  };

  return null;
}

// Hook for cache monitoring
export function useCacheMonitoring() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // Monitor cache hit rates
    let cacheHits = 0;
    let cacheMisses = 0;

    const logCacheStats = () => {
      const hitRate = cacheHits / (cacheHits + cacheMisses) * 100;
      console.group('📊 Cache Performance');
      console.log(`Cache hits: ${cacheHits}`);
      console.log(`Cache misses: ${cacheMisses}`);
      console.log(`Hit rate: ${hitRate.toFixed(1)}%`);
      console.groupEnd();
    };

    // Listen for cache events
    window.addEventListener('api-cache-hit', () => cacheHits++);
    window.addEventListener('api-cache-miss', () => cacheMisses++);

    // Log stats every 30 seconds
    const interval = setInterval(logCacheStats, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);
}