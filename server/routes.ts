import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { generateToken, requireAuth } from "./auth";
import { sendEmail, generateConfirmationEmail, generateCancellationEmail, generateBookingReceivedEmail, generatePaymentReceivedEmail, generateAdminBookingNotificationEmail, generateAdminPaymentConfirmationEmail } from "./emailService";
import { 
  insertBookingSchema, 
  adminLoginSchema, 
  insertSeoSettingsSchema, 
  insertReviewSettingsSchema, 
  insertSiteSettingsSchema, 
  insertServiceSchema, 
  insertCouponSchema, 
  insertAmenitySchema, 
  insertGalleryImageSchema,
  insertBlogPostSchema,
  insertHomepageImageSchema,
  insertCustomScriptSchema,
  insertContactMessageSchema,
  insertVisitorSessionSchema,
  insertPageViewSchema,
  insertAnalyticsEventSchema
} from "@shared/schema";
import { hyderabadLocationKeywords, seoTemplates } from "./seoConfig";

// Configure multer for file uploads
const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin middleware using proper JWT authentication
  const requireAdmin = requireAuth;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Get all services with aggressive caching and compression
  app.get("/api/services", async (req, res) => {
    try {
      // Set aggressive caching headers for faster repeat requests
      res.set({
        'Cache-Control': 'public, max-age=600, stale-while-revalidate=1800',
        'ETag': `"services-${Date.now()}"`,
        'Vary': 'Accept-Encoding'
      });

      // Check if client has cached version
      if (req.headers['if-none-match']) {
        return res.status(304).end();
      }

      const services = await storage.getAllServices();
      
      // Add location-based descriptions for SEO
      const enhancedServices = services.map(service => ({
        ...service,
        description: service.description.includes('Hyderabad') 
          ? service.description 
          : `${service.description} Available at our luxury farmhouse in Keesara, Hyderabad with easy access from Shamirpet, Medchal, and all major Hyderabad areas.`
      }));
      
      res.json(enhancedServices);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  // Gallery routes with SEO optimization
  app.get("/api/gallery", async (req, res) => {
    try {
      const images = await storage.getAllGalleryImages();
      
      // Enhance alt text for SEO with Hyderabad location keywords
      const enhancedImages = images.map(image => ({
        ...image,
        alt: image.alt && !image.alt.toLowerCase().includes('hyderabad') 
          ? `${image.alt} - Farm Feast Farm House, Keesara, Hyderabad`
          : image.alt || `Luxury Farmhouse ${image.category} - Best Farm House for Rent in Keesara, Hyderabad`
      }));
      
      res.set('Cache-Control', 'public, max-age=900'); // 15 minutes cache for images
      res.json(enhancedImages);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  // Custom scripts public route with performance optimization
  app.get("/api/custom-scripts", async (req, res) => {
    try {
      const scripts = await storage.getActiveCustomScripts();
      res.set('Cache-Control', 'public, max-age=600'); // 10 minutes cache for scripts
      res.json(scripts);
    } catch (error) {
      console.error("Error fetching active custom scripts:", error);
      res.status(500).json({ message: "Failed to fetch custom scripts" });
    }
  });

  // Coupon validation
  app.post("/api/coupons/validate", async (req, res) => {
    try {
      const { code, amount, total } = req.body;
      const orderAmount = amount || total; // Support both parameter names for compatibility
      
      if (!code) {
        return res.status(400).json({ message: "Coupon code is required" });
      }
      
      if (!orderAmount) {
        return res.status(400).json({ message: "Order amount is required" });
      }

      const coupon = await storage.getCouponByCode(code);
      
      if (!coupon) {
        return res.status(404).json({ message: "Invalid coupon code" });
      }

      if (!coupon.active) {
        return res.status(400).json({ message: "Coupon is no longer active" });
      }

      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        return res.status(400).json({ message: "Coupon has expired" });
      }

      if (coupon.minAmount && orderAmount < coupon.minAmount) {
        return res.status(400).json({ 
          message: `Minimum order amount is ₹${coupon.minAmount}` 
        });
      }

      let discountAmount = 0;
      if (coupon.type === "percentage") {
        discountAmount = Math.round((orderAmount * coupon.value) / 100);
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else {
        discountAmount = coupon.value;
      }

      res.json({
        valid: true,
        discountAmount,
        coupon: {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value
        }
      });
    } catch (error) {
      console.error("Error validating coupon:", error);
      res.status(500).json({ message: "Failed to validate coupon" });
    }
  });

  // Get booking by confirmation code
  app.get("/api/bookings/:confirmationCode", async (req, res) => {
    try {
      const { confirmationCode } = req.params;
      const booking = await storage.getBookingByConfirmationCode(confirmationCode);
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ error: "Failed to fetch booking" });
    }
  });

  // Update booking payment (when customer submits UTR)
  app.put("/api/bookings/:id/payment", async (req, res) => {
    try {
      const { id } = req.params;
      const { paymentStatus, utrNumber } = req.body;
      
      const booking = await storage.updateBooking(parseInt(id), {
        paymentStatus: paymentStatus || 'pending',
        upiTransactionId: utrNumber
      });
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Send payment received email when UTR is submitted
      if (booking.email && utrNumber) {
        try {
          const emailHtml = await generatePaymentReceivedEmail(booking);
          await sendEmail({
            to: booking.email,
            subject: `💰 Payment Received - ${booking.confirmationCode}`,
            html: emailHtml
          });
          console.log(`✅ Payment received email sent to ${booking.email}`);
        } catch (emailError) {
          console.error(`❌ Failed to send payment received email to ${booking.email}:`, emailError);
        }
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking payment:", error);
      res.status(500).json({ error: "Failed to update booking payment" });
    }
  });

  // Create booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const result = insertBookingSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid booking data", 
          errors: result.error.issues 
        });
      }

      const booking = await storage.createBooking(result.data);
      
      // Send booking received email to customer (not confirmed yet, payment needed)
      if (booking.email) {
        try {
          const emailHtml = await generateBookingReceivedEmail(booking);
          await sendEmail({
            to: booking.email,
            subject: `📧 Booking Received - Payment Required - ${booking.confirmationCode}`,
            html: emailHtml
          });
          console.log(`✅ Booking received email sent to ${booking.email}`);
        } catch (emailError) {
          console.error(`❌ Failed to send booking email to ${booking.email}:`, emailError);
        }
      }

      // Send admin notification about new booking
      try {
        const adminEmailHtml = await generateAdminBookingNotificationEmail(booking);
        await sendEmail({
          to: process.env.GMAIL_USER!, // Send to workspace email
          subject: `🆕 New Booking Alert - ${booking.confirmationCode} - ${booking.fullName}`,
          html: adminEmailHtml
        });
        console.log(`✅ Admin booking notification sent for ${booking.confirmationCode}`);
      } catch (emailError) {
        console.error(`❌ Failed to send admin booking notification for ${booking.confirmationCode}:`, emailError);
      }
      
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Admin create external booking
  app.post("/api/admin/bookings", requireAdmin, async (req, res) => {
    try {
      const result = insertBookingSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid booking data", 
          errors: result.error.issues 
        });
      }

      const booking = await storage.createBooking(result.data);
      
      // Send booking received email to customer (same flow as regular bookings)
      if (booking.email) {
        try {
          const emailHtml = await generateBookingReceivedEmail(booking);
          await sendEmail({
            to: booking.email,
            subject: `📧 Booking Received - Payment Required - ${booking.confirmationCode}`,
            html: emailHtml
          });
          console.log(`✅ Admin created booking - email sent to ${booking.email}`);
        } catch (emailError) {
          console.error(`❌ Failed to send booking email to ${booking.email}:`, emailError);
        }
      }

      // Send admin notification about new external booking (created by admin)
      try {
        const adminEmailHtml = await generateAdminBookingNotificationEmail(booking);
        await sendEmail({
          to: process.env.GMAIL_USER!, // Send to workspace email
          subject: `📋 External Booking Created - ${booking.confirmationCode} - ${booking.fullName}`,
          html: adminEmailHtml
        });
        console.log(`✅ Admin notification sent for external booking ${booking.confirmationCode}`);
      } catch (emailError) {
        console.error(`❌ Failed to send admin notification for external booking ${booking.confirmationCode}:`, emailError);
      }
      
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating admin booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Admin booking confirmation endpoint
  app.post("/api/bookings/:id/confirm", async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const booking = await storage.updateBooking(bookingId, { status: "confirmed" });
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Send confirmation email (console log for now - replace with actual email service)
      console.log(`
═══════════════════════════════════════════════════════════════
📧 BOOKING CONFIRMATION EMAIL SENT
═══════════════════════════════════════════════════════════════
To: ${booking.email || booking.contactNumber}
Subject: 🎉 Booking Confirmed - ${booking.confirmationCode}

Dear ${booking.fullName},

Great news! Your booking has been confirmed by our admin team.

📋 BOOKING DETAILS:
━━━━━━━━━━━━━━━━━━━━━
• Confirmation Code: ${booking.confirmationCode}
• Guest Name: ${booking.fullName}
• Check-in Date: ${booking.checkinDate}
• Check-out Date: ${booking.checkoutDate}
• Number of Guests: ${booking.guestCount}
• Total Amount: ₹${booking.finalTotal?.toLocaleString()}

Your booking is now confirmed and ready! We look forward to hosting you.

Best regards,
Farm Feast Farm House Team
═══════════════════════════════════════════════════════════════
      `);
      
      res.json({
        message: "Booking confirmed successfully",
        booking
      });
    } catch (error) {
      console.error("Error confirming booking:", error);
      res.status(500).json({ message: "Failed to confirm booking" });
    }
  });

  // Admin cancel booking endpoint
  app.post("/api/bookings/:id/cancel", async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { reason } = req.body;
      
      const booking = await storage.updateBooking(bookingId, { 
        status: "cancelled",
        specialRequests: reason 
      });
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json({
        message: "Booking cancelled successfully",
        booking
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      res.status(500).json({ message: "Failed to cancel booking" });
    }
  });



  // Admin get all bookings endpoint
  app.get("/api/admin/bookings", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      console.log("Login attempt received:", { username: req.body.username, passwordLength: req.body.password?.length });
      
      const result = adminLoginSchema.safeParse(req.body);
      if (!result.success) {
        console.log("Schema validation failed:", result.error);
        return res.status(400).json({ message: "Invalid input" });
      }

      const { username, password } = result.data;
      const admin = await storage.getAdminUserByUsername(username);
      
      if (!admin) {
        console.log("Admin user not found for username:", username);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log("Admin found, checking password...");
      const isValid = await bcrypt.compare(password, admin.password);
      console.log("Password validation result:", isValid);
      
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const adminData = { id: admin.id, username: admin.username, role: admin.role || 'admin' };
      const token = generateToken(adminData);

      console.log("Login successful for user:", admin.username);
      res.json({ 
        message: "Login successful", 
        admin: adminData,
        token: token
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin routes (protected) - middleware already defined above

  // Blog Posts routes
  app.get("/api/blog-posts", async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog-posts/published", async (req, res) => {
    try {
      const posts = await storage.getPublishedBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching published blog posts:", error);
      res.status(500).json({ message: "Failed to fetch published blog posts" });
    }
  });

  app.get("/api/blog-posts/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  app.post("/api/blog-posts", requireAdmin, async (req, res) => {
    try {
      const result = insertBlogPostSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid blog post data", 
          errors: result.error.issues 
        });
      }

      const post = await storage.createBlogPost(result.data);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  app.put("/api/blog-posts/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertBlogPostSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid blog post data", 
          errors: result.error.issues 
        });
      }

      const post = await storage.updateBlogPost(id, result.data);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      res.json(post);
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  app.delete("/api/blog-posts/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBlogPost(id);
      
      if (!success) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      res.json({ message: "Blog post deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // Bookings management (admin)
  app.get("/api/admin/bookings", requireAdmin, async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.put("/api/admin/bookings/:id/payment", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, utrNumber, notes } = req.body;
      
      const success = await storage.updateBookingPaymentStatus(id, status, utrNumber, notes);
      
      if (!success) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json({ message: "Payment status updated successfully" });
    } catch (error) {
      console.error("Error updating payment status:", error);
      res.status(500).json({ message: "Failed to update payment status" });
    }
  });

  // Admin: Verify payment endpoint
  app.post("/api/admin/bookings/:id/verify-payment", requireAdmin, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { verified, notes } = req.body;
      
      const paymentStatus = verified ? 'verified' : 'failed';
      const updateData = {
        paymentStatus,
        paymentNotes: notes || null,
        updatedAt: new Date(),
        ...(verified && { 
          paymentVerifiedAt: new Date(),
          status: 'confirmed' // Auto-confirm booking when payment is verified
        })
      };
      
      const updatedBooking = await storage.updateBooking(bookingId, updateData);
      
      if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Send email notification
      try {
        const siteSettings = await storage.getAllSiteSettings();
        if (verified) {
          const emailContent = await generateAdminPaymentConfirmationEmail(updatedBooking);
          await sendEmail({
            to: updatedBooking.email,
            subject: "Payment Confirmed - Farm Feast Farm House",
            html: emailContent
          });
        }
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Don't fail the entire request if email fails
      }
      
      res.json({
        message: verified ? "Payment verified successfully" : "Payment marked as failed",
        booking: updatedBooking
      });
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  app.delete("/api/admin/bookings/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBooking(id);
      
      if (!success) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json({ message: "Booking deleted successfully" });
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ message: "Failed to delete booking" });
    }
  });

  // Services management (admin)
  app.get("/api/admin/services", requireAdmin, async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.post("/api/admin/services", requireAdmin, async (req, res) => {
    try {
      const result = insertServiceSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid service data", 
          errors: result.error.issues 
        });
      }

      const service = await storage.createService(result.data);
      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.put("/api/admin/services/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertServiceSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid service data", 
          errors: result.error.issues 
        });
      }

      const service = await storage.updateService(id, result.data);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      res.json(service);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  app.delete("/api/admin/services/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteService(id);
      
      if (!success) {
        return res.status(404).json({ message: "Service not found" });
      }

      res.json({ message: "Service deleted successfully" });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Coupons management (admin)
  // Get all coupons with performance optimization  
  app.get("/api/admin/coupons", requireAdmin, async (req, res) => {
    try {
      const coupons = await storage.getAllCoupons();
      res.set('Cache-Control', 'private, max-age=300'); // 5 minutes cache for admin coupons
      res.json(coupons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });

  app.post("/api/admin/coupons", requireAdmin, async (req, res) => {
    try {
      const result = insertCouponSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid coupon data", 
          errors: result.error.issues 
        });
      }

      const coupon = await storage.createCoupon(result.data);
      res.status(201).json(coupon);
    } catch (error) {
      console.error("Error creating coupon:", error);
      res.status(500).json({ message: "Failed to create coupon" });
    }
  });

  app.put("/api/admin/coupons/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertCouponSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid coupon data", 
          errors: result.error.issues 
        });
      }

      const coupon = await storage.updateCoupon(id, result.data);
      if (!coupon) {
        return res.status(404).json({ message: "Coupon not found" });
      }

      res.json(coupon);
    } catch (error) {
      console.error("Error updating coupon:", error);
      res.status(500).json({ message: "Failed to update coupon" });
    }
  });

  app.delete("/api/admin/coupons/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCoupon(id);
      
      if (!success) {
        return res.status(404).json({ message: "Coupon not found" });
      }

      res.json({ message: "Coupon deleted successfully" });
    } catch (error) {
      console.error("Error deleting coupon:", error);
      res.status(500).json({ message: "Failed to delete coupon" });
    }
  });

  // SEO settings
  app.get("/api/seo/:page", async (req, res) => {
    try {
      const { page } = req.params;
      let settings = await storage.getSeoSettingsByPage(page);
      
      // If no custom SEO settings, use optimized templates with Hyderabad keywords
      if (!settings && seoTemplates[page as keyof typeof seoTemplates]) {
        const template = seoTemplates[page as keyof typeof seoTemplates];
        settings = {
          id: 0,
          page,
          title: template.title,
          description: template.description,
          keywords: template.keywords,
          ogTitle: template.title,
          ogDescription: template.description,
          ogImage: '/api/placeholder/1200/630',
          canonicalUrl: `https://farmfeastfarmhouse.co.in/${page === 'home' ? '' : page}`,
          schemaType: 'LodgingBusiness',
          schemaData: {},
          priority: 0.9,
          changeFreq: 'weekly',
          noindex: false,
          nofollow: false,
          reviewTitle: `Best Farm House for Rent in ${page === 'home' ? 'Keesara, Hyderabad' : 'Hyderabad'}`,
          reviewDescription: `Highly rated farmhouse rental in Keesara, Hyderabad with excellent reviews from families and corporate guests.`,
          reviewKeywords: 'best farmhouse hyderabad, top rated farm house, luxury accommodation keesara',
          updatedAt: new Date(),
          score: null,
          ranking: null,
          reviewCount: null,
          averageRating: null,
          businessName: null,
          ratingScale: null,
          reviewsEnabled: null,
          showInSnippets: null,
          reviewSnippet1Title: null,
          reviewSnippet1Author: null,
          reviewSnippet1Date: null,
          reviewSnippet1Rating: null,
          reviewSnippet1Body: null,
          reviewSnippet2Title: null,
          reviewSnippet2Author: null,
          reviewSnippet2Date: null,
          reviewSnippet2Rating: null,
          reviewSnippet2Body: null
        } as any;
      }
      
      // Enhance existing settings with location keywords if missing
      if (settings && settings.keywords && !settings.keywords.includes('hyderabad')) {
        const locationKeywords = hyderabadLocationKeywords.slice(0, 8).join(', ');
        settings.keywords = `${settings.keywords}, ${locationKeywords}`;
      }
      
      res.set('Cache-Control', 'public, max-age=300'); // 5 minutes cache for better performance
      res.json(settings);
    } catch (error) {
      console.error("Error fetching SEO settings:", error);
      res.status(500).json({ message: "Failed to fetch SEO settings" });
    }
  });

  app.get("/api/admin/seo", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getAllSeoSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch SEO settings" });
    }
  });

  app.post("/api/admin/seo", requireAdmin, async (req, res) => {
    try {
      const result = insertSeoSettingsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid SEO data", 
          errors: result.error.issues 
        });
      }

      const settings = await storage.upsertSeoSettings(result.data);
      res.json(settings);
    } catch (error) {
      console.error("Error updating SEO settings:", error);
      res.status(500).json({ message: "Failed to update SEO settings" });
    }
  });

  app.put("/api/admin/seo/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertSeoSettingsSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid SEO data", 
          errors: result.error.issues 
        });
      }

      const settings = await storage.updateSeoSettings(id, result.data);
      if (!settings) {
        return res.status(404).json({ message: "SEO settings not found" });
      }

      res.json(settings);
    } catch (error) {
      console.error("Error updating SEO settings:", error);
      res.status(500).json({ message: "Failed to update SEO settings" });
    }
  });

  // Unified review settings from SEO settings with performance optimization
  app.get("/api/reviews/seo", async (req, res) => {
    try {
      // Get review data from home page SEO settings (primary business data)
      const homeSettings = await storage.getSeoSettingsByPage("home");
      if (!homeSettings) {
        // Default review data with Hyderabad location optimization
        const defaultReviewData = {
          enabled: true,
          reviewCount: 127,
          averageRating: 4.8,
          businessName: "Farm Feast Farm House - Best Farm House for Rent in Keesara, Hyderabad",
          ratingScale: 5,
          reviewsEnabled: true,
          showInSnippets: true
        };
        res.set('Cache-Control', 'public, max-age=1800'); // 30 minutes cache
        res.json(defaultReviewData);
        return;
      }
      
      const reviewData = {
        enabled: true,
        reviewCount: homeSettings.reviewCount || 127,
        averageRating: parseFloat(homeSettings.averageRating || "4.8"),
        businessName: homeSettings.reviewTitle || homeSettings.businessName || "Farm Feast Farm House - Best Farm House for Rent in Keesara, Hyderabad",
        ratingScale: parseInt(homeSettings.ratingScale || "5"),
        reviewsEnabled: true,
        showInSnippets: true
      };
      
      res.set('Cache-Control', 'public, max-age=900'); // 15 minutes cache for review data
      res.json(reviewData);
    } catch (error) {
      console.error("Error fetching review SEO data:", error);
      res.status(500).json({ error: "Failed to fetch review data" });
    }
  });

  // Location-based SEO data endpoint for Hyderabad area optimization
  app.get("/api/seo/location", async (req, res) => {
    try {
      const locationData = {
        city: "Hyderabad",
        area: "Keesara",
        nearbyLocations: [
          "Shamirpet", "Medchal", "Ghatkesar", "Kompally", "Uppal",
          "Secunderabad", "Gachibowli", "Madhapur", "Jubilee Hills", 
          "Banjara Hills", "Kukatpally", "Kondapur"
        ],
        targetKeywords: [
          "best farm house for rent",
          "farm house rent in Keesara",
          "farm house rent in Hyderabad",
          "luxury farmhouse rental Hyderabad",
          "weekend getaway near Hyderabad",
          "corporate event venues Hyderabad",
          "birthday party venues Keesara",
          "family vacation farmhouse Hyderabad"
        ],
        distances: {
          "Shamirpet": "15 km",
          "Medchal": "10 km", 
          "Ghatkesar": "25 km",
          "Gachibowli": "45 km",
          "Hitech City": "40 km",
          "Jubilee Hills": "35 km"
        },
        businessData: {
          name: "Farm Feast Farm House",
          address: "SY. No 170/4, Keesara, Medchal-Malkajgiri, Telangana 501301",
          phone: "+91 8897326898",
          coordinates: {
            lat: 17.5623, 
            lng: 78.6897
          }
        }
      };
      
      res.set('Cache-Control', 'public, max-age=1800'); // 30 minutes cache for location data
      res.json(locationData);
    } catch (error) {
      console.error("Error fetching location SEO data:", error);
      res.status(500).json({ error: "Failed to fetch location data" });
    }
  });

  // Individual blog post SEO endpoint for crawlers
  app.get("/api/crawler/blog/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      console.log(`Blog crawler endpoint called for slug: ${slug}`);
      const fullUrl = `${req.protocol}://${req.get('host')}/blog/${slug}`;
      
      // Fetch blog post
      const blogPost = await storage.getBlogPostBySlug(slug);
      console.log(`Blog post found:`, blogPost?.title);
      
      if (!blogPost) {
        console.log(`Blog post not found for slug: ${slug}`);
        return res.status(404).json({ error: "Blog post not found" });
      }
      
      // Generate SEO data from blog post
      const seoData = {
        title: blogPost.metaTitle || `${blogPost.title} - Farm Feast Farm House Blog`,
        description: blogPost.metaDescription || blogPost.excerpt || '',
        keywords: `${Array.isArray(blogPost.tags) ? blogPost.tags.join(', ') : (blogPost.tags || '')}, farm activities, farmhouse blog, keesara experiences`,
        ogTitle: blogPost.metaTitle || blogPost.title,
        ogDescription: blogPost.metaDescription || blogPost.excerpt || '',
        ogImage: blogPost.featuredImage || '/api/placeholder/1200/630',
        canonicalUrl: fullUrl,
        author: blogPost.author,
        publishedAt: blogPost.publishedAt,
        modifiedAt: blogPost.updatedAt
      };
      
      // Generate structured data for blog post
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": blogPost.title,
        "description": blogPost.excerpt,
        "author": {
          "@type": "Organization",
          "name": blogPost.author
        },
        "publisher": {
          "@type": "Organization",
          "name": "Farm Feast Farm House",
          "logo": {
            "@type": "ImageObject",
            "url": `${req.protocol}://${req.get('host')}/api/placeholder/400/400`
          }
        },
        "datePublished": blogPost.publishedAt,
        "dateModified": blogPost.updatedAt,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": fullUrl
        },
        "image": blogPost.featuredImage
      };
      
      // Generate complete HTML for crawlers
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seoData.title}</title>
  <meta name="description" content="${seoData.description}">
  <meta name="keywords" content="${seoData.keywords}">
  <meta name="author" content="${seoData.author}">
  <meta name="robots" content="index,follow">
  <meta name="googlebot" content="index,follow">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${seoData.ogTitle}">
  <meta property="og:description" content="${seoData.ogDescription}">
  <meta property="og:image" content="${seoData.ogImage}">
  <meta property="og:url" content="${seoData.canonicalUrl}">
  <meta property="og:type" content="article">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${seoData.ogTitle}">
  <meta name="twitter:description" content="${seoData.ogDescription}">
  <meta name="twitter:image" content="${seoData.ogImage}">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${seoData.canonicalUrl}">
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  ${JSON.stringify(structuredData, null, 2)}
  </script>
