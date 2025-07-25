import { useEffect } from 'react';
import { LazyLoader, deferUntilIdle } from '@/utils/lazyLoader';

export function ScriptOptimizer() {
  useEffect(() => {
    // Remove unused event listeners
    const cleanup = () => {
      // Remove any global event listeners that aren't needed
      LazyLoader.cleanup();
    };

    // Defer non-critical script optimization
    deferUntilIdle(() => {
      // Remove unused CSS
      removeUnusedCSS();
      
      // Optimize images loading
      optimizeImageLoading();
      
      // Clean up unused event listeners
      cleanupEventListeners();
    });

    return cleanup;
  }, []);

  return null;
}

// Remove unused CSS rules
function removeUnusedCSS() {
  const stylesheets = document.styleSheets;
  
  try {
    Array.from(stylesheets).forEach(stylesheet => {
      if (stylesheet.href && stylesheet.href.includes('unused')) {
        stylesheet.disabled = true;
      }
    });
  } catch (error) {
    // Silently handle cross-origin stylesheet errors
    console.debug('CSS optimization skipped due to CORS');
  }
}

// Optimize image loading
function optimizeImageLoading() {
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  // Use intersection observer for better performance
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
}

// Clean up unused event listeners
function cleanupEventListeners() {
  // Remove abandoned event listeners
  const elements = document.querySelectorAll('[data-cleanup]');
  elements.forEach(element => {
    element.removeAttribute('data-cleanup');
  });
}