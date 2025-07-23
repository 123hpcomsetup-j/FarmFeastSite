import { storage } from "./storage";
import type { Booking } from "@shared/schema";

// Generate unique confirmation code
export function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Email templates
export function generateConfirmationEmail(booking: Booking): string {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`;
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Booking Confirmation - Farm Feast Farm House</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .confirmation-code { background: #22c55e; color: white; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 8px; margin: 20px 0; letter-spacing: 2px; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e; }
    .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; }
    .detail-label { font-weight: bold; color: #374151; }
    .detail-value { color: #6b7280; }
    .services { margin: 15px 0; }
    .service-item { background: #f3f4f6; padding: 8px 12px; margin: 5px 0; border-radius: 5px; }
    .total { background: #22c55e; color: white; padding: 15px; text-align: center; font-size: 18px; font-weight: bold; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
    .contact-info { background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 Booking Confirmed!</h1>
    <p>Thank you for choosing Farm Feast Farm House</p>
  </div>
  
  <div class="content">
    <p>Dear ${booking.fullName},</p>
    <p>We're excited to confirm your booking at Farm Feast Farm House! Your reservation has been successfully processed.</p>
    
    <div class="confirmation-code">
      Confirmation Code: ${booking.confirmationCode}
    </div>
    
    <div class="details">
      <h3>Booking Details</h3>
      <div class="detail-row">
        <span class="detail-label">Guest Name:</span>
        <span class="detail-value">${booking.fullName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Contact Number:</span>
        <span class="detail-value">${booking.contactNumber}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Email:</span>
        <span class="detail-value">${booking.email || 'Not provided'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Check-in:</span>
        <span class="detail-value">${formatDate(booking.checkinDate)} at ${booking.checkinTime}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Check-out:</span>
        <span class="detail-value">${formatDate(booking.checkoutDate)}${booking.checkoutTime ? ` at ${booking.checkoutTime}` : ''}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Number of Guests:</span>
        <span class="detail-value">${booking.guestCount} ${booking.guestCount === 1 ? 'guest' : 'guests'}</span>
      </div>
      
      ${booking.selectedServices && booking.selectedServices.length > 0 ? `
      <div class="detail-row">
        <span class="detail-label">Selected Services:</span>
        <div class="services">
          ${booking.selectedServices.map(service => `<div class="service-item">${service}</div>`).join('')}
        </div>
      </div>
      ` : ''}
      
      ${booking.specialRequests ? `
      <div class="detail-row">
        <span class="detail-label">Special Requests:</span>
        <span class="detail-value">${booking.specialRequests}</span>
      </div>
      ` : ''}
      
      ${booking.couponCode ? `
      <div class="detail-row">
        <span class="detail-label">Coupon Applied:</span>
        <span class="detail-value">${booking.couponCode} (-${formatPrice(booking.discountAmount)})</span>
      </div>
      ` : ''}
    </div>
    
    <div class="total">
      Total Amount: ${formatPrice(booking.finalTotal)}
    </div>
    
    <div class="contact-info">
      <h3>Contact Information</h3>
      <p><strong>Phone:</strong> +91-8897326898</p>
      <p><strong>WhatsApp:</strong> +91-8897326898</p>
      <p><strong>Email:</strong> info@farmfeastfarmhouse.shop</p>
      <p><strong>Address:</strong> SY. No 170/A, Near Cheeryal Kaman, Keesara, Rangareddy - 501301</p>
    </div>
    
    <h3>What's Next?</h3>
    <ul>
      <li>Save your confirmation code: <strong>${booking.confirmationCode}</strong></li>
      <li>We'll send you a reminder 24 hours before your check-in</li>
      <li>Arrive at your scheduled check-in time</li>
      <li>Present your confirmation code at reception</li>
      <li>Any questions? Contact us anytime!</li>
    </ul>
    
    <p>We look forward to hosting you at Farm Feast Farm House!</p>
  </div>
  
  <div class="footer">
    <p>Farm Feast Farm House | Luxury Farmhouse Experience</p>
    <p>This is an automated confirmation email. Please do not reply.</p>
  </div>
</body>
</html>
  `;
}

