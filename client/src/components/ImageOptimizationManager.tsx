import { useEffect, useRef } from 'react';

// Advanced Image Optimization Manager - Reduces image download time and improves LCP
export function ImageOptimizationManager() {
  const processedImages = useRef(new Set<string>());

  useEffect(() => {
    implementImageOptimizations();
    setupAdvancedLazyLoading();
    // optimizeImageFormats(); // Will be implemented with server-side optimization
    setupProgressiveLoading();
    
    return () => {
      cleanup();
    };
  }, []);

  // Implement comprehensive image optimizations
  const implementImageOptimizations = () => {
    // 1. WebP format conversion for modern browsers
    convertToModernFormats();
    
    // 2. Responsive image loading
    setupResponsiveImages();
    
    // 3. Critical image preloading
    preloadCriticalImages();
    
    // 4. Compression optimization
    optimizeImageCompression();
    
    // 5. Lazy loading with intersection observer
    setupIntersectionObserver();
    
    console.debug('Image optimization strategies implemented');
  };

  // Convert images to modern formats (WebP/AVIF) for faster loading
  const convertToModernFormats = () => {
    const supportsWebP = checkWebPSupport();
    const supportsAVIF = checkAVIFSupport();
    
    document.querySelectorAll('img[src]').forEach((element) => {
      const img = element as HTMLImageElement;
      if (processedImages.current.has(img.src)) return;
      
      const originalSrc = img.src;
      let optimizedSrc = originalSrc;
      
      // Use modern format if supported
      if (supportsAVIF && !originalSrc.includes('.avif')) {
        optimizedSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.avif');
      } else if (supportsWebP && !originalSrc.includes('.webp')) {
        optimizedSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      }
      
      // Fallback to original if modern format fails
      if (optimizedSrc !== originalSrc) {
        const testImg = new Image();
        testImg.onload = () => {
          img.src = optimizedSrc;
          processedImages.current.add(originalSrc);
        };
        testImg.onerror = () => {
          // Keep original format if modern format not available
          processedImages.current.add(originalSrc);
        };
        testImg.src = optimizedSrc;
      }
    });
  };

  // Check browser support for modern image formats
  const checkWebPSupport = (): boolean => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  };

  const checkAVIFSupport = (): boolean => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    try {
      return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    } catch (error) {
      return false;
    }
  };

  // Setup responsive images based on device characteristics
  const setupResponsiveImages = () => {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const screenWidth = window.innerWidth;
    const connectionSpeed = getConnectionSpeed();
    
    document.querySelectorAll('img').forEach((element) => {
      const img = element as HTMLImageElement;
      if (processedImages.current.has(img.src + '_responsive')) return;
      
      // Calculate optimal image size
      const imgWidth = img.clientWidth || img.naturalWidth || 300;
      const optimalWidth = Math.min(imgWidth * devicePixelRatio, screenWidth);
      
      // Adjust quality based on connection speed
      let quality = 85; // Default quality
      if (connectionSpeed === 'slow') quality = 70;
      if (connectionSpeed === 'fast') quality = 95;
      
      // Create responsive image URL (if using image service)
      if (img.src.includes('/api/placeholder/')) {
        const newSrc = img.src.replace(/\/api\/placeholder\/\d+\/\d+/, 
          `/api/placeholder/${Math.round(optimalWidth)}/auto?q=${quality}`);
        img.src = newSrc;
        processedImages.current.add(img.src + '_responsive');
      }
    });
  };

  // Preload critical images for LCP optimization
  const preloadCriticalImages = () => {
    // Identify above-the-fold images
    const criticalImages = Array.from(document.querySelectorAll('img')).filter(img => {
      const rect = img.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.left < window.innerWidth;
    });

    criticalImages.slice(0, 3).forEach((img: HTMLImageElement) => {
      if (img.src && !processedImages.current.has(img.src + '_preloaded')) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = img.src;
        link.setAttribute('fetchpriority', 'high');
        document.head.appendChild(link);
        
        // Also add to img element for immediate LCP benefit
        img.setAttribute('fetchpriority', 'high');
        img.setAttribute('loading', 'eager');
        
        processedImages.current.add(img.src + '_preloaded');
        console.debug(`Preloaded critical image: ${img.src}`);
      }
    });
  };

  // Optimize image compression based on content type
  const optimizeImageCompression = () => {
    document.querySelectorAll('img').forEach((element) => {
      const img = element as HTMLImageElement;
      if (processedImages.current.has(img.src + '_compressed')) return;
      
      // Add compression hints via URL parameters (if supported by backend)
      if (img.src.includes('/api/') || img.src.includes('/uploads/')) {
        const url = new URL(img.src, window.location.origin);
        
        // Add compression parameters
        if (!url.searchParams.has('compress')) {
          url.searchParams.set('compress', 'true');
          url.searchParams.set('quality', '85');
          url.searchParams.set('format', 'auto');
          
          img.src = url.toString();
          processedImages.current.add(img.src + '_compressed');
        }
      }
    });
  };

  // Advanced lazy loading with intersection observer
  const setupAdvancedLazyLoading = () => {
    const lazyImageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          loadImageOptimized(img);
          lazyImageObserver.unobserve(img);
        }
      });
    }, {
      // Start loading images 100px before they come into view
      rootMargin: '100px 0px',
      threshold: 0.01
    });

    // Observe all images that should be lazy loaded
    document.querySelectorAll('img[data-src]').forEach(img => {
      lazyImageObserver.observe(img);
    });

    // Setup automatic lazy loading for dynamically added images
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const imgs = element.tagName === 'IMG' ? [element] : Array.from(element.querySelectorAll('img'));
            
            imgs.forEach(img => {
              if (img.getAttribute('data-src') && !img.src) {
                lazyImageObserver.observe(img);
              }
            });
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  };

  // Load image with optimization
  const loadImageOptimized = (img: HTMLImageElement) => {
    const dataSrc = img.getAttribute('data-src');
    if (!dataSrc) return;

    // Create optimized image
    const optimizedImg = new Image();
    
    // Add loading event handlers
    optimizedImg.onload = () => {
      // Smooth transition
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.3s ease';
      
      setTimeout(() => {
        img.src = optimizedImg.src;
        img.style.opacity = '1';
        img.removeAttribute('data-src');
      }, 10);
    };

    optimizedImg.onerror = () => {
      // Fallback to original src
      img.src = dataSrc;
      img.removeAttribute('data-src');
    };

    // Load optimized version
    optimizedImg.src = dataSrc;
  };

  // Setup intersection observer for performance monitoring
  const setupIntersectionObserver = () => {
    const imagePerformanceObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          measureImageLoadTime(img);
        }
      });
    });

    document.querySelectorAll('img').forEach(img => {
      imagePerformanceObserver.observe(img);
    });
  };

  // Measure image load performance
  const measureImageLoadTime = (img: HTMLImageElement) => {
    const startTime = performance.now();
    
    if (img.complete && img.naturalHeight !== 0) {
      // Already loaded
      const loadTime = 0;
      console.debug(`Image already loaded: ${img.src} (${loadTime}ms)`);
      return;
    }

    const onLoad = () => {
      const loadTime = performance.now() - startTime;
      console.debug(`Image loaded: ${img.src} (${loadTime.toFixed(2)}ms)`);
      
      // Store performance data
      const perfKey = `img_load_${img.src.split('/').pop()}`;
      localStorage.setItem(perfKey, loadTime.toString());
      
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
    };

    const onError = () => {
      const loadTime = performance.now() - startTime;
      console.debug(`Image failed: ${img.src} (${loadTime.toFixed(2)}ms)`);
      
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
    };

    img.addEventListener('load', onLoad);
    img.addEventListener('error', onError);
  };

  // Setup progressive loading for large images
  const setupProgressiveLoading = () => {
    document.querySelectorAll('img').forEach((element) => {
      const img = element as HTMLImageElement;
      if (processedImages.current.has(img.src + '_progressive')) return;
      
      // Create low-quality placeholder
      if (img.src && !img.src.includes('placeholder')) {
        const placeholderSrc = generateLowQualityPlaceholder(img.src);
        
        if (placeholderSrc !== img.src) {
          // Load placeholder first
          const placeholder = new Image();
          placeholder.onload = () => {
            // Show blurred placeholder
            img.style.filter = 'blur(5px)';
            img.style.transition = 'filter 0.3s ease';
            img.src = placeholderSrc;
            
            // Load high-quality image
            const highQuality = new Image();
            highQuality.onload = () => {
              img.src = highQuality.src;
              img.style.filter = 'none';
            };
            highQuality.src = img.getAttribute('data-src') || img.src.replace(/q=\d+/, 'q=95');
          };
          placeholder.src = placeholderSrc;
          
          processedImages.current.add(img.src + '_progressive');
        }
      }
    });
  };

  // Generate low-quality placeholder
  const generateLowQualityPlaceholder = (src: string): string => {
    if (src.includes('/api/placeholder/')) {
      return src.replace(/\/(\d+)\/(\d+)/, '/50/50').replace(/q=\d+/, 'q=20');
    }
    
    // For other images, return a data URL placeholder
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjEwIiB5PSIyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5Ij5Mb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg==';
  };

  // Get connection speed
  const getConnectionSpeed = (): 'slow' | 'medium' | 'fast' => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'slow';
      if (effectiveType === '3g') return 'medium';
      return 'fast';
    }
    
    return 'medium'; // Default assumption
  };

  // Cleanup function
  const cleanup = () => {
    processedImages.current.clear();
    console.debug('Image optimization cleanup completed');
  };

  return null; // This component only runs effects
}

