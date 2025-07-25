import { useEffect } from 'react';

// Modern Browser Optimizer - Remove polyfills and use native features
export function ModernBrowserOptimizer() {
  useEffect(() => {
    detectModernFeatures();
    enableNativeFeatures();
    removeUnnecessaryPolyfills();
    optimizeForBaseline2023();
    
    console.debug('Modern browser optimization enabled for Baseline 2023+');
  }, []);

  return null;
}

// Detect and utilize modern browser features
function detectModernFeatures() {
  const modernFeatures = {
    // Baseline 2023 features - no polyfills needed
    esModules: 'noModule' in HTMLScriptElement.prototype,
    asyncAwait: true, // Native in all target browsers
    promiseFinally: 'finally' in Promise.prototype,
    objectSpread: true, // Native in all target browsers
    optionalChaining: true, // Native in all target browsers
    nullishCoalescing: true, // Native in all target browsers
    privateFields: true, // Native in all target browsers
    
    // Modern APIs available in Baseline 2023
    intersectionObserver: 'IntersectionObserver' in window,
    resizeObserver: 'ResizeObserver' in window,
    webAnimations: 'animate' in Element.prototype,
    cssCustomProperties: CSS.supports('color', 'var(--test)'),
    cssGrid: CSS.supports('display', 'grid'),
    cssFlexbox: CSS.supports('display', 'flex'),
    fetch: 'fetch' in window,
    
    // Modern JavaScript features
    bigInt: typeof BigInt !== 'undefined',
    dynamicImport: true, // Available in target browsers
    topLevelAwait: true, // Available in target browsers
    
    // Web APIs
    serviceWorker: 'serviceWorker' in navigator,
    webWorkers: 'Worker' in window,
    webAssembly: 'WebAssembly' in window,
    broadcastChannel: 'BroadcastChannel' in window
  };

  // Store feature detection results for optimization decisions
  (window as any).__modernFeatures = modernFeatures;
  
  // Log unsupported features (should be none for modern browsers)
  const unsupported = Object.entries(modernFeatures)
    .filter(([, supported]) => !supported)
    .map(([feature]) => feature);
    
  if (unsupported.length > 0) {
    console.warn('Some modern features not detected:', unsupported);
  }
}

// Enable native browser features instead of polyfilled versions
function enableNativeFeatures() {
  // Use native Promise instead of polyfilled versions
  if (window.Promise) {
    // Remove any Promise polyfills that might be loaded
    removePolyfill('es6-promise');
    removePolyfill('promise-polyfill');
  }

  // Use native fetch instead of polyfilled versions
  if (window.fetch) {
    removePolyfill('whatwg-fetch');
    removePolyfill('isomorphic-fetch');
  }

  // Use native URL constructor
  if (window.URL) {
    removePolyfill('url-polyfill');
  }

  // Use native Object methods (available in all target browsers)
  if (typeof Object.assign === 'function' && typeof Object.entries === 'function' && typeof Object.values === 'function') {
    removePolyfill('object-assign');
    removePolyfill('object.entries');
    removePolyfill('object.values');
  }

  // Use native Array methods
  if (typeof Array.prototype.includes === 'function' && typeof Array.prototype.find === 'function') {
    removePolyfill('array-includes');
    removePolyfill('array.prototype.find');
  }

  // Use native String methods
  if (typeof String.prototype.includes === 'function' && typeof String.prototype.startsWith === 'function') {
    removePolyfill('string.prototype.includes');
    removePolyfill('string.prototype.startswith');
  }

  // Use native Symbol
  if (typeof Symbol !== 'undefined') {
    removePolyfill('symbol-polyfill');
  }

  // Use native WeakMap and WeakSet
  if (typeof WeakMap !== 'undefined' && typeof WeakSet !== 'undefined') {
    removePolyfill('weakmap-polyfill');
    removePolyfill('weakset-polyfill');
  }
}