export function generateReminderEmail(booking: Booking): string {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Check-in Reminder - Farm Feast Farm House</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .reminder-box { background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .confirmation-code { background: #3b82f6; color: white; padding: 15px; text-align: center; font-size: 20px; font-weight: bold; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📅 Check-in Reminder</h1>
    <p>Your stay is tomorrow!</p>
  </div>
  
  <div class="content">
    <p>Dear ${booking.fullName},</p>
    
    <div class="reminder-box">
      <h3>⏰ Check-in Tomorrow!</h3>
      <p><strong>${formatDate(booking.checkinDate)} at ${booking.checkinTime}</strong></p>
    </div>
    
    <p>We're excited to welcome you to Farm Feast Farm House tomorrow! Here's a quick reminder of your booking details:</p>
    
    <div class="confirmation-code">
      Your Confirmation Code: ${booking.confirmationCode}
    </div>
    
    <h3>Before You Arrive:</h3>
    <ul>
      <li>Keep your confirmation code handy</li>
      <li>Check traffic conditions for your journey</li>
      <li>Contact us if you'll be arriving later than expected</li>
      <li>Review our amenities and services</li>
    </ul>
    
    <p><strong>Contact:</strong> +91-8897326898 | info@farmfeastfarmhouse.shop</p>
    <p>Safe travels, and see you soon!</p>
  </div>
</body>
</html>
  `;
}

// Email service (mock implementation - in production, integrate with actual email service)
export async function sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
  console.log('📧 Email would be sent to:', to);
  console.log('📧 Subject:', subject);
  console.log('📧 Content length:', htmlContent.length, 'characters');
  
  // In production, integrate with services like:
  // - SendGrid
  // - Mailgun
  // - AWS SES
  // - Nodemailer with SMTP
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return true; // Always return true for now
}

// Main confirmation functions
export async function confirmBooking(bookingId: number): Promise<Booking | null> {
  try {
    const booking = await storage.getBooking(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status === 'confirmed') {
      return booking; // Already confirmed
    }

    // Generate confirmation code if not exists
    const confirmationCode = booking.confirmationCode || generateConfirmationCode();
    
    // Update booking status
    const updatedBooking = await storage.updateBooking(bookingId, {
      status: 'confirmed',
      confirmationCode,
      confirmedAt: new Date(),
    });

    // Send confirmation email if email is provided
    if (updatedBooking.email) {
      const emailContent = generateConfirmationEmail(updatedBooking);
      const emailSent = await sendEmail(
        updatedBooking.email,
        `Booking Confirmed - ${confirmationCode} | Farm Feast Farm House`,
        emailContent
      );
      
      // Update email sent status
      if (emailSent) {
        await storage.updateBooking(bookingId, {
          emailSent: true,
        });
      }
    }

    return updatedBooking;
  } catch (error) {
    console.error('Error confirming booking:', error);
    throw error;
  }
}

export async function cancelBooking(bookingId: number, reason?: string): Promise<Booking | null> {
  try {
    const booking = await storage.getBooking(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status === 'cancelled') {
      return booking; // Already cancelled
    }

    // Update booking status
    const updatedBooking = await storage.updateBooking(bookingId, {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason: reason,
      updatedAt: new Date(),
    });

    return updatedBooking;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
}

export async function sendCheckInReminder(bookingId: number): Promise<boolean> {
  try {
    const booking = await storage.getBooking(bookingId);
    if (!booking || !booking.email || booking.reminderSent) {
      return false;
    }

    const emailContent = generateReminderEmail(booking);
    const emailSent = await sendEmail(
      booking.email,
      `Check-in Reminder - Tomorrow at ${booking.checkinTime} | Farm Feast Farm House`,
      emailContent
    );

    if (emailSent) {
      await storage.updateBooking(bookingId, {
        reminderSent: true,
      });
    }

    return emailSent;
  } catch (error) {
    console.error('Error sending reminder:', error);
    return false;
  }
}

// Check for bookings that need reminders (to be called by a cron job)
export async function processReminders(): Promise<void> {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const bookings = await storage.getAllBookings();
    const reminderBookings = bookings.filter(booking => 
      booking.checkinDate === tomorrowStr && 
      booking.status === 'confirmed' && 
      !booking.reminderSent &&
      booking.email
    );

    for (const booking of reminderBookings) {
      await sendCheckInReminder(booking.id);
    }

    console.log(`Processed ${reminderBookings.length} check-in reminders`);
  } catch (error) {
    console.error('Error processing reminders:', error);
  }
}