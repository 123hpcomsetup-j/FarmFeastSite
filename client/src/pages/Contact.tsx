import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import FastNavbar from "@/components/FastNavbar";
import Footer from "@/components/Footer";

// Contact form schema
const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  consent: z.boolean().refine(val => val === true, "You must agree to the privacy policy"),
});

type ContactForm = z.infer<typeof contactFormSchema>;

export default function Contact() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fetch site settings for dynamic contact information
  const { data: siteSettings } = useQuery({
    queryKey: ["/api/settings"]
  });

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      consent: false,
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ContactForm) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      form.reset();
      toast({
        title: "Message Sent Successfully!",
        description: "Thank you for contacting us. We'll get back to you soon.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactForm) => {
    submitMutation.mutate(data);
  };

  // Extract dynamic contact information from site settings
  const getSettingValue = (key: string) => {
    if (!siteSettings || !Array.isArray(siteSettings)) return "";
    const setting = siteSettings.find((s: any) => s.key === key);
    return setting?.value || "";
  };

  const contactInfo = {
    address: getSettingValue("contact_address") || "SY. No 170/A, Bhamragarh, Nagpur, Maharashtra 441801",
    phone: getSettingValue("contact_phone") || "+91 9876543210",
    email: getSettingValue("contact_email") || "info@farmfeastfarmhouse.com",
    whatsapp: getSettingValue("whatsapp_number") || "+91 9876543210",
    mapEmbedUrl: getSettingValue("google_maps_embed_url") || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.2!2d79.0882!3d21.1458!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjHCsDA4JzQ0LjkiTiA3OcKwMDUnMTcuNSJF!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin",
    mapPlaceUrl: getSettingValue("google_maps_place_url") || "https://www.google.com/maps/place/Farm+Feast+FarmHouse",
    mapDirectionsUrl: getSettingValue("google_maps_directions_url") || "https://www.google.com/maps/dir//Farm+Feast+FarmHouse"
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <FastNavbar />
        <div className="bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="shadow-xl">
            <CardContent className="p-12">
              <div className="flex justify-center mb-6">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
              <p className="text-lg text-gray-600 mb-6">
                Your message has been sent successfully. We appreciate you reaching out to us.
              </p>
              <p className="text-gray-500 mb-8">
                Our team will review your message and get back to you within 24 hours.
              </p>
              <Button
                onClick={() => setIsSubmitted(false)}
                className="bg-green-600 hover:bg-green-700"
              >
                Send Another Message
              </Button>
            </CardContent>
          </Card>
        </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <FastNavbar />
      <div className="bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get In Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions about our farmhouse? Planning your stay? We'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Address</h3>
                    <p className="text-gray-600">
                      <a 
                        href={contactInfo.mapPlaceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-green-600 transition-colors cursor-pointer"
                      >
                        {contactInfo.address}
                      </a>
                    </p>
                    <div className="mt-2 space-x-4">
                      <a 
                        href={contactInfo.mapDirectionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-green-600 hover:text-green-700 transition-colors"
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        Get Directions
                      </a>
                      <a 
                        href={contactInfo.mapPlaceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-green-600 hover:text-green-700 transition-colors"
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        View on Map
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Phone className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Phone & WhatsApp</h3>
                    <p className="text-gray-600">
                      <a href={`tel:${contactInfo.phone}`} className="hover:text-green-600 transition-colors">
                        {contactInfo.phone}
                      </a>
                    </p>
                    <p className="text-gray-600">
                      <a 
                        href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`} 
                        className="hover:text-green-600 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        WhatsApp: {contactInfo.whatsapp}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">
                      <a href={`mailto:${contactInfo.email}`} className="hover:text-green-600 transition-colors">
                        {contactInfo.email}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Clock className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Response Time</h3>
                    <p className="text-gray-600">We typically respond within 2-4 hours during business hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Section */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 flex items-center justify-between">
                  Find Us
                  <a 
                    href={contactInfo.mapPlaceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:text-green-700 transition-colors"
                  >
                    Open in Google Maps
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg overflow-hidden relative group">
                  {contactInfo.mapEmbedUrl ? (
                    <iframe
                      src={contactInfo.mapEmbedUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Farm Feast Farm House Location"
                      className="rounded-lg"
                    ></iframe>
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">Map not available</p>
                        <Button asChild>
                          <a 
                            href={contactInfo.mapPlaceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View on Google Maps
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Overlay for better interaction */}
                  <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors rounded-lg pointer-events-none"></div>
                </div>
                
                {/* Action buttons */}
                <div className="mt-4 flex gap-4">
                  <Button variant="outline" asChild className="flex-1">
                    <a 
                      href={contactInfo.mapDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Get Directions
                    </a>
                  </Button>
                  <Button asChild className="flex-1">
                    <a 
                      href={contactInfo.mapPlaceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      View on Maps
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
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
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your.email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="+91 98765 43210" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject *</FormLabel>
                            <FormControl>
                              <Input placeholder="What's this about?" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us more about your inquiry, booking dates, or any special requirements..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="consent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="hidden"
                              id="consent-checkbox"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <label
                              htmlFor="consent-checkbox"
                              className="flex items-center space-x-3 cursor-pointer"
                            >
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                                  field.value
                                    ? "bg-green-600 border-green-600 text-white"
                                    : "border-gray-300 hover:border-green-400"
                                }`}
                              >
                                {field.value && (
                                  <CheckCircle className="h-3 w-3 text-white" />
                                )}
                              </div>
                              <span className="text-sm text-gray-700">
                                I agree to the{" "}
                                <a href="/privacy-policy" className="text-green-600 hover:underline">
                                  Privacy Policy
                                </a>{" "}
                                and consent to being contacted regarding my inquiry. *
                              </span>
                            </label>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={submitMutation.isPending}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold transition-all duration-200 transform hover:scale-105"
                    >
                      {submitMutation.isPending ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Sending...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Send className="h-5 w-5" />
                          <span>Send Message</span>
                        </div>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}