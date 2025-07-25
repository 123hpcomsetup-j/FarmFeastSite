import { useEffect } from 'react';

export default function CriticalResourceLoader() {
  useEffect(() => {
    // Preload critical resources immediately
    const criticalResources = [
      // Critical fonts with highest priority
      {
        href: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
        priority: 'high'
      },
      // Hero image is now immediately discoverable in HTML with fetchpriority="high"
      // No need to preload it as the browser will discover it directly from FastHeroSection
    ];

    // Create preload links with priorities
    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) link.type = resource.type;
      if (resource.crossOrigin) link.crossOrigin = resource.crossOrigin;
      if (resource.priority) (link as any).fetchPriority = resource.priority;
      document.head.insertBefore(link, document.head.firstChild); // Insert at top for highest priority
    });

    // Prefetch likely next resources
    const prefetchResources = [
      '/api/services',
      '/api/gallery',
      '/api/settings'
    ];

    // Defer API prefetch to avoid critical request chains
    const deferredPrefetch = () => {
      // Use requestIdleCallback for better performance
      const scheduleIdlePrefetch = (callback: () => void) => {
        if ('requestIdleCallback' in window) {
          requestIdleCallback(callback, { timeout: 5000 });
        } else {
          setTimeout(callback, 500); // Fallback for older browsers
        }
      };

      scheduleIdlePrefetch(() => {
        // Only prefetch if network is not slow
        const connection = (navigator as any).connection;
        if (connection && connection.effectiveType && 
            ['slow-2g', '2g'].includes(connection.effectiveType)) {
          console.debug('Skipping prefetch on slow connection');
          return;
        }

        // Batch all prefetch requests to reduce chain length
        const prefetchBatch = prefetchResources.map(url => 
          fetch(url, { 
            method: 'GET',
            headers: { 'Cache-Control': 'max-age=300' },
            priority: 'low' // Use low priority to avoid competing with critical resources
          } as any).catch(() => {})
        );

        Promise.allSettled(prefetchBatch).then(() => {
          console.debug('API prefetch batch completed');
          
          // Prefetch next likely page
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = '/services';
          document.head.appendChild(link);
        });
      });
    };
    
    // Only start prefetch after page load
    if (document.readyState === 'complete') {
      deferredPrefetch();
    } else {
      window.addEventListener('load', deferredPrefetch, { once: true });
    }



  }, []);

  return null;
}