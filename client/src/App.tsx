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
import Booking from "@/pages/booking";
import BookingConfirmation from "@/pages/booking-confirmation";
import PrivacyPolicy from "@/pages/privacy-policy";
import NotFoundChecker from "@/pages/404-checker";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/booking" component={Booking} />
      <Route path="/booking-confirmation" component={BookingConfirmation} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
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
        </TourProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
