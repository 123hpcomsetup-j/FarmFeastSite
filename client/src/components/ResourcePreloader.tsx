import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export default function ResourcePreloader() {
  const { data: settings } = useQuery<any[]>({
    queryKey: ["/api/settings"],
  });

  const { data: services } = useQuery<any[]>({
    queryKey: ["/api/services"],
  });

  const { data: gallery } = useQuery<any[]>({
    queryKey: ["/api/gallery"],
  });

  useEffect(() => {
    // Preload critical CSS fonts
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.href = 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);

    // Preload hero image
    if (gallery && gallery.length > 0) {
      const heroImage = gallery.find(img => img.category === 'exterior') || gallery[0];
      if (heroImage) {
        const img = new Image();
        img.src = heroImage.source === 'url' ? heroImage.url : `/uploads/${heroImage.filename}`;
      }
    }

    // Prefetch next likely pages
    const prefetchPages = ['/services', '/booking', '/gallery'];
    prefetchPages.forEach(page => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = page;
      document.head.appendChild(link);
    });

    return () => {
      // Cleanup
      const preloadLinks = document.querySelectorAll('link[rel="preload"], link[rel="prefetch"]');
      preloadLinks.forEach(link => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [gallery]);

  return null;
}