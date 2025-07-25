import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, CheckCircle, CreditCard, Smartphone, QrCode } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import FastNavbar from "@/components/FastNavbar";
import Footer from "@/components/Footer";

interface BookingDetails {
  id: number;
  confirmationCode: string;
  fullName: string;
  email: string;
  contactNumber: string;
  checkinDate: string;
  checkoutDate: string;
  guestCount: number;
  finalTotal: number;
  status: string;
  paymentStatus: string;
}

export default function Payment() {
  const [, setLocation] = useLocation();
  const [utrNumber, setUtrNumber] = useState("");
  const [paymentStep, setPaymentStep] = useState<"payment" | "utr" | "confirmation">("payment");
  const { toast } = useToast();
  
  // Get booking confirmation code from URL params
  const confirmationCode = new URLSearchParams(window.location.search).get("booking");

  // Fetch booking details
  const { data: booking, isLoading } = useQuery<BookingDetails>({
    queryKey: ["/api/bookings", confirmationCode],
    enabled: !!confirmationCode,
  });

  // Fetch UPI settings
  const { data: upiSettings } = useQuery({
    queryKey: ["/api/settings", "upi_id"],
  });

  // Submit UTR mutation
  const submitUtrMutation = useMutation({
    mutationFn: async (data: { utrNumber: string }) => {
      return apiRequest("PUT", `/api/bookings/${booking?.id}/payment`, {
        utrNumber: data.utrNumber,
        paymentStatus: "pending_verification"
      });
    },
    onSuccess: () => {
      toast({
        title: "Payment details submitted",
        description: "Your UTR number has been recorded. We'll verify and confirm your booking soon.",
      });
      // Redirect to success page
      setLocation(`/payment-success?booking=${booking?.confirmationCode}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit payment details. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyUpiId = () => {
    const upiId = upiSettings?.value || "farmfeast@ybl";
    navigator.clipboard.writeText(upiId);
    toast({
      title: "UPI ID copied",
      description: "UPI ID has been copied to clipboard",
    });
  };

  const handleUtrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      toast({
        title: "UTR number required",
        description: "Please enter the UTR/Transaction ID",
        variant: "destructive",
      });
      return;
    }
    submitUtrMutation.mutate({ utrNumber });
  };

  useEffect(() => {
    if (!confirmationCode) {
      setLocation("/booking");
    }
  }, [confirmationCode, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FastNavbar />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center">Loading booking details...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FastNavbar />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-8">
              <h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
              <p className="text-gray-600 mb-4">The booking confirmation code is invalid or expired.</p>
              <Button onClick={() => setLocation("/booking")}>
                Make New Booking
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FastNavbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Booking Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Booking Summary</span>
              <Badge variant="outline">
                {booking?.confirmationCode}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Guest Name</p>
                <p className="text-gray-600">{booking?.fullName}</p>
              </div>
              <div>
                <p className="font-medium">Total Amount</p>
                <p className="text-2xl font-bold text-primary">₹{booking?.finalTotal?.toLocaleString()}</p>
              </div>
              <div>
                <p className="font-medium">Check-in</p>
                <p className="text-gray-600">{booking?.checkinDate ? new Date(booking.checkinDate).toLocaleDateString() : ''}</p>
              </div>
              <div>
                <p className="font-medium">Check-out</p>
                <p className="text-gray-600">{booking?.checkoutDate ? new Date(booking.checkoutDate).toLocaleDateString() : ''}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Steps */}
        {paymentStep === "payment" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Complete Payment via UPI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <QrCode className="h-16 w-16 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold mb-2">Scan QR Code or Use UPI ID</h3>
                <p className="text-gray-600 text-sm">
                  Pay ₹{booking?.finalTotal?.toLocaleString()} using any UPI app
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label htmlFor="upi-id">UPI ID</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="upi-id"
                      value={upiSettings?.value || "farmfeast@ybl"}
                      readOnly
                      className="bg-gray-50"
                    />
                    <Button onClick={copyUpiId} variant="outline" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Payment Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                    <li>Open your UPI app (PhonePe, GPay, Paytm, etc.)</li>
                    <li>Scan the QR code or enter the UPI ID: <strong>{upiSettings?.value || "farmfeast@ybl"}</strong></li>
                    <li>Enter amount: <strong>₹{booking?.finalTotal?.toLocaleString()}</strong></li>
                    <li>Add reference: <strong>{booking?.confirmationCode}</strong></li>
                    <li>Complete the payment</li>
                    <li>Note down the UTR/Transaction ID</li>
                  </ol>
                </div>
              </div>

              <Button 
                onClick={() => setPaymentStep("utr")} 
                className="w-full"
                size="lg"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                I've Made the Payment
              </Button>
            </CardContent>
          </Card>
        )}

        {paymentStep === "utr" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Enter Transaction Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUtrSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="utr">UTR/Transaction ID *</Label>
                  <Input
                    id="utr"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="Enter 12-digit UTR number"
                    maxLength={12}
                    required
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    You can find this in your UPI app's transaction history
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> Please ensure you've made the payment of 
                    <strong> ₹{booking?.finalTotal?.toLocaleString()}</strong> to UPI ID 
                    <strong> {upiSettings?.value || "farmfeast@ybl"}</strong> before submitting.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setPaymentStep("payment")}
                    className="flex-1"
                  >
                    Back to Payment
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitUtrMutation.isPending}
                    className="flex-1"
                  >
                    {submitUtrMutation.isPending ? "Submitting..." : "Submit UTR"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {paymentStep === "confirmation" && (
          <Card>
            <CardContent className="text-center py-8">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
              <p className="text-gray-600 mb-4">
                Your payment details have been submitted successfully.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-green-900 mb-2">What's Next?</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• We'll verify your payment within 2-4 hours</li>
                  <li>• You'll receive a confirmation email once verified</li>
                  <li>• Your booking will be confirmed and ready</li>
                  <li>• Check your email for updates on booking status</li>
                </ul>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Booking Reference: <strong>{booking?.confirmationCode}</strong>
                </p>
                
                <div className="flex gap-3">
                  <Button onClick={() => setLocation("/")} variant="outline" className="flex-1">
                    Back to Home
                  </Button>
                  <Button 
                    onClick={() => setLocation(`/booking-confirmation?code=${booking?.confirmationCode}`)}
                    className="flex-1"
                  >
                    View Booking
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
}