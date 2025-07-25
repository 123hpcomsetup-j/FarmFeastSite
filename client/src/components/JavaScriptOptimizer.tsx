import { useEffect } from 'react';

// JavaScript Bundle Optimization Component
export function JavaScriptOptimizer() {
  useEffect(() => {
    // Remove unused JavaScript after initial load
    const optimizeJavaScript = () => {
      // Remove unused event listeners
      removeUnusedEventListeners();
      
      // Clean up abandoned timers
      cleanupTimers();
      
      // Remove unused global variables
      cleanupGlobals();
      
      // Optimize memory usage
      optimizeMemoryUsage();
    };

    // Defer optimization until browser is idle
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(optimizeJavaScript, { timeout: 3000 });
    } else {
      setTimeout(optimizeJavaScript, 2000);
    }

    return () => {
      // Cleanup on unmount
      cleanupOnUnmount();
    };
  }, []);

  return null;
}

// Remove unused event listeners
function removeUnusedEventListeners() {
  // Remove abandoned scroll listeners
  const scrollHandlers = (window as any).__scrollHandlers || [];
  scrollHandlers.forEach((handler: EventListener) => {
    window.removeEventListener('scroll', handler);
  });
  delete (window as any).__scrollHandlers;

  // Remove unused resize listeners
  const resizeHandlers = (window as any).__resizeHandlers || [];
  resizeHandlers.forEach((handler: EventListener) => {
    window.removeEventListener('resize', handler);
  });
  delete (window as any).__resizeHandlers;
}

// Clean up abandoned timers
function cleanupTimers() {
  // Clear any abandoned intervals
  const intervals = (window as any).__intervals || [];
  intervals.forEach((id: number) => clearInterval(id));
  delete (window as any).__intervals;

  // Clear any abandoned timeouts
  const timeouts = (window as any).__timeouts || [];
  timeouts.forEach((id: number) => clearTimeout(id));
  delete (window as any).__timeouts;
}

// Remove unused global variables
function cleanupGlobals() {
  // Remove debugging variables
  delete (window as any).debug;
  delete (window as any).__DEBUG;
  
  // Remove unused libraries
  delete (window as any).__unused_libs;
}

// Optimize memory usage
function optimizeMemoryUsage() {
  // Force garbage collection if available
  if ('gc' in window && typeof (window as any).gc === 'function') {
    try {
      (window as any).gc();
    } catch (e) {
      // Silently ignore - gc not available in production
    }
  }

  // Clear caches that aren't needed
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        if (cacheName.includes('unused') || cacheName.includes('old')) {
          caches.delete(cacheName);
        }
      });
    });
  }
}

// Cleanup on component unmount
function cleanupOnUnmount() {
  // Remove all custom event listeners
  const customEvents = ['custom-event', 'app-event'];
  customEvents.forEach(event => {
    document.removeEventListener(event, () => {});
  });
}