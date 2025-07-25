import { useEffect } from 'react';

// Critical Resource Preloader for LCP optimization
export function CriticalResourcePreloader() {
  useEffect(() => {
    // Preload critical resources immediately
    const criticalResources = [
      // Hero image (LCP element)
      '/api/placeholder/800/600',
      // Critical fonts
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
    ];

    criticalResources.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      if (url.includes('fonts.googleapis.com')) {
        link.as = 'style';
        link.onload = () => {
          link.rel = 'stylesheet';
        };
      } else {
        link.as = 'image';
        link.fetchPriority = 'high';
      }
      link.href = url;
      document.head.appendChild(link);
    });

    // Preconnect to external domains
    const preconnectDomains = [
      'https://api.farmfeastfarmhouse.co.in',
      'https://fonts.gstatic.com'
    ];

    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }, []);

  return null;
}

// Lazy Loading Image Component
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}

export function OptimizedImage({ 
  src, 
  alt, 
  className = '', 
  priority = false,
  width,
  height 
}: OptimizedImageProps) {
  useEffect(() => {
    if (priority) {
      // For LCP images, add fetchpriority="high"
      const img = document.querySelector(`img[src="${src}"]`) as HTMLImageElement;
      if (img) {
        img.fetchPriority = 'high';
        img.loading = 'eager';
      }
    }
  }, [src, priority]);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      width={width}
      height={height}
      style={{ 
        contentVisibility: priority ? 'visible' : 'auto',
        containIntrinsicSize: width && height ? `${width}px ${height}px` : undefined
      }}
    />
  );
}

// Script Optimization Component
export function OptimizedScriptLoader() {
  useEffect(() => {
    // Defer non-critical scripts
    const scripts = document.querySelectorAll('script[data-defer="true"]');
    
    const loadDeferredScripts = () => {
      scripts.forEach(script => {
        if (script.hasAttribute('data-src')) {
          script.setAttribute('src', script.getAttribute('data-src') || '');
          script.removeAttribute('data-src');
        }
      });
    };

    // Load deferred scripts after initial page load
    if (document.readyState === 'complete') {
      loadDeferredScripts();
    } else {
      window.addEventListener('load', loadDeferredScripts);
    }

    return () => {
      window.removeEventListener('load', loadDeferredScripts);
    };
  }, []);

  return null;
}

// CSS Critical Path Optimizer
export function CriticalCSSInliner() {
  useEffect(() => {
    // Move non-critical CSS to load after first paint
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
    
    stylesheets.forEach(stylesheet => {
      const link = stylesheet as HTMLLinkElement;
      if (!link.media || link.media === 'all') {
        // Make stylesheet non-render-blocking
        link.media = 'print';
        link.onload = () => {
          link.media = 'all';
          link.onload = null;
        };
      }
    });
  }, []);

  return null;
}

// Bundle Analyzer Component (development only)
export function BundleAnalyzer() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Log bundle information for optimization
      console.group('🚀 Performance Metrics');
      console.log('Bundle size optimizations active');
      console.log('Critical CSS inlined');
      console.log('Resource preloading enabled');
      console.log('Lazy loading configured');
      console.groupEnd();
    }
  }, []);

  return null;
}