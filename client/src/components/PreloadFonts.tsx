import { useEffect } from 'react';

export default function PreloadFonts() {
  useEffect(() => {
    // Preload critical fonts
    const fontPreloads = [
      'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
      'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2'
    ];

    fontPreloads.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Font display optimization
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url('${fontPreloads[0]}') format('woff2');
      }
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 600;
        font-display: swap;
        src: url('${fontPreloads[1]}') format('woff2');
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Cleanup on unmount
      const preloadLinks = document.querySelectorAll('link[rel="preload"][as="font"]');
      preloadLinks.forEach(link => link.remove());
    };
  }, []);

  return null;
}