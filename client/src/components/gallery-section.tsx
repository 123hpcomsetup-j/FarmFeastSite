import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { HomepageImage } from "@shared/schema";

export default function GallerySection() {
  const { data: galleryImages = [] } = useQuery<HomepageImage[]>({
    queryKey: ["/api/homepage-images?section=gallery"],
  });

  // Fallback to default images if no gallery images are configured
  const defaultImages = [
    {
      imageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400",
      altText: "Event celebration with outdoor party setup and happy guests",
      title: "Event Celebration",
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400",
      altText: "Outdoor wedding ceremony with beautiful decorations and seating",
      title: "Wedding Ceremony",
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400",
      altText: "Birthday party celebration with colorful decorations and cake",
      title: "Birthday Party",
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400",
      altText: "Luxury bedroom with comfortable bedding and modern amenities",
      title: "Luxury Bedroom",
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1565301660306-29e08751cc53?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400",
      altText: "Outdoor BBQ area with grilling equipment and dining setup",
      title: "BBQ Experience",
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1529636798458-92182e662485?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400",
      altText: "Family gathering with people enjoying time together outdoors",
      title: "Family Gathering",
    },
  ];

  const displayImages = galleryImages.length > 0 ? galleryImages : defaultImages;

  return (
    <section data-tour="gallery" id="gallery" className="py-16 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Farm Feast Gallery
          </h2>
          <p className="text-xl text-muted-foreground">
            Take a glimpse of our beautiful farmhouse and facilities
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayImages.map((image, index) => (
            <img
              key={index}
              src={image.imageUrl}
              alt={image.altText || image.title}
              className="gallery-image rounded-xl shadow-lg w-full h-64 object-cover cursor-pointer hover:shadow-xl transition-all duration-300"
            />
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link href="/gallery">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              View More Photos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
