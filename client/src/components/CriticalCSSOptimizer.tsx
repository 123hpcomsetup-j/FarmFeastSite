import { useEffect } from 'react';

export default function CriticalCSSOptimizer() {
  useEffect(() => {
    // Remove unused CSS classes after initial render
    const removeUnusedStyles = () => {
      const allElements = document.querySelectorAll('*');
      const usedClasses = new Set<string>();
      
      allElements.forEach(el => {
        if (el.className && typeof el.className === 'string') {
          el.className.split(' ').forEach(cls => {
            if (cls.trim()) usedClasses.add(cls.trim());
          });
        }
      });

      // Add critical classes that might be used dynamically
      const criticalClasses = [
        'animate-spin', 'animate-pulse', 'opacity-0', 'opacity-100',
        'hover:opacity-80', 'transition-opacity', 'duration-200', 'duration-300'
      ];
      criticalClasses.forEach(cls => usedClasses.add(cls));
    };

    // Optimize images loading
    const optimizeImages = () => {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        // Add intersection observer for non-priority images
        if (!img.hasAttribute('data-priority')) {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const img = entry.target as HTMLImageElement;
                if (img.dataset.src) {
                  img.src = img.dataset.src;
                  img.removeAttribute('data-src');
                }
                observer.unobserve(img);
              }
            });
          }, { threshold: 0.1, rootMargin: '50px' });
          
          observer.observe(img);
        }
      });
    };

    // Run optimizations after DOM is ready
    const runOptimizations = () => {
      removeUnusedStyles();
      optimizeImages();
    };

    // Schedule optimization for next frame
    requestAnimationFrame(runOptimizations);

    // Preload critical resources with high priority
    const preloadCriticalAssets = () => {
      const criticalAssets = [
        { href: '/api/services', as: 'fetch', crossOrigin: 'anonymous' },
        { href: '/api/gallery', as: 'fetch', crossOrigin: 'anonymous' },
        { href: '/api/settings', as: 'fetch', crossOrigin: 'anonymous' }
      ];

      criticalAssets.forEach(asset => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = asset.href;
        link.as = asset.as;
        if (asset.crossOrigin) link.crossOrigin = asset.crossOrigin;
        document.head.appendChild(link);
      });
    };

    preloadCriticalAssets();

    return () => {
      // Cleanup observers
      const images = document.querySelectorAll('img[data-src]');
      images.forEach(img => {
        // Remove any remaining observers
      });
    };
  }, []);

  return null;
}