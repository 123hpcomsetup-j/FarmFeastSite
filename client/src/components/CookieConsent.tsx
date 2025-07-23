import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X, Settings, Cookie, Shield, BarChart3, Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const defaultPreferences: CookiePreferences = {
  essential: true, // Always true, cannot be disabled
  analytics: false,
  marketing: false,
  preferences: false,
};

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    const savedPreferences = localStorage.getItem("cookiePreferences");
    
    if (!consent) {
      setShowBanner(true);
    } else if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    const finalPrefs = { ...prefs, essential: true };
    localStorage.setItem("cookieConsent", "true");
    localStorage.setItem("cookiePreferences", JSON.stringify(finalPrefs));
    setPreferences(finalPrefs);
    setShowBanner(false);
    setShowSettings(false);

    // Apply cookie settings
    applyCookieSettings(finalPrefs);
  };

  const applyCookieSettings = (prefs: CookiePreferences) => {
    // Essential cookies are always enabled
    
    // Analytics cookies (Google Analytics, etc.)
    if (prefs.analytics) {
      // Enable analytics tracking
      console.log("Analytics cookies enabled");
    } else {
      // Disable analytics tracking
      console.log("Analytics cookies disabled");
    }

    // Marketing cookies (advertising, social media)
    if (prefs.marketing) {
      // Enable marketing tracking
      console.log("Marketing cookies enabled");
    } else {
      // Disable marketing tracking
      console.log("Marketing cookies disabled");
    }

    // Preference cookies (theme, language, etc.)
    if (prefs.preferences) {
      // Enable preference cookies
      console.log("Preference cookies enabled");
    } else {
      // Disable preference cookies
      console.log("Preference cookies disabled");
    }
  };

  const acceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    savePreferences(allAccepted);
  };

  const acceptEssentialOnly = () => {
    savePreferences(defaultPreferences);
  };

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    if (key === "essential") return; // Essential cookies cannot be disabled
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Cookie className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">We Value Your Privacy</h3>
                    <p className="text-gray-600 text-sm">
                      We use cookies to enhance your browsing experience, serve personalized ads or content, 
                      and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. 
                      You can customize your preferences or read our{" "}
                      <a href="/privacy-policy" className="text-blue-600 hover:underline">
                        Privacy Policy
                      </a>{" "}
                      for more details.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <Dialog open={showSettings} onOpenChange={setShowSettings}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Customize
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Cookie Preferences
                        </DialogTitle>
                        <DialogDescription>
                          Manage your cookie preferences. Essential cookies are required for the website to function properly.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6 mt-4">
                        {/* Essential Cookies */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-green-600" />
                              <Label className="text-base font-medium">Essential Cookies</Label>
                            </div>
                            <p className="text-sm text-gray-600">
                              Required for the website to function properly. These cannot be disabled.
                            </p>
                          </div>
                          <Switch checked={true} disabled className="mt-1" />
                        </div>

                        {/* Analytics Cookies */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4 text-blue-600" />
                              <Label className="text-base font-medium">Analytics Cookies</Label>
                            </div>
                            <p className="text-sm text-gray-600">
                              Help us understand how visitors interact with our website by collecting anonymous information.
                            </p>
                          </div>
                          <Switch
                            checked={preferences.analytics}
                            onCheckedChange={(value) => handlePreferenceChange("analytics", value)}
                            className="mt-1"
                          />
                        </div>

                        {/* Marketing Cookies */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <Heart className="h-4 w-4 text-pink-600" />
                              <Label className="text-base font-medium">Marketing Cookies</Label>
                            </div>
                            <p className="text-sm text-gray-600">
                              Used to track visitors and display relevant ads and marketing campaigns.
                            </p>
                          </div>
                          <Switch
                            checked={preferences.marketing}
                            onCheckedChange={(value) => handlePreferenceChange("marketing", value)}
                            className="mt-1"
                          />
                        </div>

                        {/* Preference Cookies */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <Settings className="h-4 w-4 text-purple-600" />
                              <Label className="text-base font-medium">Preference Cookies</Label>
                            </div>
                            <p className="text-sm text-gray-600">
                              Remember your preferences and settings to provide a personalized experience.
                            </p>
                          </div>
                          <Switch
                            checked={preferences.preferences}
                            onCheckedChange={(value) => handlePreferenceChange("preferences", value)}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 mt-6">
                        <Button
                          onClick={() => savePreferences(preferences)}
                          className="flex-1"
                        >
                          Save Preferences
                        </Button>
                        <Button
                          variant="outline"
                          onClick={acceptAll}
                          className="flex-1"
                        >
                          Accept All
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button onClick={acceptEssentialOnly} variant="outline" size="sm">
                    Essential Only
                  </Button>
                  
                  <Button onClick={acceptAll} size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Accept All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

// Hook to get current cookie preferences
export function useCookiePreferences() {
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const savedPreferences = localStorage.getItem("cookiePreferences");
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  return preferences;
}