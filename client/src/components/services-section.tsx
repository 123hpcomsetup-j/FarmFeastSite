import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import type { Service } from "@shared/schema";

export default function ServicesSection() {
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        </div>  
      </section>
    );
  }

  if (!services) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-muted-foreground">Unable to load services at this time.</p>
          </div>
        </div>
      </section>
    );
  }

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
    <section id="services" className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Premium Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Enhance your stay with our carefully curated services designed for your comfort and enjoyment
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Card key={service.id} className="service-card bg-muted/50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">
                    {getIconForService(service.name)}
                  </div>
                  <span className="text-2xl font-bold text-primary">₹{service.price.toLocaleString()}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                <p className="text-muted-foreground mb-4">{service.description}</p>
                <Link href="/booking">
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    Add to Booking
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/services">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              View All Services
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
