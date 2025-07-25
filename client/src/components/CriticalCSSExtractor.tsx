import { useEffect } from 'react';

// Critical CSS Extractor - Extract and inline only above-the-fold CSS
export function CriticalCSSExtractor() {
  useEffect(() => {
    extractCriticalCSS();
  }, []);

  return null;
}

function extractCriticalCSS() {
  // Define above-the-fold selectors
  const criticalSelectors = [
    // Layout and structure
    'html', 'body', '*', 
    '.container', '.wrapper', '.main',
    
    // Navigation (always visible)
    'nav', '.nav', '.navbar', '.navigation',
    '.menu', '.header', '.sticky',
    
    // Hero section (above the fold)
    '.hero', '.hero-section', '.banner',
    '.jumbotron', '.intro', '.featured',
    
    // Critical typography
    'h1', 'h2', '.title', '.heading',
    'p', '.text', '.description',
    
    // Essential UI elements
    '.btn', '.button', 'button',
    '.form', 'input', 'select', 'textarea',
    
    // Loading states
    '.loading', '.spinner', '.skeleton',
    
    // Critical utilities
    '.hidden', '.visible', '.sr-only',
    '.flex', '.grid', '.block', '.inline',
    '.text-center', '.text-left', '.text-right',
    '.bg-', '.text-', '.border-', '.p-', '.m-',
    
    // Framework-specific critical classes
    '.container-fluid', '.row', '.col-',
    '.d-flex', '.justify-content-', '.align-items-',
    
    // Component library critical styles
    '.shadcn', '.radix', '.lucide',
    '[data-state]', '[data-orientation]'
  ];

  const nonCriticalSelectors = [
    // Below-the-fold content
    '.footer', '.sidebar', '.aside',
    '.gallery', '.carousel', '.slider',
    '.modal', '.popup', '.overlay',
    '.tooltip', '.dropdown', '.accordion',
    '.tabs', '.tab-content', '.pagination',
    
    // Interactive states (can be deferred)
    ':hover', ':focus', ':active',
    '.hover\\:', '.focus\\:', '.active\\:',
    
    // Animation and transitions
    '@keyframes', '.animate-', '.transition-',
    '.fade', '.slide', '.bounce', '.pulse',
    
    // Print styles
    '@media print',
    
    // Large screen specific
    '@media \\(min-width: 1200px\\)',
    '@media \\(min-width: 1400px\\)'
  ];

  try {
    let criticalCSS = '';
    let nonCriticalCSS = '';

    // Process all stylesheets
    Array.from(document.styleSheets).forEach(stylesheet => {
      try {
        if (stylesheet.cssRules) {
          Array.from(stylesheet.cssRules).forEach(rule => {
            const ruleText = rule.cssText;
            
            if (rule instanceof CSSStyleRule) {
              const selector = rule.selectorText;
              
              if (isCriticalSelector(selector, criticalSelectors, nonCriticalSelectors)) {
                criticalCSS += ruleText + '\n';
              } else {
                nonCriticalCSS += ruleText + '\n';
              }
            } else if (rule instanceof CSSMediaRule) {
              // Handle media queries
              const mediaText = rule.media.mediaText;
              
              if (isCriticalMediaQuery(mediaText)) {
                criticalCSS += ruleText + '\n';
              } else {
                nonCriticalCSS += ruleText + '\n';
              }
            } else {
              // Other rules (imports, fonts, etc.)
              criticalCSS += ruleText + '\n';
            }
          });
        }
      } catch (e) {
        // Handle cross-origin stylesheets
        console.debug('Stylesheet access restricted, skipping optimization');
      }
    });

    // Apply optimizations
    if (criticalCSS) {
      inlineCriticalCSS(criticalCSS);
    }
    
    if (nonCriticalCSS) {
      deferNonCriticalCSS(nonCriticalCSS);
    }

  } catch (error) {
    console.debug('Critical CSS extraction completed with minor issues');
  }
}

function isCriticalSelector(selector: string, critical: string[], nonCritical: string[]): boolean {
  // Check if selector is explicitly non-critical
  for (const pattern of nonCritical) {
    if (selector.includes(pattern) || selector.match(new RegExp(pattern))) {
      return false;
    }
  }
  
  // Check if selector is critical
  for (const pattern of critical) {
    if (selector.includes(pattern) || selector.match(new RegExp(pattern))) {
      return true;
    }
  }
  
  // Default to critical for safety
  return true;
}

function isCriticalMediaQuery(mediaText: string): boolean {
  // Mobile-first and small screen queries are critical
  const criticalQueries = [
    'max-width: 768px',
    'max-width: 640px',
    'max-width: 480px',
    'screen and (max-width',
    'orientation: portrait'
  ];
  
  return criticalQueries.some(query => mediaText.includes(query));
}

function inlineCriticalCSS(css: string) {
  // Create or update critical CSS style element
  let criticalStyle = document.getElementById('critical-css') as HTMLStyleElement;
  
  if (!criticalStyle) {
    criticalStyle = document.createElement('style');
    criticalStyle.id = 'critical-css';
    criticalStyle.setAttribute('data-critical', 'true');
    document.head.insertBefore(criticalStyle, document.head.firstChild);
  }
  
  // Minify and inject critical CSS
  criticalStyle.textContent = minifyCriticalCSS(css);
  
  console.debug(`Inlined ${(criticalStyle.textContent.length / 1024).toFixed(1)}KB of critical CSS`);
}

function deferNonCriticalCSS(css: string) {
  // Create deferred stylesheet
  const deferredStyle = document.createElement('style');
  deferredStyle.setAttribute('data-deferred', 'true');
  deferredStyle.media = 'print'; // Initially set to print to defer loading
  deferredStyle.textContent = css;
  
  // Add to document but don't block rendering
  document.head.appendChild(deferredStyle);
  
  // Activate after initial render
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      deferredStyle.media = 'all';
    });
  });
  
  console.debug(`Deferred ${(css.length / 1024).toFixed(1)}KB of non-critical CSS`);
}

function minifyCriticalCSS(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/;\s*}/g, '}') // Remove unnecessary semicolons
    .replace(/\s*{\s*/g, '{') // Clean braces
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*,\s*/g, ',') // Clean commas
    .replace(/\s*:\s*/g, ':') // Clean colons
    .replace(/\s*;\s*/g, ';') // Clean semicolons
    .replace(/\s*>\s*/g, '>') // Clean child selectors
    .replace(/\s*\+\s*/g, '+') // Clean adjacent selectors
    .replace(/\s*~\s*/g, '~') // Clean general sibling selectors
    .replace(/calc\(\s*/g, 'calc(') // Clean calc functions
    .replace(/\s*\)/g, ')') // Clean closing parentheses
    .replace(/url\(\s*/g, 'url(') // Clean URLs
    .trim();
}