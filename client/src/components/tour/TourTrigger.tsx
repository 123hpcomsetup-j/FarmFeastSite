import { Button } from '@/components/ui/button';
import { useFarmTour } from './TourProvider';
import { Play, HelpCircle } from 'lucide-react';

interface TourTriggerProps {
  variant?: 'welcome' | 'help';
  className?: string;
}

export default function TourTrigger({ variant = 'help', className = '' }: TourTriggerProps) {
  const { startTour, isFirstVisit } = useFarmTour();

  if (variant === 'welcome' && isFirstVisit) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <div className="bg-white rounded-lg shadow-lg border p-4 max-w-xs animate-bounce">
          <div className="flex items-start gap-3">
            <div className="bg-green-100 rounded-full p-2">
              <Play className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                Welcome to Farm Feast! 👋
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                New here? Take a quick tour to discover all our amazing features!
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={startTour} className="bg-green-600 hover:bg-green-700">
                  <Play className="h-3 w-3 mr-1" />
                  Start Tour
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    // Mark as visited but don't start tour
                    localStorage.setItem('farm-feast-visited', 'true');
                    // Remove the welcome popup
                    const popup = document.querySelector('[data-welcome-popup]');
                    if (popup) popup.remove();
                  }}
                  className="text-gray-500"
                >
                  Skip
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'help') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={startTour}
        className={`flex items-center gap-2 ${className}`}
      >
        <HelpCircle className="h-4 w-4" />
        Take Tour
      </Button>
    );
  }

  return null;
}