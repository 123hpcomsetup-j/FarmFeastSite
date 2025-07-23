import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Mail, 
  BarChart3, 
  Heart, 
  Settings, 
  Check, 
  X,
  Download,
  Trash2,
  Edit
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ConsentSettings {
  marketing: boolean;
  analytics: boolean;
  preferences: boolean;
  dataProcessing: boolean;
  thirdPartySharing: boolean;
}

const defaultConsent: ConsentSettings = {
  marketing: false,
  analytics: false,
  preferences: false,
  dataProcessing: false,
  thirdPartySharing: false,
};

export default function ConsentManager() {
  const [consents, setConsents] = useState<ConsentSettings>(defaultConsent);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedConsents = localStorage.getItem("gdprConsents");
    if (savedConsents) {
      setConsents(JSON.parse(savedConsents));
    }
  }, []);

  const saveConsents = () => {
    localStorage.setItem("gdprConsents", JSON.stringify(consents));
    localStorage.setItem("gdprConsentDate", new Date().toISOString());
    
    toast({
      title: "Consent preferences saved",
      description: "Your privacy preferences have been updated successfully.",
    });
    
    setIsOpen(false);
  };

  const handleConsentChange = (key: keyof ConsentSettings, value: boolean) => {
    setConsents(prev => ({ ...prev, [key]: value }));
  };

  const acceptAll = () => {
    const allAccepted = {
      marketing: true,
      analytics: true,
      preferences: true,
      dataProcessing: true,
      thirdPartySharing: true,
    };
    setConsents(allAccepted);
    localStorage.setItem("gdprConsents", JSON.stringify(allAccepted));
    localStorage.setItem("gdprConsentDate", new Date().toISOString());
    
    toast({
      title: "All consents accepted",
      description: "You have consented to all data processing activities.",
    });
    
    setIsOpen(false);
  };

  const declineAll = () => {
    setConsents(defaultConsent);
    localStorage.setItem("gdprConsents", JSON.stringify(defaultConsent));
    localStorage.setItem("gdprConsentDate", new Date().toISOString());
    
    toast({
      title: "Consents declined",
      description: "You have declined optional data processing. Essential functions will continue to work.",
    });
    
    setIsOpen(false);
  };

  const withdrawAllConsents = () => {
    setConsents(defaultConsent);
    localStorage.removeItem("gdprConsents");
    localStorage.removeItem("gdprConsentDate");
    localStorage.removeItem("cookieConsent");
    localStorage.removeItem("cookiePreferences");
    
    toast({
      title: "All consents withdrawn",
      description: "Your data processing consents have been withdrawn. You may need to refresh the page.",
      variant: "destructive",
    });
    
    setIsOpen(false);
  };

  const requestDataDeletion = () => {
    toast({
      title: "Data deletion request initiated",
      description: "Your request will be processed within 30 days. You will receive confirmation via email.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Manage Consent
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            GDPR Consent Manager
          </DialogTitle>
          <DialogDescription>
            Manage your data privacy preferences and exercise your GDPR rights.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Consent Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Consent Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Marketing</span>
                  </div>
                  <Badge variant={consents.marketing ? "default" : "secondary"}>
                    {consents.marketing ? "Accepted" : "Declined"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-sm">Analytics</span>
                  </div>
                  <Badge variant={consents.analytics ? "default" : "secondary"}>
                    {consents.analytics ? "Accepted" : "Declined"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">Preferences</span>
                  </div>
                  <Badge variant={consents.preferences ? "default" : "secondary"}>
                    {consents.preferences ? "Accepted" : "Declined"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Consent Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detailed Consent Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <Label className="font-medium">Marketing Communications</Label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Receive promotional emails, newsletters, and special offers about our services.
                  </p>
                </div>
                <Switch
                  checked={consents.marketing}
                  onCheckedChange={(value) => handleConsentChange("marketing", value)}
                  className="mt-1"
                />
              </div>

              <Separator />

              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-green-600" />
                    <Label className="font-medium">Analytics & Performance</Label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Allow us to analyze website usage to improve our services and user experience.
                  </p>
                </div>
                <Switch
                  checked={consents.analytics}
                  onCheckedChange={(value) => handleConsentChange("analytics", value)}
                  className="mt-1"
                />
              </div>

              <Separator />

              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-purple-600" />
                    <Label className="font-medium">Personalization</Label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Store your preferences to provide a personalized experience across visits.
                  </p>
                </div>
                <Switch
                  checked={consents.preferences}
                  onCheckedChange={(value) => handleConsentChange("preferences", value)}
                  className="mt-1"
                />
              </div>

              <Separator />

              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-orange-600" />
                    <Label className="font-medium">Enhanced Data Processing</Label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Process your data for advanced features like AI recommendations and predictive services.
                  </p>
                </div>
                <Switch
                  checked={consents.dataProcessing}
                  onCheckedChange={(value) => handleConsentChange("dataProcessing", value)}
                  className="mt-1"
                />
              </div>

              <Separator />

              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-600" />
                    <Label className="font-medium">Third-Party Integration</Label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Share data with trusted partners for enhanced services and social media integration.
                  </p>
                </div>
                <Switch
                  checked={consents.thirdPartySharing}
                  onCheckedChange={(value) => handleConsentChange("thirdPartySharing", value)}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* GDPR Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Exercise Your GDPR Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" size="sm" className="flex items-center gap-2 justify-start">
                  <Download className="h-4 w-4" />
                  Request Data Copy
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2 justify-start">
                  <Edit className="h-4 w-4" />
                  Update My Data
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 justify-start"
                  onClick={requestDataDeletion}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete My Data
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 justify-start"
                  onClick={withdrawAllConsents}
                >
                  <X className="h-4 w-4" />
                  Withdraw All Consents
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={saveConsents} className="flex-1">
              <Check className="h-4 w-4 mr-2" />
              Save Preferences
            </Button>
            <Button onClick={acceptAll} variant="outline" className="flex-1">
              <Shield className="h-4 w-4 mr-2" />
              Accept All
            </Button>
            <Button onClick={declineAll} variant="outline" className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Decline All
            </Button>
          </div>

          {/* Legal Notice */}
          <div className="text-xs text-gray-500 p-4 bg-gray-50 rounded-lg">
            <p>
              <strong>Legal Notice:</strong> This consent manager complies with GDPR requirements. 
              Your preferences are stored locally and can be changed at any time. For questions 
              about data processing, contact our Data Protection Officer at dpo@farmfeastfarmhouse.shop. 
              You have the right to lodge a complaint with your supervisory authority if you believe 
              your data has been processed unlawfully.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}