// Image preloader utility
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(url => 
      new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      })
    )
  );
}

// LCP image optimization utility
export function optimizeLCPImage() {
  // Find the largest image in viewport (likely LCP candidate)
  const images = Array.from(document.querySelectorAll('img')).filter(img => {
    const rect = img.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.left < window.innerWidth;
  });

  if (images.length === 0) return;

  // Sort by size (area)
  images.sort((a, b) => {
    const aArea = a.clientWidth * a.clientHeight;
    const bArea = b.clientWidth * b.clientHeight;
    return bArea - aArea;
  });

  const lcpImage = images[0];
  if (lcpImage) {
    // Optimize LCP image
    lcpImage.setAttribute('fetchpriority', 'high');
    lcpImage.setAttribute('loading', 'eager');
    lcpImage.style.willChange = 'transform';
    
    // Preload if not already done
    if (lcpImage.src && !lcpImage.src.includes('data:')) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = lcpImage.src;
      link.setAttribute('fetchpriority', 'high');
      document.head.appendChild(link);
      
      console.debug(`Optimized LCP image: ${lcpImage.src}`);
    }
  }
}

// Batch image loading utility
export function loadImagesInBatches(imageElements: HTMLImageElement[], batchSize = 3, delay = 100): void {
  let currentBatch = 0;
  
  const loadBatch = () => {
    const start = currentBatch * batchSize;
    const end = Math.min(start + batchSize, imageElements.length);
    
    for (let i = start; i < end; i++) {
      const img = imageElements[i];
      const dataSrc = img.getAttribute('data-src');
      if (dataSrc) {
        img.src = dataSrc;
        img.removeAttribute('data-src');
      }
    }
    
    currentBatch++;
    
    if (end < imageElements.length) {
      setTimeout(loadBatch, delay);
    }
  };
  
  loadBatch();
}