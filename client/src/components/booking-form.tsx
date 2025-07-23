import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Phone, Send, Info } from "lucide-react";
import type { Service, Coupon } from "@shared/schema";

const bookingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  contactNumber: z.string().min(10, "Valid contact number is required"),
  email: z.string().email().optional().or(z.literal("")),
  checkinDate: z.string().min(1, "Check-in date is required"),
  checkoutDate: z.string().min(1, "Check-out date is required"),
  guestCount: z.coerce.number().min(1, "At least 1 guest is required"),
  checkinTime: z.string().min(1, "Check-in time is required"),
  checkoutTime: z.string().optional(),
  selectedServices: z.array(z.string()).default([]),
  couponCode: z.string().optional(),
  specialRequests: z.string().optional(),
  basePrice: z.number(),
  servicesPrice: z.number().default(0),
  discountAmount: z.number().default(0),
  finalTotal: z.number(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [couponValidation, setCouponValidation] = useState<{
    valid: boolean;
    coupon?: Coupon;
    discountAmount: number;
    message: string;
  } | null>(null);

  // Get today's date for minimum date validation
  const today = new Date().toISOString().split('T')[0];

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fullName: "",
      contactNumber: "",
      email: "",
      checkinDate: "",
      checkoutDate: "",
      guestCount: 1,
      checkinTime: "",
      checkoutTime: "",
      selectedServices: [],
      couponCode: "",
      specialRequests: "",
      basePrice: 0,
      servicesPrice: 0,
      discountAmount: 0,
      finalTotal: 500, // Base maintenance fee
    },
  });

  const watchedFields = form.watch();

  // Fetch available services
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  // Calculate pricing in real-time
  const calculatePricing = () => {
    const basePrice = watchedFields.guestCount * 1150;
    const maintenanceFee = 500;
    
    const selectedServicePrices = watchedFields.selectedServices.map(serviceId => {
      const service = services.find(s => s.id.toString() === serviceId);
      return service ? service.price : 0;
    });
    
    const servicesPrice = selectedServicePrices.reduce((sum, price) => sum + price, 0);
    const subtotal = basePrice + maintenanceFee + servicesPrice;
    const finalTotal = Math.max(0, subtotal - watchedFields.discountAmount);
    
    return {
      basePrice,
      maintenanceFee,
      servicesPrice,
      subtotal,
      finalTotal,
    };
  };

  const pricing = calculatePricing();

  // Update form values when calculations change
  useState(() => {
    form.setValue('basePrice', pricing.basePrice);
    form.setValue('servicesPrice', pricing.servicesPrice);
    form.setValue('finalTotal', pricing.finalTotal);
  });

  // Validate coupon mutation
  const validateCouponMutation = useMutation({
    mutationFn: async (data: { code: string; amount: number }) => {
      const response = await apiRequest("POST", "/api/coupons/validate", data);
      return response.json();
    },
    onSuccess: (data) => {
      setCouponValidation(data);
      form.setValue('discountAmount', data.discountAmount);
      toast({
        title: "Coupon Applied!",
        description: data.message,
      });
    },
    onError: (error: any) => {
      setCouponValidation({
        valid: false,
        discountAmount: 0,
        message: error.message || "Invalid coupon code",
      });
      form.setValue('discountAmount', 0);
      toast({
        title: "Invalid Coupon",
        description: error.message || "Invalid coupon code",
        variant: "destructive",
      });
    },
  });

  // Submit booking mutation
  const submitBookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const response = await apiRequest("POST", "/api/bookings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Submitted!",
        description: "We'll contact you within 24 hours to confirm your booking.",
      });
      form.reset();
      setCouponValidation(null);
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to submit booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApplyCoupon = () => {
    const couponCode = form.getValues('couponCode');
    if (!couponCode?.trim()) {
      toast({
        title: "No Coupon Code",
        description: "Please enter a coupon code",
        variant: "destructive",
      });
      return;
    }

    validateCouponMutation.mutate({
      code: couponCode.trim(),
      amount: pricing.subtotal,
    });
  };

  const onSubmit = (data: BookingFormData) => {
    // Update final calculations before submitting
    const finalCalculations = calculatePricing();
    const submissionData = {
      ...data,
      basePrice: finalCalculations.basePrice,
      servicesPrice: finalCalculations.servicesPrice,
      finalTotal: finalCalculations.finalTotal,
    };
    
    submitBookingMutation.mutate(submissionData);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-12">
      {/* Booking Form */}
      <div className="lg:col-span-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 98765 43210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="checkinDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-in Date *</FormLabel>
                        <FormControl>
                          <Input type="date" min={today} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="checkoutDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-out Date *</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            min={watchedFields.checkinDate || today} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="guestCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Guests *</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select guests" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">1 Guest</SelectItem>
                            <SelectItem value="5">5 Guests</SelectItem>
                            <SelectItem value="10">10 Guests</SelectItem>
                            <SelectItem value="15">15 Guests</SelectItem>
                            <SelectItem value="20">20 Guests</SelectItem>
                            <SelectItem value="25">25+ Guests</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="checkinTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Check-in Time *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="10:00">10:00 AM</SelectItem>
                            <SelectItem value="11:00">11:00 AM</SelectItem>
                            <SelectItem value="12:00">12:00 PM</SelectItem>
                            <SelectItem value="13:00">1:00 PM</SelectItem>
                            <SelectItem value="14:00">2:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Additional Services */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Services (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="selectedServices"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-3">
                        {services.map((service) => (
                          <div key={service.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                checked={field.value?.includes(service.id.toString())}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, service.id.toString()]);
                                  } else {
                                    field.onChange(field.value.filter(id => id !== service.id.toString()));
                                  }
                                }}
                              />
                              <div>
                                <div className="font-medium">{service.name}</div>
                                <div className="text-sm text-muted-foreground">{service.description}</div>
                              </div>
                            </div>
                            <Badge variant="secondary">₹{service.price.toLocaleString()}</Badge>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Coupon Code */}
            <Card>
              <CardHeader>
                <CardTitle>Coupon Code (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <FormField
                    control={form.control}
                    name="couponCode"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Enter coupon code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={validateCouponMutation.isPending}
                  >
                    {validateCouponMutation.isPending ? "Applying..." : "Apply"}
                  </Button>
                </div>
                {couponValidation && (
                  <div className={`mt-2 text-sm ${couponValidation.valid ? 'text-green-600' : 'text-red-600'}`}>
                    {couponValidation.message}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Special Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Special Requests or Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="specialRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Any special requirements or notes for your stay..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={submitBookingMutation.isPending}
            >
              <Send className="w-5 h-5 mr-2" />
              {submitBookingMutation.isPending ? "Submitting..." : "Submit Booking Request"}
            </Button>
          </form>
        </Form>
      </div>

      {/* Booking Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Base Price:</span>
              <span>{pricing.basePrice > 0 ? `${watchedFields.guestCount} Guest${watchedFields.guestCount > 1 ? 's' : ''} × ₹1,150 = ₹${pricing.basePrice.toLocaleString()}` : '-'}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Maintenance Fee:</span>
              <span className="text-muted-foreground">₹500</span>
            </div>
            
            {pricing.servicesPrice > 0 && (
              <div className="space-y-2">
                {watchedFields.selectedServices.map(serviceId => {
                  const service = services.find(s => s.id.toString() === serviceId);
                  return service ? (
                    <div key={service.id} className="flex justify-between text-sm">
                      <span>{service.name}:</span>
                      <span>₹{service.price.toLocaleString()}</span>
                    </div>
                  ) : null;
                })}
              </div>
            )}
            
            {couponValidation?.valid && watchedFields.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Coupon Discount:</span>
                <span>-₹{watchedFields.discountAmount.toLocaleString()}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between text-xl font-bold">
              <span>Final Total:</span>
              <span className="text-primary">₹{pricing.finalTotal.toLocaleString()}</span>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                *Mandatory fee, negotiable for parties of 20+ guests
              </p>
            </div>
            
            {/* Contact Information */}
            <div className="space-y-3">
              <h4 className="font-semibold">Contact Information</h4>
              <div className="space-y-2">
                <a href="tel:8897326898" className="flex items-center text-primary hover:text-primary/80">
                  <Phone className="w-4 h-4 mr-2" />
                  8897326898
                </a>
                <a href="tel:9951214770" className="flex items-center text-primary hover:text-primary/80">
                  <Phone className="w-4 h-4 mr-2" />
                  9951214770
                </a>
              </div>
              <p className="text-sm text-muted-foreground">
                We'll contact you within 24 hours to confirm your booking and provide payment details.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
