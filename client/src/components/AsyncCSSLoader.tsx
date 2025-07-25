import { useEffect } from 'react';

// Async CSS Loader - Load non-critical CSS asynchronously to reduce render blocking
export function AsyncCSSLoader() {
  useEffect(() => {
    loadNonCriticalStyles();
  }, []);

  return null;
}

function loadNonCriticalStyles() {
  // Define non-critical CSS modules to load asynchronously
  const nonCriticalModules = [
    {
      name: 'animations',
      condition: () => window.matchMedia('(prefers-reduced-motion: no-preference)').matches,
      styles: generateAnimationCSS()
    },
    {
      name: 'interactive',
      condition: () => true, // Always load but defer
      styles: generateInteractiveCSS()
    },
    {
      name: 'print',
      condition: () => true,
      styles: generatePrintCSS(),
      media: 'print'
    },
    {
      name: 'large-screen',
      condition: () => window.innerWidth > 1200,
      styles: generateLargeScreenCSS(),
      media: '(min-width: 1200px)'
    }
  ];

  // Load each module asynchronously
  nonCriticalModules.forEach(module => {
    if (module.condition()) {
      loadStyleModule(module);
    }
  });

  // Set up responsive loading for screen size changes
  setupResponsiveLoading();
}

function loadStyleModule(module: { name: string; styles: string; media?: string }) {
  // Check if module already loaded
  if (document.querySelector(`[data-module="${module.name}"]`)) {
    return;
  }

  // Create style element
  const style = document.createElement('style');
  style.setAttribute('data-module', module.name);
  style.setAttribute('data-async-loaded', 'true');
  
  if (module.media) {
    style.media = module.media;
  }

  // Load asynchronously to avoid blocking
  requestIdleCallback(() => {
    style.textContent = module.styles;
    document.head.appendChild(style);
    
    console.debug(`Loaded ${module.name} CSS module (${(module.styles.length / 1024).toFixed(1)}KB)`);
  }, { timeout: 2000 });
}

function generateAnimationCSS(): string {
  return `
    /* Animation styles - loaded only if animations are preferred */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideIn {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    .animate-slide-in { animation: slideIn 0.4s ease-out; }
    .animate-pulse { animation: pulse 2s infinite; }
    
    .transition-all { transition: all 0.3s ease; }
    .transition-colors { transition: color 0.2s, background-color 0.2s, border-color 0.2s; }
    .transition-transform { transition: transform 0.2s ease; }
  `;
}

function generateInteractiveCSS(): string {
  return `
    /* Interactive states - deferred loading */
    .hover\\:bg-gray-100:hover { background-color: rgb(243 244 246); }
    .hover\\:bg-gray-200:hover { background-color: rgb(229 231 235); }
    .hover\\:text-blue-600:hover { color: rgb(37 99 235); }
    .hover\\:scale-105:hover { transform: scale(1.05); }
    .hover\\:shadow-lg:hover { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); }
    
    .focus\\:outline-none:focus { outline: 2px solid transparent; }
    .focus\\:ring-2:focus { box-shadow: 0 0 0 2px rgb(59 130 246 / 0.5); }
    .focus\\:border-blue-500:focus { border-color: rgb(59 130 246); }
    
    .active\\:scale-95:active { transform: scale(0.95); }
    
    /* Tooltip styles */
    .tooltip { position: relative; }
    .tooltip::after {
      content: attr(data-tooltip);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: rgb(0 0 0 / 0.8);
      color: white;
      padding: 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
    }
    .tooltip:hover::after { opacity: 1; }
    
    /* Modal and overlay styles */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgb(0 0 0 / 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .dropdown-menu {
      position: absolute;
      background: white;
      border: 1px solid rgb(229 231 235);
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      z-index: 50;
    }
  `;
}

function generatePrintCSS(): string {
  return `
    /* Print styles */
    @media print {
      * { color-adjust: exact !important; }
      
      .no-print { display: none !important; }
      
      .print-break-before { page-break-before: always; }
      .print-break-after { page-break-after: always; }
      .print-break-inside { page-break-inside: avoid; }
      
      header, nav, .navigation { display: none; }
      footer { position: static; }
      
      a::after { content: " (" attr(href) ")"; }
      
      body { font-size: 12pt; line-height: 1.4; }
      h1 { font-size: 18pt; }
      h2 { font-size: 16pt; }
      h3 { font-size: 14pt; }
      
      .container { max-width: none; margin: 0; padding: 0; }
    }
  `;
}

function generateLargeScreenCSS(): string {
  return `
    /* Large screen optimizations */
    @media (min-width: 1200px) {
      .container { max-width: 1200px; }
      .lg\\:text-6xl { font-size: 3.75rem; line-height: 1; }
      .lg\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
      .lg\\:py-20 { padding-top: 5rem; padding-bottom: 5rem; }
      .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .lg\\:gap-8 { gap: 2rem; }
      .lg\\:space-x-8 > :not([hidden]) ~ :not([hidden]) { margin-left: 2rem; }
    }
    
    @media (min-width: 1400px) {
      .container { max-width: 1400px; }
      .xl\\:text-7xl { font-size: 4.5rem; line-height: 1; }
      .xl\\:px-12 { padding-left: 3rem; padding-right: 3rem; }
      .xl\\:gap-12 { gap: 3rem; }
    }
  `;
}

function setupResponsiveLoading() {
  // Load additional styles on screen size changes
  const mediaQuery = window.matchMedia('(min-width: 1200px)');
  
  const handleScreenChange = (e: MediaQueryListEvent) => {
    if (e.matches && !document.querySelector('[data-module="large-screen"]')) {
      loadStyleModule({
        name: 'large-screen',
        styles: generateLargeScreenCSS(),
        media: '(min-width: 1200px)'
      });
    }
  };

  mediaQuery.addListener(handleScreenChange);
  
  // Cleanup function
  return () => {
    mediaQuery.removeListener(handleScreenChange);
  };
}

// Helper function for requestIdleCallback fallback
function requestIdleCallback(callback: () => void, options?: { timeout?: number }) {
  if ('requestIdleCallback' in window) {
    return (window as any).requestIdleCallback(callback, options);
  } else {
    return setTimeout(callback, 1);
  }
}