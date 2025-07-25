import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Phone, Menu, X, Home, ImageIcon, Calendar, MapPin, MessageCircle, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Get site settings
  const { data: settings = [] } = useQuery<any[]>({
    queryKey: ["/api/settings"],
  });

  // Helper function to get setting value
  const getSetting = (key: string, defaultValue: string = "") => {
    const setting = settings.find((s: any) => s.key === key);
    return setting?.value || defaultValue;
  };

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Services", href: "/services", icon: Sparkles },
    { name: "Gallery", href: "/gallery", icon: ImageIcon },
    { name: "Blog", href: "/blog", icon: Calendar },
    { name: "Location", href: "/location", icon: MapPin },
    { name: "Contact", href: "/contact", icon: MessageCircle },
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav data-tour="navigation" className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center group transition-transform hover:scale-105">
            <div className="flex items-center space-x-2">
              <div className="text-2xl">🌿</div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-primary group-hover:text-primary/80 transition-colors">
                  {getSetting("site_name", "Farm Feast")}
                </h1>
                <span className="text-xs text-muted-foreground hidden sm:block">Farm House</span>
              </div>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`accessible-button flex items-center space-x-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    isActive
                      ? "text-primary bg-primary/10 shadow-sm"
                      : "text-muted-foreground hover:text-primary hover:bg-muted"
                  }`}
                  aria-label={`Navigate to ${item.name} page`}
                  title={`Go to ${item.name} section`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
          
          <div className="flex items-center space-x-3">
            <a
              href={`tel:${getSetting("contact_phone", "8897326898")}`}
              className="accessible-button hidden lg:flex items-center px-4 py-3 text-sm text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-all duration-200"
              aria-label={`Call Farm Feast Farm House at ${getSetting("contact_phone", "8897326898")}`}
              title="Call us directly"
            >
              <Phone className="w-4 h-4 mr-2" />
              <span className="font-medium">{getSetting("contact_phone", "8897326898").replace("+91", "")}</span>
            </a>
            <Link href="/booking">
              <Button className="accessible-button bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 font-semibold px-6"
                aria-label="Book your stay at Farm Feast Farm House - Check availability and make reservation"
                title="Make a booking"
              >
                Book Now
              </Button>
            </Link>
            
            {/* Mobile menu button */}
            <button
              className="accessible-button md:hidden p-3 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
              title={isOpen ? "Close menu" : "Open navigation menu"}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isOpen && (
          <div 
            id="mobile-navigation"
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm"
            role="navigation"
            aria-label="Mobile navigation menu"
          >
            <div className="px-2 pt-4 pb-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`mobile-menu-item accessible-button flex items-center space-x-3 px-5 py-4 text-base font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? "text-primary bg-primary/10 shadow-sm border border-primary/20"
                        : "text-muted-foreground hover:text-primary hover:bg-muted"
                    }`}
                    onClick={() => setIsOpen(false)}
                    aria-label={`Navigate to ${item.name} page`}
                    title={`Go to ${item.name} section`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Mobile Contact Info */}
              <div className="pt-4 mt-4 border-t border-border">
                <a
                  href={`tel:${getSetting("contact_phone", "8897326898")}`}
                  className="mobile-menu-item accessible-button flex items-center space-x-3 px-5 py-4 text-base font-medium text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-all duration-200"
                  aria-label={`Call Farm Feast Farm House at ${getSetting("contact_phone", "8897326898")}`}
                  title="Call us directly"
                >
                  <Phone className="w-5 h-5" />
                  <span>Call: {getSetting("contact_phone", "8897326898").replace("+91", "")}</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
