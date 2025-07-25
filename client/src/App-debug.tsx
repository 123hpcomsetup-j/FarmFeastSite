import { Switch, Route, useLocation } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import LiveChatFixed from "@/components/LiveChatFixed";
import CookieConsent from "@/components/CookieConsent";
import CustomScripts from "@/components/CustomScripts";
import SeoHead from "@/components/SeoHead";
import { TourProvider } from "@reactour/tour";
import { TooltipProvider } from "@/components/ui/tooltip";

// Simplified non-lazy imports for debugging
import Home from "@/pages/home";
import Services from "@/pages/services";
import Gallery from "@/pages/gallery";
import Location from "@/pages/location";
import Booking from "@/pages/booking";
import Payment from "@/pages/payment";
import PaymentSuccess from "@/pages/payment-success";
import BookingConfirmation from "@/pages/booking-confirmation";
import Contact from "@/pages/Contact";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsConditions from "@/pages/terms-conditions";
import CookiePolicy from "@/pages/cookie-policy";
import DataProcessing from "@/pages/data-processing";
import NotFoundChecker from "@/pages/404-checker";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import NotFound from "@/pages/not-found";

function App() {
  console.log("App component rendering...");
  
  // Debug current route
  const [location] = useLocation();
  console.log("Current route:", location);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TourProvider>
          <div className="min-h-screen bg-background">
            <SeoHead />
            <AnalyticsTracker />
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