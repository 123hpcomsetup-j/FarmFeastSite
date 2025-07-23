import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { storage } from "./storage";
import { insertBookingSchema, adminLoginSchema, insertSeoSettingsSchema, insertReviewSettingsSchema, insertSiteSettingsSchema, insertServiceSchema, insertCouponSchema, insertAmenitySchema, insertGalleryImageSchema } from "@shared/schema";
import { confirmBooking, cancelBooking, sendCheckInReminder, generateConfirmationCode, confirmationService } from "./confirmationService";
import { z } from "zod";
import { authenticateAdmin, generateToken, requireAuth, type AuthenticatedRequest } from "./auth";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
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
  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));
  
  // Get all services
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getActiveServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  // Get gallery images (public)
  app.get("/api/gallery", async (req, res) => {
    try {
      const images = await storage.getGalleryImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  // Get all coupons (admin endpoint)
  app.get("/api/coupons", async (req, res) => {
    try {
      const coupons = await storage.getAllCoupons();
      res.json(coupons);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });

  // Validate coupon
  app.post("/api/coupons/validate", async (req, res) => {
    try {
      const { code, amount } = req.body;
      
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

      // Check expiry date
      if (coupon.expiryDate) {
        const expiryDate = new Date(coupon.expiryDate);
        if (new Date() > expiryDate) {
          return res.status(400).json({ message: "Coupon has expired" });
        }
      }

      // Check minimum amount - handle null/undefined minAmount as 0
      const minAmount = coupon.minAmount || 0;
      if (amount < minAmount) {
        return res.status(400).json({ 
          message: `Minimum order amount of ₹${minAmount} required` 
        });
      }

      // Calculate discount
      let discountAmount = 0;
      if (coupon.type === "percentage") {
        discountAmount = Math.floor((amount * coupon.value) / 100);
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else if (coupon.type === "fixed") {
        discountAmount = coupon.value;
      }

      res.json({
        valid: true,
        coupon,
        discountAmount,
        message: `Coupon applied! You saved ₹${discountAmount}`,
      });
    } catch (error) {
      console.error("Coupon validation error:", error);
      res.status(500).json({ message: "Failed to validate coupon" });
    }
  });

  // Create booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      
      // Generate confirmation code
      const confirmationCode = generateConfirmationCode();
      
      const booking = await storage.createBooking({
        ...validatedData,
        confirmationCode,
        status: 'pending'
      });
      
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid booking data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create booking" });
      }
    }
  });

  // Confirm a booking
  app.post("/api/bookings/:id/confirm", async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const confirmedBooking = await confirmBooking(bookingId);
      
      if (!confirmedBooking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }
      
      res.json({
        message: "Booking confirmed successfully",
        booking: confirmedBooking,
        emailSent: confirmedBooking.emailSent
      });
    } catch (error) {
      console.error("Error confirming booking:", error);
      res.status(500).json({ message: "Failed to confirm booking" });
    }
  });

  // Cancel a booking
  app.post("/api/bookings/:id/cancel", async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { reason } = req.body;
      
      const cancelledBooking = await cancelBooking(bookingId, reason);
      
      if (!cancelledBooking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }
      
      res.json({
        message: "Booking cancelled successfully",
        booking: cancelledBooking
      });
    } catch (error) {
      console.error("Error cancelling booking:", error);
      res.status(500).json({ message: "Failed to cancel booking" });
    }
  });

  // Send check-in reminder
  app.post("/api/bookings/:id/reminder", async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const reminderSent = await sendCheckInReminder(bookingId);
      
      if (!reminderSent) {
        res.status(400).json({ message: "Unable to send reminder" });
        return;
      }
      
      res.json({ message: "Reminder sent successfully" });
    } catch (error) {
      console.error("Error sending reminder:", error);
      res.status(500).json({ message: "Failed to send reminder" });
    }
  });

  // Submit payment details
  app.post("/api/bookings/:id/payment", async (req, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { upiTransactionId } = req.body;
      
      if (!upiTransactionId) {
        res.status(400).json({ message: "UTR number is required" });
        return;
      }
      
      const updatedBooking = await storage.updateBooking(bookingId, {
        paymentStatus: 'paid',
        upiTransactionId: upiTransactionId.trim(),
        updatedAt: new Date(),
      });
      
      if (!updatedBooking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }
      
      res.json({
        message: "Payment details submitted successfully",
        booking: updatedBooking
      });
    } catch (error) {
      console.error("Error submitting payment:", error);
      res.status(500).json({ message: "Failed to submit payment details" });
    }
  });

  // Admin: Verify payment
  app.post("/api/admin/bookings/:id/verify-payment", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const { verified, notes } = req.body;
      
      const paymentStatus = verified ? 'verified' : 'failed';
      const updateData: any = {
        paymentStatus,
        paymentNotes: notes || null,
        updatedAt: new Date(),
      };
      
      if (verified) {
        updateData.paymentVerifiedAt = new Date();
        updateData.status = 'confirmed'; // Auto-confirm booking when payment is verified
      }
      
      const updatedBooking = await storage.updateBooking(bookingId, updateData);
      
      if (!updatedBooking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }

      // Send email notification
      try {
        const siteSettings = await storage.getAllSiteSettings();
        if (verified) {
          await confirmationService.sendPaymentConfirmationEmail(updatedBooking, siteSettings);
        } else {
          await confirmationService.sendPaymentFailedEmail(updatedBooking, siteSettings, notes);
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

  // Get booking by confirmation code (public endpoint)
  app.get("/api/bookings/confirmation/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const bookings = await storage.getAllBookings();
      const booking = bookings.find(b => b.confirmationCode === code);
      
      if (!booking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }
      
      // Return limited booking info for security
      res.json({
        id: booking.id,
        confirmationCode: booking.confirmationCode,
        fullName: booking.fullName,
        checkinDate: booking.checkinDate,
        checkoutDate: booking.checkoutDate,
        guestCount: booking.guestCount,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        finalTotal: booking.finalTotal
      });
    } catch (error) {
      console.error("Error fetching booking by confirmation code:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  // Get all bookings (admin endpoint)
  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Get booking by ID
  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBooking(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  // Update booking status
  app.patch("/api/bookings/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const booking = await storage.updateBookingStatus(id, status);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // Get gallery images
  app.get("/api/gallery", async (req, res) => {
    try {
      const images = await storage.getAllGalleryImages();
      res.json(images);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  // Get amenities
  app.get("/api/amenities", async (req, res) => {
    try {
      const amenities = await storage.getAllAmenities();
      res.json(amenities);
    } catch (error) {
      console.error("Error fetching amenities:", error);
      res.status(500).json({ message: "Failed to fetch amenities" });
    }
  });

  // Get SEO settings
  app.get("/api/seo", async (req, res) => {
    try {
      const seoSettings = await storage.getAllSeoSettings();
      res.json(seoSettings);
    } catch (error) {
      console.error("Error fetching SEO settings:", error);
      res.status(500).json({ message: "Failed to fetch SEO settings" });
    }
  });

  // Get site settings
  app.get("/api/site-settings", async (req, res) => {
    try {
      const siteSettings = await storage.getAllSiteSettings();
      res.json(siteSettings);
    } catch (error) {
      console.error("Error fetching site settings:", error);
      res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });

  // Admin Authentication Routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = adminLoginSchema.parse(req.body);
      
      const admin = await authenticateAdmin(username, password);
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(admin);
      res.json({ 
        token, 
        admin: { 
          id: admin.id, 
          username: admin.username, 
          role: admin.role 
        } 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid login data", errors: error.errors });
      } else {
        console.error("Error during admin login:", error);
        res.status(500).json({ message: "Login failed" });
      }
    }
  });

  // Admin Dashboard - Get all bookings (protected)
  app.get("/api/admin/bookings", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Admin - Manage Services
  app.get("/api/admin/services", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.post("/api/admin/services", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(validatedData);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid service data", errors: error.errors });
      } else {
        console.error("Error creating service:", error);
        res.status(500).json({ message: "Failed to create service" });
      }
    }
  });

  app.patch("/api/admin/services/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertServiceSchema.parse(req.body);
      const service = await storage.updateService(id, validatedData);
      res.json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid service data", errors: error.errors });
      } else {
        console.error("Error updating service:", error);
        res.status(500).json({ message: "Failed to update service" });
      }
    }
  });

  app.delete("/api/admin/services/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteService(id);
      if (success) {
        res.json({ message: "Service deleted successfully" });
      } else {
        res.status(404).json({ message: "Service not found" });
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Admin - Manage Coupons
  app.get("/api/admin/coupons", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const coupons = await storage.getAllCoupons();
      res.json(coupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      res.status(500).json({ message: "Failed to fetch coupons" });
    }
  });

  app.post("/api/admin/coupons", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertCouponSchema.parse(req.body);
      const coupon = await storage.createCoupon(validatedData);
      res.status(201).json(coupon);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid coupon data", errors: error.errors });
      } else {
        console.error("Error creating coupon:", error);
        res.status(500).json({ message: "Failed to create coupon" });
      }
    }
  });

  app.patch("/api/admin/coupons/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCouponSchema.parse(req.body);
      const coupon = await storage.updateCoupon(id, validatedData);
      res.json(coupon);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid coupon data", errors: error.errors });
      } else {
        console.error("Error updating coupon:", error);
        res.status(500).json({ message: "Failed to update coupon" });
      }
    }
  });

  app.delete("/api/admin/coupons/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCoupon(id);
      if (success) {
        res.json({ message: "Coupon deleted successfully" });
      } else {
        res.status(404).json({ message: "Coupon not found" });
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      res.status(500).json({ message: "Failed to delete coupon" });
    }
  });

  // Admin - Manage Gallery Images
  app.get("/api/admin/gallery", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const images = await storage.getAllGalleryImages();
      res.json(images);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  app.post("/api/admin/gallery", requireAuth, upload.single('image'), async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Image file is required" });
      }

      const imageData = {
        title: req.body.title || req.file.originalname,
        description: req.body.description || '',
        url: `/uploads/${req.file.filename}`,
        category: req.body.category || 'general'
      };

      const validatedData = insertGalleryImageSchema.parse(imageData);
      const image = await storage.createGalleryImage(validatedData);
      res.status(201).json(image);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid image data", errors: error.errors });
      } else {
        console.error("Error uploading image:", error);
        res.status(500).json({ message: "Failed to upload image" });
      }
    }
  });

  app.patch("/api/admin/gallery/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertGalleryImageSchema.parse(req.body);
      const image = await storage.updateGalleryImage(id, validatedData);
      res.json(image);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid image data", errors: error.errors });
      } else {
        console.error("Error updating image:", error);
        res.status(500).json({ message: "Failed to update image" });
      }
    }
  });

  app.delete("/api/admin/gallery/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteGalleryImage(id);
      if (success) {
        res.json({ message: "Image deleted successfully" });
      } else {
        res.status(404).json({ message: "Image not found" });
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({ message: "Failed to delete image" });
    }
  });

  // Admin - Manage Amenities
  app.get("/api/admin/amenities", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const amenities = await storage.getAllAmenities();
      res.json(amenities);
    } catch (error) {
      console.error("Error fetching amenities:", error);
      res.status(500).json({ message: "Failed to fetch amenities" });
    }
  });

  app.post("/api/admin/amenities", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertAmenitySchema.parse(req.body);
      const amenity = await storage.createAmenity(validatedData);
      res.status(201).json(amenity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid amenity data", errors: error.errors });
      } else {
        console.error("Error creating amenity:", error);
        res.status(500).json({ message: "Failed to create amenity" });
      }
    }
  });

  app.patch("/api/admin/amenities/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAmenitySchema.parse(req.body);
      const amenity = await storage.updateAmenity(id, validatedData);
      res.json(amenity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid amenity data", errors: error.errors });
      } else {
        console.error("Error updating amenity:", error);
        res.status(500).json({ message: "Failed to update amenity" });
      }
    }
  });

  app.delete("/api/admin/amenities/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAmenity(id);
      if (success) {
        res.json({ message: "Amenity deleted successfully" });
      } else {
        res.status(404).json({ message: "Amenity not found" });
      }
    } catch (error) {
      console.error("Error deleting amenity:", error);
      res.status(500).json({ message: "Failed to delete amenity" });
    }
  });

  // Admin - Manage SEO Settings
  app.get("/api/admin/seo", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const seoSettings = await storage.getAllSeoSettings();
      res.json(seoSettings);
    } catch (error) {
      console.error("Error fetching SEO settings:", error);
      res.status(500).json({ message: "Failed to fetch SEO settings" });
    }
  });

  app.post("/api/admin/seo", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertSeoSettingsSchema.parse(req.body);
      const seoSettings = await storage.createSeoSettings(validatedData);
      res.status(201).json(seoSettings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid SEO data", errors: error.errors });
      } else {
        console.error("Error creating SEO settings:", error);
        res.status(500).json({ message: "Failed to create SEO settings" });
      }
    }
  });

  app.put("/api/admin/seo/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSeoSettingsSchema.parse(req.body);
      const seoSettings = await storage.updateSeoSettings(id, validatedData);
      res.json(seoSettings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid SEO data", errors: error.errors });
      } else {
        console.error("Error updating SEO settings:", error);
        res.status(500).json({ message: "Failed to update SEO settings" });
      }
    }
  });

  // Admin - Manage Review Settings for SEO snippets
  app.get("/api/admin/reviews", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const reviewSettings = await storage.getReviewSettings();
      res.json(reviewSettings || {
        reviewCount: 0,
        averageRating: "0.0",
        businessName: "Farm Feast Farm House",
        ratingScale: "5",
        reviewsEnabled: true,
        showInSnippets: true
      });
    } catch (error) {
      console.error("Error fetching review settings:", error);
      res.status(500).json({ message: "Failed to fetch review settings" });
    }
  });

  app.post("/api/admin/reviews", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertReviewSettingsSchema.parse(req.body);
      const reviewSettings = await storage.upsertReviewSettings(validatedData);
      res.json(reviewSettings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid review data", errors: error.errors });
      } else {
        console.error("Error updating review settings:", error);
        res.status(500).json({ message: "Failed to update review settings" });
      }
    }
  });

  // Public endpoint to get review data for SEO
  app.get("/api/reviews/seo", async (req, res) => {
    try {
      const reviewSettings = await storage.getReviewSettings();
      if (!reviewSettings || !reviewSettings.reviewsEnabled || !reviewSettings.showInSnippets) {
        res.json({ enabled: false });
        return;
      }
      
      res.json({
        enabled: true,
        reviewCount: reviewSettings.reviewCount,
        averageRating: parseFloat(reviewSettings.averageRating),
        businessName: reviewSettings.businessName,
        ratingScale: parseInt(reviewSettings.ratingScale)
      });
    } catch (error) {
      console.error("Error fetching review SEO data:", error);
      res.status(500).json({ error: "Failed to fetch review data" });
    }
  });

  // Admin - Manage Site Settings
  app.get("/api/admin/site-settings", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const siteSettings = await storage.getAllSiteSettings();
      res.json(siteSettings);
    } catch (error) {
      console.error("Error fetching site settings:", error);
      res.status(500).json({ message: "Failed to fetch site settings" });
    }
  });

  app.post("/api/admin/site-settings", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertSiteSettingsSchema.parse(req.body);
      const siteSettings = await storage.createSiteSettings(validatedData);
      res.status(201).json(siteSettings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid site settings data", errors: error.errors });
      } else {
        console.error("Error creating site settings:", error);
        res.status(500).json({ message: "Failed to create site settings" });
      }
    }
  });

  app.put("/api/admin/site-settings/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSiteSettingsSchema.parse(req.body);
      const siteSettings = await storage.updateSiteSettings(id, validatedData);
      res.json(siteSettings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid site settings data", errors: error.errors });
      } else {
        console.error("Error updating site settings:", error);
        res.status(500).json({ message: "Failed to update site settings" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
