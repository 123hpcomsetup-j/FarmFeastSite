import React, { createContext, useContext, useState, useEffect } from 'react';
import { TourProvider as ReactTourProvider, useTour } from '@reactour/tour';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRight, ArrowLeft, Play, SkipForward } from 'lucide-react';

interface TourContextType {
  startTour: () => void;
  isFirstVisit: boolean;
  setFirstVisit: (value: boolean) => void;
  completeTour: () => void;
}

const TourContext = createContext<TourContextType | null>(null);

export const useFarmTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useFarmTour must be used within a TourProvider');
  }
  return context;
};

const tourSteps = [
  {
    selector: '[data-tour="hero"]',
    content: (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-green-800">Welcome to Farm Feast Farmhouse! 🌾</h3>
        <p className="text-gray-700">
          Get ready to discover our luxury farmhouse rental experience. This quick tour will show you 
          all the amazing features and how to make your perfect booking.
        </p>
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Play className="h-4 w-4" />
          <span>Let's start exploring!</span>
        </div>
      </div>
    ),
    position: 'bottom',
  },
  {
    selector: '[data-tour="services"]',
    content: (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-blue-800">Explore Our Services 🎯</h3>
        <p className="text-gray-700">
          Discover all the amazing services we offer - from BBQ setups and bonfire arrangements 
          to swimming pool access and indoor games. Each service is designed to make your stay unforgettable.
        </p>
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip:</strong> Click on any service to see detailed pricing and availability
          </p>
        </div>
      </div>
    ),
    position: 'bottom',
  },
  {
    selector: '[data-tour="gallery"]',
    content: (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-purple-800">Visual Gallery Experience 📸</h3>
        <p className="text-gray-700">
          Browse through our stunning photo gallery showcasing the farmhouse, activities, 
          amenities, and delicious food options. Get inspired for your perfect getaway!
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-purple-50 p-2 rounded">🏡 Farmhouse Views</div>
          <div className="bg-purple-50 p-2 rounded">🎯 Activities</div>
          <div className="bg-purple-50 p-2 rounded">✨ Amenities</div>
          <div className="bg-purple-50 p-2 rounded">🍽️ Food Options</div>
        </div>
      </div>
    ),
    position: 'bottom',
  },
  {
    selector: '[data-tour="booking-button"]',
    content: (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-orange-800">Ready to Book? 🎉</h3>
        <p className="text-gray-700">
          When you're ready to make your reservation, click this button to access our 
          comprehensive booking form with real-time pricing and instant confirmation.
        </p>
        <div className="bg-orange-50 p-3 rounded-lg">
          <p className="text-sm text-orange-700">
            🎯 <strong>What you'll get:</strong> Instant confirmation, UPI payment options, 
            and 24/7 customer support
          </p>
        </div>
      </div>
    ),
    position: 'bottom',
  },
  {
    selector: '[data-tour="amenities"]',
    content: (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-green-800">Luxury Amenities 🏊‍♂️</h3>
        <p className="text-gray-700">
          Check out our world-class amenities including swimming pool, spacious parking, 
          air-conditioned rooms, and pet-friendly facilities. Everything for your comfort!
        </p>
        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">Swimming Pool</Badge>
          <Badge variant="secondary" className="text-xs">AC Rooms</Badge>
          <Badge variant="secondary" className="text-xs">Pet-Friendly</Badge>
          <Badge variant="secondary" className="text-xs">Parking</Badge>
        </div>
      </div>
    ),
    position: 'top',
  },
  {
    selector: '[data-tour="contact"]',
    content: (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-indigo-800">Need Help? We're Here! 📞</h3>
        <p className="text-gray-700">
          Our support team is available 24/7 via WhatsApp, phone, or email. 
          Whether you have questions about booking, services, or need assistance during your stay.
        </p>
        <div className="bg-indigo-50 p-3 rounded-lg">
          <p className="text-sm text-indigo-700">
            💬 <strong>Quick Support:</strong> WhatsApp us for instant responses and real-time assistance
          </p>
        </div>
      </div>
    ),
    position: 'top',
  },
  {
    selector: '[data-tour="hero"]',
    content: (
      <div className="space-y-4 text-center">
        <h3 className="text-xl font-semibold text-green-800">Tour Complete! 🎊</h3>
        <p className="text-gray-700">
          You're now ready to explore Farm Feast Farmhouse and make your perfect booking. 
          Thanks for taking the tour!
        </p>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-700 mb-3">
            🚀 <strong>Next Steps:</strong>
          </p>
          <div className="space-y-2 text-sm text-green-600">
            <div>1. Browse our services and amenities</div>
            <div>2. Check out the photo gallery</div>
            <div>3. Make your booking when ready</div>
            <div>4. Contact us for any questions</div>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          You can restart this tour anytime from the help menu
        </p>
      </div>
    ),
    position: 'center',
  },
];

const TourControls = () => {
  const { currentStep, steps, setCurrentStep, setIsOpen } = useTour();
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          {currentStep + 1} of {steps.length}
        </Badge>
        <div className="w-24 bg-gray-200 rounded-full h-1.5">
          <div 
            className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <SkipForward className="h-4 w-4 mr-1" />
          Skip
        </Button>
        
        {!isFirstStep && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        )}
        
        <Button
          size="sm"
          onClick={() => {
            if (isLastStep) {
              setIsOpen(false);
            } else {
              setCurrentStep(currentStep + 1);
            }
          }}
          className="bg-green-600 hover:bg-green-700"
        >
          {isLastStep ? (
            <>
              <X className="h-4 w-4 mr-1" />
              Finish
            </>
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

interface TourProviderProps {
  children: React.ReactNode;
}

export default function TourProvider({ children }: TourProviderProps) {
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('farm-feast-visited');
    if (!hasVisited) {
      setIsFirstVisit(true);
      // Delay the tour start to allow page to load
      const timer = setTimeout(() => {
        setIsTourOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = () => {
    setIsTourOpen(true);
  };

  const setFirstVisit = (value: boolean) => {
    setIsFirstVisit(value);
    if (!value) {
      localStorage.setItem('farm-feast-visited', 'true');
    }
  };

  const completeTour = () => {
    setIsTourOpen(false);
    setFirstVisit(false);
  };

  const tourConfig = {
    steps: tourSteps,
    isOpen: isTourOpen,
    onRequestClose: completeTour,
    styles: {
      popover: (base: any) => ({
        ...base,
        '--reactour-accent': '#16a34a',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        maxWidth: '400px',
      }),
      mask: (base: any) => ({ 
        ...base, 
        color: 'rgba(0, 0, 0, 0.7)' 
      }),
      badge: (base: any) => ({ 
        ...base, 
        display: 'none' // Hide default badge, we have custom controls
      }),
    },
    showNavigation: false, // We use custom navigation
    showBadge: false,
    showCloseButton: false,
    disableInteraction: false,
    className: 'farm-tour',
  };

  return (
    <TourContext.Provider value={{ startTour, isFirstVisit, setFirstVisit, completeTour }}>
      <ReactTourProvider {...tourConfig}>
        {children}
        <TourControls />
      </ReactTourProvider>
    </TourContext.Provider>
  );
}