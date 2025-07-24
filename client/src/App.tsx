import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import TourProvider from "@/components/tour/TourProvider";
import SeoHead from "@/components/SeoHead";
import Home from "@/pages/home";
import Services from "@/pages/services";
import Gallery from "@/pages/gallery";
import Location from "@/pages/location";
import Booking from "@/pages/booking";
import Payment from "@/pages/payment";
import PaymentSuccess from "@/pages/payment-success";
import BookingConfirmation from "@/pages/booking-confirmation";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsConditions from "@/pages/terms-conditions";
import CookiePolicy from "@/pages/cookie-policy";
import DataProcessing from "@/pages/data-processing";
import NotFoundChecker from "@/pages/404-checker";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import NotFound from "@/pages/not-found";
import CookieConsent from "@/components/CookieConsent";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/location" component={Location} />
      <Route path="/booking" component={Booking} />
      <Route path="/payment" component={Payment} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/booking-confirmation" component={BookingConfirmation} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-conditions" component={TermsConditions} />
      <Route path="/cookie-policy" component={CookiePolicy} />
      <Route path="/data-processing" component={DataProcessing} />
      <Route path="/404-checker" component={NotFoundChecker} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TourProvider>
          <SeoHead />
          <Toaster />
          <Router />
          <CookieConsent />
        </TourProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
