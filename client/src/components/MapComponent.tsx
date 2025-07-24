import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Phone, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  name: string;
  phone?: string;
}

export default function MapComponent() {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Get site settings for location data
  const { data: settings = [] } = useQuery({
    queryKey: ["/api/settings"],
  });

  // Extract location data from settings
  const getLocationData = (): LocationData => {
    const settingsArray = Array.isArray(settings) ? settings : [];
    const addressSetting = settingsArray.find((s: any) => s.key === "contact_address");
    const phoneSetting = settingsArray.find((s: any) => s.key === "contact_phone");
    const latSetting = settingsArray.find((s: any) => s.key === "location_latitude");
    const lngSetting = settingsArray.find((s: any) => s.key === "location_longitude");
    
    return {
      latitude: latSetting ? parseFloat(latSetting.value) : 28.6139,
      longitude: lngSetting ? parseFloat(lngSetting.value) : 77.2090,
      address: addressSetting?.value || "Farm Feast Farm House, Rural Location",
      name: "Farm Feast Farm House",
      phone: phoneSetting?.value,
    };
  };

  const getMapUrls = () => {
    const settingsArray = Array.isArray(settings) ? settings : [];
    const embedUrlSetting = settingsArray.find((s: any) => s.key === "google_maps_embed_url");
    const directionsUrlSetting = settingsArray.find((s: any) => s.key === "google_maps_directions_url");
    const placeUrlSetting = settingsArray.find((s: any) => s.key === "google_maps_place_url");
    
    return {
      embedUrl: embedUrlSetting?.value || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.8!2d77.2090!3d28.6139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xf390df9eae466c03!2sFarm%20Feast%20FarmHouse!5e0!3m2!1sen!2sin!4v1642123456789!5m2!1sen!2sin",
      directionsUrl: directionsUrlSetting?.value || "https://www.google.com/maps/dir//Farm+Feast+FarmHouse/@28.6139,77.2090",
      placeUrl: placeUrlSetting?.value || "https://www.google.com/maps/place/Farm+Feast+FarmHouse/data=!4m2!3m1!1s0x0:0xf390df9eae466c03?sa=X&ved=1t:2428&ictx=111"
    };
  };

  const locationData = getLocationData();
  const mapUrls = getMapUrls();

  // User location disabled to prevent popup
  // useEffect(() => {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (position) => {
  //         setUserLocation({
  //           lat: position.coords.latitude,
  //           lng: position.coords.longitude
  //         });
  //       },
  //       (error) => {
  //         console.log("Location access denied:", error);
  //       }
  //     );
  //   }
  // }, []);

  const openInGoogleMaps = () => {
    window.open(mapUrls.placeUrl, '_blank');
  };

  const openDirections = () => {
    window.open(mapUrls.directionsUrl, '_blank');
  };

  const callLocation = () => {
    if (locationData.phone) {
      window.location.href = `tel:${locationData.phone}`;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            Find Us
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Interactive Map Container */}
          <div className="relative w-full h-64 md:h-80 bg-gray-100 rounded-lg overflow-hidden border">
            <iframe
              src={mapUrls.embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Farm Feast Farm House Location"
            />
          </div>

          {/* Location Information */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900">{locationData.name}</h3>
                <p className="text-gray-600 text-sm">{locationData.address}</p>
              </div>
            </div>

            {locationData.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-green-600" />
                <span className="text-gray-600">{locationData.phone}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={openDirections} className="flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              Get Directions
            </Button>
            
            <Button variant="outline" onClick={openInGoogleMaps} className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Open in Maps
            </Button>

            {locationData.phone && (
              <Button variant="outline" onClick={callLocation} className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Call Us
              </Button>
            )}
          </div>

          {/* Distance Information - Removed to prevent location popup */}
        </CardContent>
      </Card>

      {/* Nearby Landmarks Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Nearby Landmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Transportation</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Nearest Railway Station: 15 km</li>
                <li>• Bus Stop: 2 km</li>
                <li>• Airport: 45 km</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Amenities</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Medical Center: 5 km</li>
                <li>• Market/Shop: 3 km</li>
                <li>• Fuel Station: 8 km</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Travel Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Travel Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">🚗</span>
              <p><strong>By Car:</strong> Well-connected roads with clear signage. Parking available on-site.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">🚌</span>
              <p><strong>Public Transport:</strong> Regular bus service to nearby village, then 2km walk or auto-rickshaw.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">⏰</span>
              <p><strong>Best Time to Travel:</strong> Early morning or evening to avoid traffic and enjoy scenic route.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">📱</span>
              <p><strong>Navigation:</strong> GPS coordinates work well. Call us if you need assistance finding the location.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}