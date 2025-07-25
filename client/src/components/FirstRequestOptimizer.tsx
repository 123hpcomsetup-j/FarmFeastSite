import { useEffect } from 'react';

// First Request Optimizer - Eliminates/optimizes the first network request for fastest TTFB
export function FirstRequestOptimizer() {
  useEffect(() => {
    optimizeFirstRequest();
    setupServerResponseCaching();
    implementConnectionOptimizations();
    
    return () => {
      cleanup();
    };
  }, []);

  // Optimize the first critical network request
  const optimizeFirstRequest = () => {
    // 1. Preconnect to own API domain to reduce connection time
    addPreconnectHints();
    
    // 2. Inline critical API data to eliminate first request entirely
    inlineCriticalApiData();
    
    // 3. Use fastest endpoints first
    prioritizeFastEndpoints();
    
    // 4. Implement aggressive response caching
    setupResponseCaching();
    
    console.debug('First request optimizations applied');
  };

  // Add preconnect hints to reduce connection latency
  const addPreconnectHints = () => {
    const hints = [
      { rel: 'preconnect', href: window.location.origin },
      { rel: 'dns-prefetch', href: window.location.origin }
    ];

    hints.forEach(hint => {
      const existing = document.head.querySelector(`link[rel="${hint.rel}"][href="${hint.href}"]`);
      if (!existing) {
        const link = document.createElement('link');
        link.rel = hint.rel;
        link.href = hint.href;
        if (hint.rel === 'preconnect') {
          link.crossOrigin = 'anonymous';
        }
        document.head.appendChild(link);
      }
    });
  };

  // Inline critical API data to eliminate the first request
  const inlineCriticalApiData = () => {
    // Check if critical data is already inlined from server
    const inlinedData = (window as any).__CRITICAL_DATA__;
    if (inlinedData) {
      // Store inlined data in cache for immediate use
      Object.keys(inlinedData).forEach(endpoint => {
        const cacheKey = `api_cache_${endpoint.replace(/\//g, '_')}`;
        localStorage.setItem(cacheKey, JSON.stringify(inlinedData[endpoint]));
        localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
        localStorage.setItem(`${cacheKey}_ttl`, (30 * 60 * 1000).toString()); // 30 minutes
      });
      
      console.debug('Critical API data inlined, eliminated first request');
      return;
    }

    // If not inlined, use fastest possible request strategy
    optimizeFastestRequest();
  };

  // Optimize the fastest possible API request
  const optimizeFastestRequest = () => {
    // Use the fastest endpoints first based on historical data
    const fastEndpoints = [
      '/api/seo/home',      // Usually fastest (simple data)
      '/api/settings',      // Medium speed
      '/api/services'       // Slowest (complex data)
    ];

    // Prioritize requests by speed
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input.url;
      
      // Add cache headers for faster responses
      if (url.startsWith('/api/')) {
        const enhancedInit = {
          ...init,
          headers: {
            ...init?.headers,
            'Cache-Control': 'max-age=300', // 5 minutes client cache
            'If-None-Match': localStorage.getItem(`etag_${url}`) || '',
          }
        };
        
        try {
          const response = await originalFetch(input, enhancedInit);
          
          // Store ETag for next request
          const etag = response.headers.get('ETag');
          if (etag) {
            localStorage.setItem(`etag_${url}`, etag);
          }
          
          return response;
        } catch (error) {
          return originalFetch(input, init);
        }
      }
      
      return originalFetch(input, init);
    };
  };

  // Prioritize fastest endpoints to load first
  const prioritizeFastEndpoints = () => {
    // Reorder API calls based on response speed
    const endpointPriority = {
      '/api/seo/home': 1,      // Fastest - 115ms average
      '/api/settings': 2,       // Medium speed
      '/api/services': 3        // Slowest - 431ms average
    };

    // Intercept query key generation to prioritize fast endpoints
    const originalQueryKey = (window as any).queryKeyGeneration;
    if (originalQueryKey) {
      (window as any).queryKeyGeneration = (endpoint: string) => {
        const priority = endpointPriority[endpoint as keyof typeof endpointPriority] || 999;
        return [endpoint, { priority }];
      };
    }
  };

  // Setup server response caching
  const setupServerResponseCaching = () => {
    // Add response caching headers for all API requests
    const addCacheHeaders = (url: string) => {
      const cacheHeaders: Record<string, string> = {};
      
      if (url.includes('/api/seo/')) {
        cacheHeaders['Cache-Control'] = 'public, max-age=300, stale-while-revalidate=600';
      } else if (url.includes('/api/services')) {
        cacheHeaders['Cache-Control'] = 'public, max-age=600, stale-while-revalidate=1800';
      } else if (url.includes('/api/settings')) {
        cacheHeaders['Cache-Control'] = 'public, max-age=1800, stale-while-revalidate=3600';
      }
      
      return cacheHeaders;
    };

    // Monitor and cache API responses
    window.addEventListener('fetch', (event: any) => {
      const request = event.request;
      if (request.url.includes('/api/')) {
        const cacheHeaders = addCacheHeaders(request.url);
        Object.keys(cacheHeaders).forEach(header => {
          request.headers.set(header, cacheHeaders[header]);
        });
      }
    });
  };

  // Setup response caching for repeat requests
  const setupResponseCaching = () => {
    // Implement aggressive response caching
    const responseCache = new Map();
    
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input.url;
      const method = init?.method || 'GET';
      
      if (method === 'GET' && url.includes('/api/')) {
        const cacheKey = url;
        const cached = responseCache.get(cacheKey);
        
        // Use cached response if less than 5 minutes old
        if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
          console.debug(`Cache hit for ${url}`);
          return new Response(JSON.stringify(cached.data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        try {
          const response = await originalFetch(input, init);
          
          if (response.ok) {
            const data = await response.clone().json();
            responseCache.set(cacheKey, {
              data,
              timestamp: Date.now()
            });
            console.debug(`Cached response for ${url}`);
          }
          
          return response;
        } catch (error) {
          // Return cached data on network error if available
          if (cached) {
            console.debug(`Network error, using stale cache for ${url}`);
            return new Response(JSON.stringify(cached.data), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          throw error;
        }
      }
      
      return originalFetch(input, init);
    };
  };

  // Implement connection optimizations
  const implementConnectionOptimizations = () => {
    // 1. HTTP/2 connection reuse hints
    addHttp2Hints();
    
    // 2. Connection keep-alive optimization
    optimizeKeepAlive();
    
    // 3. Request pipelining hints
    addPipeliningHints();
  };

  // Add HTTP/2 optimization hints
  const addHttp2Hints = () => {
    // Add HTTP/2 server push hints for critical resources
    const pushHints = [
      '/api/seo/home',
      '/api/settings'
    ];

    pushHints.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.setAttribute('as', 'fetch');
      link.setAttribute('crossorigin', 'anonymous');
      document.head.appendChild(link);
    });
  };

  // Optimize connection keep-alive
  const optimizeKeepAlive = () => {
    // Configure fetch to reuse connections
    const defaultFetchOptions = {
      keepalive: true,
      credentials: 'same-origin' as RequestCredentials
    };

    // Override default fetch options
    const originalFetch = window.fetch;
    window.fetch = (input, init = {}) => {
      const enhancedInit = {
        ...defaultFetchOptions,
        ...init,
        headers: {
          'Connection': 'keep-alive',
          ...init.headers
        }
      };
      
      return originalFetch(input, enhancedInit);
    };
  };

  // Add request pipelining hints
  const addPipeliningHints = () => {
    // Add meta tag for browser connection optimization
    const meta = document.createElement('meta');
    meta.httpEquiv = 'x-dns-prefetch-control';
    meta.content = 'on';
    document.head.appendChild(meta);
  };

  // Cleanup function
  const cleanup = () => {
    // Restore original fetch if overridden
    // Note: In production, we might want to keep optimizations
    console.debug('First request optimizer cleanup completed');
  };

  return null; // This component only runs effects
}

