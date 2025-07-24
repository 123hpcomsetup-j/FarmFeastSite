import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Create Gmail transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'info@farmfeastfarmhouse.shop',
      pass: 'snxz naab kfcb rrmu'
    }
  });
};

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: '"Farm Feast Farm House" <info@farmfeastfarmhouse.shop>',
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