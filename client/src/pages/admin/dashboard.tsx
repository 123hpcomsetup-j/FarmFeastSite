import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import BookingsManagement from "@/components/admin/BookingsManagement";
import ServicesManagement from "@/components/admin/ServicesManagement";
import CouponsManagement from "@/components/admin/CouponsManagement";
import GalleryManagement from "@/components/admin/GalleryManagement";
import AmenitiesManagement from "@/components/admin/AmenitiesManagement";
import BlogManagement from "@/components/admin/BlogManagement";
import SeoManagement from "@/components/admin/SeoManagement";
import ReviewsManagement from "@/components/admin/ReviewsManagement";
import BookingConfirmationManagement from "@/components/admin/BookingConfirmationManagement";
import PaymentManagement from "@/components/admin/PaymentManagement";
import SitemapManagement from "@/components/admin/SitemapManagement";
import SiteSettingsManagement from "@/components/admin/SiteSettingsManagement";
import { 
  Calendar, 
  Settings, 
  Users, 
  CreditCard, 
  ImageIcon, 
  Star, 
  Search, 
  Globe,
  LogOut,
  BarChart3
} from "lucide-react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const user = localStorage.getItem("admin_user");
    
    if (!token || !user) {
      setLocation("/admin/login");
      return;
    }

    try {
      setAdminUser(JSON.parse(user));
    } catch (error) {
      console.error("Error parsing admin user:", error);
      setLocation("/admin/login");
    }
  }, [setLocation]);

  const { data: bookings } = useQuery({
    queryKey: ["/api/admin/bookings"],
    enabled: !!adminUser,
    meta: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
      },
    },
  });

  const { data: services } = useQuery({
    queryKey: ["/api/admin/services"],
    enabled: !!adminUser,
    meta: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
      },
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    setLocation("/admin/login");
  };

  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Bookings",
      value: bookings?.length || 0,
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "Active Services",
      value: services?.filter((s: any) => s.active)?.length || 0,
      icon: Star,
      color: "text-green-600",
    },
    {
      title: "Pending Bookings",
      value: bookings?.filter((b: any) => b.status === "pending")?.length || 0,
      icon: Users,
      color: "text-yellow-600",
    },
    {
      title: "Total Revenue",
      value: `₹${bookings?.reduce((sum: number, b: any) => sum + (b.finalTotal || 0), 0).toLocaleString() || 0}`,
      icon: CreditCard,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {adminUser.username}</p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-12">
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Coupons
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="amenities" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Amenities
            </TabsTrigger>
            <TabsTrigger value="blog" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Blog
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="confirmations" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Confirmations
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="sitemap" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Sitemap
            </TabsTrigger>
            <TabsTrigger value="blog" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Blog Posts
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <BookingsManagement />
          </TabsContent>

          <TabsContent value="services">
            <ServicesManagement />
          </TabsContent>

          <TabsContent value="coupons">
            <CouponsManagement />
          </TabsContent>

          <TabsContent value="gallery">
            <GalleryManagement />
          </TabsContent>

          <TabsContent value="amenities">
            <AmenitiesManagement />
          </TabsContent>

          <TabsContent value="blog">
            <BlogManagement />
          </TabsContent>

          <TabsContent value="seo">
            <SeoManagement />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsManagement />
          </TabsContent>

          <TabsContent value="confirmations">
            <BookingConfirmationManagement />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentManagement />
          </TabsContent>

          <TabsContent value="sitemap">
            <SitemapManagement />
          </TabsContent>

          <TabsContent value="blog">
            <BlogManagement />
          </TabsContent>

          <TabsContent value="settings">
            <SiteSettingsManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}