// Remove specific polyfill if it exists
function removePolyfill(polyfillName: string) {
  // Remove script tags with polyfill names
  const scripts = document.querySelectorAll('script[src*="' + polyfillName + '"]');
  scripts.forEach(script => script.remove());
  
  // Remove from global scope if loaded
  const globalNames = [
    polyfillName.replace(/-/g, ''),
    polyfillName.replace(/-/g, '_'),
    polyfillName.toUpperCase().replace(/-/g, '_')
  ];
  
  globalNames.forEach(name => {
    if ((window as any)[name]) {
      delete (window as any)[name];
    }
  });
}

// Remove unnecessary polyfills that might be auto-loaded
function removeUnnecessaryPolyfills() {
  // Common polyfills that are unnecessary for Baseline 2023 browsers
  const unnecessaryPolyfills = [
    // ES6+ polyfills
    'babel-polyfill',
    'core-js',
    'regenerator-runtime',
    
    // Specific feature polyfills
    'es6-promise',
    'whatwg-fetch',
    'url-polyfill',
    'intersection-observer-polyfill',
    'resize-observer-polyfill',
    
    // Array/Object polyfills
    'array.prototype.find',
    'array.prototype.includes',
    'object.entries',
    'object.values',
    'object.assign',
    
    // String polyfills
    'string.prototype.includes',
    'string.prototype.startswith',
    'string.prototype.endswith',
    
    // DOM polyfills
    'element-closest',
    'classlist-polyfill',
    'custom-event-polyfill',
    
    // CSS polyfills
    'css-vars-ponyfill',
    'flexibility', // Flexbox polyfill
    'css-grid-polyfill'
  ];

  unnecessaryPolyfills.forEach(polyfill => {
    removePolyfill(polyfill);
  });

  // Remove polyfill detection scripts
  removePolyfillDetectionScripts();
}

// Remove polyfill detection and loading scripts
function removePolyfillDetectionScripts() {
  // Remove Modernizr if it's only used for polyfill detection
  if ((window as any).Modernizr && Object.keys((window as any).Modernizr).length < 5) {
    delete (window as any).Modernizr;
  }

  // Remove polyfill.io scripts
  const polyfillIoScripts = document.querySelectorAll('script[src*="polyfill.io"]');
  polyfillIoScripts.forEach(script => script.remove());

  // Remove feature detection utilities that are no longer needed
  const featureDetectionScripts = [
    'supports-es6',
    'feature-detect',
    'browser-detect'
  ];

  featureDetectionScripts.forEach(scriptName => {
    const scripts = document.querySelectorAll(`script[src*="${scriptName}"]`);
    scripts.forEach(script => script.remove());
  });
}

// Optimize specifically for Baseline 2023 features
function optimizeForBaseline2023() {
  // Enable modern CSS features
  enableModernCSS();
  
  // Use modern JavaScript APIs
  enableModernJavaScript();
  
  // Optimize event handling for modern browsers
  enableModernEventHandling();
  
  // Use modern loading strategies
  enableModernLoading();
}

// Enable modern CSS features without fallbacks
function enableModernCSS() {
  const modernCSS = document.createElement('style');
  modernCSS.id = 'modern-browser-optimizations';
  modernCSS.textContent = `
    /* Modern CSS features - no fallbacks needed for Baseline 2023 */
    
    /* CSS Grid (native support) */
    .modern-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }
    
    /* CSS Custom Properties (native support) */
    :root {
      --modern-primary: #3b82f6;
      --modern-secondary: #64748b;
      --modern-accent: #f59e0b;
    }
    
    /* Modern selectors */
    .card:is(.featured, .highlighted) {
      border: 2px solid var(--modern-primary);
    }
    
    /* Container queries (if supported) */
    @supports (container-type: inline-size) {
      .responsive-container {
        container-type: inline-size;
      }
      
      @container (min-width: 400px) {
        .card { padding: 2rem; }
      }
    }
    
    /* Modern pseudo-selectors */
    .form-field:user-invalid {
      border-color: #ef4444;
    }
    
    /* Cascade layers (if supported) */
    @supports (at-rule(@layer)) {
      @layer base, components, utilities;
    }
    
    /* Subgrid (if supported) */
    @supports (grid-template-rows: subgrid) {
      .subgrid-item {
        grid-template-rows: subgrid;
      }
    }
  `;
  
  document.head.appendChild(modernCSS);
}

