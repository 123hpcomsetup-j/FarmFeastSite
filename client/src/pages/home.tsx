import FastNavbar from "@/components/FastNavbar";
import Footer from "@/components/Footer";
import FastHeroSection from "@/components/FastHeroSection";
import AmenitiesSection from "@/components/amenities-section";
import ServicesSection from "@/components/services-section";
import GallerySection from "@/components/gallery-section";
import ContactSection from "@/components/contact-section";
import MapComponent from "@/components/MapComponent";
import SeoHead from "@/components/SeoHead";
import LocationSeoContent from "@/components/LocationSeoContent";
import StructuredData from "@/components/StructuredData";

export default function Home() {
  console.log("Home component rendering...");
  return (
    <div className="min-h-screen bg-background">
      <SeoHead 
        title="Farm Feast Farm House - Luxury Farmhouse Rental & Events"
        description="Experience luxury farmhouse rental with modern amenities, pet-friendly accommodations, and farm-to-table dining. Book your perfect getaway today."
        type="website"
      />
      <StructuredData page="home" includeReviews={true} />
      <FastNavbar />
      <main>
        <FastHeroSection />
        <AmenitiesSection />
        <ServicesSection />
        <GallerySection />
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Us</h2>
              <p className="text-lg text-gray-600">Easily locate our farmhouse with interactive maps and directions</p>
            </div>
            <MapComponent />
          </div>
        </section>
        <LocationSeoContent page="home" showNearbyLocations={true} showKeywordTags={true} />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
