import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Search, Calendar, Users, Phone, Mail, MapPin, Clock, CreditCard } from "lucide-react";
import { format } from "date-fns";
import PaymentForm from "@/components/payment/PaymentForm";

interface BookingDetails {
  id: number;
  confirmationCode: string;
  fullName: string;
  checkinDate: string;
  checkoutDate: string;
  guestCount: number;
  status: string;
  paymentStatus: string;
  finalTotal: number;
}

export default function BookingConfirmation() {
  const [, setLocation] = useLocation();
  const [confirmationCode, setConfirmationCode] = useState("");
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Check URL parameters for auto-fill and payment flag
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('booking') || urlParams.get('code'); // Support both formats
    const paymentParam = urlParams.get('payment');
    
    if (codeParam) {
      setConfirmationCode(codeParam);
      setSearchAttempted(true);
      if (paymentParam === 'true') {
        setShowPayment(true);
      }
    }
  }, []);

  const { data: booking, isLoading, error, refetch } = useQuery<BookingDetails>({
    queryKey: ["/api/bookings", confirmationCode],
    enabled: searchAttempted && confirmationCode.length >= 6,
  });

  const handleSearch = () => {
    if (confirmationCode.trim().length >= 6) {
      setSearchAttempted(true);
      refetch();
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "EEEE, MMMM do, yyyy");
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'paid':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
      default:
        return 'bg-orange-100 text-orange-800 border-orange-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Booking Confirmation
          </h1>
          <p className="text-gray-600">
            Enter your confirmation code to view booking details
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Find Your Booking
            </CardTitle>
            <CardDescription>
              Enter the confirmation code you received when booking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="confirmationCode">Confirmation Code</Label>
                <Input
                  id="confirmationCode"
                  placeholder="e.g., ABC12345"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value.toUpperCase())}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleSearch}
                  disabled={confirmationCode.length < 6 || isLoading}
                  className="px-6"
                >
                  {isLoading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {searchAttempted && error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-red-600 text-lg font-medium mb-2">
                  Booking Not Found
                </div>
                <p className="text-red-600 text-sm">
                  Please check your confirmation code and try again. If you continue to have issues, 
                  contact us at +91-8897326898.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Details */}
        {booking && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-900">
                Booking Found!
              </CardTitle>
              <CardDescription className="text-green-700">
                Here are your reservation details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status and Confirmation Code */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 flex-wrap">
                  <Badge className={`px-4 py-2 text-sm font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                  <Badge className={`px-4 py-2 text-sm font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                    Payment: {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                  </Badge>
                </div>
                
                <div className="bg-green-600 text-white px-6 py-4 rounded-lg">
                  <div className="text-sm font-medium">Confirmation Code</div>
                  <div className="text-2xl font-bold tracking-wider">
                    {booking.confirmationCode}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Booking Details Grid */}
              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                  <Users className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Guest Name</div>
                    <div className="text-gray-600">{booking.fullName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Check-in Date</div>
                    <div className="text-gray-600">{formatDate(booking.checkinDate)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Check-out Date</div>
                    <div className="text-gray-600">{formatDate(booking.checkoutDate)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                  <Users className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Number of Guests</div>
                    <div className="text-gray-600">
                      {booking.guestCount} {booking.guestCount === 1 ? 'guest' : 'guests'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
                  <div className="text-2xl">💰</div>
                  <div>
                    <div className="font-medium text-gray-900">Total Amount</div>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{booking.finalTotal.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-900">Phone: +91-8897326898</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-900">Email: info@farmfeastfarmhouse.shop</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-blue-900">
                      Address: SY. No 170/A, Near Cheeryal Kaman, Keesara, Rangareddy - 501301
                    </span>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              {booking.status === 'confirmed' && (
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Important Notes
                  </h3>
                  <ul className="text-sm text-yellow-800 space-y-2">
                    <li>• Please arrive at your scheduled check-in time</li>
                    <li>• Bring your confirmation code: <strong>{booking.confirmationCode}</strong></li>
                    <li>• Contact us if you'll be arriving later than expected</li>
                    <li>• We'll send you a reminder 24 hours before check-in</li>
                  </ul>
                </div>
              )}

              {/* Payment Section */}
              {booking.paymentStatus === 'pending' && !showPayment && (
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Required
                  </h3>
                  <p className="text-sm text-orange-800 mb-4">
                    Complete your payment to confirm your booking. Your reservation will be confirmed once payment is verified.
                  </p>
                  <Button 
                    onClick={() => setLocation(`/payment?booking=${booking.confirmationCode}`)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Proceed to Payment
                  </Button>
                </div>
              )}

              {booking.status === 'pending' && booking.paymentStatus !== 'pending' && (
                <div className="bg-yellow-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-4">
                    Booking Pending
                  </h3>
                  <p className="text-sm text-yellow-800">
                    Your booking is currently pending confirmation. We'll contact you within 24 hours to confirm your reservation.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Form */}
        {booking && showPayment && (
          <PaymentForm 
            booking={booking as any}
            onPaymentSubmitted={() => {
              setShowPayment(false);
              refetch(); // Refresh booking data
            }}
          />
        )}

        {/* Help Section */}
        <div className="text-center mt-8 text-gray-600">
          <p className="text-sm">
            Need help? Contact us at{" "}
            <a href="tel:+918897326898" className="text-blue-600 hover:underline">
              +91-8897326898
            </a>{" "}
            or{" "}
            <a href="mailto:info@farmfeastfarmhouse.shop" className="text-blue-600 hover:underline">
              info@farmfeastfarmhouse.shop
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}