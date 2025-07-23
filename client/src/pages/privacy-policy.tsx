import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Shield, FileText } from "lucide-react";

export default function PrivacyPolicy() {
  // Fetch site settings for contact information
  const { data: siteSettings } = useQuery({
    queryKey: ["/api/site-settings"],
  });

  const settings = siteSettings?.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {}) || {};

  const contactEmail = settings.contact_email || settings.booking_email || "info@farmfeastfarmhouse.com";
  const contactPhone = settings.contact_phone || settings.whatsapp_number || "+91 8897326898";
  const contactAddress = settings.contact_address || "SY. No 170/A, Near Cheeryal Kaman, Keesara, Rangareddy - 501301";
  const siteName = settings.site_name || "Farm Feast Farmhouse";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-lg text-gray-600">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-gray-600">{contactEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-sm text-gray-600">{contactPhone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-red-600" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-gray-600">{contactAddress}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Policy Content */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold mb-2">Personal Information</h3>
                  <p>When you make a booking with {siteName}, we collect:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Full name and contact details (phone number, email address)</li>
                    <li>Booking preferences (dates, number of guests, special requirements)</li>
                    <li>Payment information (UPI transaction details, UTR numbers)</li>
                    <li>Communication history with our support team</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Technical Information</h3>
                  <p>We automatically collect certain technical information:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Device information (browser type, operating system)</li>
                    <li>Usage data (pages visited, time spent on site)</li>
                    <li>IP address and location data (for security and analytics)</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <div className="space-y-4 text-gray-700">
                <p>We use your information for the following purposes:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Booking Management:</strong> To process and manage your farmhouse reservations</li>
                  <li><strong>Payment Processing:</strong> To verify payments and issue confirmation receipts</li>
                  <li><strong>Customer Support:</strong> To respond to your inquiries and provide assistance</li>
                  <li><strong>Communication:</strong> To send booking confirmations, reminders, and important updates</li>
                  <li><strong>Service Improvement:</strong> To analyze usage patterns and enhance our services</li>
                  <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">3. Information Sharing and Disclosure</h2>
              <div className="space-y-4 text-gray-700">
                <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in these circumstances:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Service Providers:</strong> With trusted partners who help us operate our business (payment processors, email services)</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                  <li><strong>Business Transfers:</strong> In connection with any merger, acquisition, or sale of assets</li>
                  <li><strong>With Your Consent:</strong> When you explicitly agree to share information with third parties</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
              <div className="space-y-4 text-gray-700">
                <p>We implement appropriate security measures to protect your personal information:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Secure data transmission using encryption protocols (HTTPS)</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls limiting who can view your information</li>
                  <li>Secure payment processing through trusted payment gateways</li>
                  <li>Regular backups and disaster recovery procedures</li>
                </ul>
                <p className="mt-4">
                  However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">5. Your Rights and Choices</h2>
              <div className="space-y-4 text-gray-700">
                <p>You have the following rights regarding your personal information:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                  <li><strong>Portability:</strong> Request a copy of your data in a structured, machine-readable format</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, please contact us using the information provided above.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
              <div className="space-y-4 text-gray-700">
                <p>We use cookies and similar technologies to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze website traffic and user behavior</li>
                  <li>Provide personalized content and recommendations</li>
                  <li>Ensure website security and prevent fraud</li>
                </ul>
                <p className="mt-4">
                  You can control cookies through your browser settings. However, disabling cookies may affect the functionality of our website.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
              <div className="space-y-4 text-gray-700">
                <p>We retain your personal information for as long as necessary to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Provide our services and fulfill bookings</li>
                  <li>Comply with legal and regulatory requirements</li>
                  <li>Resolve disputes and enforce our agreements</li>
                  <li>Improve our services and customer experience</li>
                </ul>
                <p className="mt-4">
                  Typically, we retain booking and payment information for 7 years for tax and legal compliance purposes.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. 
                  We will notify you of any significant changes by:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Posting the updated policy on our website</li>
                  <li>Sending email notifications for material changes</li>
                  <li>Updating the "Last updated" date at the top of this policy</li>
                </ul>
                <p className="mt-4">
                  Your continued use of our services after any changes indicates your acceptance of the updated policy.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
                  please contact us:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={`mailto:${contactEmail}`}>
                        <Mail className="h-4 w-4 mr-2" />
                        {contactEmail}
                      </a>
                    </Button>
                  </div>
                  <div>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={`tel:${contactPhone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        {contactPhone}
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm">
                    <strong>Mailing Address:</strong><br />
                    {contactAddress}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 py-6 border-t">
          <p className="text-gray-500">
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}