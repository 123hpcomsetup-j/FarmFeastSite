import { useEffect } from 'react';

// LCP Optimizer - Optimizes Largest Contentful Paint specifically
export function LCPOptimizer() {
  useEffect(() => {
    optimizeLCP();
    measureLCP();
    
    return () => {
      cleanup();
    };
  }, []);

  // Optimize Largest Contentful Paint performance
  const optimizeLCP = () => {
    // Remove lazy loading from potential LCP elements
    removeLazyLoadingFromLCPElements();
    
    // Add fetch priority to hero images
    prioritizeHeroImages();
    
    // Optimize image dimensions to prevent layout shifts
    addImageDimensions();
    
    // Remove blocking resources that delay LCP
    optimizeBlockingResources();
    
    console.debug('LCP optimizations applied');
  };

  // Remove lazy loading from elements that could be LCP
  const removeLazyLoadingFromLCPElements = () => {
    // Find images in hero sections or above-the-fold content
    const potentialLCPImages = document.querySelectorAll(`
      img[src*="hero"], 
      img[src*="banner"], 
      .hero img, 
      .banner img,
      img[loading="lazy"]:not([data-below-fold])
    `);

    potentialLCPImages.forEach((img) => {
      const imgElement = img as HTMLImageElement;
      const rect = imgElement.getBoundingClientRect();
      
      // If image is above the fold (within first 600px), optimize for LCP
      if (rect.top < 600) {
        imgElement.loading = 'eager';
        imgElement.setAttribute('fetchpriority', 'high');
        imgElement.setAttribute('decoding', 'async');
        
        // Add width/height if missing to prevent layout shifts
        if (!imgElement.width && !imgElement.height) {
          const computedStyle = window.getComputedStyle(imgElement);
          const width = parseInt(computedStyle.width);
          const height = parseInt(computedStyle.height);
          
          if (width > 0 && height > 0) {
            imgElement.width = width;
            imgElement.height = height;
          }
        }
      }
    });
  };

  // Add high priority to hero images
  const prioritizeHeroImages = () => {
    const heroImages = document.querySelectorAll('.hero img, [data-hero-image]');
    
    heroImages.forEach((img) => {
      const imgElement = img as HTMLImageElement;
      imgElement.setAttribute('fetchpriority', 'high');
      imgElement.loading = 'eager';
      imgElement.setAttribute('decoding', 'async');
      
      // Force immediate display
      imgElement.style.contentVisibility = 'visible';
    });
  };

  // Add explicit dimensions to prevent layout shifts
  const addImageDimensions = () => {
    const images = document.querySelectorAll('img:not([width]):not([height])');
    
    images.forEach((img) => {
      const imgElement = img as HTMLImageElement;
      
      // Only process if image is loaded or has natural dimensions
      if (imgElement.complete && imgElement.naturalWidth > 0) {
        imgElement.width = imgElement.naturalWidth;
        imgElement.height = imgElement.naturalHeight;
      } else {
        // Set dimensions when image loads
        const handleLoad = () => {
          if (imgElement.naturalWidth > 0) {
            imgElement.width = imgElement.naturalWidth;
            imgElement.height = imgElement.naturalHeight;
          }
          imgElement.removeEventListener('load', handleLoad);
        };
        
        imgElement.addEventListener('load', handleLoad, { once: true });
      }
    });
  };

  // Remove or defer blocking resources that delay LCP
  const optimizeBlockingResources = () => {
    // Defer non-critical stylesheets
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
    
    stylesheets.forEach((link) => {
      const linkElement = link as HTMLLinkElement;
      const href = linkElement.href;
      
      // Skip critical CSS and external fonts
      if (href.includes('fonts.googleapis.com') || 
          href.includes('critical') || 
          linkElement.hasAttribute('data-critical')) {
        return;
      }
      
      // Make non-critical CSS non-blocking
      linkElement.media = 'print';
      linkElement.onload = () => {
        linkElement.media = 'all';
      };
    });

    // Defer non-essential scripts
    const scripts = document.querySelectorAll('script:not([async]):not([defer]):not([data-critical])');
    
    scripts.forEach((script) => {
      const scriptElement = script as HTMLScriptElement;
      
      // Skip inline scripts and critical scripts
      if (!scriptElement.src || scriptElement.hasAttribute('data-critical')) {
        return;
      }
      
      // Add defer to non-critical external scripts
      if (!scriptElement.async && !scriptElement.defer) {
        scriptElement.defer = true;
      }
    });
  };

  // Measure LCP performance
  const measureLCP = () => {
    if (!('PerformanceObserver' in window)) return;

    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        
        if (lastEntry) {
          const lcpTime = Math.round(lastEntry.startTime);
          console.log(`📊 LCP: ${lcpTime}ms`);
          
          // Performance targets
          if (lcpTime <= 2500) {
            console.log('✅ LCP: Good performance (≤2.5s)');
          } else if (lcpTime <= 4000) {
            console.log('⚠️ LCP: Needs improvement (2.5s-4s)');
          } else {
            console.log('❌ LCP: Poor performance (>4s)');
          }
          
          // Report to analytics if available
          if ('gtag' in window) {
            (window as any).gtag('event', 'LCP', {
              value: lcpTime,
              custom_map: { metric_name: 'largest_contentful_paint' }
            });
          }
        }
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      
      // Auto-disconnect after 10 seconds
      setTimeout(() => {
        lcpObserver.disconnect();
      }, 10000);
      
    } catch (error) {
      console.debug('LCP measurement not available:', error);
    }
  };

  // Cleanup function
  const cleanup = () => {
    // Remove any temporary optimizations if needed
    console.debug('LCP optimizer cleanup completed');
  };

  return null;
}

// Hook for LCP monitoring in development
export function useLCPMonitoring() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.entryType === 'largest-contentful-paint') {
          console.group('🎯 LCP Analysis');
          console.log('Time:', Math.round(entry.startTime), 'ms');
          console.log('Element:', entry.element);
          console.log('Size:', entry.size, 'pixels');
          console.log('URL:', entry.url || 'N/A');
          console.groupEnd();
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.debug('LCP monitoring not supported');
    }

    return () => observer.disconnect();
  }, []);
}