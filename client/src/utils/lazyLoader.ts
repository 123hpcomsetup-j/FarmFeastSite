// Advanced Lazy Loading Utility for JavaScript Optimization
export class LazyLoader {
  private static loadedScripts = new Set<string>();
  private static loadingPromises = new Map<string, Promise<void>>();

  // Lazy load components when they enter viewport
  static createIntersectionObserver(callback: () => void, threshold = 0.1) {
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers
      callback();
      return null;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
            observer.disconnect();
          }
        });
      },
      { threshold }
    );

    return observer;
  }

  // Defer script loading until user interaction
  static deferUntilInteraction(loadFn: () => void) {
    const events = ['mousedown', 'touchstart', 'keydown', 'scroll'];
    
    const load = () => {
      loadFn();
      events.forEach(event => {
        document.removeEventListener(event, load, true);
      });
    };

    events.forEach(event => {
      document.addEventListener(event, load, true);
    });

    // Fallback timeout
    setTimeout(load, 5000);
  }

  // Load external scripts on demand
  static async loadScript(src: string, defer = true): Promise<void> {
    if (this.loadedScripts.has(src)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src)!;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.defer = defer;
      script.async = true;
      
      script.onload = () => {
        this.loadedScripts.add(src);
        resolve();
      };
      
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      
      document.head.appendChild(script);
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  // Preload modules for faster subsequent loading
  static preloadModule(href: string) {
    if (document.querySelector(`link[href="${href}"]`)) return;
    
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = href;
    document.head.appendChild(link);
  }

  // Remove unused event listeners and cleanup
  static cleanup() {
    this.loadedScripts.clear();
    this.loadingPromises.clear();
  }
}

// Component-specific lazy loading hooks
import { useState, useCallback, ComponentType } from 'react';

export function useLazyComponent<T>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ComponentType
) {
  const [Component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadComponent = useCallback(async () => {
    if (Component) return;
    
    setLoading(true);
    try {
      const module = await importFn();
      setComponent(module.default);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [Component, importFn]);

  return { Component, loading, error, loadComponent };
}

// Defer heavy operations until browser is idle
export function deferUntilIdle(fn: () => void) {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(fn, { timeout: 2000 });
  } else {
    setTimeout(fn, 1);
  }
}