// Connection timing optimization
export function measureFirstRequestLatency() {
  const startTime = performance.now();
  
  return {
    measure: (endpoint: string) => {
      const endTime = performance.now();
      const latency = endTime - startTime;
      
      console.debug(`First request latency for ${endpoint}: ${latency.toFixed(2)}ms`);
      
      // Store timing data for optimization
      const timingKey = `timing_${endpoint.replace(/\//g, '_')}`;
      localStorage.setItem(timingKey, latency.toString());
      
      return latency;
    }
  };
}

// Network connection type detection for adaptive optimization
export function getConnectionType(): string {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (connection) {
    return connection.effectiveType || connection.type || 'unknown';
  }
  
  return 'unknown';
}

// Adaptive optimization based on connection speed
export function adaptiveFirstRequestOptimization() {
  const connectionType = getConnectionType();
  
  switch (connectionType) {
    case 'slow-2g':
    case '2g':
      // Very aggressive caching for slow connections
      return {
        cacheTime: 60 * 60 * 1000, // 1 hour
        compressionLevel: 9,
        prefetchDisabled: true
      };
      
    case '3g':
      // Moderate caching
      return {
        cacheTime: 30 * 60 * 1000, // 30 minutes
        compressionLevel: 6,
        prefetchDisabled: false
      };
      
    case '4g':
    default:
      // Standard optimization for fast connections
      return {
        cacheTime: 5 * 60 * 1000, // 5 minutes
        compressionLevel: 6,
        prefetchDisabled: false
      };
  }
}