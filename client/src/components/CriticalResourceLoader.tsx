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
      // Hero image with high priority
      {
        href: '/api/placeholder/800/600',
        as: 'image',
        priority: 'high'
      }
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

    // Aggressively prefetch critical API endpoints
    const prefetchPromises = prefetchResources.map(url => 
      fetch(url, { 
        method: 'GET',
        headers: { 'Cache-Control': 'max-age=300' }
      }).catch(() => {}) // Silent fail for prefetch
    );
    
    // Wait for prefetch to complete before preloading next page
    Promise.all(prefetchPromises).then(() => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = '/services';
      document.head.appendChild(link);
    });



  }, []);

  return null;
}