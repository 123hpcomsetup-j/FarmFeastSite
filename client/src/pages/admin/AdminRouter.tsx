import { useEffect } from "react";
import { useLocation } from "wouter";
import { authUtils } from "@/lib/auth";
import AdminLogin from "./login";
import AdminDashboard from "./dashboard";

export default function AdminRouter() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // If we're at /admin and user is authenticated, redirect to dashboard
    if (location === "/admin" && authUtils.isAuthenticated()) {
      console.log("User authenticated, redirecting to dashboard");
      setLocation("/admin/dashboard");
    }
    // If we're at /admin and user is not authenticated, stay on login
    else if (location === "/admin" && !authUtils.isAuthenticated()) {
      console.log("User not authenticated, staying on login");
    }
  }, [location, setLocation]);

  // If we're at /admin/dashboard, show dashboard (it has its own auth check)
  if (location === "/admin/dashboard") {
    return <AdminDashboard />;
  }

  // Otherwise show login
  return <AdminLogin />;
}