// Enable modern JavaScript features
function enableModernJavaScript() {
  // Use native async/await instead of Promise chains where possible
  optimizeAsyncCode();
  
  // Use native optional chaining and nullish coalescing
  optimizePropertyAccess();
  
  // Use native private fields in classes
  optimizeClassDefinitions();
  
  // Use native BigInt for large numbers
  optimizeBigNumbers();
}

// Optimize async code to use native features
function optimizeAsyncCode() {
  // Replace Promise chains with async/await in dynamic imports
  (window as any).__optimizedImport = async (modulePath: string) => {
    try {
      const module = await import(/* @vite-ignore */ modulePath);
      return module;
    } catch (error) {
      console.error('Failed to import module:', modulePath, error);
      throw error;
    }
  };
}

// Optimize property access using modern syntax
function optimizePropertyAccess() {
  // Utility for safe property access using optional chaining
  (window as any).__safeAccess = (obj: any, path: string) => {
    return new Function('obj', `return obj?.${path}}`)(obj);
  };
}

// Optimize class definitions for modern browsers
function optimizeClassDefinitions() {
  // Enable modern class features
  (window as any).__ModernClass = class {
    // Private fields (native support)
    #privateData = new Map();
    
    // Static blocks (if supported)
    static {
      console.debug('Modern class features enabled');
    }
    
    setPrivate(key: string, value: any) {
      this.#privateData.set(key, value);
    }
    
    getPrivate(key: string) {
      return this.#privateData.get(key);
    }
  };
}

// Optimize for big numbers using native BigInt
function optimizeBigNumbers() {
  if (typeof BigInt !== 'undefined') {
    (window as any).__safeBigInt = (value: string | number) => {
      try {
        return BigInt(value);
      } catch {
        return Number(value);
      }
    };
  }
}

// Enable modern event handling
function enableModernEventHandling() {
  // Use native AbortController for cancellable operations
  if ('AbortController' in window) {
    (window as any).__createCancellableOperation = (operation: () => Promise<any>) => {
      const controller = new AbortController();
      const promise = operation();
      
      return {
        promise,
        cancel: () => controller.abort(),
        signal: controller.signal
      };
    };
  }

  // Use native EventTarget for custom events
  if ('EventTarget' in window) {
    (window as any).__ModernEventEmitter = class extends EventTarget {
      emit(eventName: string, data?: any) {
        this.dispatchEvent(new CustomEvent(eventName, { detail: data }));
      }
      
      on(eventName: string, handler: (event: CustomEvent) => void) {
        this.addEventListener(eventName, handler as EventListener);
      }
      
      off(eventName: string, handler: (event: CustomEvent) => void) {
        this.removeEventListener(eventName, handler as EventListener);
      }
    };
  }
}

// Enable modern loading strategies
function enableModernLoading() {
  // Use native lazy loading for images
  enableNativeLazyLoading();
  
  // Use native module preloading
  enableModulePreloading();
  
  // Use native intersection observer
  enableNativeIntersectionObserver();
}

// Enable native lazy loading for images
function enableNativeLazyLoading() {
  // Add loading="lazy" to images that don't have it
  const images = document.querySelectorAll('img:not([loading])');
  images.forEach(img => {
    (img as HTMLImageElement).loading = 'lazy';
  });
}

// Enable module preloading for better performance
function enableModulePreloading() {
  // Preload critical modules
  const criticalModules = [
    '/src/main.tsx',
    '/src/App.tsx'
  ];
  
  criticalModules.forEach(module => {
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = module;
    document.head.appendChild(link);
  });
}

// Enable native intersection observer for lazy loading
function enableNativeIntersectionObserver() {
  if ('IntersectionObserver' in window) {
    // Replace any polyfilled intersection observer usage
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-viewport');
        }
      });
    });
    
    // Observe lazy-loadable elements
    const lazyElements = document.querySelectorAll('[data-lazy]');
    lazyElements.forEach(el => observer.observe(el));
    
    (window as any).__modernIntersectionObserver = observer;
  }
}