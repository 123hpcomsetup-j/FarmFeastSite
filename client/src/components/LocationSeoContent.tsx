// Location-based SEO Content Component for Hyderabad Farmhouse Rentals
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Star } from "lucide-react";

interface LocationSeoContentProps {
  page?: string;
  showNearbyLocations?: boolean;
  showKeywordTags?: boolean;
}

export default function LocationSeoContent({ 
  page = 'home', 
  showNearbyLocations = true, 
  showKeywordTags = true 
}: LocationSeoContentProps) {
  
  const nearbyLocations = [
    { name: 'Shamirpet', distance: '15 km', time: '20 min' },
    { name: 'Medchal', distance: '20 km', time: '25 min' },
    { name: 'Ghatkesar', distance: '25 km', time: '30 min' },
    { name: 'Kompally', distance: '35 km', time: '40 min' },
    { name: 'Hitech City', distance: '40 km', time: '45 min' },
    { name: 'Gachibowli', distance: '45 km', time: '50 min' },
    { name: 'Jubilee Hills', distance: '50 km', time: '55 min' },
    { name: 'Banjara Hills', distance: '55 km', time: '60 min' }
  ];

  const seoKeywords = [
    'Best Farm House for Rent',
    'Farm House Rent in Keesara',
    'Farm House Rent in Hyderabad',
    'Luxury Farmhouse Rental Hyderabad',
    'Weekend Getaway Hyderabad',
    'Farm Stay Hyderabad',
    'Corporate Events Hyderabad',
    'Family Vacation Hyderabad'
  ];

  const locationContent = {
    home: {
      title: 'Premium Farmhouse in Keesara, Hyderabad',
      description: 'Experience the best farm house for rent in Keesara, Hyderabad. Our luxury farmhouse rental offers the perfect weekend getaway with modern amenities, swimming pool, and beautiful gardens. Located just 40 km from Hitech City and Gachibowli, we provide easy access from all major Hyderabad areas including Shamirpet, Medchal, and Ghatkesar.'
    },
    services: {
      title: 'Farmhouse Services in Hyderabad',
      description: 'Comprehensive farmhouse rental services including corporate events, birthday parties, family stays, and team outings. Our luxury farmhouse in Keesara serves all of Hyderabad with convenient access from Jubilee Hills, Banjara Hills, and surrounding areas.'
    },
    gallery: {
      title: 'Farmhouse Photo Gallery - Hyderabad',
      description: 'Browse our beautiful farmhouse gallery showcasing premium accommodation, swimming pool, gardens, and amenities. See why we\'re rated as the best farm house for rent in Keesara, Hyderabad area.'
    },
    booking: {
      title: 'Book Your Hyderabad Farmhouse Stay',
      description: 'Easy online booking for the best farmhouse rental in Keesara, Hyderabad. Special weekend rates and corporate packages available. Book now for your perfect getaway!'
    }
  };

  const currentContent = locationContent[page as keyof typeof locationContent] || locationContent.home;

  return (
    <div className="space-y-6 py-8">
      {/* Main Location Content */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">
          {currentContent.title}
        </h2>
        <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
          {currentContent.description}
        </p>
      </div>

      {/* SEO Keywords Display */}
      {showKeywordTags && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Popular Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {seoKeywords.map((keyword, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-sm py-1 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100"
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nearby Locations */}
      {showNearbyLocations && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-500" />
              Easy Access from Major Hyderabad Areas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {nearbyLocations.map((location, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{location.name}</p>
                    <p className="text-sm text-gray-600">{location.distance}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {location.time}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Perfect Location:</strong> Our farmhouse in Keesara offers peaceful countryside living 
                while maintaining easy connectivity to all major Hyderabad business districts, shopping areas, 
                and IT hubs including HITEC City, Gachibowli, and Jubilee Hills.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Strategic Location</h4>
            <p className="text-sm text-gray-600">
              Located in Keesara with excellent connectivity to all parts of Hyderabad via Outer Ring Road
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Premium Amenities</h4>
            <p className="text-sm text-gray-600">
              Luxury accommodation with swimming pool, gardens, and modern facilities for perfect family getaways
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Easy Booking</h4>
            <p className="text-sm text-gray-600">
              Simple online booking process with instant confirmation and flexible cancellation policies
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}