import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Phone, Send, Info, Calendar, Users, CreditCard, Check, ChevronRight, Star } from "lucide-react";
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

// Helper function to get emoji for service name
const getServiceEmoji = (name: string) => {
  const emojiMap: { [key: string]: string } = {
    "Pet Essentials": "🐾",
    "Farm Tour": "🚜",
    "Breakfast": "☕",
    "Dinner": "🍽️",
    "BBQ Setup": "🔥",
    "Bonfire Evening": "🔥",
    "Box Cricket & Sand Volleyball": "🏐",
    "Bonfire Arrangement": "🔥",
    "Utensils": "🍽️",
    "Personal Chef": "👨‍🍳",
    "Party Decorations": "🎉",
  };
  return emojiMap[name] || "⭐";
};

export default function BookingForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [formProgress, setFormProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [couponValidation, setCouponValidation] = useState<{
    valid: boolean;
    coupon?: Coupon;
    discountAmount: number;
    message: string;
  } | null>(null);

  const steps = [
    { title: "Personal Info", icon: Users, fields: ["fullName", "contactNumber", "email"] },
    { title: "Booking Details", icon: Calendar, fields: ["checkinDate", "checkoutDate", "guestCount", "checkinTime", "checkoutTime"] },
    { title: "Services", icon: Star, fields: ["selectedServices"] },
    { title: "Payment", icon: CreditCard, fields: ["couponCode", "specialRequests"] }
  ];

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

  // Calculate pricing based on selections
  const calculatePricing = () => {
    const basePrice = watchedFields.guestCount * 1150;
    const servicesPrice = watchedFields.selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id.toString() === serviceId);
      return total + (service?.price || 0);
    }, 0);
    const subtotal = basePrice + servicesPrice + 500; // Include maintenance fee
    const discountAmount = couponValidation?.valid ? couponValidation.discountAmount : 0;
    const finalTotal = Math.max(0, subtotal - discountAmount);
    
    return { basePrice, servicesPrice, subtotal, discountAmount, finalTotal };
  };

  const pricing = calculatePricing();

  // Validate coupon mutation
  const validateCouponMutation = useMutation({
    mutationFn: async ({ code, amount }: { code: string; amount: number }) => {
      const response = await apiRequest("POST", "/api/coupons/validate", { code, amount });
      return response.json();
    },
    onSuccess: (data) => {
      setCouponValidation({
        valid: true,
        coupon: data.coupon,
        discountAmount: data.discountAmount,
        message: `Coupon applied! You saved ₹${data.discountAmount.toLocaleString()}`,
      });
      form.setValue('discountAmount', data.discountAmount);
      toast({
        title: "Coupon Applied!",
        description: `You saved ₹${data.discountAmount.toLocaleString()}`,
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
    onSuccess: (booking) => {
      toast({
        title: "Booking Submitted Successfully!",
        description: `Your confirmation code is: ${booking.confirmationCode}`,
      });
      
      // Reset form and navigate to booking confirmation page
      form.reset();
      setCouponValidation(null);
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      
      // Redirect to booking confirmation page with the booking data
      setLocation(`/booking-confirmation?booking=${booking.confirmationCode}`);
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to submit booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const validateCoupon = () => {
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

  // Update progress based on filled fields
  useEffect(() => {
    const allFields = ["fullName", "contactNumber", "checkinDate", "checkoutDate", "guestCount", "checkinTime"];
    const filledFields = allFields.filter(field => {
      const value = form.getValues(field as keyof BookingFormData);
      return value && value.toString().trim() !== "";
    });
    const progress = (filledFields.length / allFields.length) * 100;
    setFormProgress(progress);
  }, [watchedFields, form]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const validateCurrentStep = () => {
    const currentStepFields = steps[currentStep].fields;
    return currentStepFields.every(field => {
      const value = form.getValues(field as keyof BookingFormData);
      if (field === "email") return true; // Email is optional
      if (field === "checkoutTime") return true; // Checkout time is optional
      if (field === "selectedServices") return true; // Services are optional
      if (field === "couponCode") return true; // Coupon is optional
      if (field === "specialRequests") return true; // Special requests are optional
      return value && value.toString().trim() !== "";
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Mobile Progress Header */}
        <div className="lg:col-span-2">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Book Your Stay</h2>
              <span className="text-sm text-gray-500">{currentStep + 1} of {steps.length}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
            
            {/* Step Indicators - Hidden on mobile */}
            <div className="hidden md:flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                
                return (
                  <div key={index} className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                    <div 
                      className={`
                        flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                        ${isCompleted ? 'bg-primary border-primary text-white' : 
                          isCurrent ? 'border-primary text-primary bg-primary/10' : 
                          'border-muted-foreground text-muted-foreground'}
                      `}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                    </div>
                    <span className={`ml-2 text-sm font-medium ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-primary' : 'bg-border'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className={`transition-all duration-300 ${isAnimating ? 'opacity-70 transform scale-95' : 'opacity-100 transform scale-100'}`}>
                
                {/* Step 1: Personal Information */}
                {currentStep === 0 && (
                  <Card className="mobile-card booking-step">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem className="mobile-input">
                              <FormLabel>Full Name *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your full name" 
                                  className="mobile-input text-base"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="contactNumber"
                          render={({ field }) => (
                            <FormItem className="mobile-input">
                              <FormLabel>Contact Number *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="+91 98765 43210" 
                                  className="mobile-input text-base"
                                  type="tel"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem className="mobile-input">
                              <FormLabel>Email Address (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="your.email@example.com" 
                                  className="mobile-input text-base"
                                  type="email"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 2: Booking Details */}
                {currentStep === 1 && (
                  <Card className="mobile-card booking-step">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Booking Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="checkinDate"
                            render={({ field }) => (
                              <FormItem className="mobile-input">
                                <FormLabel>Check-in Date *</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="date" 
                                    min={today} 
                                    className="mobile-input text-base"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="checkoutDate"
                            render={({ field }) => (
                              <FormItem className="mobile-input">
                                <FormLabel>Check-out Date *</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="date" 
                                    min={watchedFields.checkinDate || today}
                                    className="mobile-input text-base"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="guestCount"
                            render={({ field }) => (
                              <FormItem className="mobile-input">
                                <FormLabel>Number of Guests *</FormLabel>
                                <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                  <FormControl>
                                    <SelectTrigger className="mobile-input text-base">
                                      <SelectValue placeholder="Select guests" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(num => (
                                      <SelectItem key={num} value={num.toString()}>
                                        {num} {num === 1 ? 'Guest' : 'Guests'}
                                      </SelectItem>
                                    ))}
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
                              <FormItem className="mobile-input">
                                <FormLabel>Check-in Time *</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="mobile-input text-base">
                                      <SelectValue placeholder="Select time" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="10:00">10:00 AM</SelectItem>
                                    <SelectItem value="11:00">11:00 AM</SelectItem>
                                    <SelectItem value="12:00">12:00 PM</SelectItem>
                                    <SelectItem value="13:00">01:00 PM</SelectItem>
                                    <SelectItem value="14:00">02:00 PM</SelectItem>
                                    <SelectItem value="15:00">03:00 PM</SelectItem>
                                    <SelectItem value="16:00">04:00 PM</SelectItem>
                                    <SelectItem value="17:00">05:00 PM</SelectItem>
                                    <SelectItem value="18:00">06:00 PM</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="checkoutTime"
                          render={({ field }) => (
                            <FormItem className="mobile-input">
                              <FormLabel>Check-out Time (Optional)</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="mobile-input text-base">
                                    <SelectValue placeholder="Select checkout time" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="09:00">09:00 AM</SelectItem>
                                  <SelectItem value="10:00">10:00 AM</SelectItem>
                                  <SelectItem value="11:00">11:00 AM</SelectItem>
                                  <SelectItem value="12:00">12:00 PM</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 3: Services */}
                {currentStep === 2 && (
                  <Card className="mobile-card booking-step">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-primary" />
                        Additional Services
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="selectedServices"
                        render={({ field }) => (
                          <FormItem>
                            <div className="grid gap-3">
                              {services.map((service) => (
                                <div 
                                  key={service.id} 
                                  className={`
                                    service-item flex items-center justify-between p-4 rounded-lg border cursor-pointer
                                    ${field.value?.includes(service.id.toString()) ? 
                                      'border-primary bg-primary/5 selected' : 
                                      'border-gray-200 bg-white hover:border-gray-300'
                                    }
                                  `}
                                  onClick={() => {
                                    const isSelected = field.value?.includes(service.id.toString());
                                    if (isSelected) {
                                      field.onChange(field.value.filter(id => id !== service.id.toString()));
                                    } else {
                                      field.onChange([...field.value, service.id.toString()]);
                                    }
                                  }}
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="text-2xl">{getServiceEmoji(service.name)}</div>
                                    <div>
                                      <h4 className="font-medium text-gray-900">{service.name}</h4>
                                      <p className="text-sm text-gray-500">{service.description}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-semibold text-lg">₹{service.price.toLocaleString()}</span>
                                    <div className={`w-5 h-5 rounded-full border-2 mt-1 ml-auto transition-all duration-200 ${
                                      field.value?.includes(service.id.toString()) ? 
                                      'bg-primary border-primary' : 'border-gray-300'
                                    }`}>
                                      {field.value?.includes(service.id.toString()) && (
                                        <Check className="w-3 h-3 text-white m-0.5" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Step 4: Payment */}
                {currentStep === 3 && (
                  <Card className="mobile-card booking-step">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        Payment Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="couponCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Coupon Code (Optional)</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input 
                                  placeholder="Enter coupon code" 
                                  className="mobile-input text-base"
                                  {...field} 
                                />
                              </FormControl>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={validateCoupon}
                                disabled={validateCouponMutation.isPending}
                                className="mobile-button accessible-button"
                                aria-label={validateCouponMutation.isPending ? "Checking coupon code validity" : "Apply coupon code for discount"}
                              >
                                {validateCouponMutation.isPending ? "Checking..." : "Apply"}
                              </Button>
                            </div>
                            <FormMessage />
                            {couponValidation && (
                              <div className={`coupon-feedback p-3 rounded-lg ${
                                couponValidation.valid ? 'bg-green-50 text-green-700 coupon-success' : 'bg-red-50 text-red-700 coupon-error'
                              }`}>
                                <p className="text-sm">{couponValidation.message}</p>
                              </div>
                            )}
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="specialRequests"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Special Requests (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any special requirements or requests..."
                                className="mobile-input text-base min-h-20"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0 || submitBookingMutation.isPending}
                    className="mobile-button"
                    aria-label="Go to previous step in booking form"
                  >
                    Previous
                  </Button>
                  
                  {currentStep < steps.length - 1 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!validateCurrentStep() || isAnimating}
                      className="mobile-button flex items-center gap-2"
                      aria-label="Continue to next step in booking form"
                    >
                      Next Step
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={submitBookingMutation.isPending || !validateCurrentStep()}
                      className="mobile-button flex items-center gap-2"
                      aria-label="Submit your booking request to Farm Feast Farm House"
                    >
                      <Send className="w-4 h-4" />
                      {submitBookingMutation.isPending ? "Submitting..." : "Submit Booking"}
                    </Button>
                  )}
                </div>
              </div>
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
                  <a 
                    href="tel:8897326898" 
                    className="flex items-center text-primary hover:text-primary/80 accessible-link"
                    aria-label="Call Farm Feast Farm House at 8897326898"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    8897326898
                  </a>
                  <a 
                    href="tel:9951214770" 
                    className="flex items-center text-primary hover:text-primary/80 accessible-link"
                    aria-label="Call Farm Feast Farm House at 9951214770"
                  >
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
    </div>
  );
}