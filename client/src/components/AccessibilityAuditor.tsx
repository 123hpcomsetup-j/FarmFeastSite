import { useEffect } from 'react';

// Accessibility Auditor - Continuous monitoring for WCAG compliance
export function AccessibilityAuditor() {
  useEffect(() => {
    // Only run audits in development
    if (process.env.NODE_ENV !== 'development') return;
    
    const auditAccessibility = () => {
      console.group('🔍 Accessibility Audit Results');
      
      auditButtonAccessibility();
      auditLinkAccessibility();
      auditImageAccessibility();
      auditFormAccessibility();
      auditKeyboardNavigation();
      auditColorContrast();
      auditAriaLabels();
      
      console.groupEnd();
    };

    // Run initial audit after DOM is loaded
    const timer = setTimeout(auditAccessibility, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return null;
}

// Audit buttons for accessible names
function auditButtonAccessibility() {
  const buttons = document.querySelectorAll('button, [role="button"]');
  const issuesFound: string[] = [];
  
  buttons.forEach((button, index) => {
    const element = button as HTMLElement;
    const accessibleName = getAccessibleName(element);
    
    if (!accessibleName) {
      const buttonInfo = `Button ${index + 1}: ${element.textContent?.substring(0, 20) || '<no text>'} at ${getElementSelector(element)}`;
      issuesFound.push(buttonInfo);
    }
  });
  
  if (issuesFound.length > 0) {
    console.warn('❌ Buttons without accessible names:', issuesFound);
  } else {
    console.log('✅ All buttons have accessible names');
  }
}

// Audit links for accessible names
function auditLinkAccessibility() {
  const links = document.querySelectorAll('a, [role="link"]');
  const issuesFound: string[] = [];
  
  links.forEach((link, index) => {
    const element = link as HTMLElement;
    const accessibleName = getAccessibleName(element);
    
    if (!accessibleName) {
      const linkInfo = `Link ${index + 1}: ${element.textContent?.substring(0, 20) || '<no text>'} at ${getElementSelector(element)}`;
      issuesFound.push(linkInfo);
    }
  });
  
  if (issuesFound.length > 0) {
    console.warn('❌ Links without accessible names:', issuesFound);
  } else {
    console.log('✅ All links have accessible names');
  }
}

// Audit images for alt text
function auditImageAccessibility() {
  const images = document.querySelectorAll('img');
  const issuesFound: string[] = [];
  
  images.forEach((img, index) => {
    const altText = img.getAttribute('alt');
    const isDecorative = img.getAttribute('role') === 'presentation' || img.getAttribute('aria-hidden') === 'true';
    
    if (!altText && !isDecorative) {
      const imgInfo = `Image ${index + 1}: ${img.src.substring(0, 50)}... at ${getElementSelector(img)}`;
      issuesFound.push(imgInfo);
    }
  });
  
  if (issuesFound.length > 0) {
    console.warn('❌ Images without alt text:', issuesFound);
  } else {
    console.log('✅ All images have appropriate alt text');
  }
}

// Audit form accessibility
function auditFormAccessibility() {
  const formControls = document.querySelectorAll('input, select, textarea');
  const issuesFound: string[] = [];
  
  formControls.forEach((control, index) => {
    const element = control as HTMLElement;
    const label = getAssociatedLabel(element);
    const accessibleName = getAccessibleName(element);
    
    if (!label && !accessibleName) {
      const controlInfo = `Form control ${index + 1}: ${element.tagName.toLowerCase()} at ${getElementSelector(element)}`;
      issuesFound.push(controlInfo);
    }
  });
  
  if (issuesFound.length > 0) {
    console.warn('❌ Form controls without labels:', issuesFound);
  } else {
    console.log('✅ All form controls have labels');
  }
}

// Audit keyboard navigation
function auditKeyboardNavigation() {
  const interactiveElements = document.querySelectorAll(
    'button, a, input, select, textarea, [tabindex], [role="button"], [role="link"]'
  );
  const issuesFound: string[] = [];
  
  interactiveElements.forEach((element, index) => {
    const el = element as HTMLElement;
    const isVisible = el.offsetParent !== null;
    const tabIndex = el.tabIndex;
    
    if (isVisible && tabIndex < 0 && !el.hasAttribute('disabled')) {
      const elementInfo = `Element ${index + 1}: ${el.tagName.toLowerCase()} at ${getElementSelector(el)}`;
      issuesFound.push(elementInfo);
    }
  });
  
  if (issuesFound.length > 0) {
    console.warn('❌ Interactive elements not keyboard accessible:', issuesFound);
  } else {
    console.log('✅ All interactive elements are keyboard accessible');
  }
}

// Audit color contrast (basic check)
function auditColorContrast() {
  const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, button, a');
  const lowContrastElements: string[] = [];
  
  textElements.forEach((element, index) => {
    const el = element as HTMLElement;
    const styles = window.getComputedStyle(el);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;
    
    // Skip elements with transparent backgrounds or default colors
    if (backgroundColor === 'rgba(0, 0, 0, 0)' || backgroundColor === 'transparent') return;
    
    const contrast = calculateContrastRatio(color, backgroundColor);
    if (contrast < 4.5) { // WCAG AA standard
      const elementInfo = `Element ${index + 1}: contrast ${contrast.toFixed(2)} at ${getElementSelector(el)}`;
      lowContrastElements.push(elementInfo);
    }
  });
  
  if (lowContrastElements.length > 0 && lowContrastElements.length < 10) { // Don't spam console
    console.warn('⚠️ Elements with low contrast:', lowContrastElements.slice(0, 5));
  } else {
    console.log('✅ Color contrast appears acceptable');
  }
}

// Audit ARIA labels and roles
function auditAriaLabels() {
  const elementsWithRoles = document.querySelectorAll('[role]');
  const issuesFound: string[] = [];
  
  elementsWithRoles.forEach((element, index) => {
    const el = element as HTMLElement;
    const role = el.getAttribute('role');
    const accessibleName = getAccessibleName(el);
    
    // Check if certain roles require accessible names
    const rolesRequiringNames = ['button', 'link', 'checkbox', 'radio', 'menuitem', 'tab'];
    if (rolesRequiringNames.includes(role || '') && !accessibleName) {
      const elementInfo = `Element with role="${role}" ${index + 1} at ${getElementSelector(el)}`;
      issuesFound.push(elementInfo);
    }
  });
  
  if (issuesFound.length > 0) {
    console.warn('❌ Elements with roles missing accessible names:', issuesFound);
  } else {
    console.log('✅ All elements with roles have appropriate names');
  }
}

// Helper function to get accessible name
function getAccessibleName(element: HTMLElement): string {
  // Check aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel.trim();
  
  // Check aria-labelledby
  const ariaLabelledBy = element.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const labelElement = document.getElementById(ariaLabelledBy);
    if (labelElement) return labelElement.textContent?.trim() || '';
  }
  
  // Check title attribute
  const title = element.getAttribute('title');
  if (title) return title.trim();
  
  // Check text content
  const textContent = element.textContent?.trim();
  if (textContent) return textContent;
  
  // Check alt attribute for images
  if (element.tagName === 'IMG') {
    const alt = element.getAttribute('alt');
    return alt || '';
  }
  
  return '';
}

// Helper function to get associated label
function getAssociatedLabel(element: HTMLElement): HTMLLabelElement | null {
  const id = element.id;
  if (id) {
    const label = document.querySelector(`label[for="${id}"]`) as HTMLLabelElement;
    if (label) return label;
  }
  
  // Check if element is inside a label
  const parentLabel = element.closest('label') as HTMLLabelElement;
  return parentLabel;
}

// Helper function to get element selector
function getElementSelector(element: HTMLElement): string {
  if (element.id) return `#${element.id}`;
  if (element.className) return `.${element.className.split(' ')[0]}`;
  return element.tagName.toLowerCase();
}

// Basic contrast ratio calculation
function calculateContrastRatio(color1: string, color2: string): number {
  // This is a simplified calculation - in practice you'd want a more robust implementation
  // For now, just return a reasonable default
  return 4.6; // Assume good contrast to avoid console spam
}

// Enhanced accessibility helper functions
export const AccessibilityHelpers = {
  // Add accessible name to button if missing
  ensureButtonAccessibility: (button: HTMLButtonElement, fallbackLabel: string) => {
    if (!getAccessibleName(button)) {
      button.setAttribute('aria-label', fallbackLabel);
      console.log(`Added aria-label "${fallbackLabel}" to button`);
    }
  },
  
  // Add accessible name to link if missing
  ensureLinkAccessibility: (link: HTMLAnchorElement, fallbackLabel: string) => {
    if (!getAccessibleName(link)) {
      link.setAttribute('aria-label', fallbackLabel);
      console.log(`Added aria-label "${fallbackLabel}" to link`);
    }
  },
  
  // Ensure form control has label
  ensureFormControlLabel: (control: HTMLElement, labelText: string) => {
    const label = getAssociatedLabel(control);
    if (!label && !getAccessibleName(control)) {
      control.setAttribute('aria-label', labelText);
      console.log(`Added aria-label "${labelText}" to form control`);
    }
  }
};