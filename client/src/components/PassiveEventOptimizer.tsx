import { useEffect } from 'react';

// Passive Event Optimizer - Improve scroll performance with passive listeners
export function PassiveEventOptimizer() {
  useEffect(() => {
    optimizeEventListeners();
    setupPassiveEventInterception();
    
    return () => {
      cleanupEventOptimizations();
    };
  }, []);

  return null;
}

// Optimize existing event listeners to be passive
function optimizeEventListeners() {
  // Override addEventListener to automatically make scroll/touch events passive
  const originalAddEventListener = Element.prototype.addEventListener;
  const originalWindowAddEventListener = window.addEventListener;
  
  // Passive events that benefit from non-blocking behavior
  const passiveEvents = [
    'touchstart', 'touchmove', 'touchend', 'touchcancel',
    'wheel', 'mousewheel', 'DOMMouseScroll',
    'scroll', 'resize'
  ];

  // Element addEventListener override
  Element.prototype.addEventListener = function(
    type: string, 
    listener: EventListenerOrEventListenerObject, 
    options?: boolean | AddEventListenerOptions
  ) {
    if (passiveEvents.includes(type)) {
      // Make passive if not explicitly set to false
      if (typeof options === 'boolean') {
        options = { passive: true, capture: options };
      } else if (!options) {
        options = { passive: true };
      } else if (options.passive === undefined) {
        options.passive = true;
      }
    }
    
    return originalAddEventListener.call(this, type, listener, options);
  };

  // Window addEventListener override
  window.addEventListener = function(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) {
    if (passiveEvents.includes(type)) {
      if (typeof options === 'boolean') {
        options = { passive: true, capture: options };
      } else if (!options) {
        options = { passive: true };
      } else if (options.passive === undefined) {
        options.passive = true;
      }
    }
    
    return originalWindowAddEventListener.call(this, type, listener, options);
  };

  console.debug('Event listeners optimized for passive scroll performance');
}

// Set up passive event interception for common libraries
function setupPassiveEventInterception() {
  // Optimize React event handlers
  optimizeReactEvents();
  
  // Optimize third-party library events
  optimizeLibraryEvents();
  
  // Monitor and optimize dynamic event listeners
  monitorDynamicEventListeners();
}

// Optimize React synthetic events for better scroll performance
function optimizeReactEvents() {
  // React events that should be passive
  const reactPassiveEvents = [
    'onTouchStart', 'onTouchMove', 'onTouchEnd',
    'onWheel', 'onScroll'
  ];

  // Intercept React event registration
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) {
          optimizeElementEvents(node);
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Store observer for cleanup
  (window as any).__passiveEventObserver = observer;
}

// Optimize events on a specific element
function optimizeElementEvents(element: Element) {
  // Check for common touch/scroll handlers
  const touchElements = element.querySelectorAll('[onTouchStart], [onTouchMove], [onWheel], [onScroll]');
  
  touchElements.forEach((el) => {
    // Remove inline handlers and re-add as passive
    ['touchstart', 'touchmove', 'touchend', 'wheel', 'scroll'].forEach(eventType => {
      const handler = (el as any)[`on${eventType}`];
      if (handler) {
        el.removeEventListener(eventType, handler);
        el.addEventListener(eventType, handler, { passive: true });
      }
    });
  });
}

// Optimize common JavaScript libraries
function optimizeLibraryEvents() {
  // Wait for libraries to load
  setTimeout(() => {
    optimizeScrollLibraries();
    optimizeTouchLibraries();
    optimizeGestureLibraries();
  }, 1000);
}

// Optimize scroll-related libraries
function optimizeScrollLibraries() {
  // Intersection Observer for scroll optimization
  if ('IntersectionObserver' in window) {
    setupScrollOptimization();
  }

  // Optimize smooth scrolling
  optimizeSmoothScrolling();
}

// Set up intersection observer for scroll performance
function setupScrollOptimization() {
  const scrollElements = document.querySelectorAll('[data-scroll], .scroll-trigger, .lazy-load');
  
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Element is visible, optimize its scroll handlers
        optimizeElementScrollHandlers(entry.target as Element);
      }
    });
  }, {
    rootMargin: '50px',
    threshold: 0.1
  });

  scrollElements.forEach((el) => scrollObserver.observe(el));
  (window as any).__scrollOptimizer = scrollObserver;
}

// Optimize scroll handlers on specific element
function optimizeElementScrollHandlers(element: Element) {
  // Replace any non-passive scroll listeners
  const scrollData = (element as any).__scrollHandlers || [];
  
  scrollData.forEach((handler: EventListener) => {
    element.removeEventListener('scroll', handler);
    element.addEventListener('scroll', handler, { passive: true });
  });
}

