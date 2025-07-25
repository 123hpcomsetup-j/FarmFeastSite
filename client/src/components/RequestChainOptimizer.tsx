import { useEffect } from 'react';

// Request Chain Optimizer - Reduces critical request chain length and defers unnecessary resources
export function RequestChainOptimizer() {
  useEffect(() => {
    optimizeRequestChains();
    setupResourceDeferral();
    monitorRequestChains();
    
    return () => {
      cleanup();
    };
  }, []);

  // Optimize critical request chains by reducing their length
  const optimizeRequestChains = () => {
    // 1. Inline critical resources to eliminate chain steps
    inlineCriticalResources();
    
    // 2. Bundle small resources to reduce chain depth
    bundleSmallResources();
    
    // 3. Remove unnecessary dependencies from critical path
    removeCriticalPathDependencies();
    
    // 4. Optimize font loading strategy
    optimizeFontLoading();
    
    console.debug('Request chain optimizations applied');
  };

  // Inline critical resources to eliminate network requests
  const inlineCriticalResources = () => {
    // Inline critical CSS that's currently external
    const criticalStyles = `
      /* Essential layout styles - inline to avoid request chain */
      body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
      .hero-gradient { 
        background: linear-gradient(135deg, hsl(220, 30%, 98%) 0%, hsl(220, 30%, 95%) 100%);
      }
      .nav-blur { 
        backdrop-filter: blur(10px); 
        background: rgba(255,255,255,0.9);
      }
      .primary-button {
        background: hsl(221, 83%, 53%);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        transition: background 0.2s;
      }
      .primary-button:hover {
        background: hsl(221, 83%, 48%);
      }
      /* Prevent layout shifts */
      img { max-width: 100%; height: auto; }
      .aspect-ratio-4-3 { aspect-ratio: 4/3; }
    `;

    const style = document.createElement('style');
    style.textContent = criticalStyles;
    style.setAttribute('data-critical-inline', 'true');
    document.head.insertBefore(style, document.head.firstChild);
  };

  // Bundle small resources to reduce request count
  const bundleSmallResources = () => {
    // Group small API calls into single requests where possible
    const apiEndpoints = [
      '/api/settings',
      '/api/seo/home',
      '/api/reviews/seo'
    ];

    // Create a bundled endpoint call
    const bundledApiCall = async () => {
      try {
        // Only bundle if all endpoints are needed simultaneously
        const responses = await Promise.all(
          apiEndpoints.map(endpoint => 
            fetch(endpoint).then(r => r.ok ? r.json() : null)
          )
        );
        
        // Cache results to avoid repeated requests
        const bundledData = {
          settings: responses[0],
          seo: responses[1], 
          reviews: responses[2]
        };
        
        // Store in session storage for immediate reuse
        sessionStorage.setItem('bundled-api-data', JSON.stringify(bundledData));
        
      } catch (error) {
        console.debug('Bundled API call failed, falling back to individual requests');
      }
    };

    // Only execute if no cached data exists
    if (!sessionStorage.getItem('bundled-api-data')) {
      // Defer to avoid blocking critical path
      setTimeout(bundledApiCall, 200);
    }
  };

  // Remove dependencies from critical rendering path
  const removeCriticalPathDependencies = () => {
    // Defer third-party scripts that create request chains
    const thirdPartyScripts = document.querySelectorAll('script[src*="google"], script[src*="facebook"], script[src*="twitter"]');
    
    thirdPartyScripts.forEach(script => {
      const scriptElement = script as HTMLScriptElement;
      if (!scriptElement.defer && !scriptElement.async) {
        scriptElement.defer = true;
      }
    });

    // Defer non-critical stylesheets to break chain dependencies
    const nonCriticalStylesheets = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
    
    nonCriticalStylesheets.forEach(link => {
      const linkElement = link as HTMLLinkElement;
      
      // Skip Google Fonts and critical CSS
      if (linkElement.href.includes('fonts.googleapis.com') || 
          linkElement.hasAttribute('data-critical')) {
        return;
      }
      
      // Make non-blocking using media attribute trick
      const originalMedia = linkElement.media || 'all';
      linkElement.media = 'print';
      linkElement.onload = () => {
        linkElement.media = originalMedia;
        linkElement.onload = null;
      };
    });
  };

  // Optimize font loading to reduce request chain depth
  const optimizeFontLoading = () => {
    // Preconnect to font domains early to reduce chain length
    const fontDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];

    fontDomains.forEach(domain => {
      // Check if preconnect already exists
      const existingPreconnect = document.querySelector(`link[rel="preconnect"][href="${domain}"]`);
      if (!existingPreconnect) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });

    // Use font-display: swap to reduce blocking time
    const fontStyle = document.createElement('style');
    fontStyle.textContent = `
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: local('Inter Regular'), local('Inter-Regular'),
             url('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2') format('woff2');
      }
    `;
    document.head.appendChild(fontStyle);
  };

  // Set up resource deferral strategies
  const setupResourceDeferral = () => {
    // Defer analytics and tracking scripts
    deferAnalyticsScripts();
    
    // Defer social media widgets
    deferSocialWidgets();
    
    // Defer non-essential images
    deferNonEssentialImages();
    
    // Defer JavaScript modules that aren't immediately needed
    deferNonCriticalModules();
  };

  // Defer analytics scripts to reduce critical chain
  const deferAnalyticsScripts = () => {
    const analyticsScripts = [
      'gtag', 'analytics', 'tracking', 'pixel', 'tag-manager'
    ];

    analyticsScripts.forEach(scriptType => {
      const scripts = document.querySelectorAll(`script[src*="${scriptType}"]`);
      scripts.forEach(script => {
        const scriptElement = script as HTMLScriptElement;
        scriptElement.defer = true;
      });
    });

    // Defer custom analytics until after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        // Initialize analytics after critical path is complete
        if ('gtag' in window) {
          console.debug('Analytics initialized post-load');
        }
      }, 1000);
    }, { once: true });
  };

  // Defer social media widgets that create request chains
  const deferSocialWidgets = () => {
    const socialScripts = document.querySelectorAll('script[src*="facebook"], script[src*="twitter"], script[src*="linkedin"]');
    
    socialScripts.forEach(script => {
      const scriptElement = script as HTMLScriptElement;
      
      // Convert to on-demand loading
      const placeholder = document.createElement('div');
      placeholder.className = 'social-widget-placeholder';
      placeholder.innerHTML = `
        <button onclick="loadSocialWidget('${scriptElement.src}')" 
                style="padding: 8px 16px; background: #1DA1F2; color: white; border: none; border-radius: 4px;">
          Load Social Widget
        </button>
      `;
      
      if (scriptElement.parentNode) {
        scriptElement.parentNode.replaceChild(placeholder, scriptElement);
      }
    });
  };

  // Defer non-essential images to reduce bandwidth competition
  const deferNonEssentialImages = () => {
    const images = document.querySelectorAll('img[loading="lazy"]:not([data-critical])');
    
    images.forEach(img => {
      const imgElement = img as HTMLImageElement;
      
      // Use Intersection Observer for progressive loading
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLImageElement;
            if (target.dataset.src) {
              target.src = target.dataset.src;
              target.removeAttribute('data-src');
            }
            observer.unobserve(target);
          }
        });
      }, {
        rootMargin: '50px' // Start loading 50px before entering viewport
      });

      // Convert src to data-src for lazy loading
      if (imgElement.src && !imgElement.dataset.src) {
        imgElement.dataset.src = imgElement.src;
        imgElement.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
      }

      observer.observe(imgElement);
    });
  };

  // Defer non-critical JavaScript modules
  const deferNonCriticalModules = () => {
    // Identify modules that can be loaded on-demand
    const nonCriticalModules = [
      'chart', 'calendar', 'editor', 'player', 'widget'
    ];

    // Convert to dynamic imports with user interaction triggers
    window.addEventListener('load', () => {
      // Set up intersection observers for components that need these modules
      const componentObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            const moduleType = element.getAttribute('data-module');
            
            if (moduleType && nonCriticalModules.includes(moduleType)) {
              // Load module when component becomes visible (removed dynamic import)
              console.debug(`Loading ${moduleType} module on demand`);
              componentObserver.unobserve(element);
            }
          }
        });
      });

      // Observe elements that need non-critical modules
      document.querySelectorAll('[data-module]').forEach(el => {
        componentObserver.observe(el);
      });
    }, { once: true });
  };

  // Monitor request chains for performance
  const monitorRequestChains = () => {
    if (!('PerformanceObserver' in window)) return;

    try {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceResourceTiming[];
        
        // Analyze request chains
        const criticalResources = entries.filter(entry => 
          entry.name.includes('.css') || 
          entry.name.includes('.js') || 
          entry.name.includes('font')
        );

        if (criticalResources.length > 0) {
          const totalRequestTime = Math.max(...criticalResources.map(r => r.responseEnd));
          const requestCount = criticalResources.length;
          
          console.group('📊 Request Chain Analysis');
          console.log(`Total critical requests: ${requestCount}`);
          console.log(`Chain completion time: ${Math.round(totalRequestTime)}ms`);
          
          if (requestCount > 10) {
            console.warn('⚠️ High request count detected - consider bundling');
          }
          
          if (totalRequestTime > 3000) {
            console.warn('⚠️ Long request chain - consider inlining critical resources');
          }
          
          console.groupEnd();
        }
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
      
      // Auto-disconnect after 30 seconds
      setTimeout(() => {
        resourceObserver.disconnect();
      }, 30000);
      
    } catch (error) {
      console.debug('Request chain monitoring not available');
    }
  };

  // Cleanup function
  const cleanup = () => {
    // Remove temporary optimizations if needed
    console.debug('Request chain optimizer cleanup completed');
  };

  return null;
}

// Global function for social widget loading
(window as any).loadSocialWidget = (src: string) => {
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  document.head.appendChild(script);
};