import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import type { Service } from "@shared/schema";
import SeoHead from "@/components/SeoHead";
import LocationSeoContent from "@/components/LocationSeoContent";

export default function Services() {
  console.log("Services component rendering...");
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });
  console.log("Services data:", services, "isLoading:", isLoading);

  const getIconForService = (name: string) => {
    const iconMap: { [key: string]: string } = {
      "Pet Essentials": "🐾",
      "Box Cricket & Sand Volleyball": "🏐",
      "Bonfire Arrangement": "🔥",
      "BBQ Setup": "🍖",
      "Utensils": "🍽️",
      "Personal Chef": "👨‍🍳",
      "Party Decorations": "🎉",
    };
    return iconMap[name] || "⭐";
  };

  return (
    <div className="min-h-screen bg-background">
      <SeoHead 
        title="Farmhouse Services in Hyderabad | Corporate Events & Family Stays"
        description="Comprehensive farmhouse rental services in Hyderabad including luxury accommodation, corporate event hosting, birthday parties, and family vacations. Located in Keesara with easy access from Hitech City, Gachibowli, and all major Hyderabad areas."
      />
      <Navbar />
      <main>
        {/* Header Section */}
        <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Premium Services
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Enhance your farmhouse experience with our carefully curated services. Each service is designed to make your stay comfortable, memorable, and truly special.
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-xl" />
                ))}
              </div>
            ) : !services ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Unable to load services at this time.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service) => (
                  <Card key={service.id} className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="text-4xl mb-2">
                          {getIconForService(service.name)}
                        </div>
                        <Badge variant="secondary" className="text-lg font-bold">
                          ₹{service.price.toLocaleString()}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{service.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">{service.description}</p>
                      <div className="flex gap-2">
                        <Badge variant="outline">{service.category}</Badge>
                        <Badge variant="outline">per service</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {/* CTA Section */}
            <div className="text-center mt-16">
              <h2 className="text-2xl font-bold mb-4">Ready to Book?</h2>
              <p className="text-muted-foreground mb-6">
                Select your preferred services during the booking process and create your perfect farmhouse experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/booking">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Book Your Stay
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" size="lg">
                    View Amenities
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Service Areas */}
        <section className="py-16 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Service Areas</h2>
              <p className="text-muted-foreground">
                We provide premium farmhouse services in the following areas around Hyderabad.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                "Secunderabad", "Madhapur", "Jubilee Hills", "Banjara Hills",
                "Gachibowli", "Kukatpally", "Kondapur", "Keesara",
                "Medchal", "Kompally", "Uppal", "Ghatkesar"
              ].map((area, index) => (
                <Card key={index} className="text-center p-4">
                  <CardContent className="p-0">
                    <h3 className="font-semibold">{area}</h3>
                    <p className="text-sm text-muted-foreground">Hyderabad</p>
                    <p className="text-sm text-primary">+91 8897326898</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <p className="text-muted-foreground mb-4">Don't see your area? We're expanding our services!</p>
              <Button variant="outline" asChild>
                <a href="tel:8897326898">Contact Us for Other Areas</a>
              </Button>
            </div>
          </div>
        </section>
        
        <LocationSeoContent page="services" showNearbyLocations={true} showKeywordTags={false} />
      </main>
      <Footer />
    </div>
  );
}
