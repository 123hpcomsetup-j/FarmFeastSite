// Email notification service for booking confirmations
import { sendEmail } from "./emailService";
import type { Booking, SiteSettings } from "@shared/schema";

interface EmailTemplate {
  subject: string;
  body: string;
}

export class ConfirmationService {
  private getSiteSettings(settings: SiteSettings[]): { [key: string]: string } {
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as { [key: string]: string });
  }

  private generatePaymentConfirmationEmail(booking: Booking, siteSettings: { [key: string]: string }): EmailTemplate {
    const supportPhone = siteSettings.whatsapp_number || siteSettings.contact_phone || '8897326898';
    const emergencyContact = siteSettings.emergency_contact || '8309001021';
    
    return {
      subject: `🎉 Payment Confirmed - Booking ${booking.confirmationCode}`,
      body: `
Dear ${booking.fullName},

Great news! Your payment has been verified and your booking is now CONFIRMED! 🎉

📋 BOOKING DETAILS:
━━━━━━━━━━━━━━━━━━━━━
• Confirmation Code: ${booking.confirmationCode}
• Guest Name: ${booking.fullName}
• Check-in Date: ${booking.checkinDate}
• Check-out Date: ${booking.checkoutDate}
• Number of Guests: ${booking.guestCount}
• Check-in Time: ${booking.checkinTime}
• Total Amount: ₹${booking.finalTotal.toLocaleString()}

💳 PAYMENT INFORMATION:
━━━━━━━━━━━━━━━━━━━━━
• Payment Status: VERIFIED ✅
• UTR Number: ${booking.upiTransactionId}
• Amount Paid: ₹${booking.finalTotal.toLocaleString()}

📞 SUPPORT & CONTACT:
━━━━━━━━━━━━━━━━━━━━━
• WhatsApp: ${supportPhone}
• Emergency Contact: ${emergencyContact}
• Email Support: Available 24/7

📍 LOCATION & DIRECTIONS:
━━━━━━━━━━━━━━━━━━━━━
${siteSettings.contact_address || 'SY. No 170/A, Near Cheeryal Kaman, Keesara, Rangareddy - 501301'}

💡 IMPORTANT REMINDERS:
━━━━━━━━━━━━━━━━━━━━━
• Please arrive on time for check-in
• Bring valid ID proof for all guests
• Contact us if you need to modify your booking
• Keep this confirmation email handy

We're excited to host you at Farm Feast Farmhouse! If you have any questions or special requests, don't hesitate to reach out to our support team.

Thank you for choosing Farm Feast Farmhouse!

Best regards,
The Farm Feast Team

---
This is an automated confirmation email. Please save this email for your records.
Farm Feast Farmhouse - Where memories are made! 🌾
      `.trim()
    };
  }

  private generatePaymentFailedEmail(booking: Booking, siteSettings: { [key: string]: string }, reason?: string): EmailTemplate {
    const supportPhone = siteSettings.whatsapp_number || siteSettings.contact_phone || '8897326898';
    
    return {
      subject: `❌ Payment Issue - Booking ${booking.confirmationCode}`,
      body: `
Dear ${booking.fullName},

We regret to inform you that there was an issue verifying your payment for booking ${booking.confirmationCode}.

📋 BOOKING DETAILS:
━━━━━━━━━━━━━━━━━━━━━
• Confirmation Code: ${booking.confirmationCode}
• Guest Name: ${booking.fullName}
• Check-in Date: ${booking.checkinDate}
• Total Amount: ₹${booking.finalTotal.toLocaleString()}

❌ PAYMENT ISSUE:
━━━━━━━━━━━━━━━━━━━━━
${reason ? `• Issue: ${reason}` : '• Your payment could not be verified with the bank'}
• UTR Number Submitted: ${booking.upiTransactionId || 'Not provided'}

🔄 NEXT STEPS:
━━━━━━━━━━━━━━━━━━━━━
1. Please verify your UTR number is correct
2. Check if the payment amount matches exactly: ₹${booking.finalTotal.toLocaleString()}
3. Contact our support team for immediate assistance
4. You can retry payment or get a refund if needed

📞 IMMEDIATE SUPPORT:
━━━━━━━━━━━━━━━━━━━━━
• WhatsApp: ${supportPhone}
• Call: ${supportPhone}
• Available: 24/7 for payment issues

We apologize for any inconvenience and are here to help resolve this quickly. Please contact us immediately so we can assist you.

Best regards,
The Farm Feast Team

---
Need urgent help? WhatsApp us at ${supportPhone}
Farm Feast Farmhouse - Your satisfaction is our priority! 🌾
      `.trim()
    };
  }

  async sendPaymentConfirmationEmail(booking: Booking, siteSettings: SiteSettings[]): Promise<void> {
    try {
      if (!booking.email) {
        console.log(`No email address provided for booking ${booking.confirmationCode}`);
        return;
      }

      const settings = this.getSiteSettings(siteSettings);
      const emailTemplate = this.generatePaymentConfirmationEmail(booking, settings);
      
      // Convert text email to HTML
      const htmlBody = emailTemplate.body.replace(/\n/g, '<br>').replace(/━+/g, '<hr>');
      
      // Send actual email
      const emailSent = await sendEmail({
        to: booking.email,
        subject: emailTemplate.subject,
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px;">${htmlBody}</div>`
      });

      if (emailSent) {
        console.log(`✅ Payment confirmation email sent to ${booking.email} for booking ${booking.confirmationCode}`);
      } else {
        console.error(`❌ Failed to send payment confirmation email to ${booking.email} for booking ${booking.confirmationCode}`);
      }

    } catch (error) {
      console.error('Failed to send payment confirmation email:', error);
      throw error;
    }
  }

  async sendPaymentFailedEmail(booking: Booking, siteSettings: SiteSettings[], reason?: string): Promise<void> {
    try {
      if (!booking.email) {
        console.log(`No email address provided for booking ${booking.confirmationCode}`);
        return;
      }

      const settings = this.getSiteSettings(siteSettings);
      const emailTemplate = this.generatePaymentFailedEmail(booking, settings, reason);
      
      // Convert text email to HTML
      const htmlBody = emailTemplate.body.replace(/\n/g, '<br>').replace(/━+/g, '<hr>');
      
      // Send actual email
      const emailSent = await sendEmail({
        to: booking.email,
        subject: emailTemplate.subject,
        html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; background-color: #fff3f3; border-left: 4px solid #ef4444;">${htmlBody}</div>`
      });

      if (emailSent) {
        console.log(`✅ Payment failed email sent to ${booking.email} for booking ${booking.confirmationCode}`);
      } else {
        console.error(`❌ Failed to send payment failed email to ${booking.email} for booking ${booking.confirmationCode}`);
      }

    } catch (error) {
      console.error('Failed to send payment failed email:', error);
      throw error;
    }
  }
}

export const confirmationService = new ConfirmationService();

// Legacy functions for compatibility - can be removed if not used elsewhere
export async function confirmBooking(booking: any, notes?: string): Promise<void> {
  console.log(`📧 Booking confirmed: ${booking.confirmationCode}`);
}

export async function cancelBooking(booking: any, reason?: string): Promise<void> {
  console.log(`❌ Booking cancelled: ${booking.confirmationCode} - ${reason}`);
}

export async function sendCheckInReminder(booking: any): Promise<void> {
  console.log(`⏰ Check-in reminder sent for: ${booking.confirmationCode}`);
}

export function generateConfirmationCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}