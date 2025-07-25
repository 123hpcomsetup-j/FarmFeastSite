import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import LocationSeoContent from "@/components/LocationSeoContent";

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Fetch gallery images from API
  const { data: galleryImages = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/gallery"],
  });

  // Transform API data to match component expectations
  const transformedImages = galleryImages.map((img: any) => ({
    src: img.url,
    alt: img.alt,
    category: img.category,
  }));

  // Get unique categories from API data
  const categories = ["All", ...Array.from(new Set(galleryImages.map((img: any) => img.category)))];

  // Fallback images if API data is empty
  const fallbackImages = [
    {
      src: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      alt: "Beautiful farmhouse exterior with green landscaping",
      category: "Exterior",
    },
    {
      src: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      alt: "Luxurious swimming pool with clear blue water and deck area",
      category: "Pool & Amenities",
    },
    {
      src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      alt: "Event celebration with outdoor party setup and happy guests",
      category: "Events",
    },
  ];

  const imagesToDisplay = transformedImages.length > 0 ? transformedImages : fallbackImages;

  const filteredImages = selectedCategory === "All" 
    ? imagesToDisplay 
    : imagesToDisplay.filter(img => img.category === selectedCategory);

  const openModal = (index: number) => {
    setSelectedImage(index);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % filteredImages.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? filteredImages.length - 1 : selectedImage - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SeoHead 
        title="Farmhouse Gallery | Luxury Accommodation Photos in Keesara, Hyderabad"
        description="Explore our beautiful farmhouse gallery showcasing luxury rooms, swimming pool, gardens, and amenities. Located in Keesara, Hyderabad with stunning views and modern facilities for perfect weekend getaways."
      />
      <Navbar />
      <main>
        {/* Header Section */}
        <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Farm Feast Gallery
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Take a visual journey through our beautiful farmhouse property. See our luxurious amenities, spacious grounds, and memorable events.
              </p>
            </div>
          </div>
        </section>

        {/* Filter Categories */}
        <section className="py-8 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={`accessible-button ${selectedCategory === category ? "bg-primary text-primary-foreground" : ""}`}
                  aria-label={`Filter gallery by ${category} images`}
                  title={`Show ${category} category images`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="h-64 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredImages.map((image, index) => (
                  <button
                  key={index}
                  className="relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 accessible-button"
                  onClick={() => openModal(index)}
                  aria-label={`View ${image.alt} in full size - Category: ${image.category}`}
                  title={`Click to view ${image.alt} in gallery modal`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="bg-primary px-2 py-1 rounded text-sm font-medium">
                      {image.category}
                    </span>
                  </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Image Modal */}
        {selectedImage !== null && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="relative max-w-4xl max-h-full">
              <img
                src={filteredImages[selectedImage].src}
                alt={filteredImages[selectedImage].alt}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors accessible-button"
                aria-label="Close gallery modal and return to gallery view"
                title="Close image viewer"
              >
                <X className="w-6 h-6" />
              </button>
              
              {/* Navigation Buttons */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors accessible-button"
                aria-label="View previous image in gallery"
                title="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors accessible-button"
                aria-label="View next image in gallery"
                title="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              {/* Image Info */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-4 rounded-lg">
                <p className="font-medium">{filteredImages[selectedImage].alt}</p>
                <p className="text-sm opacity-75">{filteredImages[selectedImage].category}</p>
              </div>
            </div>
          </div>
        )}
        
        <LocationSeoContent page="gallery" showNearbyLocations={true} showKeywordTags={false} />
      </main>
      <Footer />
    </div>
  );
}
