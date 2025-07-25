import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useCookiePreferences } from "@/components/CookieConsent";
import { Shield, BarChart3, Heart, Settings, Cookie } from "lucide-react";
import FastNavbar from "@/components/FastNavbar";
import Footer from "@/components/Footer";

export default function CookiePolicy() {
  const cookiePreferences = useCookiePreferences();

  const manageCookies = () => {
    // Trigger cookie preference dialog
    localStorage.removeItem("cookieConsent");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <FastNavbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
              <Cookie className="h-8 w-8" />
              Cookie Policy
            </CardTitle>
            <p className="text-center text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">What Are Cookies?</h2>
              <p className="text-gray-700">
                Cookies are small text files stored on your device when you visit our website. 
                They help us provide you with a better browsing experience by remembering your 
                preferences and analyzing how you use our site. Cookies do not contain any 
                personally identifiable information unless you have specifically provided it.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">Types of Cookies We Use</h2>
              
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold">Essential Cookies</h3>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Required</span>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">
                    These cookies are necessary for the website to function properly. They enable 
                    core functionality such as security, network management, and accessibility.
                  </p>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    <li>Session management and user authentication</li>
                    <li>Shopping cart and booking form functionality</li>
                    <li>Security and fraud prevention</li>
                    <li>Load balancing and website performance</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Analytics Cookies</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      cookiePreferences.analytics 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {cookiePreferences.analytics ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">
                    These cookies help us understand how visitors interact with our website 
                    by collecting anonymous information about page views, time spent, and user behavior.
                  </p>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    <li>Google Analytics for website traffic analysis</li>
                    <li>Page performance and load time monitoring</li>
                    <li>User journey and conversion tracking</li>
                    <li>Popular content and feature usage statistics</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-5 w-5 text-pink-600" />
                    <h3 className="font-semibold">Marketing Cookies</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      cookiePreferences.marketing 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {cookiePreferences.marketing ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">
                    These cookies are used to track visitors across websites and display 
                    relevant advertisements and marketing campaigns.
                  </p>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    <li>Social media integration and sharing</li>
                    <li>Personalized advertising and retargeting</li>
                    <li>Email marketing campaign tracking</li>
                    <li>Third-party advertising networks</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold">Preference Cookies</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      cookiePreferences.preferences 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {cookiePreferences.preferences ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mb-2">
                    These cookies remember your preferences and settings to provide a 
                    personalized experience across visits.
                  </p>
                  <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                    <li>Language and region preferences</li>
                    <li>Theme and display settings</li>
                    <li>Font size and accessibility options</li>
                    <li>Recently viewed content and favorites</li>
                  </ul>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">Third-Party Cookies</h2>
              <div className="space-y-3 text-gray-700">
                <p>We may use third-party services that set their own cookies:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Google Analytics:</strong> Website traffic and user behavior analysis</li>
                  <li><strong>Social Media Platforms:</strong> Facebook, Instagram, WhatsApp integration</li>
                  <li><strong>Payment Processors:</strong> UPI payment gateway services</li>
                  <li><strong>Email Services:</strong> Newsletter and marketing communications</li>
                  <li><strong>Content Delivery Networks:</strong> Faster content delivery</li>
                </ul>
                <p className="mt-3">
                  These third parties have their own privacy policies and cookie practices. 
                  We recommend reviewing their policies to understand how they handle your data.
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">Managing Your Cookie Preferences</h2>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Cookie Consent Manager</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    You can change your cookie preferences at any time using our cookie consent manager.
                  </p>
                  <Button onClick={manageCookies} className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Manage Cookie Preferences
                  </Button>
                </div>

                <div className="space-y-3 text-gray-700">
                  <p><strong>Browser Settings:</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Chrome:</strong> Settings &gt; Privacy and Security &gt; Cookies and other site data</li>
                    <li><strong>Firefox:</strong> Options &gt; Privacy &amp; Security &gt; Cookies and Site Data</li>
                    <li><strong>Safari:</strong> Preferences &gt; Privacy &gt; Manage Website Data</li>
                    <li><strong>Edge:</strong> Settings &gt; Site permissions &gt; Cookies and site data</li>
                  </ul>
                  
                  <p className="mt-3">
                    <strong>Note:</strong> Disabling certain cookies may affect website functionality 
                    and your user experience.
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">Cookie Retention</h2>
              <div className="space-y-3 text-gray-700">
                <p>Different types of cookies are stored for different periods:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                  <li><strong>Essential Cookies:</strong> Stored for the duration of your session</li>
                  <li><strong>Analytics Cookies:</strong> Typically stored for 24-26 months</li>
                  <li><strong>Marketing Cookies:</strong> Usually stored for 30-90 days</li>
                  <li><strong>Preference Cookies:</strong> Stored for 1-2 years or until changed</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">Your Rights</h2>
              <div className="space-y-3 text-gray-700">
                <p>Under GDPR and other privacy regulations, you have the right to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Know what cookies are being used and for what purpose</li>
                  <li>Give or withdraw consent for non-essential cookies</li>
                  <li>Access and delete personal data collected through cookies</li>
                  <li>Object to the processing of your personal data</li>
                  <li>Data portability for your personal information</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">Updates to This Policy</h2>
              <p className="text-gray-700">
                We may update this Cookie Policy from time to time to reflect changes in our 
                practices or for other operational, legal, or regulatory reasons. We will 
                notify you of any material changes by posting the updated policy on our website.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
              <div className="space-y-2 text-gray-700">
                <p>If you have any questions about our use of cookies, please contact us:</p>
                <ul className="list-none space-y-1">
                  <li><strong>Email:</strong> privacy@farmfeastfarmhouse.shop</li>
                  <li><strong>Phone:</strong> +91 8897326898</li>
                  <li><strong>Data Protection Officer:</strong> dpo@farmfeastfarmhouse.shop</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}