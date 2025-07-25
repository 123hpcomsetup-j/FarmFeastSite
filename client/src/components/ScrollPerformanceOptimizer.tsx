import { useEffect, useRef } from 'react';

// Scroll Performance Optimizer - Optimize all scroll-related interactions
export function ScrollPerformanceOptimizer() {
  const rafId = useRef<number>();
  const scrollTimeout = useRef<number>();
  
  useEffect(() => {
    optimizeScrollPerformance();
    setupScrollThrottling();
    
    return () => {
      cleanupScrollOptimizations();
    };
  }, []);

  // Optimize scroll performance across the application
  const optimizeScrollPerformance = () => {
    // Enable passive event listeners for all scroll events
    enablePassiveScrollListeners();
    
    // Optimize scroll-triggered animations
    optimizeScrollAnimations();
    
    // Set up efficient scroll handling
    setupEfficientScrollHandling();
    
    // Optimize touch scrolling on mobile
    optimizeTouchScrolling();
  };

  // Enable passive event listeners for scroll events
  const enablePassiveScrollListeners = () => {
    const scrollElements = document.querySelectorAll('[data-scroll-handler]');
    
    scrollElements.forEach(element => {
      // Remove existing non-passive listeners
      const existingHandlers = (element as any).__scrollHandlers || [];
      existingHandlers.forEach((handler: EventListener) => {
        element.removeEventListener('scroll', handler);
        // Re-add as passive
        element.addEventListener('scroll', handler, { passive: true });
      });
    });
    
    // Global scroll optimization
    window.addEventListener('scroll', handleOptimizedScroll, { passive: true });
    
    console.debug('Passive scroll listeners enabled');
  };

  // Optimized scroll handler using requestAnimationFrame
  const handleOptimizedScroll = () => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    
    rafId.current = requestAnimationFrame(() => {
      // Batch scroll-related DOM updates
      batchScrollUpdates();
    });
  };

  // Batch scroll-related DOM updates for better performance
  const batchScrollUpdates = () => {
    const scrollY = window.pageYOffset;
    const windowHeight = window.innerHeight;
    
    // Update scroll-dependent elements efficiently
    updateScrollProgress(scrollY);
    updateVisibilityStates(scrollY, windowHeight);
    updateParallaxElements(scrollY);
  };

  // Update scroll progress indicators
  const updateScrollProgress = (scrollY: number) => {
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(scrollY / documentHeight, 1);
    
    // Update progress bars
    const progressBars = document.querySelectorAll('[data-scroll-progress]');
    progressBars.forEach((bar) => {
      (bar as HTMLElement).style.transform = `scaleX(${progress})`;
    });
  };

  // Update element visibility states based on scroll position
  const updateVisibilityStates = (scrollY: number, windowHeight: number) => {
    const elements = document.querySelectorAll('[data-scroll-reveal]');
    
    elements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < windowHeight && rect.bottom > 0;
      
      if (isVisible && !element.hasAttribute('data-revealed')) {
        element.setAttribute('data-revealed', 'true');
        element.classList.add('scroll-revealed');
      }
    });
  };

  // Update parallax elements with transform3d for GPU acceleration
  const updateParallaxElements = (scrollY: number) => {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    parallaxElements.forEach((element) => {
      const speed = parseFloat(element.getAttribute('data-parallax') || '0.5');
      const offset = scrollY * speed;
      
      // Use transform3d for GPU acceleration
      (element as HTMLElement).style.transform = `translate3d(0, ${offset}px, 0)`;
    });
  };

  // Optimize scroll-triggered animations
  const optimizeScrollAnimations = () => {
    // Use Intersection Observer for better performance
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          triggerScrollAnimation(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    // Observe elements with scroll animations
    const animatedElements = document.querySelectorAll('[data-scroll-animate]');
    animatedElements.forEach((el) => animationObserver.observe(el));
    
    // Store observer for cleanup
    (window as any).__scrollAnimationObserver = animationObserver;
  };

  // Trigger scroll animation on element
  const triggerScrollAnimation = (element: Element) => {
    const animationType = element.getAttribute('data-scroll-animate');
    
    switch (animationType) {
      case 'fade-in':
        element.classList.add('animate-fade-in');
        break;
      case 'slide-up':
        element.classList.add('animate-slide-up');
        break;
      case 'scale-in':
        element.classList.add('animate-scale-in');
        break;
      default:
        element.classList.add('scroll-animated');
    }
  };

  // Set up efficient scroll handling with throttling
  const setupEfficientScrollHandling = () => {
    let isScrolling = false;
    
    const throttledScrollHandler = () => {
      if (!isScrolling) {
        requestAnimationFrame(() => {
          handleScrollEvents();
          isScrolling = false;
        });
        isScrolling = true;
      }
    };
    
    // Replace existing scroll handlers with throttled version
    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
  };

  // Handle scroll events efficiently
  const handleScrollEvents = () => {
    // Update scroll-dependent UI elements
    updateScrollDependentUI();
    
    // Lazy load images in viewport
    lazyLoadVisibleImages();
    
    // Update navigation state
    updateNavigationState();
  };

  // Update UI elements that depend on scroll position
  const updateScrollDependentUI = () => {
    const scrollY = window.pageYOffset;
    
    // Update sticky navigation
    const navbar = document.querySelector('[data-sticky-nav]');
    if (navbar) {
      if (scrollY > 100) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    
    // Update scroll-to-top button
    const scrollTopButton = document.querySelector('[data-scroll-top]');
    if (scrollTopButton) {
      if (scrollY > 500) {
        (scrollTopButton as HTMLElement).style.opacity = '1';
        (scrollTopButton as HTMLElement).style.pointerEvents = 'auto';
      } else {
        (scrollTopButton as HTMLElement).style.opacity = '0';
        (scrollTopButton as HTMLElement).style.pointerEvents = 'none';
      }
    }
  };

  // Lazy load images that become visible
  const lazyLoadVisibleImages = () => {
    const lazyImages = document.querySelectorAll('img[data-src]:not([src])');
    
    lazyImages.forEach((img) => {
      const rect = img.getBoundingClientRect();
      if (rect.top < window.innerHeight + 200) {
        const src = img.getAttribute('data-src');
        if (src) {
          img.setAttribute('src', src);
          img.removeAttribute('data-src');
        }
      }
    });
  };

  // Update navigation state based on scroll position
  const updateNavigationState = () => {
    const sections = document.querySelectorAll('[data-nav-section]');
    const navLinks = document.querySelectorAll('[data-nav-link]');
    
    let activeSection = '';
    
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 100 && rect.bottom > 100) {
        activeSection = section.getAttribute('data-nav-section') || '';
      }
    });
    
    // Update active navigation link
    navLinks.forEach((link) => {
      const linkTarget = link.getAttribute('data-nav-link');
      if (linkTarget === activeSection) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  // Optimize touch scrolling for mobile devices
  const optimizeTouchScrolling = () => {
    // Enable momentum scrolling on iOS
    document.body.style.webkitOverflowScrolling = 'touch';
    
    // Optimize touch events for scrolling
    let touchStartY = 0;
    let isScrollingDown = false;
    
    document.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
      const touchY = e.touches[0].clientY;
      isScrollingDown = touchY < touchStartY;
      
      // Optimize scroll direction handling
      handleScrollDirection(isScrollingDown);
    }, { passive: true });
  };

  // Handle scroll direction changes
  const handleScrollDirection = (isDown: boolean) => {
    const navbar = document.querySelector('[data-hide-on-scroll]');
    if (navbar) {
      if (isDown) {
        navbar.classList.add('scroll-hide');
      } else {
        navbar.classList.remove('scroll-hide');
      }
    }
  };

  // Set up scroll throttling for better performance
  const setupScrollThrottling = () => {
    let scrollTimer: number;
    
    const throttledScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        // Scroll ended, clean up any pending operations
        cleanupScrollOperations();
      }, 100);
    };
    
    window.addEventListener('scroll', throttledScroll, { passive: true });
  };

  // Clean up scroll operations when scrolling stops
  const cleanupScrollOperations = () => {
    // Cancel any pending animations
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = undefined;
    }
    
    // Reset scroll-related states if needed
    resetScrollStates();
  };

  // Reset scroll-related states
  const resetScrollStates = () => {
    // Clear any temporary scroll classes
    const tempElements = document.querySelectorAll('[data-scroll-temp]');
    tempElements.forEach((el) => {
      el.removeAttribute('data-scroll-temp');
    });
  };

  // Clean up scroll optimizations
  const cleanupScrollOptimizations = () => {
    // Cancel animation frames
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    
    // Clear timeouts
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    // Disconnect observers
    if ((window as any).__scrollAnimationObserver) {
      (window as any).__scrollAnimationObserver.disconnect();
    }
    
    console.debug('Scroll performance optimizations cleaned up');
  };

  return null;
}