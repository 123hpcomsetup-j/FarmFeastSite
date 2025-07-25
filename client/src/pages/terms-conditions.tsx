import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import FastNavbar from "@/components/FastNavbar";
import Footer from "@/components/Footer";

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-background">
      <FastNavbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Terms & Conditions</CardTitle>
            <p className="text-center text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using the Farm Feast Farm House website and services, you accept 
                and agree to be bound by the terms and provision of this agreement. If you do not 
                agree to abide by the above, please do not use this service.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">2. Booking and Reservations</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>Booking Process:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>All bookings are subject to availability and confirmation</li>
                  <li>A valid booking requires completed payment and confirmation code</li>
                  <li>Check-in time: 2:00 PM | Check-out time: 12:00 PM</li>
                  <li>Early check-in or late check-out may incur additional charges</li>
                </ul>
                
                <p><strong>Booking Modifications:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Modifications subject to availability and may incur charges</li>
                  <li>Contact us at least 24 hours before arrival for changes</li>
                  <li>Date changes may result in different pricing</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">3. Payment Terms</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>Payment Methods:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>UPI payments are our primary payment method</li>
                  <li>All payments must be made in Indian Rupees (INR)</li>
                  <li>Payment confirmation required for booking validation</li>
                </ul>
                
                <p><strong>Payment Security:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>We use secure payment processing systems</li>
                  <li>UTR (Unique Transaction Reference) numbers required for verification</li>
                  <li>All transactions are encrypted and secure</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">4. Cancellation and Refund Policy</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>Cancellation Timeline:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>More than 7 days:</strong> Full refund minus processing fee (5%)</li>
                  <li><strong>3-7 days:</strong> 50% refund</li>
                  <li><strong>Less than 3 days:</strong> 25% refund</li>
                  <li><strong>Same day/No show:</strong> No refund</li>
                </ul>
                
                <p><strong>Force Majeure:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Full refund for cancellations due to natural disasters</li>
                  <li>Government restrictions or emergencies</li>
                  <li>Property unavailability due to unforeseen circumstances</li>
                </ul>
                
                <p><strong>Refund Processing:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Refunds processed within 7-10 business days</li>
                  <li>Refunds made to the original payment method</li>
                  <li>Processing fees may apply as per payment gateway policies</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">5. Guest Responsibilities</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>Property Care:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Treat the property and amenities with respect</li>
                  <li>Report any damages or issues immediately</li>
                  <li>Additional charges apply for damages beyond normal wear</li>
                  <li>Smoking is prohibited in designated non-smoking areas</li>
                </ul>
                
                <p><strong>Guest Conduct:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Respect other guests and neighboring properties</li>
                  <li>Comply with local laws and regulations</li>
                  <li>Maximum occupancy limits must be respected</li>
                  <li>Pets allowed only with prior approval and additional fees</li>
                </ul>
                
                <p><strong>Safety and Security:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Guests responsible for personal belongings and security</li>
                  <li>Follow all safety guidelines and emergency procedures</li>
                  <li>Report any security concerns immediately</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">6. Liability and Insurance</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>Limitation of Liability:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>We are not liable for personal injury or property damage</li>
                  <li>Guests advised to obtain travel and personal insurance</li>
                  <li>Liability limited to the amount paid for accommodation</li>
                  <li>Force majeure events exclude liability</li>
                </ul>
                
                <p><strong>Guest Insurance:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Travel insurance recommended for all bookings</li>
                  <li>Coverage for trip cancellation, medical emergencies</li>
                  <li>Personal belongings insurance advised</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">7. Privacy and Data Protection</h2>
              <div className="space-y-3 text-gray-700">
                <p>Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these terms by reference.</p>
                
                <p><strong>Data Collection:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Personal information collected for booking and service purposes</li>
                  <li>Information used to improve our services and communication</li>
                  <li>Data shared only as outlined in our Privacy Policy</li>
                  <li>You may request access, correction, or deletion of your data</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">8. Intellectual Property</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>Content Ownership:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>All website content, images, and materials are our property</li>
                  <li>Unauthorized use, reproduction, or distribution prohibited</li>
                  <li>Guests may take personal photos for non-commercial use</li>
                  <li>Commercial photography requires written permission</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">9. Force Majeure</h2>
              <p className="text-gray-700">
                We shall not be liable for any failure or delay in performance under this 
                agreement which is due to earthquake, fire, flood, or other acts of God, 
                acts of civil or military authorities, acts of terrorism, wars, strikes, 
                or other labor disputes, or any other cause which is beyond our reasonable control.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">10. Dispute Resolution</h2>
              <div className="space-y-3 text-gray-700">
                <p><strong>Governing Law:</strong></p>
                <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in [Your City/State].</p>
                
                <p><strong>Resolution Process:</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Initial attempts at amicable resolution</li>
                  <li>Mediation before legal proceedings</li>
                  <li>Arbitration as per Indian Arbitration and Conciliation Act</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">11. Modifications to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify these terms at any time. Updated terms will be 
                posted on our website with the revision date. Continued use of our services 
                after changes constitutes acceptance of the modified terms.
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">12. Contact Information</h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>Farm Feast Farm House</strong></p>
                <p><strong>Email:</strong> info@farmfeastfarmhouse.shop</p>
                <p><strong>Phone:</strong> +91 8897326898</p>
                <p><strong>Address:</strong> [Your Complete Address]</p>
                
                <p className="mt-4">
                  For legal inquiries: legal@farmfeastfarmhouse.shop
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h2 className="text-xl font-semibold mb-3">13. Severability</h2>
              <p className="text-gray-700">
                If any provision of these terms is found to be unenforceable or invalid, 
                that provision shall be limited or eliminated to the minimum extent necessary 
                so that the terms shall otherwise remain in full force and effect.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}