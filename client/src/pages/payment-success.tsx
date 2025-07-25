import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Home, Calendar } from "lucide-react";
import FastNavbar from "@/components/FastNavbar";
import Footer from "@/components/Footer";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [confirmationCode, setConfirmationCode] = useState("");
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('booking');
    if (code) {
      setConfirmationCode(code);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <FastNavbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-800">
                Payment Submitted Successfully!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="bg-white p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thank you for your payment!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your payment details have been submitted and are being verified. 
                  We'll confirm your booking within 2-4 hours.
                </p>
                
                {confirmationCode && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-sm text-gray-600 mb-1">Booking Reference:</p>
                    <p className="font-mono text-lg font-bold text-gray-900">
                      {confirmationCode}
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg text-left">
                  <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Admin will verify your payment within 2-4 hours</li>
                    <li>• You'll receive a confirmation email once approved</li>
                    <li>• Your booking will be confirmed and ready</li>
                    <li>• Keep your confirmation code safe for reference</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => setLocation("/")}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Back to Home
                </Button>
                
                {confirmationCode && (
                  <Button 
                    onClick={() => setLocation(`/booking-confirmation?booking=${confirmationCode}`)}
                    className="flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    View Booking Details
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="text-sm text-gray-500 border-t pt-4">
                <p>Need help? Contact us at support@farmfeastfarmhouse.shop or call +91 8897326898</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}