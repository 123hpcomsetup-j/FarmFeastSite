import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { sendEmail, generateConfirmationEmail, generateCancellationEmail } from "./emailService";
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
  insertBlogPostSchema
} from "@shared/schema";

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
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Get all services
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  // Gallery routes
  app.get("/api/gallery", async (req, res) => {
    try {
      const images = await storage.getAllGalleryImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gallery images" });
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

  // Update booking payment
  app.put("/api/bookings/:id/payment", async (req, res) => {
    try {
      const { id } = req.params;
      const { paymentStatus, utrNumber } = req.body;
      
      const booking = await storage.updateBooking(parseInt(id), {
        paymentStatus,
        upiTransactionId: utrNumber
      });
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
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
      res.status(201).json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
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

  // Admin routes (protected)
  const requireAdmin = (req: any, res: any, next: any) => {
    // Simple admin check - in production, use proper JWT
    next();
  };

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
  app.get("/api/admin/coupons", requireAdmin, async (req, res) => {
    try {
      const coupons = await storage.getAllCoupons();
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
      const settings = await storage.getSeoSettingsByPage(req.params.page);
      if (!settings) {
        return res.status(404).json({ message: "SEO settings not found" });
      }
      res.json(settings);
    } catch (error) {
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

  // Review settings
  app.get("/api/reviews/seo", async (req, res) => {
    try {
      const settings = await storage.getReviewSettings();
      res.json(settings || { enabled: false });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch review settings" });
    }
  });

  app.post("/api/admin/reviews", requireAdmin, async (req, res) => {
    try {
      const result = insertReviewSettingsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid review data", 
          errors: result.error.issues 
        });
      }

      const settings = await storage.upsertReviewSettings(result.data);
      res.json(settings);
    } catch (error) {
      console.error("Error updating review settings:", error);
      res.status(500).json({ message: "Failed to update review settings" });
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
        title: req.body.title || req.file.originalname,
        description: req.body.description || '',
        url: `/uploads/${req.file.filename}`,
        category: req.body.category || 'general',
        filename: req.file.filename,
        alt: req.body.title || req.file.originalname,
        order: parseInt(req.body.order) || 1,
        active: true
      };

      const image = await storage.createGalleryImage(imageData);
      res.status(201).json(image);
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
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

  // Site settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getAllSiteSettings();
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
          const emailHtml = generateConfirmationEmail(updatedBooking);
          await sendEmail({
            to: booking.email,
            subject: `🎉 Booking Confirmed - ${booking.confirmationCode}`,
            html: emailHtml
          });
          console.log(`✅ Confirmation email sent to ${booking.email}`);
        } else if (status === "canceled") {
          // Send cancellation email
          const emailHtml = generateCancellationEmail(updatedBooking, paymentNotes);
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

  // Blog Posts Routes
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

  const httpServer = createServer(app);
  return httpServer;
}