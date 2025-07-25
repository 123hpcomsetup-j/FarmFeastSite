import { useEffect, useRef } from 'react';

interface OptimizedImageWithLCPProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onLoad?: () => void;
}

export function OptimizedImageWithLCP({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  onLoad
}: OptimizedImageWithLCPProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // Set attributes for optimal LCP
    if (priority) {
      img.setAttribute('fetchpriority', 'high');
      img.loading = 'eager';
      img.decoding = 'async';
    } else {
      img.loading = 'lazy';
      img.decoding = 'async';
    }

    // Add load event listener
    const handleLoad = () => {
      if (onLoad) onLoad();
      
      // Mark as loaded for potential CSS animations
      img.classList.add('loaded');
      
      // Report LCP if this is a priority image
      if (priority && 'performance' in window) {
        performance.mark('hero-image-loaded');
      }
    };

    img.addEventListener('load', handleLoad);

    return () => {
      img.removeEventListener('load', handleLoad);
    };
  }, [priority, onLoad]);

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={`${className} transition-opacity duration-300`}
      width={width}
      height={height}
      style={{
        aspectRatio: width && height ? `${width}/${height}` : undefined,
        contentVisibility: priority ? 'visible' : 'auto',
        contain: 'layout style paint'
      }}
    />
  );
}

// Hook for measuring LCP
export function useLCPMeasurement() {
  useEffect(() => {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      if (lastEntry) {
        console.log('📊 LCP:', Math.round(lastEntry.startTime), 'ms');
        
        // Report to analytics if available
        if ('gtag' in window) {
          // @ts-ignore
          gtag('event', 'LCP', {
            value: Math.round(lastEntry.startTime),
            custom_map: { metric_name: 'largest_contentful_paint' }
          });
        }
      }
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });

    return () => observer.disconnect();
  }, []);
}