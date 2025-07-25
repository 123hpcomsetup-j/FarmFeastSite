import { Switch, Route } from "wouter";
import { Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

// Import only critical pages - remove all performance optimizers temporarily
import Home from "@/pages/home";
import Services from "@/pages/services";
import Booking from "@/pages/booking";

function App() {
  console.log("App component rendering...");
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <Suspense fallback={<div>Loading...</div>}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/services" component={Services} />
            <Route path="/booking" component={Booking} />
            <Route>
              <div className="p-8 text-center">
                <h1 className="text-2xl font-bold">Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
              </div>
            </Route>
          </Switch>
        </Suspense>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;