import nodemailer from 'nodemailer';
import { storage } from './storage';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Create Gmail transporter
const createTransporter = () => {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;
  
  if (!gmailUser || !gmailPassword) {
    throw new Error('Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.');
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPassword
    }
  });
};

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Farm Feast Farm House" <${process.env.GMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${options.to}: ${options.subject}`);
    console.log(`Message ID: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

export async function generateBookingReceivedEmail(booking: any): Promise<string> {
  // Get dynamic UPI ID from admin settings
  const upiIdSetting = await storage.getSiteSettingByKey('upi_id');
  const upiId = upiIdSetting?.value || 'ybl@ybl'; // fallback if not set
  
  // Get other dynamic contact info
  const phoneSetting = await storage.getSiteSettingByKey('contact_phone');
  const emailSetting = await storage.getSiteSettingByKey('contact_email');
  const whatsappSetting = await storage.getSiteSettingByKey('whatsapp_number');
  
  const contactPhone = phoneSetting?.value || '+91 8897326898';
  const contactEmail = emailSetting?.value || 'info@farmfeastfarmhouse.shop';
  const whatsappNumber = whatsappSetting?.value || '+91 8897326898';
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
        <h1>📧 Booking Received!</h1>
      </div>
      
      <div style="padding: 20px;">
        <p>Dear ${booking.fullName},</p>
        
        <p>Thank you for your booking request! We have received your booking details and are processing your request.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Your Booking Details</h3>
          <p><strong>Confirmation Code:</strong> ${booking.confirmationCode}</p>
          <p><strong>Guest Name:</strong> ${booking.fullName}</p>
          <p><strong>Check-in:</strong> ${new Date(booking.checkinDate).toLocaleDateString()}</p>
          <p><strong>Check-out:</strong> ${new Date(booking.checkoutDate).toLocaleDateString()}</p>
          <p><strong>Guests:</strong> ${booking.guestCount}</p>
          <p><strong>Total Amount:</strong> ₹${booking.finalTotal?.toLocaleString()}</p>
        </div>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #d97706;">⚠️ Payment Required</h4>
          <p><strong>To confirm your booking, please complete the payment:</strong></p>
          <p>• Amount to pay: <strong>₹${booking.finalTotal?.toLocaleString()}</strong></p>
          <p>• UPI ID: <strong>${upiId}</strong></p>
          <p>• After payment, submit your UTR number through our website</p>
        </div>
        
        <h3>Next Steps:</h3>
        <ol>
          <li>Make payment using the UPI ID above</li>
          <li>Submit your UTR/Transaction ID on our website</li>
          <li>Our team will verify your payment within 2-4 hours</li>
          <li>You'll receive a confirmation email once payment is verified</li>
        </ol>
        
        <h3>Need Help?</h3>
        <p>If you have any questions, please contact us:</p>
        
        <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Phone:</strong> ${contactPhone}</p>
          <p><strong>Email:</strong> ${contactEmail}</p>
          <p><strong>WhatsApp:</strong> ${whatsappNumber}</p>
        </div>
        
        <p>Thank you for choosing Farm Feast Farm House!</p>
        
        <p>Best regards,<br>
        Farm Feast Farm House Team</p>
      </div>
      
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #666;">
        <p>This is an automated email. Please keep this for your records.</p>
        <p>Farm Feast Farm House | Luxury Countryside Experience</p>
      </div>
    </div>
  `;
}

