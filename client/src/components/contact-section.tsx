import { Phone, MessageCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactSection() {
  const serviceAreas = [
    { name: "Keesara Daira", distance: "1.8 km" },
    { name: "Cheeriyal", distance: "2.3 km" },
    { name: "Bandlaguda-Keesara", distance: "3.5 km" },
    { name: "Chirala", distance: "4.8 km" },
    { name: "Kundanpally", distance: "5.2 km" },
    { name: "Medchal", distance: "8.5 km" },
  ];

  return (
    <section data-tour="contact" id="contact" className="py-16 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Ready to Book Your Stay?
          </h2>
          <p className="text-xl text-muted-foreground">
            Contact us directly or use our easy online booking system
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Call Us</h3>
            <div className="space-y-1">
              <a
                href="tel:8897326898"
                className="block text-primary hover:text-primary/80 text-lg font-medium"
              >
                8897326898
              </a>
              <a
                href="tel:8309001021"
                className="block text-primary hover:text-primary/80 text-lg font-medium"
              >
                8309001021
              </a>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">WhatsApp</h3>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <a
                href="https://wa.me/918897326898"
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat Now
              </a>
            </Button>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Location</h3>
            <p className="text-muted-foreground">
              SY. No 170/A, Near Cheeryal Kaman,<br />
              Keesara, Rangareddy - 501301
            </p>
          </div>
        </div>
        
        {/* Service Areas */}
        <div className="mt-16">
          <h3 className="text-2xl font-semibold text-center mb-8">We Serve Nearby Areas</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {serviceAreas.map((area, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 bg-background p-4 rounded-lg shadow-sm"
              >
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <div className="font-medium">{area.name}</div>
                  <div className="text-sm text-muted-foreground">{area.distance}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
