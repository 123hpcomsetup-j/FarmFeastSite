// @ts-nocheck
// Performance Testing Utility
export class PerformanceAnalyzer {
  constructor() {
    this.metrics = {};
    this.startTime = performance.now();
  }

  // Test Core Web Vitals
  measureCoreWebVitals() {
    return new Promise((resolve) => {
      const vitals = {
        FCP: null,
        LCP: null,
        FID: null,
        CLS: null,
        TTFB: null
      };

      // First Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        vitals.FCP = entries[0]?.startTime || null;
        console.log('✅ FCP (First Contentful Paint):', Math.round(vitals.FCP), 'ms');
      }).observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.LCP = lastEntry?.startTime || null;
        console.log('🎯 LCP (Largest Contentful Paint):', Math.round(vitals.LCP), 'ms');
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        vitals.CLS = clsValue;
        console.log('📐 CLS (Cumulative Layout Shift):', vitals.CLS.toFixed(3));
      }).observe({ entryTypes: ['layout-shift'] });

      // Time to First Byte
      const navEntry = performance.getEntriesByType('navigation')[0];
      if (navEntry) {
        vitals.TTFB = navEntry.responseStart - navEntry.requestStart;
        console.log('⚡ TTFB (Time to First Byte):', Math.round(vitals.TTFB), 'ms');
      }

      setTimeout(() => resolve(vitals), 3000);
    });
  }

  // Test Resource Loading
  analyzeResourceLoading() {
    const resources = performance.getEntriesByType('resource');
    const analysis = {
      totalResources: resources.length,
      cssFiles: resources.filter(r => r.name.includes('.css')).length,
      jsFiles: resources.filter(r => r.name.includes('.js')).length,
      images: resources.filter(r => r.name.includes('image') || r.name.includes('.jpg') || r.name.includes('.png')).length,
      renderBlocking: resources.filter(r => r.renderBlockingStatus === 'blocking').length,
      preloaded: resources.filter(r => r.name.includes('preload')).length
    };

    console.group('📊 Resource Loading Analysis');
    console.log('Total Resources:', analysis.totalResources);
    console.log('CSS Files:', analysis.cssFiles);
    console.log('JS Files:', analysis.jsFiles);
    console.log('Images:', analysis.images);
    console.log('Render Blocking:', analysis.renderBlocking);
    console.log('Preloaded:', analysis.preloaded);
    console.groupEnd();

    return analysis;
  }

  // Test Bundle Size Analysis
  analyzeBundleSize() {
    const scripts = document.querySelectorAll('script[src]');
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    
    console.group('📦 Bundle Analysis');
    console.log('JavaScript Bundles:', scripts.length);
    console.log('CSS Bundles:', stylesheets.length);
    
    // Check for lazy loading
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    const eagerImages = document.querySelectorAll('img[loading="eager"]');
    console.log('Lazy Images:', lazyImages.length);
    console.log('Eager Images (LCP candidates):', eagerImages.length);
    
    // Check for critical optimizations
    const preconnects = document.querySelectorAll('link[rel="preconnect"]');
    const preloads = document.querySelectorAll('link[rel="preload"]');
    console.log('Preconnect Links:', preconnects.length);
    console.log('Preload Links:', preloads.length);
    console.groupEnd();

    return {
      scripts: scripts.length,
      stylesheets: stylesheets.length,
      lazyImages: lazyImages.length,
      eagerImages: eagerImages.length,
      preconnects: preconnects.length,
      preloads: preloads.length
    };
  }

  // Test Critical Path Optimization
  testCriticalPath() {
    const criticalTests = {
      inlineCss: !!document.querySelector('style'),
      fontPreload: !!document.querySelector('link[rel="preload"][as="style"]'),
      modulePreload: !!document.querySelector('link[rel="modulepreload"]'),
      fetchPriority: !!document.querySelector('img[fetchpriority="high"]'),
      asyncDecoding: !!document.querySelector('img[decoding="async"]')
    };

    console.group('🎯 Critical Path Optimizations');
    Object.entries(criticalTests).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}:`, passed);
    });
    console.groupEnd();

    return criticalTests;
  }

  // Generate Performance Report
  async generateReport() {
    console.group('🚀 Performance Test Results');
    
    // 1. Core Web Vitals
    console.log('🔍 Measuring Core Web Vitals...');
    const vitals = await this.measureCoreWebVitals();
    
    // 2. Resource Analysis
    const resources = this.analyzeResourceLoading();
    
    // 3. Bundle Analysis
    const bundles = this.analyzeBundleSize();
    
    // 4. Critical Path Tests
    const criticalPath = this.testCriticalPath();
    
    // 5. Performance Score
    const score = this.calculatePerformanceScore(vitals, resources, bundles, criticalPath);
    
    console.log('📈 Overall Performance Score:', score + '/100');
    console.groupEnd();

    return {
      vitals,
      resources,
      bundles,
      criticalPath,
      score
    };
  }

  calculatePerformanceScore(vitals, resources, bundles, criticalPath) {
    let score = 0;
    
    // LCP scoring (35 points)
    if (vitals.LCP < 2500) score += 35;
    else if (vitals.LCP < 4000) score += 20;
    else score += 5;
    
    // FCP scoring (25 points)
    if (vitals.FCP < 1800) score += 25;
    else if (vitals.FCP < 3000) score += 15;
    else score += 5;
    
    // CLS scoring (15 points)
    if (vitals.CLS < 0.1) score += 15;
    else if (vitals.CLS < 0.25) score += 10;
    else score += 3;
    
    // Resource optimization (15 points)
    if (resources.renderBlocking < 3) score += 8;
    if (bundles.preloads >= 2) score += 4;
    if (bundles.lazyImages > bundles.eagerImages) score += 3;
    
    // Critical path optimizations (10 points)
    const criticalOptimizations = Object.values(criticalPath).filter(Boolean).length;
    score += Math.min(criticalOptimizations * 2, 10);
    
    return Math.min(score, 100);
  }
}

// Auto-run performance test in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.testPerformance = () => {
    const analyzer = new PerformanceAnalyzer();
    return analyzer.generateReport();
  };
  
  // Auto-run after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      console.log('🔬 Running automatic performance test...');
      window.testPerformance();
    }, 2000);
  });
}