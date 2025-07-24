import { Car, Snowflake, Dog } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { HomepageImage } from "@shared/schema";

function AmenitiesImages() {
  const { data: amenityImages = [] } = useQuery<HomepageImage[]>({
    queryKey: ["/api/homepage-images?section=amenities"],
  });

  // Default images if none configured
  const defaultImages = [
    {
      imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
      altText: "Luxurious swimming pool with clear blue water and deck area",
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
      altText: "Spacious air-conditioned bedroom with modern furnishing",
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
      altText: "Outdoor BBQ setup with grilling equipment and seating area",
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300",
      altText: "Large parking area with vehicles and green surroundings",
    },
  ];

  const displayImages = amenityImages.length > 0 ? amenityImages : defaultImages;

  return (
    <div className="grid md:grid-cols-2 gap-8 mt-16">
      <div className="space-y-6">
        {displayImages.slice(0, 2).map((image, index) => (
          <img
            key={index}
            src={image.imageUrl}
            alt={image.altText || `Amenity image ${index + 1}`}
            className={`rounded-xl shadow-lg w-full object-cover ${index === 0 ? 'h-64' : 'h-48'}`}
          />
        ))}
      </div>
      <div className="space-y-6">
        {displayImages.slice(2, 4).map((image, index) => (
          <img
            key={index + 2}
            src={image.imageUrl}
            alt={image.altText || `Amenity image ${index + 3}`}
            className={`rounded-xl shadow-lg w-full object-cover ${index === 1 ? 'h-64' : 'h-48'}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function AmenitiesSection() {
  const amenities = [
    {
      icon: "🏊‍♂️",
      title: "Swimming Pool",
      description: "Large outdoor pool with kids section for family fun",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: <Car className="w-6 h-6" />,
      title: "Parking Available",
      description: "Spacious parking area for multiple vehicles",
      color: "bg-green-50 text-green-600",
    },
    {
      icon: <Snowflake className="w-6 h-6" />,
      title: "Air Conditioned",
      description: "Comfortable AC rooms for a relaxing stay",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: <Dog className="w-6 h-6" />,
      title: "Pet-Friendly",
      description: "Bring your furry friends along for the adventure",
      color: "bg-amber-50 text-amber-600",
    },
  ];

  const occasions = [
    {
      icon: "🎂",
      title: "Birthday Celebrations",
      description: "Make your special day memorable with our party amenities",
    },
    {
      icon: "👨‍👩‍👧‍👦",
      title: "Family Gatherings",
      description: "Spacious venue perfect for family reunions and get-togethers",
    },
    {
      icon: "💍",
      title: "Wedding Functions",
      description: "Beautiful setting for pre-wedding ceremonies and celebrations",
    },
    {
      icon: "💼",
      title: "Corporate Events",
      description: "Professional environment for team outings and corporate parties",
    },
  ];

  return (
    <>
      {/* Amenities Section */}
      <section data-tour="amenities" id="amenities" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Luxurious Farmhouse Amenities
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Experience comfort and luxury with our world-class facilities designed for your perfect getaway
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {amenities.map((amenity, index) => (
              <div key={index} className="text-center group">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:opacity-80 transition-opacity ${amenity.color}`}>
                  {typeof amenity.icon === 'string' ? (
                    <span className="text-2xl">{amenity.icon}</span>
                  ) : (
                    amenity.icon
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2">{amenity.title}</h3>
                <p className="text-muted-foreground">{amenity.description}</p>
              </div>
            ))}
          </div>
          
          {/* Amenities showcase images */}
          <AmenitiesImages />
        </div>
      </section>

      {/* Occasions Section */}
      <section className="py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Perfect for Every Occasion
            </h2>
            <p className="text-xl text-muted-foreground">
              Create unforgettable memories for all your special events
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {occasions.map((occasion, index) => (
              <div key={index} className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-center">
                  <div className="text-3xl mb-4">{occasion.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{occasion.title}</h3>
                  <p className="text-muted-foreground text-sm">{occasion.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
