import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";
import MapComponent from "@/components/MapComponent";
import SeoHead from "@/components/SeoHead";

export default function Location() {
  return (
    <div className="min-h-screen bg-background">
      <SeoHead 
        title="Location & Directions - Farm Feast Farm House"
        description="Find your way to Farm Feast Farm House with our interactive map, detailed directions, and travel tips. Get directions and contact information."
        type="website"
      />
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Location & Directions</h1>
          <p className="text-lg text-gray-600">
            Find us easily with our interactive map and detailed travel information
          </p>
        </div>
        <MapComponent />
      </main>
      <Footer />
    </div>
  );
}