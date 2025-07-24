import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Calendar, MessageCircle, MapPin, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { GalleryImage, SiteSettings } from "@shared/schema";

export default function HeroSection() {
  const { data: galleryImages = [] } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery"],
  });

  const { data: siteSettings = [] } = useQuery<SiteSettings[]>({
    queryKey: ["/api/settings"],
  });

  // Use exterior images for hero section, fallback to any available image
  const heroImage = galleryImages.find(img => img.category === 'exterior') || galleryImages[0];

  // Get dynamic stats from site settings with fallbacks
  const getSettingValue = (key: string, fallback: string) => {
    const setting = siteSettings.find(s => s.key === key);
    return setting?.value || fallback;
  };

  const pricePerGuest = getSettingValue('price_per_guest', '₹1,150');
  const capacity = getSettingValue('capacity', '50+');
  const supportHours = getSettingValue('support_hours', '24/7');
  
  // Get dynamic hero content from site settings with fallbacks
  const heroTitleLine1 = getSettingValue('hero_title_line1', 'Your Perfect');
  const heroTitleLine2 = getSettingValue('hero_title_line2', 'Getaway');
  const heroLocation = getSettingValue('hero_location', 'Near Hyderabad');
  const heroDescription = getSettingValue('hero_description', 'Escape the city buzz and relax in nature at Farm Feast Farm House. Premium farmhouse with swimming pool, luxury amenities, and professional services.');

  return (
    <section data-tour="hero" className="hero-gradient py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                {heroTitleLine1}
                <span className="text-primary"> {heroTitleLine2}</span>
                <br />{heroLocation}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {heroDescription}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/booking">
                <Button data-tour="booking-button" size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Your Stay
                </Button>
              </Link>
              <Button variant="outline" size="lg" asChild>
                <a
                  href="https://wa.me/918897326898"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp
                </a>
              </Button>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 text-primary mr-2" />
                <span>Cheeriyal, Telangana</span>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span>Premium Property</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <img
              src={heroImage?.url || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
              alt={heroImage?.alt || "Beautiful farmhouse exterior with green landscaping"}
              className="rounded-2xl shadow-2xl w-full h-96 object-cover"
            />
            
            {/* Quick stats overlay - Dynamic from admin settings */}
            <div className="absolute -bottom-6 left-6 right-6 bg-card rounded-xl shadow-lg p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{pricePerGuest}</div>
                  <div className="text-sm text-muted-foreground">Per Guest</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{capacity}</div>
                  <div className="text-sm text-muted-foreground">Capacity</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{supportHours}</div>
                  <div className="text-sm text-muted-foreground">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