</head>
<body>
  <h1>${blogPost.title}</h1>
  <p>${blogPost.excerpt}</p>
  <div>${blogPost.content}</div>
</body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error("Error rendering blog post for crawler:", error);
      res.status(500).json({ error: "Failed to render blog post" });
    }
  });

  // SEO HTML meta tags endpoint for crawlers (works in development too)
  app.get("/api/crawler/:page", async (req, res) => {
    try {
      const { page } = req.params;
      const fullUrl = `${req.protocol}://${req.get('host')}/${page === 'home' ? '' : page}`;
      
      // Fetch SEO settings
      let seoSettings = await storage.getSeoSettingsByPage(page);
      
      // Fall back to template if no custom settings
      if (!seoSettings && seoTemplates[page as keyof typeof seoTemplates]) {
        const template = seoTemplates[page as keyof typeof seoTemplates];
        seoSettings = {
          id: 0,
          page,
          title: template.title,
          description: template.description,
          keywords: template.keywords,
          ogTitle: template.title,
          ogDescription: template.description,
          ogImage: '/api/placeholder/1200/630',
          canonicalUrl: fullUrl,
          schemaType: (template as any).schemaType,
          schemaData: {},
          priority: 0.8,
          changeFreq: 'weekly',
          noindex: false,
          nofollow: false,
          updatedAt: new Date(),
          score: 80,
          ranking: 1,
          reviewCount: 1008,
          averageRating: "4.5",
          businessName: "Farm Feast Farm House", 
          ratingScale: "5",
          reviewsEnabled: true,
          showInSnippets: true,
          reviewTitle: null,
          reviewDescription: null,
          reviewKeywords: null,
          reviewSnippet1Author: "Kinididoddi Pradeep",
          reviewSnippet1Date: "2025-07-23",
          reviewSnippet1Rating: "5",
          reviewSnippet1Body: "Awesome! It's very good and perfectly suited for couples and families. ❤️💯",
          reviewSnippet2Author: "Ravi Kumar",
          reviewSnippet2Date: "2025-07-21",
          reviewSnippet2Rating: "5",
          reviewSnippet2Body: "Great place for a peaceful weekend. The pool and garden area were beautifully maintained!"
        };
      }

      // Get review data
      const reviewData = await storage.getReviewSettings();
      
      // Generate structured data
      const structuredData: any = {
        "@context": "https://schema.org",
        "@type": seoSettings?.schemaType || "LodgingBusiness",
        "name": seoSettings?.title || "Farm Feast Farm House - Luxury Farmhouse Rental Near Hyderabad",
        "description": seoSettings?.description || "Escape to luxury at Farm Feast Farm House. Premium farmhouse rental with swimming pool, modern amenities, and professional services. Perfect for events, family gatherings, and weekend getaways near Hyderabad.",
        "url": fullUrl,
        "image": seoSettings?.ogImage || "/api/placeholder/1200/630",
        "telephone": "+91-8897326898",
        "email": "info@farmfeastfarmhouse.shop",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "SY. No 170/A, Near Cheeryal Kaman, Keesara",
          "addressLocality": "Keesara",
          "postalCode": "501301",
          "addressRegion": "Telangana",
          "addressCountry": "IN"
        },
        "amenityFeature": [
          { "@type": "LocationFeatureSpecification", "name": "Swimming Pool" },
          { "@type": "LocationFeatureSpecification", "name": "Free Parking" },
          { "@type": "LocationFeatureSpecification", "name": "Air Conditioning" },
          { "@type": "LocationFeatureSpecification", "name": "Pet Friendly" },
          { "@type": "LocationFeatureSpecification", "name": "Free WiFi" }
        ],
        "priceRange": "₹5500-15000",
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 17.5099358,
          "longitude": 78.6273986
        }
      };

      // Add review data if available
      if (seoSettings?.reviewsEnabled && (seoSettings?.reviewCount || 0) > 0) {
        structuredData.aggregateRating = {
          "@type": "AggregateRating",
          "ratingValue": parseFloat(seoSettings.averageRating || "4.8"),
          "reviewCount": seoSettings.reviewCount || 127,
          "bestRating": parseInt(seoSettings.ratingScale || "5"),
          "worstRating": 1
        };

        // Add individual review snippets if enabled
        if (seoSettings?.showInSnippets) {
          const reviews = [];
          
          // Add review snippet 1 if available
          if (seoSettings.reviewSnippet1Body && seoSettings.reviewSnippet1Author) {
            reviews.push({
              "@type": "Review",
              "author": {
                "@type": "Person",
                "name": seoSettings.reviewSnippet1Author
              },
              "datePublished": seoSettings.reviewSnippet1Date || "2025-07-23",
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": seoSettings.reviewSnippet1Rating || "5"
              },
              "reviewBody": seoSettings.reviewSnippet1Body
            });
          }
          
          // Add review snippet 2 if available
          if (seoSettings.reviewSnippet2Body && seoSettings.reviewSnippet2Author) {
            reviews.push({
              "@type": "Review",
              "author": {
                "@type": "Person",
                "name": seoSettings.reviewSnippet2Author
              },
              "datePublished": seoSettings.reviewSnippet2Date || "2025-07-21",
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": seoSettings.reviewSnippet2Rating || "5"
              },
              "reviewBody": seoSettings.reviewSnippet2Body
            });
          }
          
          // Only add reviews if we have at least one
          if (reviews.length > 0) {
            structuredData.review = reviews;
          }
        }
      }

      const title = seoSettings?.title || "Farm Feast Farm House - Luxury Farmhouse Rental Near Hyderabad";
      const description = seoSettings?.description || "Escape to luxury at Farm Feast Farm House. Premium farmhouse rental with swimming pool, modern amenities, and professional services. Perfect for events, family gatherings, and weekend getaways near Hyderabad.";
      const image = seoSettings?.ogImage || "/api/placeholder/1200/630";
      const keywords = seoSettings?.keywords || "farmhouse rental, luxury farmhouse, swimming pool, Hyderabad, weekend getaway, event venue, family gathering";
      const robots = seoSettings?.noindex ? "noindex,nofollow" : "index,follow";

      const metaHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="keywords" content="${keywords}" />
    <meta name="robots" content="${robots}" />
    <meta name="googlebot" content="${robots}" />
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Farm Feast Farm House" />
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    
    ${seoSettings?.canonicalUrl ? `<link rel="canonical" href="${seoSettings.canonicalUrl}" />` : ''}
    
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    ${JSON.stringify(structuredData, null, 2)}
    </script>
