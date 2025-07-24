import { useEffect } from 'react';

// Optimized asset loading for modern browsers
const OptimizedAssetLoader = () => {
  useEffect(() => {
    // Preload critical resources with modern features
    const preloadCritical = () => {
      // Use modern module preloading
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = '/src/pages/booking.tsx';
      document.head.appendChild(link);

      // Prefetch likely next routes
      setTimeout(() => {
        const routes = ['/src/pages/services.tsx', '/src/pages/gallery.tsx'];
        routes.forEach(route => {
          const prefetchLink = document.createElement('link');
          prefetchLink.rel = 'prefetch';
          prefetchLink.href = route;
          document.head.appendChild(prefetchLink);
        });
      }, 3000);
    };

    // Only for modern browsers (ES2020+)
    if ('import' in document.createElement('script')) {
      preloadCritical();
    }
  }, []);

  return null;
};

export default OptimizedAssetLoader;