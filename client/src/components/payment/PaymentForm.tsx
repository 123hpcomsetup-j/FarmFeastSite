import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  CreditCard, 
  Copy, 
  Check, 
  AlertCircle, 
  QrCode,
  Smartphone,
  Clock,
  CheckCircle
} from "lucide-react";
import { z } from "zod";
import type { Booking, SiteSettings } from "@shared/schema";

const paymentSchema = z.object({
  upiTransactionId: z.string().min(12, "UTR number must be at least 12 characters").max(50, "UTR number too long"),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  booking: Booking;
  onPaymentSubmitted: () => void;
}

export default function PaymentForm({ booking, onPaymentSubmitted }: PaymentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'instructions' | 'utr' | 'submitted'>('instructions');

  // Fetch UPI ID from site settings
  const { data: siteSettings = [] } = useQuery<SiteSettings[]>({
    queryKey: ["/api/admin/site-settings"],
  });

  const upiId = siteSettings.find(setting => setting.key === 'upi_id')?.value || 'ybl@ybl';

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      upiTransactionId: "",
    },
  });

  // Submit payment mutation
  const submitPaymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      const response = await apiRequest("POST", `/api/bookings/${booking.id}/payment`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Submitted!",
        description: "Your payment details have been submitted for verification. You'll receive confirmation within 24 hours.",
      });
      setPaymentStep('submitted');
      onPaymentSubmitted();
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit payment details. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "UPI ID copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const onSubmit = (data: PaymentFormData) => {
    submitPaymentMutation.mutate(data);
  };

  if (booking.paymentStatus === 'verified') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-900 mb-2">Payment Verified</h3>
            <p className="text-green-700">
              Your payment has been verified and your booking is confirmed!
            </p>
            {booking.upiTransactionId && (
              <div className="mt-4 p-3 bg-green-100 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Transaction ID:</strong> {booking.upiTransactionId}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (booking.paymentStatus === 'failed') {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">Payment Failed</h3>
            <p className="text-red-700 mb-4">
              There was an issue with your payment verification. Please contact support or try again.
            </p>
            {booking.paymentNotes && (
              <div className="p-3 bg-red-100 rounded-lg mb-4">
                <p className="text-sm text-red-800">
                  <strong>Note:</strong> {booking.paymentNotes}
                </p>
              </div>
            )}
            <Button 
              onClick={() => setPaymentStep('instructions')}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (paymentStep === 'submitted') {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <Clock className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Payment Under Review</h3>
            <p className="text-blue-700 mb-4">
              Your payment details have been submitted successfully. Our team will verify your payment within 24 hours.
            </p>
            <div className="p-4 bg-blue-100 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                <strong>What happens next?</strong>
              </p>
              <ul className="text-xs text-blue-700 space-y-1 text-left">
                <li>• Our team will verify your UTR number with the bank</li>
                <li>• You'll receive an email once payment is confirmed</li>
                <li>• Your booking will be automatically confirmed</li>
                <li>• Contact support if you have any questions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Instructions */}
      {paymentStep === 'instructions' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Payment Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Booking Summary */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-3">Booking Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Confirmation Code:</span>
                  <span className="font-mono font-semibold">{booking.confirmationCode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guest Name:</span>
                  <span>{booking.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-in Date:</span>
                  <span>{booking.checkinDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Number of Guests:</span>
                  <span>{booking.guestCount}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Amount:</span>
                  <span className="text-green-600">₹{booking.finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* UPI Payment Instructions */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                UPI Payment Steps
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                  <div>
                    <p className="font-medium">Copy UPI ID</p>
                    <p className="text-sm text-gray-600">Use the UPI ID below to make payment</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                  <div>
                    <p className="font-medium">Open UPI App</p>
                    <p className="text-sm text-gray-600">Use Google Pay, PhonePe, Paytm, or any UPI app</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                  <div>
                    <p className="font-medium">Send Payment</p>
                    <p className="text-sm text-gray-600">Send exactly ₹{booking.finalTotal.toLocaleString()} to the UPI ID</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">4</div>
                  <div>
                    <p className="font-medium">Note UTR Number</p>
                    <p className="text-sm text-gray-600">Save the 12-digit UTR/Transaction ID from your app</p>
                  </div>
                </div>
              </div>
            </div>

            {/* UPI ID Card */}
            <div className="p-4 border-2 border-primary rounded-lg bg-primary/5">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">UPI ID</Label>
              <div className="flex items-center gap-3">
                <div className="flex-1 p-3 bg-white border rounded-lg">
                  <span className="font-mono text-lg font-semibold">{upiId}</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyUpiId}
                  className="px-3"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Please send exactly ₹{booking.finalTotal.toLocaleString()} to avoid delays in verification. 
                Save the UTR number as you'll need it in the next step.
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <Button 
                onClick={() => setPaymentStep('utr')}
                className="w-full sm:w-auto"
                size="lg"
              >
                I Have Made the Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* UTR Submission Form */}
      {paymentStep === 'utr' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Submit Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="upiTransactionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UTR/Transaction ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter 12-digit UTR number (e.g., 123456789012)"
                          {...field}
                          className="font-mono"
                        />
                      </FormControl>
                      <FormMessage />
                      <div className="text-xs text-gray-500">
                        You can find this in your UPI app after making the payment. It's usually a 12-digit number.
                      </div>
                    </FormItem>
                  )}
                />

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800 mb-1">Verification Process</p>
                      <p className="text-yellow-700">
                        After submitting your UTR number, our team will verify the payment with the bank. 
                        This typically takes a few hours during business hours.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPaymentStep('instructions')}
                    className="flex-1"
                  >
                    Back to Instructions
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitPaymentMutation.isPending}
                    className="flex-1"
                  >
                    {submitPaymentMutation.isPending ? "Submitting..." : "Submit for Verification"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}