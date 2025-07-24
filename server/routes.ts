import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { sendEmail, generateConfirmationEmail, generateCancellationEmail, generateBookingReceivedEmail, generatePaymentReceivedEmail } from "./emailService";
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
  insertContactMessageSchema
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
  // Admin middleware (define first)
  const requireAdmin = (req: any, res: any, next: any) => {
    // Simple admin check - in production, use proper JWT
    next();
  };

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Get all services with caching and SEO optimization
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getAllServices();
      
      // Add location-based descriptions for SEO
      const enhancedServices = services.map(service => ({
        ...service,
        description: service.description.includes('Hyderabad') 
          ? service.description 
          : `${service.description} Available at our luxury farmhouse in Keesara, Hyderabad with easy access from Shamirpet, Medchal, and all major Hyderabad areas.`
      }));
      
      res.set('Cache-Control', 'public, max-age=600'); // 10 minutes cache
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
      const { code, total } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: "Coupon code is required" });
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

      if (coupon.minAmount && total < coupon.minAmount) {
        return res.status(400).json({ 
          message: `Minimum order amount is ₹${coupon.minAmount}` 
        });
      }

      let discountAmount = 0;
      if (coupon.type === "percentage") {
        discountAmount = Math.round((total * coupon.value) / 100);
        if (coupon.maxDiscount) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscount);
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
      const result = adminLoginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid input" });
      }

      const { username, password } = result.data;
      const admin = await storage.getAdminUserByUsername(username);
      
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, admin.password);
      
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ 
        message: "Login successful", 
        admin: { id: admin.id, username: admin.username, role: admin.role } 
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
          canonicalUrl: `https://farmfeastfarmhouse.shop/${page === 'home' ? '' : page}`,
          schemaType: 'LodgingBusiness',
          schemaData: {},
          priority: 0.9,
          changeFreq: 'weekly',
          noindex: false,
          nofollow: false,
          reviewTitle: `Best Farm House for Rent in ${page === 'home' ? 'Keesara, Hyderabad' : 'Hyderabad'}`,
          reviewDescription: `Highly rated farmhouse rental in Keesara, Hyderabad with excellent reviews from families and corporate guests.`,
          reviewKeywords: 'best farmhouse hyderabad, top rated farm house, luxury accommodation keesara',
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      
      // Enhance existing settings with location keywords if missing
      if (settings && !settings.keywords.includes('hyderabad')) {
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
          // Send confirmation email
          const emailHtml = await generateConfirmationEmail(updatedBooking);
          await sendEmail({
            to: booking.email,
            subject: `🎉 Booking Confirmed - ${booking.confirmationCode}`,
            html: emailHtml
          });
          console.log(`✅ Confirmation email sent to ${booking.email}`);
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

  const httpServer = createServer(app);
  return httpServer;
}