</head>
<body>
    <h1>${title}</h1>
    <p>${description}</p>
    <div class="location-info">
        <h2>Location & Contact</h2>
        <p><strong>Address:</strong> SY. No 170/A, Near Cheeryal Kaman, Keesara, Telangana 501301</p>
        <p><strong>Phone:</strong> +91-8897326898</p>
        <p><strong>Email:</strong> info@farmfeastfarmhouse.shop</p>
    </div>
    <div class="amenities">
        <h2>Amenities</h2>
        <ul>
            <li>Swimming Pool</li>
            <li>Free Parking</li>
            <li>Air Conditioning</li>
            <li>Pet Friendly</li>
            <li>Free WiFi</li>
        </ul>
    </div>
    <p><a href="${page === 'home' ? '/' : '/' + page}">Visit the interactive website</a></p>
    <script>
        // Redirect to main app for human visitors (not bots)
        if (!navigator.userAgent.match(/bot|crawl|slurp|spider|mediapartners|facebookexternalhit|twitterbot|linkedinbot|whatsapp/i)) {
            setTimeout(() => {
                window.location.href = '${page === 'home' ? '/' : '/' + page}';
            }, 1000);
        }
    </script>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=600'); // 10 minutes cache
      res.send(metaHTML);
    } catch (error) {
      console.error("Error generating SEO crawler page:", error);
      res.status(500).send('<html><body><h1>Error loading page</h1></body></html>');
    }
  });

  // Gallery management (admin)
  app.get("/api/admin/gallery", requireAdmin, async (req, res) => {
    try {
      const images = await storage.getAllGalleryImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  app.post("/api/admin/gallery", requireAdmin, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Image file is required" });
      }

      const imageData = {
        url: `/uploads/${req.file.filename}`,
        category: req.body.category || 'exterior',
        filename: req.file.filename,
        alt: req.body.alt || req.file.originalname,
        source: 'upload',
        order: parseInt(req.body.order) || 0,
        active: req.body.active !== undefined ? req.body.active === 'true' : true
      };

      const image = await storage.createGalleryImage(imageData);
      res.status(201).json(image);
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  app.post("/api/admin/gallery/url", requireAdmin, async (req, res) => {
    try {
      const result = insertGalleryImageSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid gallery data", 
          errors: result.error.issues 
        });
      }

      // For URL-based images, filename is null
      const imageData = {
        ...result.data,
        filename: null,
        source: 'url'
      };

      const image = await storage.createGalleryImage(imageData);
      res.status(201).json(image);
    } catch (error) {
      console.error("Error adding URL image:", error);
      res.status(500).json({ message: "Failed to add URL image" });
    }
  });

  app.put("/api/admin/gallery/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertGalleryImageSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid gallery data", 
          errors: result.error.issues 
        });
      }

      const image = await storage.updateGalleryImage(id, result.data);
      if (!image) {
        return res.status(404).json({ message: "Gallery image not found" });
      }

      res.json(image);
    } catch (error) {
      console.error("Error updating gallery image:", error);
      res.status(500).json({ message: "Failed to update gallery image" });
    }
  });

  app.delete("/api/admin/gallery/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteGalleryImage(id);
      
      if (!success) {
        return res.status(404).json({ message: "Gallery image not found" });
      }

      res.json({ message: "Gallery image deleted successfully" });
    } catch (error) {
      console.error("Error deleting gallery image:", error);
      res.status(500).json({ message: "Failed to delete gallery image" });
    }
  });

  // Site settings with performance optimization
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getAllSiteSettings();
      res.set('Cache-Control', 'public, max-age=600'); // 10 minutes cache for settings
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });

  app.get("/api/settings/:key", async (req, res) => {
    try {
      const setting = await storage.getSiteSettingByKey(req.params.key);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });

  app.get("/api/admin/site-settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getAllSiteSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching site settings:", error);
      res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });

  app.post("/api/admin/site-settings", requireAdmin, async (req, res) => {
    try {
      const result = insertSiteSettingsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid settings data", 
          errors: result.error.issues 
        });
      }

      const setting = await storage.upsertSiteSettings(result.data);
      res.json(setting);
    } catch (error) {
      console.error("Error creating site settings:", error);
      res.status(500).json({ message: "Failed to create site settings" });
    }
  });

  app.put("/api/admin/site-settings/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertSiteSettingsSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid settings data", 
          errors: result.error.issues 
        });
      }

      const setting = await storage.updateSiteSettings(id, result.data);
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }

      res.json(setting);
    } catch (error) {
      console.error("Error updating site settings:", error);
      res.status(500).json({ message: "Failed to update site settings" });
    }
  });

  app.post("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const result = insertSiteSettingsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid settings data", 
          errors: result.error.issues 
        });
      }

      const setting = await storage.upsertSiteSettings(result.data);
      res.json(setting);
    } catch (error) {
      console.error("Error updating site settings:", error);
      res.status(500).json({ message: "Failed to update site settings" });
    }
  });

  // Amenities
  app.get("/api/amenities", async (req, res) => {
    try {
      const amenities = await storage.getAllAmenities();
      res.json(amenities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch amenities" });
    }
  });

  app.get("/api/admin/amenities", requireAdmin, async (req, res) => {
    try {
      const amenities = await storage.getAllAmenities();
      res.json(amenities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch amenities" });
    }
  });

  app.post("/api/admin/amenities", requireAdmin, async (req, res) => {
    try {
      const result = insertAmenitySchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid amenity data", 
          errors: result.error.issues 
        });
      }

      const amenity = await storage.createAmenity(result.data);
      res.status(201).json(amenity);
    } catch (error) {
      console.error("Error creating amenity:", error);
      res.status(500).json({ message: "Failed to create amenity" });
    }
  });

  app.put("/api/admin/amenities/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertAmenitySchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid amenity data", 
          errors: result.error.issues 
        });
      }

      const amenity = await storage.updateAmenity(id, result.data);
      if (!amenity) {
        return res.status(404).json({ message: "Amenity not found" });
      }

      res.json(amenity);
    } catch (error) {
      console.error("Error updating amenity:", error);
      res.status(500).json({ message: "Failed to update amenity" });
    }
  });

  app.delete("/api/admin/amenities/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAmenity(id);
      
      if (!success) {
        return res.status(404).json({ message: "Amenity not found" });
      }

      res.json({ message: "Amenity deleted successfully" });
    } catch (error) {
      console.error("Error deleting amenity:", error);
      res.status(500).json({ message: "Failed to delete amenity" });
    }
  });

  // Admin booking status management
  app.patch("/api/admin/bookings/:id/status", requireAdmin, async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { status, paymentStatus, paymentNotes } = req.body;
      
      const booking = await storage.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Update booking
      const updatedBooking = await storage.updateBooking(bookingId, {
        status,
        paymentStatus,
        paymentNotes,
        paymentVerifiedAt: paymentStatus === "verified" ? new Date() : booking.paymentVerifiedAt
      });

      if (!updatedBooking) {
        return res.status(404).json({ message: "Failed to update booking" });
      }

      // Send email notifications based on status changes
      if (booking.email) {
        if (status === "complete" && paymentStatus === "verified") {
          // Send confirmation email to customer
          const emailHtml = await generateConfirmationEmail(updatedBooking);
          await sendEmail({
            to: booking.email,
            subject: `🎉 Booking Confirmed - ${booking.confirmationCode}`,
            html: emailHtml
          });
          console.log(`✅ Confirmation email sent to ${booking.email}`);

          // Send admin notification about payment confirmation
          try {
            const adminEmailHtml = await generateAdminPaymentConfirmationEmail(updatedBooking);
            await sendEmail({
              to: process.env.GMAIL_USER!, // Send to workspace email
              subject: `💰 Payment Confirmed - ${booking.confirmationCode} - ${booking.fullName}`,
              html: adminEmailHtml
            });
            console.log(`✅ Admin payment confirmation notification sent for ${booking.confirmationCode}`);
          } catch (emailError) {
            console.error(`❌ Failed to send admin payment confirmation notification for ${booking.confirmationCode}:`, emailError);
          }
        } else if (status === "canceled") {
          // Send cancellation email
          const emailHtml = await generateCancellationEmail(updatedBooking, paymentNotes);
          await sendEmail({
            to: booking.email,
            subject: `❌ Booking Cancelled - ${booking.confirmationCode}`,
            html: emailHtml
          });
          console.log(`❌ Cancellation email sent to ${booking.email}`);
        }
      }

      res.json({
        message: "Booking updated successfully",
        booking: updatedBooking,
        emailSent: !!booking.email
      });
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // Blog Posts Routes with performance optimization
  app.get("/api/blog-posts", async (req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.set('Cache-Control', 'private, max-age=300'); // 5 minutes cache for all posts (admin only)
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Failed to fetch blog posts" });
    }
  });

  // All blog posts (public, published only) with performance optimization
  app.get("/api/blog-posts/published", async (req, res) => {
    try {
      const posts = await storage.getPublishedBlogPosts();
      res.set('Cache-Control', 'public, max-age=600'); // 10 minutes cache for published posts
      res.json(posts);
    } catch (error) {
      console.error("Error fetching published blog posts:", error);
      res.status(500).json({ message: "Failed to fetch published blog posts" });
    }
  });

  app.get("/api/blog-posts/:slug", async (req, res) => {
    try {
      const post = await storage.getBlogPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Failed to fetch blog post" });
    }
  });

  app.post("/api/blog-posts", requireAdmin, async (req, res) => {
    try {
      const blogData = req.body;
      
      // Auto-generate slug if not provided
      if (!blogData.slug && blogData.title) {
        blogData.slug = blogData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }
      
      const post = await storage.createBlogPost(blogData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  app.put("/api/blog-posts/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.updateBlogPost(id, req.body);
      
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      res.json(post);
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  app.delete("/api/blog-posts/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBlogPost(id);
      
      if (!success) {
        return res.status(404).json({ message: "Blog post not found" });
      }

      res.json({ message: "Blog post deleted successfully" });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  // Sitemap routes
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const protocol = req.protocol;
      const host = req.get('host');
      const baseUrl = `${protocol}://${host}`;
      
      const { SitemapService } = await import("./sitemapService");
      const customSitemapService = new SitemapService(baseUrl);
      let sitemap = await customSitemapService.generateSitemap();
      
      res.set({
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      });
      
      res.send(sitemap);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  app.get("/robots.txt", async (req, res) => {
    try {
      const protocol = req.protocol;
      const host = req.get('host');
      const baseUrl = `${protocol}://${host}`;
      
      const { SitemapService } = await import("./sitemapService");
      const customSitemapService = new SitemapService(baseUrl);
      const robotsTxt = await customSitemapService.generateRobotsTxt();
      
      res.set({
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      });
      
      res.send(robotsTxt);
    } catch (error) {
      console.error("Error generating robots.txt:", error);
      res.status(500).send("Error generating robots.txt");
    }
  });

  app.post("/api/admin/sitemap/regenerate", requireAdmin, async (req, res) => {
    try {
      const protocol = req.protocol;
      const host = req.get('host');
      const baseUrl = `${protocol}://${host}`;
      
      const { SitemapService } = await import("./sitemapService");
      const customSitemapService = new SitemapService(baseUrl);
      const sitemap = await customSitemapService.generateSitemap();
      
      // Count URLs in the sitemap
      const urlCount = (sitemap.match(/<url>/g) || []).length;
      
      res.json({
        message: "Sitemap regenerated successfully",
        urls: urlCount,
        lastGenerated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error regenerating sitemap:", error);
      res.status(500).json({ message: "Failed to regenerate sitemap" });
    }
  });

  // Test email endpoint (admin only)
  app.post("/api/admin/test-email", requireAdmin, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email address required" });
      }

      const testEmailSent = await sendEmail({
        to: email,
        subject: "Test Email - Farm Feast Farm House",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #22c55e; color: white; padding: 20px; text-align: center;">
              <h1>✅ Email Test Successful!</h1>
            </div>
            <div style="padding: 20px;">
              <p>This is a test email from Farm Feast Farm House booking system.</p>
              <p>If you received this email, the email service is working correctly!</p>
              <p>Timestamp: ${new Date().toISOString()}</p>
            </div>
          </div>
        `
      });

      if (testEmailSent) {
        res.json({ message: "Test email sent successfully", email });
      } else {
        res.status(500).json({ message: "Failed to send test email" });
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      res.status(500).json({ message: "Failed to send test email", error: (error as Error).message });
    }
  });

  // Homepage Images routes
  app.get("/api/homepage-images", async (req, res) => {
    try {
      const { section } = req.query;
      let images;
      
      if (section) {
        images = await storage.getHomepageImagesBySection(section as string);
      } else {
        images = await storage.getAllHomepageImages();
      }
      
      res.json(images);
    } catch (error) {
      console.error("Error fetching homepage images:", error);
      res.status(500).json({ message: "Failed to fetch homepage images" });
    }
  });

  app.post("/api/homepage-images", requireAdmin, async (req, res) => {
    try {
      const result = insertHomepageImageSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid homepage image data", 
          errors: result.error.issues 
        });
      }

      const image = await storage.createHomepageImage(result.data);
      res.status(201).json(image);
    } catch (error) {
      console.error("Error creating homepage image:", error);
      res.status(500).json({ message: "Failed to create homepage image" });
    }
  });

  app.put("/api/homepage-images/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertHomepageImageSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid homepage image data", 
          errors: result.error.issues 
        });
      }

      const image = await storage.updateHomepageImage(id, result.data);
      if (!image) {
        return res.status(404).json({ message: "Homepage image not found" });
      }

      res.json(image);
    } catch (error) {
      console.error("Error updating homepage image:", error);
      res.status(500).json({ message: "Failed to update homepage image" });
    }
  });

  app.delete("/api/homepage-images/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteHomepageImage(id);
      
      if (!success) {
        return res.status(404).json({ message: "Homepage image not found" });
      }

      res.json({ message: "Homepage image deleted successfully" });
    } catch (error) {
      console.error("Error deleting homepage image:", error);
      res.status(500).json({ message: "Failed to delete homepage image" });
    }
  });

  // Custom Scripts Management Routes
  app.get("/api/admin/custom-scripts", requireAdmin, async (req, res) => {
    try {
      const scripts = await storage.getAllCustomScripts();
      res.json(scripts);
    } catch (error) {
      console.error("Error fetching custom scripts:", error);
      res.status(500).json({ message: "Failed to fetch custom scripts" });
    }
  });

  app.get("/api/admin/custom-scripts/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const script = await storage.getCustomScriptById(id);
      if (!script) {
        return res.status(404).json({ message: "Custom script not found" });
      }
      res.json(script);
    } catch (error) {
      console.error("Error fetching custom script:", error);
      res.status(500).json({ message: "Failed to fetch custom script" });
    }
  });

  app.post("/api/admin/custom-scripts", requireAdmin, async (req, res) => {
    try {
      const result = insertCustomScriptSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid custom script data", 
          errors: result.error.issues 
        });
      }

      const script = await storage.createCustomScript(result.data);
      res.status(201).json(script);
    } catch (error) {
      console.error("Error creating custom script:", error);
      res.status(500).json({ message: "Failed to create custom script" });
    }
  });

  app.put("/api/admin/custom-scripts/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertCustomScriptSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid custom script data", 
          errors: result.error.issues 
        });
      }

      const script = await storage.updateCustomScript(id, result.data);
      if (!script) {
        return res.status(404).json({ message: "Custom script not found" });
      }
      res.json(script);
    } catch (error) {
      console.error("Error updating custom script:", error);
      res.status(500).json({ message: "Failed to update custom script" });
    }
  });

  app.delete("/api/admin/custom-scripts/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCustomScript(id);
      if (!deleted) {
        return res.status(404).json({ message: "Custom script not found" });
      }
      res.json({ message: "Custom script deleted successfully" });
    } catch (error) {
      console.error("Error deleting custom script:", error);
      res.status(500).json({ message: "Failed to delete custom script" });
    }
  });

  // Public endpoint to get active custom scripts
  app.get("/api/custom-scripts", async (req, res) => {
    try {
      const scripts = await storage.getActiveCustomScripts();
      res.json(scripts);
    } catch (error) {
      console.error("Error fetching active custom scripts:", error);
      res.status(500).json({ message: "Failed to fetch custom scripts" });
    }
  });

  // Contact form submission endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const result = insertContactMessageSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid contact form data", 
          errors: result.error.issues 
        });
      }

      const contactMessage = await storage.createContactMessage(result.data);
      
      // Send notification email to admin (optional)
      try {
        // Note: Email service for contact notifications would be implemented here
        console.log("Contact message received:", contactMessage);
      } catch (emailError) {
        console.error("Failed to send contact notification email:", emailError);
        // Don't fail the request if email fails
      }

      res.status(201).json({ message: "Message sent successfully", id: contactMessage.id });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Analytics API Routes
  // Create a new visitor session
  app.post("/api/analytics/session", async (req, res) => {
    try {
      const result = insertVisitorSessionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid session data", 
          errors: result.error.issues 
        });
      }
      
      const newSession = await storage.createVisitorSession(result.data);
      res.json(newSession);
    } catch (error) {
      console.error("Error creating visitor session:", error);
      res.status(500).json({ error: "Failed to create visitor session" });
    }
  });

  // Update visitor session (activity tracking)
  app.put("/api/analytics/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const updates = req.body;
      const updatedSession = await storage.updateVisitorSession(sessionId, updates);
      res.json(updatedSession);
    } catch (error) {
      console.error("Error updating visitor session:", error);
      res.status(500).json({ error: "Failed to update visitor session" });
    }
  });

  // Track a page view
  app.post("/api/analytics/pageview", async (req, res) => {
    try {
      const result = insertPageViewSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid page view data", 
          errors: result.error.issues 
        });
      }
      
      const newPageView = await storage.createPageView(result.data);
      res.json(newPageView);
    } catch (error) {
      console.error("Error creating page view:", error);
      res.status(500).json({ error: "Failed to create page view" });
    }
  });

  // Track analytics events (clicks, form submissions, etc.)
  app.post("/api/analytics/event", async (req, res) => {
    try {
      const result = insertAnalyticsEventSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid analytics event data", 
          errors: result.error.issues 
        });
      }
      
      const newEvent = await storage.createAnalyticsEvent(result.data);
      res.json(newEvent);
    } catch (error) {
      console.error("Error creating analytics event:", error);
      res.status(500).json({ error: "Failed to create analytics event" });
    }
  });

  // Get analytics overview (admin only)
  app.get("/api/admin/analytics/overview", requireAdmin, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      console.log("Fetching analytics overview for", days, "days");
      const overview = await storage.getAnalyticsOverview(days);
      console.log("Analytics overview result:", overview);
      res.json(overview);
    } catch (error) {
      console.error("Error fetching analytics overview:", error);
      res.status(500).json({ error: "Failed to fetch analytics overview" });
    }
  });

  // Get real-time visitor data (admin only)
  app.get("/api/admin/analytics/realtime", requireAdmin, async (req, res) => {
    try {
      console.log("Fetching real-time analytics data");
      const realtimeData = await storage.getRealtimeVisitors();
      console.log("Real-time analytics result:", realtimeData);
      res.json(realtimeData);
    } catch (error) {
      console.error("Error fetching real-time analytics:", error);
      res.status(500).json({ error: "Failed to fetch real-time analytics" });
    }
  });

  // Get active visitor sessions (admin only)  
  app.get("/api/admin/analytics/active-sessions", requireAdmin, async (req, res) => {
    try {
      const activeSessions = await storage.getActiveVisitorSessions();
      res.json(activeSessions);
    } catch (error) {
      console.error("Error fetching active sessions:", error);
      res.status(500).json({ error: "Failed to fetch active sessions" });
    }
  });

  // Test analytics database connection (public for testing)
  app.get("/api/analytics/test", async (req, res) => {
    try {
      // Import sql for testing
      const { sql } = await import("drizzle-orm");
      const { visitorSessions, pageViews } = await import("@shared/schema");
      
      const testData = {
        totalSessions: await storage.getAllBookings().then(() => "Database connected"),
        activeSessions: await storage.getActiveVisitorSessions(),
        recentActivity: "Analytics tracking active"
      };
      res.json({
        message: "Analytics database connection working",
        data: testData
      });
    } catch (error) {
      console.error("Analytics test error:", error);
      res.status(500).json({ error: "Database connection failed", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // Live Chat API Routes
  
  // Start a new chat session (public)
  app.post("/api/chat/start", async (req, res) => {
    try {
      const { visitorSessionId, visitorName, visitorEmail, visitorPhone } = req.body;
      console.log("Starting chat with data:", { visitorSessionId, visitorName, visitorEmail, visitorPhone });
      
      // Check if visitor already has an active chat session
      let chatSession = await storage.getChatSessionByVisitorId(visitorSessionId);
      
      if (!chatSession || chatSession.status === "closed") {
        // Create new chat session
        const sessionData = {
          visitorSessionId,
          visitorName,
          visitorEmail,
          visitorPhone,
          status: "waiting" as const
        };
        console.log("Creating session with data:", sessionData);
        chatSession = await storage.createChatSession(sessionData);
        console.log("New chat session created:", chatSession);
      } else {
        console.log("Existing chat session found:", chatSession);
      }
      
      if (!chatSession || !chatSession.id) {
        console.error("Failed to create or retrieve chat session");
        return res.status(500).json({ error: "Failed to create chat session" });
      }
      
      res.json(chatSession);
    } catch (error) {
      console.error("Error starting chat session:", error);
      res.status(500).json({ error: "Failed to start chat session", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // Send a message (public)
  app.post("/api/chat/message", async (req, res) => {
    try {
      const { chatSessionId, senderType, senderId, message } = req.body;
      
      const newMessage = await storage.createChatMessage({
        chatSessionId,
        senderType,
        senderId,
        message,
        messageType: "text"
      });
      
      // Broadcast message via WebSocket if function is available
      if ((app as any).broadcastToChat) {
        (app as any).broadcastToChat(chatSessionId, {
          type: "new_message",
          message: newMessage
        });
      }
      
      res.json(newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Get chat messages (public)
  app.get("/api/chat/:sessionId/messages", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      if (isNaN(sessionId)) {
        return res.status(400).json({ error: "Invalid session ID" });
      }
      const messages = await storage.getChatMessages(sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Admin Chat Routes (admin only)
  
  // Get all chat sessions (admin only)
  app.get("/api/admin/chat/sessions", requireAdmin, async (req, res) => {
    try {
      const sessions = await storage.getAllChatSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ error: "Failed to fetch chat sessions" });
    }
  });

  // Get active chat sessions (admin only)
  app.get("/api/admin/chat/active", requireAdmin, async (req, res) => {
    try {
      const activeSessions = await storage.getActiveChatSessions();
      res.json(activeSessions);
    } catch (error) {
      console.error("Error fetching active chat sessions:", error);
      res.status(500).json({ error: "Failed to fetch active chat sessions" });
    }
  });

  // Assign admin to chat session (admin only)
  app.put("/api/admin/chat/:sessionId/assign", requireAdmin, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const adminId = req.admin?.id;
      
      const updatedSession = await storage.updateChatSession(sessionId, {
        adminId,
        status: "active"
      });
      
      // Notify visitor that admin joined
      if ((app as any).broadcastToChat) {
        (app as any).broadcastToChat(sessionId, {
          type: "admin_joined",
          session: updatedSession
        });
      }
      
      res.json(updatedSession);
    } catch (error) {
      console.error("Error assigning admin to chat:", error);
      res.status(500).json({ error: "Failed to assign admin" });
    }
  });

  // Close chat session (admin only)
  app.put("/api/admin/chat/:sessionId/close", requireAdmin, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      
      const updatedSession = await storage.updateChatSession(sessionId, {
        status: "closed",
        closedAt: new Date()
      });
      
      // Notify visitor that chat was closed
      if ((app as any).broadcastToChat) {
        (app as any).broadcastToChat(sessionId, {
          type: "chat_closed",
          session: updatedSession
        });
      }
      
      res.json(updatedSession);
    } catch (error) {
      console.error("Error closing chat session:", error);
      res.status(500).json({ error: "Failed to close chat session" });
    }
  });

  // Mark messages as read (admin only)
  app.put("/api/admin/chat/:sessionId/read", requireAdmin, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      await storage.markMessagesAsRead(sessionId, "admin");
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ error: "Failed to mark messages as read" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket Server for Real-time Chat
  const { WebSocketServer, WebSocket } = await import("ws");
  const wss = new WebSocketServer({ server: httpServer, path: '/ws/chat' });
  
  interface ChatWebSocket extends WebSocket {
    chatSessionId?: number;
    userType?: 'admin' | 'visitor';
    adminId?: number;
    visitorSessionId?: string;
  }
  
  const chatConnections = new Map<number, ChatWebSocket[]>(); // sessionId -> connections
  
  wss.on('connection', (ws: ChatWebSocket, req) => {
    console.log('New WebSocket connection for chat');
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'join_chat':
            if (!message.chatSessionId || isNaN(parseInt(message.chatSessionId))) {
              console.error('Invalid chat session ID:', message.chatSessionId);
              break;
            }
            
            const sessionId = parseInt(message.chatSessionId);
            ws.chatSessionId = sessionId;
            ws.userType = message.userType;
            if (message.userType === 'admin') {
              ws.adminId = message.adminId;
            } else {
              ws.visitorSessionId = message.visitorSessionId;
            }
            
            // Add to connections map
            if (!chatConnections.has(sessionId)) {
              chatConnections.set(sessionId, []);
            }
            chatConnections.get(sessionId)?.push(ws);
            
            console.log(`${message.userType} joined chat session ${sessionId}`);
            break;
            
          case 'send_message':
            // Validate message data
            if (!message.chatSessionId || !message.content || !message.senderType) {
              console.error('Invalid message data:', message);
              break;
            }
            
            // Handle message sending through WebSocket
            const newMessage = await storage.createChatMessage({
              chatSessionId: parseInt(message.chatSessionId),
              senderType: message.senderType,
              senderId: message.senderId,
              message: message.content,
              messageType: "text"
            });
            
            // Broadcast to all connections in this chat session
            const connections = chatConnections.get(parseInt(message.chatSessionId));
            if (connections) {
              connections.forEach(conn => {
                if (conn.readyState === WebSocket.OPEN) {
                  conn.send(JSON.stringify({
                    type: 'new_message',
                    message: newMessage
                  }));
                }
              });
            }
            break;
        }
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      // Remove from connections map
      if (ws.chatSessionId) {
        const connections = chatConnections.get(ws.chatSessionId);
        if (connections) {
          const index = connections.indexOf(ws);
          if (index > -1) {
            connections.splice(index, 1);
          }
          if (connections.length === 0) {
            chatConnections.delete(ws.chatSessionId);
          }
        }
      }
    });
  });
  
  // Broadcast function for chat messages
  function broadcastToChat(chatSessionId: number, data: any) {
    const connections = chatConnections.get(chatSessionId);
    if (connections) {
      connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      });
    }
  }
  
  // Make broadcastToChat available in the route handlers
  (app as any).broadcastToChat = broadcastToChat;
  
  return httpServer;
}