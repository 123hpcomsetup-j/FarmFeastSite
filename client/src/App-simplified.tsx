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
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { LiveChatFixed } from "@/components/LiveChatFixed";

// Import critical pages normally
import Home from "@/pages/home";
import Services from "@/pages/services";
import Booking from "@/pages/booking";

// Lazy load secondary pages
const Gallery = lazy(() => import("@/pages/gallery"));
const Location = lazy(() => import("@/pages/location"));
const Blog = lazy(() => import("@/pages/blog"));
const BlogPost = lazy(() => import("@/pages/blog-post"));
const Payment = lazy(() => import("@/pages/payment"));
const PaymentSuccess = lazy(() => import("@/pages/payment-success"));
const BookingConfirmation = lazy(() => import("@/pages/booking-confirmation"));
const Contact = lazy(() => import("@/pages/Contact"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const TermsConditions = lazy(() => import("@/pages/terms-conditions"));
const CookiePolicy = lazy(() => import("@/pages/cookie-policy"));
const DataProcessing = lazy(() => import("@/pages/data-processing"));
const NotFoundChecker = lazy(() => import("@/pages/404-checker"));
const AdminLogin = lazy(() => import("@/pages/admin/login"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const NotFound = lazy(() => import("@/pages/not-found"));

function App() {
  console.log("App component rendering...");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TourProvider>
          <div className="min-h-screen bg-background">
            <SeoHead />
            <AnalyticsTracker />
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }>
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/services" component={Services} />
                <Route path="/gallery" component={Gallery} />
                <Route path="/location" component={Location} />
                <Route path="/booking" component={Booking} />
                <Route path="/payment" component={Payment} />
                <Route path="/payment-success" component={PaymentSuccess} />
                <Route path="/booking-confirmation" component={BookingConfirmation} />
                <Route path="/contact" component={Contact} />
                <Route path="/blog" component={Blog} />
                <Route path="/blog/:slug" component={BlogPost} />
                <Route path="/privacy-policy" component={PrivacyPolicy} />
                <Route path="/terms-conditions" component={TermsConditions} />
                <Route path="/cookie-policy" component={CookiePolicy} />
                <Route path="/data-processing" component={DataProcessing} />
                <Route path="/404-checker" component={NotFoundChecker} />
                <Route path="/admin" component={AdminLogin} />
                <Route path="/admin/dashboard" component={AdminDashboard} />
                <Route component={NotFound} />
              </Switch>
            </Suspense>
            <LiveChatFixed visitorSessionId="" />
            <CookieConsent />
            <CustomScripts />
            <Toaster />
          </div>
        </TourProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;