export async function generatePaymentReceivedEmail(booking: any): Promise<string> {
  // Get dynamic contact info from admin settings
  const phoneSetting = await storage.getSiteSettingByKey('contact_phone');
  const emailSetting = await storage.getSiteSettingByKey('contact_email');
  const whatsappSetting = await storage.getSiteSettingByKey('whatsapp_number');
  
  const contactPhone = phoneSetting?.value || '+91 8897326898';
  const contactEmail = emailSetting?.value || 'info@farmfeastfarmhouse.shop';
  const whatsappNumber = whatsappSetting?.value || '+91 8897326898';
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f59e0b; color: white; padding: 20px; text-align: center;">
        <h1>💰 Payment Received!</h1>
      </div>
      
      <div style="padding: 20px;">
        <p>Dear ${booking.fullName},</p>
        
        <p>We have received your payment and your UTR number. Your booking is being processed for final confirmation.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Payment Details</h3>
          <p><strong>Confirmation Code:</strong> ${booking.confirmationCode}</p>
          <p><strong>UTR Number:</strong> ${booking.upiTransactionId}</p>
          <p><strong>Amount:</strong> ₹${booking.finalTotal?.toLocaleString()}</p>
          <p><strong>Payment Status:</strong> Verification in Progress</p>
        </div>
        
        <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #1d4ed8;">ℹ️ What happens next?</h4>
          <p>Our team will verify your payment within 2-4 hours. Once verified, you'll receive a final booking confirmation email with all details.</p>
        </div>
        
        <h3>Your Booking Details</h3>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Check-in:</strong> ${new Date(booking.checkinDate).toLocaleDateString()}</p>
          <p><strong>Check-out:</strong> ${new Date(booking.checkoutDate).toLocaleDateString()}</p>
          <p><strong>Guests:</strong> ${booking.guestCount}</p>
        </div>
        
        <h3>Need Help?</h3>
        <p>If you have any questions, please contact us:</p>
        
        <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Phone:</strong> ${contactPhone}</p>
          <p><strong>Email:</strong> ${contactEmail}</p>
          <p><strong>WhatsApp:</strong> ${whatsappNumber}</p>
        </div>
        
        <p>Thank you for your payment!</p>
        
        <p>Best regards,<br>
        Farm Feast Farm House Team</p>
      </div>
      
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #666;">
        <p>This is an automated email. Please keep this for your records.</p>
        <p>Farm Feast Farm House | Luxury Countryside Experience</p>
      </div>
    </div>
  `;
}

export function generateConfirmationEmail(booking: any): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #22c55e; color: white; padding: 20px; text-align: center;">
        <h1>🎉 Booking Confirmed!</h1>
      </div>
      
      <div style="padding: 20px;">
        <p>Dear ${booking.fullName},</p>
        
        <p>Great news! Your booking has been confirmed and your payment has been verified.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Booking Details</h3>
          <p><strong>Confirmation Code:</strong> ${booking.confirmationCode}</p>
          <p><strong>Guest Name:</strong> ${booking.fullName}</p>
          <p><strong>Check-in:</strong> ${new Date(booking.checkinDate).toLocaleDateString()}</p>
          <p><strong>Check-out:</strong> ${new Date(booking.checkoutDate).toLocaleDateString()}</p>
          <p><strong>Guests:</strong> ${booking.guestCount}</p>
          <p><strong>Total Amount:</strong> ₹${booking.finalTotal?.toLocaleString()}</p>
        </div>
        
        <h3>What's Next?</h3>
        <ul>
          <li>Save this confirmation email for your records</li>
          <li>Arrive at the farmhouse on your check-in date</li>
          <li>Contact us if you have any special requests</li>
          <li>Get ready for an amazing farm experience!</li>
        </ul>
        
        <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0;">Contact Information</h4>
          <p><strong>Phone:</strong> +91 8897326898</p>
          <p><strong>Email:</strong> info@farmfeastfarmhouse.shop</p>
          <p><strong>WhatsApp:</strong> Available for instant support</p>
        </div>
        
        <p>Thank you for choosing Farm Feast Farm House. We look forward to hosting you!</p>
        
        <p>Best regards,<br>
        Farm Feast Farm House Team</p>
      </div>
      
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #666;">
        <p>This is an automated email. Please do not reply to this email.</p>
        <p>Farm Feast Farm House | Luxury Countryside Experience</p>
      </div>
    </div>
  `;
}

export function generateCancellationEmail(booking: any, reason?: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center;">
        <h1>❌ Booking Cancelled</h1>
      </div>
      
      <div style="padding: 20px;">
        <p>Dear ${booking.fullName},</p>
        
        <p>We regret to inform you that your booking has been cancelled.</p>
        
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Cancelled Booking Details</h3>
          <p><strong>Confirmation Code:</strong> ${booking.confirmationCode}</p>
          <p><strong>Guest Name:</strong> ${booking.fullName}</p>
          <p><strong>Check-in:</strong> ${new Date(booking.checkinDate).toLocaleDateString()}</p>
          <p><strong>Check-out:</strong> ${new Date(booking.checkoutDate).toLocaleDateString()}</p>
          <p><strong>Total Amount:</strong> ₹${booking.finalTotal?.toLocaleString()}</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        </div>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0;">Refund Information</h4>
          <p>If you have already made a payment, our team will process your refund within 5-7 business days.</p>
          <p>You will receive a separate email confirmation once the refund has been processed.</p>
        </div>
        
        <h3>Need Help?</h3>
        <p>If you have any questions about this cancellation or would like to make a new booking, please contact us:</p>
        
        <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Phone:</strong> +91 8897326898</p>
          <p><strong>Email:</strong> info@farmfeastfarmhouse.shop</p>
          <p><strong>WhatsApp:</strong> Available for instant support</p>
        </div>
        
        <p>We apologize for any inconvenience caused and hope to serve you in the future.</p>
        
        <p>Best regards,<br>
        Farm Feast Farm House Team</p>
      </div>
      
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #666;">
        <p>This is an automated email. Please do not reply to this email.</p>
        <p>Farm Feast Farm House | Luxury Countryside Experience</p>
      </div>
    </div>
  `;
}