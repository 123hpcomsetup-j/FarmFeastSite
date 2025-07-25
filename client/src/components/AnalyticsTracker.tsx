import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

// Generate a unique session ID
function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Generate a browser fingerprint
function generateFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

// Detect device type
function getDeviceType(): string {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|tablet/.test(userAgent)) {
    return /ipad|tablet/.test(userAgent) ? 'tablet' : 'mobile';
  }
  return 'desktop';
}

// Detect browser
function getBrowser(): string {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('chrome')) return 'chrome';
  if (userAgent.includes('firefox')) return 'firefox';
  if (userAgent.includes('safari')) return 'safari';
  if (userAgent.includes('edge')) return 'edge';
  return 'other';
}

// Detect OS
function getOS(): string {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('windows')) return 'windows';
  if (userAgent.includes('mac')) return 'macos';
  if (userAgent.includes('linux')) return 'linux';
  if (userAgent.includes('android')) return 'android';
  if (userAgent.includes('ios')) return 'ios';
  return 'other';
}

// Track page view with time measurement
let pageStartTime = Date.now();
let scrollDepth = 0;

// Cache document height to avoid forced reflows
let cachedDocumentHeight = 0;

function trackScrollDepth() {
  const windowHeight = window.innerHeight;
  
  // Cache document height on first call or window resize
  if (cachedDocumentHeight === 0) {
    cachedDocumentHeight = document.documentElement.scrollHeight;
  }
  
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  const currentScrollDepth = Math.round(((scrollTop + windowHeight) / cachedDocumentHeight) * 100);
  scrollDepth = Math.max(scrollDepth, Math.min(currentScrollDepth, 100));
}

interface AnalyticsData {
  sessionId: string;
  fingerprint: string;
  userAgent: string;
  device: string;
  browser: string;
  os: string;
  referrer: string;
  landingPage: string;
}

export function AnalyticsTracker() {
  const [location] = useLocation();
  const sessionRef = useRef<AnalyticsData | null>(null);
  const pageViewStartRef = useRef<number>(Date.now());
  const lastPageRef = useRef<string>('');

  // Initialize session on first load
  useEffect(() => {
    const initializeSession = async () => {
      // Get or create session ID
      let sessionId = sessionStorage.getItem('analytics_session_id');
      if (!sessionId) {
        sessionId = generateSessionId();
        sessionStorage.setItem('analytics_session_id', sessionId);
      }

      const analyticsData: AnalyticsData = {
        sessionId,
        fingerprint: generateFingerprint(),
        userAgent: navigator.userAgent,
        device: getDeviceType(),
        browser: getBrowser(),
        os: getOS(),
        referrer: document.referrer,
        landingPage: window.location.pathname
      };

      sessionRef.current = analyticsData;

      try {
        // Create or update visitor session
        const existingSession = sessionStorage.getItem('session_created');
        if (!existingSession) {
          await fetch('/api/analytics/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(analyticsData)
          });
          sessionStorage.setItem('session_created', 'true');
        } else {
          // Update existing session with new activity
          await fetch(`/api/analytics/session/${sessionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lastActiveAt: new Date() })
          });
        }
      } catch (error) {
        console.error('Analytics session error:', error);
      }
    };

    initializeSession();

    // Track scroll depth
    const handleScroll = () => trackScrollDepth();
    window.addEventListener('scroll', handleScroll);
    
    // Track activity for session updates
    const activityInterval = setInterval(async () => {
      if (sessionRef.current?.sessionId) {
        try {
          await fetch(`/api/analytics/session/${sessionRef.current.sessionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lastActiveAt: new Date() })
          });
        } catch (error) {
          // Silent fail for activity updates
        }
      }
    }, 30000); // Update every 30 seconds

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(activityInterval);
    };
  }, []);

  // Track page views when location changes
  useEffect(() => {
    const trackPageView = async () => {
      if (!sessionRef.current) return;

      const currentPage = location;
      const pageTitle = document.title;
      const currentUrl = window.location.href;

      // Calculate time spent on previous page
      if (lastPageRef.current) {
        const timeOnPreviousPage = Math.round((Date.now() - pageViewStartRef.current) / 1000);
        
        try {
          // Update the previous page view with exit data
          await fetch('/api/analytics/pageview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: sessionRef.current.sessionId,
              page: lastPageRef.current,
              url: window.location.href,
              title: document.title,
              timeOnPage: timeOnPreviousPage,
              scrollDepth: scrollDepth,
              exitPage: true
            })
          });
        } catch (error) {
          console.error('Analytics page view error:', error);
        }
      }

      // Track new page view
      try {
        await fetch('/api/analytics/pageview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionRef.current.sessionId,
            page: currentPage,
            url: currentUrl,
            title: pageTitle,
            timeOnPage: 0,
            scrollDepth: 0,
            exitPage: false
          })
        });
      } catch (error) {
        console.error('Analytics page view error:', error);
      }

      // Reset tracking for new page
      lastPageRef.current = currentPage;
      pageViewStartRef.current = Date.now();
      scrollDepth = 0;
    };

    trackPageView();
  }, [location]);

  // Track page unload
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (sessionRef.current && lastPageRef.current) {
        const timeOnPage = Math.round((Date.now() - pageViewStartRef.current) / 1000);
        
        // Use sendBeacon for reliable tracking on page unload
        const data = {
          sessionId: sessionRef.current.sessionId,
          page: lastPageRef.current,
          url: window.location.href,
          title: document.title,
          timeOnPage,
          scrollDepth,
          exitPage: true
        };

        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/analytics/pageview', JSON.stringify(data));
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return null; // This component doesn't render anything
}

// Hook for tracking custom events
export function useAnalyticsEvent() {
  const sessionRef = useRef<string | null>(null);

  useEffect(() => {
    sessionRef.current = sessionStorage.getItem('analytics_session_id');
  }, []);

  const trackEvent = async (
    eventType: string,
    eventCategory?: string,
    eventAction?: string,
    eventLabel?: string,
    value?: number,
    metadata?: Record<string, any>
  ) => {
    if (!sessionRef.current) return;

    try {
      await fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionRef.current,
          eventType,
          eventCategory,
          eventAction,
          eventLabel,
          value,
          metadata
        })
      });
    } catch (error) {
      console.error('Analytics event error:', error);
    }
  };

  return { trackEvent };
}