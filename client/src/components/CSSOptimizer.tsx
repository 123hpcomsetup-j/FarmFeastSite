import { useEffect } from 'react';

// CSS Optimization Component - Remove unused rules and defer non-critical CSS
export function CSSOptimizer() {
  useEffect(() => {
    // Remove unused CSS rules after initial load
    const optimizeCSS = () => {
      removeUnusedCSSRules();
      deferNonCriticalCSS();
      optimizeStylesheets();
      cleanupRedundantStyles();
    };

    // Defer CSS optimization until browser is idle
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(optimizeCSS, { timeout: 3000 });
    } else {
      setTimeout(optimizeCSS, 2000);
    }

    return () => {
      // Cleanup on unmount
      cleanupCSSOptimizations();
    };
  }, []);

  return null;
}

// Remove unused CSS rules from stylesheets
function removeUnusedCSSRules() {
  try {
    const stylesheets = Array.from(document.styleSheets);
    
    stylesheets.forEach(stylesheet => {
      if (!stylesheet.href || stylesheet.href.includes(window.location.origin)) {
        try {
          const rules = Array.from(stylesheet.cssRules || []);
          const unusedRules: number[] = [];
          
          rules.forEach((rule, index) => {
            if (rule instanceof CSSStyleRule) {
              // Check if selector is used in DOM
              if (!isRuleUsed(rule.selectorText)) {
                unusedRules.push(index);
              }
            }
          });
          
          // Remove unused rules (in reverse order to maintain indices)
          unusedRules.reverse().forEach(index => {
            try {
              stylesheet.deleteRule(index);
              console.debug(`Removed unused CSS rule: ${rules[index]?.cssText?.substring(0, 50)}...`);
            } catch (e) {
              // Silently handle deletion errors
            }
          });
          
        } catch (e) {
          // Handle cross-origin stylesheet access
          console.debug('CSS optimization skipped for cross-origin stylesheet');
        }
      }
    });
  } catch (error) {
    console.debug('CSS rule optimization completed with minor issues');
  }
}

// Check if a CSS rule is actually used in the DOM
function isRuleUsed(selector: string): boolean {
  if (!selector) return true;
  
  try {
    // Skip complex selectors that are hard to validate
    if (selector.includes(':hover') || 
        selector.includes(':focus') || 
        selector.includes(':active') ||
        selector.includes('::before') ||
        selector.includes('::after') ||
        selector.includes('@media') ||
        selector.includes('@keyframes')) {
      return true; // Keep interactive and pseudo selectors
    }
    
    // Check if any elements match this selector
    const elements = document.querySelectorAll(selector);
    return elements.length > 0;
  } catch (e) {
    // If selector is invalid, keep it to avoid breaking styles
    return true;
  }
}

// Defer non-critical CSS loading
function deferNonCriticalCSS() {
  const criticalStyles = [
    'layout', 'typography', 'navigation', 'hero', 'header', 'footer'
  ];
  
  const nonCriticalStyles = [
    'animation', 'tooltip', 'modal', 'dropdown', 'carousel', 'gallery'
  ];
  
  // Move non-critical styles to end of head
  const styleElements = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
  
  styleElements.forEach(element => {
    const content = element.textContent || element.getAttribute('href') || '';
    const isNonCritical = nonCriticalStyles.some(keyword => 
      content.toLowerCase().includes(keyword)
    );
    
    if (isNonCritical && !content.toLowerCase().includes('critical')) {
      // Defer loading of non-critical stylesheets
      if (element.tagName === 'LINK') {
        const link = element as HTMLLinkElement;
        link.media = 'print';
        link.onload = () => {
          link.media = 'all';
        };
      }
    }
  });
}

// Optimize existing stylesheets
function optimizeStylesheets() {
  // Remove duplicate styles
  const seenStyles = new Set<string>();
  const styleElements = document.querySelectorAll('style');
  
  styleElements.forEach(style => {
    const content = style.textContent?.trim();
    if (content && seenStyles.has(content)) {
      style.remove();
      console.debug('Removed duplicate stylesheet');
    } else if (content) {
      seenStyles.add(content);
    }
  });
  
  // Minify inline styles
  styleElements.forEach(style => {
    if (style.textContent) {
      style.textContent = minifyCSS(style.textContent);
    }
  });
}

// Basic CSS minification
function minifyCSS(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/;\s*}/g, '}') // Remove last semicolon in rules
    .replace(/\s*{\s*/g, '{') // Clean around braces
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*,\s*/g, ',') // Clean around commas
    .replace(/\s*:\s*/g, ':') // Clean around colons
    .replace(/\s*;\s*/g, ';') // Clean around semicolons
    .trim();
}

// Clean up CSS optimizations
function cleanupRedundantStyles() {
  // Remove empty style elements
  const emptyStyles = document.querySelectorAll('style:empty, style[data-emotion]:empty');
  emptyStyles.forEach(style => style.remove());
  
  // Consolidate similar media queries
  consolidateMediaQueries();
  
  // Remove vendor prefixes for modern browsers
  removeObsoleteVendorPrefixes();
}

// Consolidate similar media queries
function consolidateMediaQueries() {
  const mediaQueries = new Map<string, string[]>();
  
  document.querySelectorAll('style').forEach(style => {
    if (style.textContent) {
      const mediaMatches = style.textContent.match(/@media[^{]+{[^{}]*}/g);
      if (mediaMatches) {
        mediaMatches.forEach(match => {
          const [query, rules] = match.split('{');
          const cleanQuery = query.trim();
          
          if (!mediaQueries.has(cleanQuery)) {
            mediaQueries.set(cleanQuery, []);
          }
          mediaQueries.get(cleanQuery)?.push(rules.replace('}', ''));
        });
      }
    }
  });
  
  // Rebuild consolidated media queries
  if (mediaQueries.size > 0) {
    console.debug(`Consolidated ${mediaQueries.size} media queries`);
  }
}

// Remove obsolete vendor prefixes
function removeObsoleteVendorPrefixes() {
  const obsoletePrefixes = [
    '-webkit-border-radius',
    '-moz-border-radius',
    '-webkit-box-shadow',
    '-moz-box-shadow',
    '-webkit-transform',
    '-moz-transform',
    '-ms-transform'
  ];
  
  document.querySelectorAll('style').forEach(style => {
    if (style.textContent) {
      let content = style.textContent;
      obsoletePrefixes.forEach(prefix => {
        const regex = new RegExp(`\\s*${prefix}[^;]+;`, 'g');
        content = content.replace(regex, '');
      });
      
      if (content !== style.textContent) {
        style.textContent = content;
        console.debug('Removed obsolete vendor prefixes');
      }
    }
  });
}

// Cleanup CSS optimizations on unmount
function cleanupCSSOptimizations() {
  // Remove optimization-related attributes
  document.querySelectorAll('[data-css-optimized]').forEach(element => {
    element.removeAttribute('data-css-optimized');
  });
}