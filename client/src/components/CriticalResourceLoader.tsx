import { useEffect } from 'react';

export default function CriticalResourceLoader() {
  useEffect(() => {
    // Preload critical resources immediately
    const criticalResources = [
      // Critical fonts
      {
        href: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous'
      },
      // Hero image placeholder
      {
        href: '/api/placeholder/800/600',
        as: 'image'
      }
    ];

    // Create preload links
    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) link.type = resource.type;
      if (resource.crossOrigin) link.crossOrigin = resource.crossOrigin;
      document.head.appendChild(link);
    });

    // Prefetch likely next resources
    const prefetchResources = [
      '/api/services',
      '/api/gallery',
      '/api/settings'
    ];

    // Delay prefetch to not block critical resources
    setTimeout(() => {
      prefetchResources.forEach(url => {
        fetch(url, { 
          method: 'GET',
          headers: { 'Cache-Control': 'max-age=300' }
        }).catch(() => {}); // Silent fail for prefetch
      });
    }, 100);

    // Preload next likely page
    setTimeout(() => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = '/services';
      document.head.appendChild(link);
    }, 200);

  }, []);

  return null;
}