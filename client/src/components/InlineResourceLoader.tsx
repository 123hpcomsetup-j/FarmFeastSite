import { useEffect } from 'react';

// Inline critical resources to avoid render-blocking requests
export default function InlineResourceLoader() {
  useEffect(() => {
    // Inline critical CSS immediately to avoid blocking
    const inlineCriticalStyles = () => {
      const style = document.createElement('style');
      style.textContent = `
        /* Critical above-the-fold styles */
        .critical-hero { 
          height: 100vh; 
          display: flex; 
          align-items: center; 
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        .critical-navbar { 
          position: fixed; 
          top: 0; 
          width: 100%; 
          z-index: 50; 
          background: rgba(255,255,255,0.95); 
          backdrop-filter: blur(10px);
        }
        .critical-text { 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
          line-height: 1.6;
        }
        .critical-button { 
          display: inline-flex; 
          align-items: center; 
          padding: 12px 24px; 
          background: #3b82f6; 
          color: white; 
          border-radius: 8px; 
          text-decoration: none; 
          transition: transform 0.2s;
        }
        .critical-button:hover { 
          transform: translateY(-2px); 
        }
      `;
      document.head.insertBefore(style, document.head.firstChild);
    };

    // Inline critical resources immediately
    inlineCriticalStyles();

    // Preconnect to external domains to reduce connection time
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://api.mapbox.com'
    ];

    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // DNS prefetch for likely domains
    const dnsPrefetchDomains = [
      'https://cdn.jsdelivr.net',
      'https://unpkg.com'
    ];

    dnsPrefetchDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });

  }, []);

  return null;
}