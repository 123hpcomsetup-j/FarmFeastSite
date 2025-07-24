// Lazy loading utilities for better performance
import { lazy } from 'react';

// Lazy load admin components only when needed
export const LazyAdminDashboard = lazy(() => import('../pages/admin/dashboard'));
export const LazyBlogPost = lazy(() => import('../pages/blog-post'));
export const LazyBlog = lazy(() => import('../pages/blog'));
export const LazyGallery = lazy(() => import('../pages/gallery'));
export const LazyContact = lazy(() => import('../pages/Contact'));
export const LazyServices = lazy(() => import('../pages/services'));
export const LazyPrivacyPolicy = lazy(() => import('../pages/privacy-policy'));
export const LazyTermsConditions = lazy(() => import('../pages/terms-conditions'));
export const LazyCookiePolicy = lazy(() => import('../pages/cookie-policy'));
export const LazyDataProcessing = lazy(() => import('../pages/data-processing'));

// Preload critical components only
export const preloadCriticalRoutes = () => {
  // Only preload booking and home-related components
  import('../pages/booking');
  import('../pages/booking-confirmation');
  import('../pages/payment');
};

// Load non-critical components on user interaction
export const loadSecondaryComponents = () => {
  setTimeout(() => {
    import('../pages/gallery');
    import('../pages/services');
    import('../pages/Contact');
  }, 2000);
};