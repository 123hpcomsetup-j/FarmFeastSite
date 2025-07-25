import { useEffect } from 'react';

// Non-blocking resource loader to avoid delaying LCP
export default function NonBlockingLoader() {
  useEffect(() => {
    // Only start resource loading after critical path is complete
    const loadNonCriticalResources = () => {
      // Defer all non-essential requests until after initial render
      requestIdleCallback(() => {
        // Preload secondary images with low priority
        const secondaryImages = [
          '/api/placeholder/400/300', // Gallery thumbnails
          '/api/placeholder/300/200'  // Service images
        ];
        
        secondaryImages.forEach(src => {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.href = src;
          link.as = 'image';
          (link as any).fetchPriority = 'low';
          document.head.appendChild(link);
        });
        
        // Prefetch secondary API endpoints
        const secondaryAPIs = ['/api/amenities', '/api/blog-posts'];
        secondaryAPIs.forEach(url => {
          setTimeout(() => {
            fetch(url).catch(() => {}); // Silent fail
          }, Math.random() * 1000); // Stagger requests
        });
      });
    };

    // Wait for page load to avoid blocking critical resources
    if (document.readyState === 'complete') {
      loadNonCriticalResources();
    } else {
      window.addEventListener('load', loadNonCriticalResources, { once: true });
    }
  }, []);

  return null;
}