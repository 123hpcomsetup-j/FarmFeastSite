import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  BarChart3,
  FileText,
  CheckCircle,
  Menu,
  X,
  Home,
  TrendingUp
} from "lucide-react";

const menuItems = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "bookings", label: "Bookings", icon: Calendar },
  { id: "confirmations", label: "Confirmations", icon: CheckCircle },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "services", label: "Services", icon: Star },
  { id: "coupons", label: "Coupons", icon: TrendingUp },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
  { id: "amenities", label: "Amenities", icon: Settings },
  { id: "blog", label: "Blog Posts", icon: FileText },
  { id: "seo", label: "SEO", icon: Search },
  { id: "reviews", label: "Reviews", icon: BarChart3 },
  { id: "sitemap", label: "Sitemap", icon: Globe },
  { id: "settings", label: "Site Settings", icon: Settings },
];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/admin/bookings"],
    enabled: !!adminUser,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["/api/admin/services"],
    enabled: !!adminUser,
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Services",
      value: services?.filter((s: any) => s.active)?.length || 0,
      icon: Star,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending Bookings",
      value: bookings?.filter((b: any) => b.status === "pending")?.length || 0,
      icon: Users,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Total Revenue",
      value: `₹${bookings?.reduce((sum: number, b: any) => sum + (b.finalTotal || 0), 0).toLocaleString() || 0}`,
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
              <p className="text-gray-600">Welcome back, {adminUser.username}! Here's what's happening with your farm house.</p>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bookings?.slice(0, 5).map((booking: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{booking.fullName}</p>
                          <p className="text-sm text-gray-600">{booking.confirmationCode}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{booking.finalTotal?.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{booking.status}</p>
                        </div>
                      </div>
                    )) || (
                      <p className="text-gray-500 text-center py-4">No recent bookings</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={() => setActiveTab("bookings")} 
                      variant="outline" 
                      className="flex items-center gap-2 justify-start h-12"
                    >
                      <Calendar className="h-4 w-4" />
                      View Bookings
                    </Button>
                    <Button 
                      onClick={() => setActiveTab("confirmations")} 
                      variant="outline" 
                      className="flex items-center gap-2 justify-start h-12"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Confirmations
                    </Button>
                    <Button 
                      onClick={() => setActiveTab("payments")} 
                      variant="outline" 
                      className="flex items-center gap-2 justify-start h-12"
                    >
                      <CreditCard className="h-4 w-4" />
                      Payments
                    </Button>
                    <Button 
                      onClick={() => setActiveTab("settings")} 
                      variant="outline" 
                      className="flex items-center gap-2 justify-start h-12"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case "bookings":
        return <BookingsManagement />;
      case "confirmations":
        return <BookingConfirmationManagement />;
      case "payments":
        return <PaymentManagement />;
      case "services":
        return <ServicesManagement />;
      case "coupons":
        return <CouponsManagement />;
      case "gallery":
        return <GalleryManagement />;
      case "amenities":
        return <AmenitiesManagement />;
      case "blog":
        return <BlogManagement />;
      case "seo":
        return <SeoManagement />;
      case "reviews":
        return <ReviewsManagement />;
      case "sitemap":
        return <SitemapManagement />;
      case "settings":
        return <SiteSettingsManagement />;
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'} flex flex-col`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600">Farm Feast</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={`w-full justify-start ${!sidebarOpen && 'px-2'}`}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="h-4 w-4" />
                {sidebarOpen && <span className="ml-2">{item.label}</span>}
              </Button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t">
          <Button
            onClick={handleLogout}
            variant="outline"
            className={`w-full justify-start ${!sidebarOpen && 'px-2'}`}
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {menuItems.find(item => item.id === activeTab)?.label || "Dashboard"}
              </h2>
              <p className="text-sm text-gray-600">
                Manage your farm house business
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{adminUser.username}</p>
                <p className="text-xs text-gray-600">{adminUser.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}