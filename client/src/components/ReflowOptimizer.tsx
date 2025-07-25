import { useEffect, useRef } from 'react';

// Reflow Optimizer - Prevents forced reflows by batching DOM reads and writes
export function ReflowOptimizer() {
  const rafQueue = useRef<Array<() => void>>([]);
  const isScheduled = useRef(false);

  useEffect(() => {
    // Set up global reflow optimization
    setupReflowOptimization();
    
    // Monitor and optimize dynamic DOM changes
    monitorDOMChanges();
    
    return () => {
      cleanup();
    };
  }, []);

  // Set up global reflow optimization strategies
  const setupReflowOptimization = () => {
    // Cache commonly accessed geometric properties
    cacheGeometricProperties();
    
    // Batch DOM operations
    setupDOMBatching();
    
    // Optimize CSS animations to avoid layout thrashing
    optimizeCSSAnimations();
    
    console.debug('Reflow optimization enabled');
  };

  // Cache geometric properties to avoid repeated calculations
  const cacheGeometricProperties = () => {
    const cache = new Map<Element, DOMRect>();
    
    // Create optimized getBoundingClientRect wrapper
    (window as any).__optimizedGetBoundingClientRect = (element: Element) => {
      if (cache.has(element)) {
        return cache.get(element);
      }
      
      const rect = element.getBoundingClientRect();
      cache.set(element, rect);
      
      // Clear cache on next frame to stay fresh
      requestAnimationFrame(() => {
        cache.delete(element);
      });
      
      return rect;
    };
  };

  // Set up DOM operation batching
  const setupDOMBatching = () => {
    // Queue DOM writes to be executed in a single frame
    (window as any).__batchDOMWrite = (writeOperation: () => void) => {
      rafQueue.current.push(writeOperation);
      
      if (!isScheduled.current) {
        isScheduled.current = true;
        requestAnimationFrame(() => {
          // Execute all queued operations in a single frame
          rafQueue.current.forEach(operation => operation());
          rafQueue.current = [];
          isScheduled.current = false;
        });
      }
    };
    
    // Separate read and write phases
    (window as any).__batchDOMOperations = (
      readOperations: Array<() => any>,
      writeOperations: Array<() => void>
    ) => {
      // Execute all reads first
      const readResults = readOperations.map(op => op());
      
      // Then execute all writes in next frame
      requestAnimationFrame(() => {
        writeOperations.forEach(op => op());
      });
      
      return readResults;
    };
  };

  // Optimize CSS animations to use transform and opacity only
  const optimizeCSSAnimations = () => {
    const style = document.createElement('style');
    style.textContent = `
      /* Optimize animations to avoid layout thrashing */
      .reflow-optimized {
        will-change: transform, opacity;
        transform: translateZ(0); /* Force GPU layer */
      }
      
      .reflow-optimized.animating {
        backface-visibility: hidden;
        perspective: 1000px;
      }
      
      /* Use transform instead of changing position properties */
      .slide-animation {
        transition: transform 0.3s ease-out;
      }
      
      .fade-animation {
        transition: opacity 0.3s ease-out;
      }
      
      /* Avoid animating layout-affecting properties */
      .avoid-layout-animation {
        transition: transform 0.3s ease-out, opacity 0.3s ease-out;
      }
      
      /* Optimize scroll-triggered animations */
      .scroll-reveal {
        transform: translateY(20px);
        opacity: 0;
        transition: transform 0.6s ease-out, opacity 0.6s ease-out;
      }
      
      .scroll-reveal.revealed {
        transform: translateY(0);
        opacity: 1;
      }
      
      /* Use contain property to limit reflow scope */
      .contain-layout {
        contain: layout style paint;
      }
    `;
    
    document.head.appendChild(style);
  };

  // Monitor DOM changes that might cause reflows
  const monitorDOMChanges = () => {
    // Use ResizeObserver to track element size changes efficiently
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver((entries) => {
        // Batch resize handling to avoid multiple reflows
        const resizeOperations: Array<() => void> = [];
        
        entries.forEach((entry) => {
          const element = entry.target;
          resizeOperations.push(() => {
            element.dispatchEvent(new CustomEvent('optimized-resize', {
              detail: { 
                contentRect: entry.contentRect,
                borderBoxSize: entry.borderBoxSize
              }
            }));
          });
        });
        
        // Execute all resize operations in a single frame
        if (resizeOperations.length > 0) {
          (window as any).__batchDOMWrite(() => {
            resizeOperations.forEach(op => op());
          });
        }
      });
      
      // Observe elements that might cause reflows
      document.querySelectorAll('[data-reflow-monitor]').forEach(element => {
        resizeObserver.observe(element);
      });
    }
    
    // Use MutationObserver to track DOM changes
    const mutationObserver = new MutationObserver((mutations) => {
      const hasLayoutChanges = mutations.some(mutation => 
        mutation.type === 'childList' || 
        (mutation.type === 'attributes' && 
         ['class', 'style', 'width', 'height'].includes(mutation.attributeName || ''))
      );
      
      if (hasLayoutChanges) {
        // Defer layout-affecting operations
        requestAnimationFrame(() => {
          document.querySelectorAll('.reflow-optimized').forEach(element => {
            element.classList.add('reflow-optimized');
          });
        });
      }
    });
    
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'width', 'height']
    });
  };

  // Cleanup function
  const cleanup = () => {
    // Clear any pending operations
    rafQueue.current = [];
    isScheduled.current = false;
    
    // Remove global optimization functions
    delete (window as any).__optimizedGetBoundingClientRect;
    delete (window as any).__batchDOMWrite;
    delete (window as any).__batchDOMOperations;
  };

  return null;
}