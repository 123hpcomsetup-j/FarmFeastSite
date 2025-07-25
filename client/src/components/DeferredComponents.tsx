import { lazy, Suspense, useEffect, useState } from 'react';
import { LazyLoader, deferUntilIdle } from '@/utils/lazyLoader';

// Import with proper export handling
const DeferredAnalytics = lazy(() => 
  import('@/components/AnalyticsTracker').then(module => ({ 
    default: module.AnalyticsTracker 
  }))
);
const DeferredLiveChat = lazy(() => 
  import('@/components/LiveChatFixed').then(module => ({ 
    default: module.LiveChatFixed 
  }))
);
const DeferredCustomScripts = lazy(() => import('@/components/CustomScripts'));

interface DeferredComponentsProps {
  visitorSessionId: string;
}

export function DeferredComponents({ visitorSessionId }: DeferredComponentsProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [componentsLoaded, setComponentsLoaded] = useState({
    analytics: false,
    liveChat: false,
    customScripts: false
  });

  useEffect(() => {
    // Defer loading until after critical rendering
    deferUntilIdle(() => {
      setShouldLoad(true);
    });

    // Load components on user interaction
    LazyLoader.deferUntilInteraction(() => {
      setShouldLoad(true);
    });
  }, []);

  useEffect(() => {
    if (shouldLoad) {
      // Stagger component loading to avoid blocking
      setTimeout(() => setComponentsLoaded(prev => ({ ...prev, analytics: true })), 100);
      setTimeout(() => setComponentsLoaded(prev => ({ ...prev, customScripts: true })), 200);
      setTimeout(() => setComponentsLoaded(prev => ({ ...prev, liveChat: true })), 300);
    }
  }, [shouldLoad]);

  if (!shouldLoad) {
    return null;
  }

  return (
    <>
      {componentsLoaded.analytics && (
        <Suspense fallback={<ComponentPlaceholder />}>
          <DeferredAnalytics />
        </Suspense>
      )}
      
      {componentsLoaded.customScripts && (
        <Suspense fallback={<ComponentPlaceholder />}>
          <DeferredCustomScripts />
        </Suspense>
      )}
      
      {componentsLoaded.liveChat && (
        <Suspense fallback={<ComponentPlaceholder />}>
          <DeferredLiveChat visitorSessionId={visitorSessionId} />
        </Suspense>
      )}
    </>
  );
}

// Lightweight placeholder for non-critical features
export function ComponentPlaceholder() {
  return <div style={{ display: 'none' }} aria-hidden="true" />;
}