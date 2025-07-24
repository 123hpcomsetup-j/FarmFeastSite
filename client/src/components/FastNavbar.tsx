import { Link, useLocation } from "wouter";
import { useState, memo } from "react";
import { Menu, X, Phone } from "lucide-react";

const FastNavbar = memo(() => {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/services", label: "Services" },
    { path: "/gallery", label: "Gallery" },
    { path: "/booking", label: "Booking" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">Farm Feast</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`font-medium transition-colors hover:text-primary ${
                  location === item.path ? "text-primary" : "text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <a
              href="tel:+918897326898"
              className="flex items-center space-x-1 text-sm font-medium text-primary hover:text-primary/80"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden lg:inline">+91 88973 26898</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md text-foreground hover:text-primary"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`font-medium transition-colors hover:text-primary ${
                    location === item.path ? "text-primary" : "text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <a
                href="tel:+918897326898"
                className="flex items-center space-x-2 text-primary font-medium"
              >
                <Phone className="w-4 h-4" />
                <span>+91 88973 26898</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
});

FastNavbar.displayName = "FastNavbar";

export default FastNavbar;