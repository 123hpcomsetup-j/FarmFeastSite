import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Privacy Policy</CardTitle>
            <p className="text-center text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>Personal Information:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Name, email address, phone number</li>
                  <li>Booking preferences and special requests</li>
                  <li>Payment information (processed securely through UPI)</li>
                  <li>Communication records and customer service interactions</li>
                </ul>
                
                <p><strong>Automatically Collected Information:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>IP address, browser type, device information</li>
                  <li>Website usage data and analytics</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Location data (with your consent)</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Process and manage your bookings and reservations</li>
                <li>Communicate with you about your stay and services</li>
                <li>Send booking confirmations and important updates</li>
                <li>Improve our website and customer experience</li>
                <li>Comply with legal obligations and resolve disputes</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Analyze website usage and optimize our services</li>
              </ul>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">3. Legal Basis for Processing (GDPR)</h2>
              <div className="space-y-3 text-gray-700">
                <p>We process your personal data based on:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Contract Performance:</strong> To fulfill our booking and service agreements</li>
                  <li><strong>Legitimate Interest:</strong> For customer service, fraud prevention, and business operations</li>
                  <li><strong>Consent:</strong> For marketing communications and optional services</li>
                  <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">4. Your Rights Under GDPR</h2>
              <div className="space-y-3 text-gray-700">
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                  <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                  <li><strong>Restriction:</strong> Limit how we process your data</li>
                  <li><strong>Portability:</strong> Receive your data in a structured format</li>
                  <li><strong>Object:</strong> Object to processing based on legitimate interests</li>
                  <li><strong>Withdraw Consent:</strong> Withdraw consent for marketing or optional processing</li>
                </ul>
                <p className="mt-3">
                  To exercise these rights, contact us at: <strong>privacy@farmfeastfarmhouse.shop</strong>
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">5. Data Sharing and Disclosure</h2>
              <div className="space-y-3 text-gray-700">
                <p>We may share your information with:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Service Providers:</strong> Payment processors, email services, analytics providers</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
                  <li><strong>With Your Consent:</strong> Any other sharing you explicitly approve</li>
                </ul>
                <p className="mt-3">
                  We do not sell or rent your personal information to third parties for marketing purposes.
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">6. Data Security and Retention</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>Security Measures:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Industry-standard encryption for data transmission</li>
                  <li>Secure servers and regular security updates</li>
                  <li>Access controls and employee training</li>
                  <li>Regular security audits and monitoring</li>
                </ul>
                
                <p className="mt-3"><strong>Data Retention:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Booking data: 7 years for legal and tax purposes</li>
                  <li>Marketing data: Until you withdraw consent</li>
                  <li>Website analytics: 26 months maximum</li>
                  <li>Customer service records: 3 years</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">7. Cookies and Tracking</h2>
              <div className="space-y-3 text-gray-700">
                <p>We use cookies and similar technologies for:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Essential Cookies:</strong> Required for website functionality</li>
                  <li><strong>Analytics Cookies:</strong> To understand website usage</li>
                  <li><strong>Marketing Cookies:</strong> For personalized advertising (with consent)</li>
                  <li><strong>Preference Cookies:</strong> To remember your settings</li>
                </ul>
                <p className="mt-3">
                  You can manage cookie preferences through our cookie consent banner or browser settings.
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">8. International Data Transfers</h2>
              <p className="text-gray-700">
                Your data is primarily processed within India. If we transfer data internationally, 
                we ensure adequate protection through appropriate safeguards such as Standard 
                Contractual Clauses or adequacy decisions.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">9. Children's Privacy</h2>
              <p className="text-gray-700">
                Our services are not directed to children under 16. We do not knowingly collect 
                personal information from children under 16. If you believe we have collected 
                such information, please contact us immediately.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">10. Contact Information</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>Data Controller:</strong> Farm Feast Farm House</p>
                <p><strong>Email:</strong> privacy@farmfeastfarmhouse.shop</p>
                <p><strong>Phone:</strong> +91 8897326898</p>
                <p><strong>Address:</strong> [Your Physical Address]</p>
                
                <p className="mt-4">
                  <strong>Data Protection Officer:</strong> For GDPR-related inquiries, contact our 
                  DPO at dpo@farmfeastfarmhouse.shop
                </p>
                
                <p className="mt-4">
                  <strong>Supervisory Authority:</strong> You have the right to lodge a complaint 
                  with your local data protection authority if you believe we have not handled 
                  your data appropriately.
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">11. Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy periodically. We will notify you of significant 
                changes by email or through a prominent notice on our website. Your continued use 
                of our services after such modifications constitutes acceptance of the updated policy.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}