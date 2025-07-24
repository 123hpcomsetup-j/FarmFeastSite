import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter, Shield } from "lucide-react";
import ConsentManager from "@/components/ConsentManager";

export default function Footer() {
  // Get site settings
  const { data: settings = [] } = useQuery<any[]>({
    queryKey: ["/api/settings"],
  });

  // Helper function to get setting value
  const getSetting = (key: string, defaultValue: string = "") => {
    const setting = settings.find((s: any) => s.key === key);
    return setting?.value || defaultValue;
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">{getSetting("site_name", "Farm Feast Farm House")}</h3>
            <p className="text-gray-300 text-sm">
              Experience luxury countryside living with modern amenities. 
              Perfect for family getaways, corporate retreats, and special events.
            </p>
            <div className="flex space-x-4">
              {getSetting("social_facebook") && (
                <a href={getSetting("social_facebook")} className="text-gray-300 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {getSetting("social_instagram") && (
                <a href={getSetting("social_instagram")} className="text-gray-300 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {getSetting("social_twitter") && (
                <a href={getSetting("social_twitter")} className="text-gray-300 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-gray-300 hover:text-white transition-colors">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/booking" className="text-gray-300 hover:text-white transition-colors">
                  Book Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href={`tel:${getSetting("contact_phone", "8897326898")}`} className="text-gray-300 hover:text-white transition-colors">
                  {getSetting("contact_phone", "+91 8897326898")}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${getSetting("contact_email", "info@farmfeastfarmhouse.shop")}`} className="text-gray-300 hover:text-white transition-colors">
                  {getSetting("contact_email", "info@farmfeastfarmhouse.shop")}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span className="text-gray-300">
                  {getSetting("contact_address", "SY. No 170/A, Near Cheeryal Kaman, Keesara, Rangareddy - 501301")}
                </span>
              </div>
            </div>
          </div>

          {/* Legal & Privacy */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Legal & Privacy
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy-policy" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="text-gray-300 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="text-gray-300 hover:text-white transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/data-processing" className="text-gray-300 hover:text-white transition-colors">
                  Data Processing & Rights
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © {new Date().getFullYear()} Farm Feast Farm House. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <ConsentManager />
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Shield className="h-4 w-4" />
                <span>GDPR Compliant</span>
              </div>
              <div className="text-sm text-gray-300">
                <span>🇮🇳 Made in India</span>
              </div>
            </div>
          </div>
          
          {/* GDPR Notice */}
          <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-300 text-center">
              This website is GDPR compliant and respects your privacy rights. 
              We use cookies to enhance your experience and provide personalized services. 
              By using our website, you consent to our use of cookies in accordance with our{" "}
              <Link href="/cookie-policy" className="text-blue-400 hover:text-blue-300 underline">
                Cookie Policy
              </Link>
              . You can manage your preferences or exercise your data rights at any time.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}