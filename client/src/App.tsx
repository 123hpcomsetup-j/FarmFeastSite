import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import TourProvider from "@/components/tour/TourProvider";
import SeoHead from "@/components/SeoHead";
import CookieConsent from "@/components/CookieConsent";
import CustomScripts from "@/components/CustomScripts";
import ResourcePreloader from "@/components/ResourcePreloader";
import PreloadFonts from "@/components/PreloadFonts";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import CriticalResourceLoader from "@/components/CriticalResourceLoader";
import CriticalCSSOptimizer from "@/components/CriticalCSSOptimizer";
import OptimizedAssetLoader from "@/components/OptimizedAssetLoader";
import { 
  CriticalResourcePreloader, 
  OptimizedScriptLoader, 
  CriticalCSSInliner,
  BundleAnalyzer 
} from "@/components/PerformanceOptimizer";
import { DeferredComponents } from "@/components/DeferredComponents";
import { ScriptOptimizer } from "@/components/ScriptOptimizer";
import { JavaScriptOptimizer } from "@/components/JavaScriptOptimizer";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { LiveChatFixed } from "@/components/LiveChatFixed";

// Import critical pages normally, lazy load secondary pages
import Home from "@/pages/home";
import Services from "@/pages/services";
import Booking from "@/pages/booking";

// Advanced lazy loading with route-based code splitting
const Gallery = lazy(() => 
  import("@/pages/gallery").then(module => {
    // Preload related components
    import("@/components/ImageOptimized");
    return module;
  })
);

const Location = lazy(() => import("@/pages/location"));

const Blog = lazy(() => 
  import("@/pages/blog").then(module => {
    // Preload blog post component for faster navigation
    import("@/pages/blog-post");
    return module;
  })
);

const BlogPost = lazy(() => import("@/pages/blog-post"));

// Group payment-related pages
const Payment = lazy(() => import("@/pages/payment"));
const PaymentSuccess = lazy(() => import("@/pages/payment-success"));
const BookingConfirmation = lazy(() => import("@/pages/booking-confirmation"));

const Contact = lazy(() => import("@/pages/Contact"));

// Group legal pages for shared dependencies
const PrivacyPolicy = lazy(() => 
  import("@/pages/privacy-policy").then(module => {
    // Preload other legal pages
    import("@/pages/terms-conditions");
    import("@/pages/cookie-policy");
    import("@/pages/data-processing");
    return module;
  })
);

const TermsConditions = lazy(() => import("@/pages/terms-conditions"));
const CookiePolicy = lazy(() => import("@/pages/cookie-policy"));
const DataProcessing = lazy(() => import("@/pages/data-processing"));

const NotFoundChecker = lazy(() => import("@/pages/404-checker"));

// Admin components - largest bundle, load on demand
const AdminLogin = lazy(() => import("@/pages/admin/login"));
const AdminDashboard = lazy(() => 
  import("@/pages/admin/dashboard").then(module => {
    // Remove heavy admin dependencies from main bundle
    console.log('Admin dashboard loaded');
    return module;
  })
);

const NotFound = lazy(() => import("@/pages/not-found"));

// Ultra-fast loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
      <p className="text-sm text-gray-600">Loading...</p>
    </div>
  </div>
);

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/booking" component={Booking} />
      <Route path="/gallery">
        <Suspense fallback={<PageLoader />}>
          <Gallery />
        </Suspense>
      </Route>
      <Route path="/blog">
        <Suspense fallback={<PageLoader />}>
          <Blog />
        </Suspense>
      </Route>
      <Route path="/blog/:slug">
        <Suspense fallback={<PageLoader />}>
          <BlogPost />
        </Suspense>
      </Route>
      <Route path="/location">
        <Suspense fallback={<PageLoader />}>
          <Location />
        </Suspense>
      </Route>
      <Route path="/contact">
        <Suspense fallback={<PageLoader />}>
          <Contact />
        </Suspense>
      </Route>
      <Route path="/payment">
        <Suspense fallback={<PageLoader />}>
          <Payment />
        </Suspense>
      </Route>
      <Route path="/payment-success">
        <Suspense fallback={<PageLoader />}>
          <PaymentSuccess />
        </Suspense>
      </Route>
      <Route path="/booking-confirmation">
        <Suspense fallback={<PageLoader />}>
          <BookingConfirmation />
        </Suspense>
      </Route>
      <Route path="/privacy-policy">
        <Suspense fallback={<PageLoader />}>
          <PrivacyPolicy />
        </Suspense>
      </Route>
      <Route path="/terms-conditions">
        <Suspense fallback={<PageLoader />}>
          <TermsConditions />
        </Suspense>
      </Route>
      <Route path="/cookie-policy">
        <Suspense fallback={<PageLoader />}>
          <CookiePolicy />
        </Suspense>
      </Route>
      <Route path="/data-processing">
        <Suspense fallback={<PageLoader />}>
          <DataProcessing />
        </Suspense>
      </Route>
      <Route path="/404-checker">
        <Suspense fallback={<PageLoader />}>
          <NotFoundChecker />
        </Suspense>
      </Route>
      <Route path="/admin">
        <Suspense fallback={<PageLoader />}>
          <AdminLogin />
        </Suspense>
      </Route>
      <Route path="/admin/login">
        <Suspense fallback={<PageLoader />}>
          <AdminLogin />
        </Suspense>
      </Route>
      <Route path="/admin/dashboard">
        <Suspense fallback={<PageLoader />}>
          <AdminDashboard />
        </Suspense>
      </Route>
      <Route>
        <Suspense fallback={<PageLoader />}>
          <NotFound />
        </Suspense>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TourProvider>
          <SeoHead />
          <CriticalResourceLoader />
          <CriticalCSSOptimizer />
          <CriticalResourcePreloader />
          <CriticalCSSInliner />
          <OptimizedScriptLoader />
          <BundleAnalyzer />
          <PreloadFonts />
          <ResourcePreloader />
          <ServiceWorkerRegistration />
          <ScriptOptimizer />
          <JavaScriptOptimizer />
          {/* Temporarily load components directly until deferred loading is fixed */}
          <AnalyticsTracker />
          <LiveChatFixed visitorSessionId={typeof window !== 'undefined' && window.localStorage?.getItem('visitor_session_id') || ''} />
          <CustomScripts />
          <Toaster />
          <Router />
          <CookieConsent />
        </TourProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
