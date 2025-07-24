import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Shield, Mail, Download, Trash2, Eye, Edit } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/Footer";

export default function DataProcessing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
              <Shield className="h-8 w-8" />
              Data Processing & Your Rights
            </CardTitle>
            <p className="text-center text-gray-600">GDPR Compliance & Data Subject Rights</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Your Data Protection Rights</h2>
              <p className="text-gray-700 mb-4">
                Under the General Data Protection Regulation (GDPR) and other privacy laws, 
                you have several rights regarding your personal data. Below you can find 
                information about these rights and how to exercise them.
              </p>
            </div>

            <Separator />

            <div className="grid gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Right to Access</h3>
                </div>
                <p className="text-gray-700 text-sm mb-3">
                  You have the right to request a copy of all personal data we hold about you.
                </p>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Request Data Copy
                </Button>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Edit className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Right to Rectification</h3>
                </div>
                <p className="text-gray-700 text-sm mb-3">
                  You can request that we correct any inaccurate or incomplete personal data.
                </p>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Update My Data
                </Button>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Trash2 className="h-5 w-5 text-red-600" />
                  <h3 className="font-semibold">Right to Erasure ("Right to be Forgotten")</h3>
                </div>
                <p className="text-gray-700 text-sm mb-3">
                  You can request that we delete your personal data under certain circumstances.
                </p>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete My Data
                </Button>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold">Right to Restrict Processing</h3>
                </div>
                <p className="text-gray-700 text-sm mb-3">
                  You can request that we limit how we process your personal data in certain situations.
                </p>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Restrict Processing
                </Button>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Download className="h-5 w-5 text-indigo-600" />
                  <h3 className="font-semibold">Right to Data Portability</h3>
                </div>
                <p className="text-gray-700 text-sm mb-3">
                  You can request to receive your personal data in a structured, machine-readable format.
                </p>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export My Data
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">How We Process Your Data</h2>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Booking and Service Data</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li><strong>Legal Basis:</strong> Contract performance and legitimate interests</li>
                    <li><strong>Purpose:</strong> Process bookings, provide services, customer support</li>
                    <li><strong>Retention:</strong> 7 years for legal and accounting purposes</li>
                    <li><strong>Sharing:</strong> Payment processors, service providers (as needed)</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Marketing Communications</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li><strong>Legal Basis:</strong> Consent</li>
                    <li><strong>Purpose:</strong> Send promotional emails, newsletters, offers</li>
                    <li><strong>Retention:</strong> Until you withdraw consent</li>
                    <li><strong>Sharing:</strong> Email service providers only</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Website Analytics</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li><strong>Legal Basis:</strong> Legitimate interests and consent</li>
                    <li><strong>Purpose:</strong> Improve website performance and user experience</li>
                    <li><strong>Retention:</strong> 26 months maximum</li>
                    <li><strong>Sharing:</strong> Analytics providers (Google Analytics)</li>
                  </ul>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">Data Subject Request Process</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>How to Submit a Request:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Email us at: <strong>privacy@farmfeastfarmhouse.shop</strong></li>
                  <li>Include your full name and email address used for bookings</li>
                  <li>Specify which right you want to exercise</li>
                  <li>Provide any additional details about your request</li>
                </ul>

                <p className="mt-4"><strong>What Happens Next:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>We will acknowledge your request within 72 hours</li>
                  <li>We may ask for additional information to verify your identity</li>
                  <li>We will respond to your request within 30 days</li>
                  <li>If we need more time, we will inform you of the delay</li>
                </ul>

                <p className="mt-4"><strong>Verification Process:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>We may request ID verification for security purposes</li>
                  <li>For booking-related data, we may ask for booking confirmation details</li>
                  <li>This helps us protect your data from unauthorized access</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">Automated Decision Making</h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  We use limited automated processing for:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Fraud Prevention:</strong> Automated checks for suspicious booking patterns</li>
                  <li><strong>Spam Detection:</strong> Email and form submission filtering</li>
                  <li><strong>Pricing:</strong> Dynamic pricing based on demand and availability</li>
                </ul>

                <p className="mt-3">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Request human intervention in automated decisions</li>
                  <li>Express your point of view about automated decisions</li>
                  <li>Contest decisions that significantly affect you</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">International Data Transfers</h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  Your data is primarily processed in India. When we transfer data internationally, 
                  we ensure adequate protection through:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Adequacy decisions by relevant authorities</li>
                  <li>Standard Contractual Clauses (SCCs)</li>
                  <li>Binding Corporate Rules (BCRs)</li>
                  <li>Other legally approved transfer mechanisms</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">Contact Our Data Protection Officer</h2>
              <div className="bg-gray-50 border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Data Protection Officer</p>
                    <p className="text-sm text-gray-700 mb-2">
                      For all GDPR-related inquiries and data subject requests
                    </p>
                    <p><strong>Email:</strong> dpo@farmfeastfarmhouse.shop</p>
                    <p><strong>Phone:</strong> +91 8897326898</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">Filing a Complaint</h2>
              <p className="text-gray-700">
                If you believe we have not handled your personal data appropriately, you have 
                the right to lodge a complaint with your local data protection authority. 
                In India, this would be the relevant state or national privacy authority.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}