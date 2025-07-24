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
  skipTour: () => void;
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
    position: 'bottom' as const,
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
    position: 'bottom' as const,
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
    position: 'bottom' as const,
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
    position: 'bottom' as const,
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
    position: 'top' as const,
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
            📱 <strong>Quick tip:</strong> Use our WhatsApp for instant responses!
          </p>
        </div>
      </div>
    ),
    position: 'top' as const,
  },
  {
    selector: '[data-tour="navigation"]',
    content: (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-pink-800">Easy Navigation 🧭</h3>
        <p className="text-gray-700">
          Use our intuitive navigation menu to explore different sections: Home, Services, 
          Gallery, and Booking. Everything is organized for your convenience.
        </p>
        <div className="bg-pink-50 p-3 rounded-lg text-center">
          <p className="text-sm text-pink-700 font-medium">
            🎉 Tour Complete! You're ready to explore Farm Feast Farmhouse!
          </p>
        </div>
      </div>
    ),
    position: 'bottom' as const,
  },
];

// Welcome Dialog Component
const WelcomeDialog = ({ isOpen, onClose, onStartTour }: {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
}) => (
  <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 relative animate-in fade-in-0 zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🌾</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Farm Feast Farmhouse!
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Ready to discover our luxury farmhouse experience? Take a quick guided tour 
              to see all our amazing features and learn how to make your perfect booking.
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-green-700 mb-2">
              <span>🎯</span>
              <span className="font-medium">What you'll discover:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-green-600">
              <div>• Luxury services</div>
              <div>• Photo gallery</div>
              <div>• Booking process</div>
              <div>• Amenities & features</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Skip for now
            </Button>
            <Button
              onClick={onStartTour}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Tour
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CustomTourComponent = ({ steps, currentStep, setCurrentStep, setIsOpen }: any) => {
  const { setIsOpen: setTourOpen } = useTour();

  if (currentStep >= steps.length) {
    return null;
  }

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleSkip = () => {
    setIsOpen(false);
    setTourOpen(false);
    localStorage.setItem('farmhouse-tour-completed', 'true');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 relative animate-in fade-in-0 zoom-in-95 duration-200">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
            <div className="flex gap-1">
              {steps.map((_: any, index: number) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            {step.content}
          </div>
          
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
            >
              <SkipForward className="h-4 w-4" />
              Skip Tour
            </Button>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
              )}
              
              <Button
                onClick={() => {
                  if (isLastStep) {
                    setIsOpen(false);
                    setTourOpen(false);
                    localStorage.setItem('farmhouse-tour-completed', 'true');
                  } else {
                    setCurrentStep(currentStep + 1);
                  }
                }}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                {isLastStep ? (
                  <>
                    Complete Tour
                    <X className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isFirstVisit, setFirstVisit] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Tour disabled to prevent popup
    // const hasCompletedTour = localStorage.getItem('farmhouse-tour-completed');
    // const hasVisited = localStorage.getItem('farmhouse-visited');
    
    // if (!hasVisited && !hasCompletedTour) {
    //   setFirstVisit(true);
    //   setShowWelcome(true);
    //   localStorage.setItem('farmhouse-visited', 'true');
    // }
    
    // Mark tour as completed to prevent any tour dialogs
    localStorage.setItem('farmhouse-tour-completed', 'true');
    localStorage.setItem('farmhouse-visited', 'true');
  }, []);

  const startTour = () => {
    setShowWelcome(false);
    setIsTourOpen(true);
    setCurrentStep(0);
  };

  const completeTour = () => {
    setIsTourOpen(false);
    localStorage.setItem('farmhouse-tour-completed', 'true');
  };

  const skipTour = () => {
    setShowWelcome(false);
    setIsTourOpen(false);
    localStorage.setItem('farmhouse-tour-completed', 'true');
  };

  const contextValue: TourContextType = {
    startTour,
    isFirstVisit,
    setFirstVisit,
    completeTour,
    skipTour,
  };

  return (
    <TourContext.Provider value={contextValue}>
      <ReactTourProvider
        steps={tourSteps}
        showCloseButton={false}
        showNavigation={false}
        showBadge={false}
        className="tour-mask"
        styles={{
          popover: (base) => ({
            ...base,
            display: 'none', // Hide default popover since we use custom component
          }),
        }}
      >
        {children}
        
        <WelcomeDialog
          isOpen={showWelcome}
          onClose={skipTour}
          onStartTour={startTour}
        />
        
        {isTourOpen && (
          <CustomTourComponent
            steps={tourSteps}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            setIsOpen={setIsTourOpen}
          />
        )}
      </ReactTourProvider>
    </TourContext.Provider>
  );
};

export default TourProvider;