// Optimize touch-related libraries
function optimizeTouchLibraries() {
  // Common touch gesture libraries
  const touchSelectors = [
    '[data-touch]', '.touch-handler', '.swipe-container',
    '.draggable', '.gesture-zone', '.touch-zone'
  ];

  touchSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      optimizeTouchHandlers(element);
    });
  });
}

// Optimize touch handlers on element
function optimizeTouchHandlers(element: Element) {
  const touchEvents = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];
  
  touchEvents.forEach(eventType => {
    // Get existing handlers
    const handlers = (element as any)[`__${eventType}Handlers`] || [];
    
    // Re-register as passive
    handlers.forEach((handler: EventListener) => {
      element.removeEventListener(eventType, handler);
      element.addEventListener(eventType, handler, { passive: true });
    });
  });
}

// Optimize gesture libraries (pinch, zoom, rotate)
function optimizeGestureLibraries() {
  // Prevent default only when necessary
  document.addEventListener('touchstart', (e) => {
    // Only prevent default for specific gesture interactions
    const target = e.target as Element;
    if (target.closest('.prevent-default') || 
        target.hasAttribute('data-prevent-default')) {
      e.preventDefault();
    }
  }, { passive: false }); // This one needs to be non-passive for preventDefault

  // All other touch events can be passive
  ['touchmove', 'touchend', 'touchcancel'].forEach(eventType => {
    document.addEventListener(eventType, () => {
      // Passive listener for performance
    }, { passive: true });
  });
}

// Optimize smooth scrolling behavior
function optimizeSmoothScrolling() {
  // Use CSS scroll-behavior when possible
  document.documentElement.style.scrollBehavior = 'smooth';
  
  // Optimize programmatic scrolling
  const originalScrollTo = window.scrollTo;
  const originalScrollBy = window.scrollBy;
  
  window.scrollTo = function(options: ScrollToOptions | number, y?: number) {
    if (typeof options === 'object') {
      // Use requestAnimationFrame for smooth performance
      if (!options.behavior || options.behavior === 'smooth') {
        smoothScrollTo(options.left || 0, options.top || 0);
        return;
      }
    }
    return originalScrollTo.call(this, options as any, y);
  };

  window.scrollBy = function(options: ScrollToOptions | number, y?: number) {
    if (typeof options === 'object') {
      if (!options.behavior || options.behavior === 'smooth') {
        const currentX = window.pageXOffset;
        const currentY = window.pageYOffset;
        smoothScrollTo(
          currentX + (options.left || 0),
          currentY + (options.top || 0)
        );
        return;
      }
    }
    return originalScrollBy.call(this, options as any, y);
  };
}

// Smooth scroll implementation using requestAnimationFrame
function smoothScrollTo(targetX: number, targetY: number) {
  const startX = window.pageXOffset;
  const startY = window.pageYOffset;
  const deltaX = targetX - startX;
  const deltaY = targetY - startY;
  const duration = 300; // ms
  let startTime: number;

  function animate(currentTime: number) {
    if (!startTime) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth animation
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    
    const currentX = startX + deltaX * easeProgress;
    const currentY = startY + deltaY * easeProgress;
    
    window.scroll(currentX, currentY);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
  
  requestAnimationFrame(animate);
}

// Monitor and optimize dynamically added event listeners
function monitorDynamicEventListeners() {
  // Track event listener additions
  const eventListenerMap = new WeakMap();
  
  // Override addEventListener to track listeners
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) {
    // Store listener info for optimization
    if (!eventListenerMap.has(this)) {
      eventListenerMap.set(this, new Map());
    }
    
    const listeners = eventListenerMap.get(this);
    if (!listeners.has(type)) {
      listeners.set(type, new Set());
    }
    listeners.get(type).add(listener);
    
    return originalAddEventListener.call(this, type, listener, options);
  };

  console.debug('Dynamic event listener monitoring enabled');
}

// Cleanup event optimizations
function cleanupEventOptimizations() {
  // Restore original event listener methods
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  if ((window as any).__originalAddEventListener) {
    EventTarget.prototype.addEventListener = (window as any).__originalAddEventListener;
  }

  // Clean up observers
  if ((window as any).__passiveEventObserver) {
    (window as any).__passiveEventObserver.disconnect();
  }
  
  if ((window as any).__scrollOptimizer) {
    (window as any).__scrollOptimizer.disconnect();
  }

  console.debug('Event optimization cleanup completed');
}