import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/hero-section";
import AmenitiesSection from "@/components/amenities-section";
import ServicesSection from "@/components/services-section";
import GallerySection from "@/components/gallery-section";
import ContactSection from "@/components/contact-section";
import TourTrigger from "@/components/tour/TourTrigger";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <AmenitiesSection />
        <ServicesSection />
        <GallerySection />
        <ContactSection />
      </main>
      <Footer />
      <TourTrigger variant="welcome" />
    </div>
  );
}
