import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Calendar, MessageCircle, MapPin, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { memo, useMemo } from "react";
import type { GalleryImage, SiteSettings } from "@shared/schema";

const FastHeroSection = memo(() => {
  const { data: galleryImages = [] } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: siteSettings = [] } = useQuery<SiteSettings[]>({
    queryKey: ["/api/settings"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Memoize expensive calculations
  const heroData = useMemo(() => {
    const heroImage = galleryImages.find(img => img.category === 'exterior') || galleryImages[0];
    
    const getSettingValue = (key: string, fallback: string) => {
      const setting = siteSettings.find(s => s.key === key);
      return setting?.value || fallback;
    };

    return {
      heroImage,
      pricePerGuest: getSettingValue('price_per_guest', '₹1,150'),
      capacity: getSettingValue('capacity', '50+'),
      supportHours: getSettingValue('support_hours', '24/7'),
      heroTitleLine1: getSettingValue('hero_title_line1', 'Your Perfect'),
      heroTitleLine2: getSettingValue('hero_title_line2', 'Getaway'),
      heroLocation: getSettingValue('hero_location', 'Near Hyderabad'),
      heroDescription: getSettingValue('hero_description', 'Escape the city buzz and relax in nature at Farm Feast Farm House. Premium farmhouse with swimming pool, luxury amenities, and professional services.')
    };
  }, [galleryImages, siteSettings]);

  const imageSrc = heroData.heroImage?.source === 'url' 
    ? heroData.heroImage.url || '/api/placeholder/800/600' 
    : heroData.heroImage?.filename 
      ? `/uploads/${heroData.heroImage.filename}` 
      : '/api/placeholder/800/600';

  return (
    <section data-tour="hero" className="hero-gradient py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                {heroData.heroTitleLine1}
                <span className="text-primary"> {heroData.heroTitleLine2}</span>
                <br />{heroData.heroLocation}
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {heroData.heroDescription}
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
                  aria-label="Contact Farm Feast Farm House via WhatsApp"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp
                </a>
              </Button>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-foreground/80">
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
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={imageSrc}
                alt={heroData.heroImage?.alt || "Farm Feast Farm House - Luxury farmhouse exterior with modern amenities and beautiful landscaping"}
                className="w-full h-full object-cover"
                width={800}
                height={600}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                style={{ 
                  aspectRatio: '4/3',
                  contentVisibility: 'visible',
                  contain: 'layout style paint'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            {/* Quick stats overlay - Dynamic from admin settings */}
            <div className="absolute -bottom-6 left-6 right-6 bg-card rounded-xl shadow-lg p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{heroData.pricePerGuest}</div>
                  <div className="text-sm text-muted-foreground">Per Guest</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{heroData.capacity}</div>
                  <div className="text-sm text-muted-foreground">Capacity</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{heroData.supportHours}</div>
                  <div className="text-sm text-muted-foreground">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

FastHeroSection.displayName = "FastHeroSection";

export default FastHeroSection;