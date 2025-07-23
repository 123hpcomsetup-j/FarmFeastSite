import { pgTable, text, serial, integer, boolean, timestamp, json, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  contactNumber: text("contact_number").notNull(),
  email: text("email"),
  checkinDate: text("checkin_date").notNull(),
  checkoutDate: text("checkout_date").notNull(),
  guestCount: integer("guest_count").notNull(),
  checkinTime: text("checkin_time").notNull(),
  checkoutTime: text("checkout_time"),
  selectedServices: json("selected_services").$type<string[]>().default([]),
  couponCode: text("coupon_code"),
  specialRequests: text("special_requests"),
  basePrice: integer("base_price").notNull(),
  servicesPrice: integer("services_price").default(0),
  discountAmount: integer("discount_amount").default(0),
  finalTotal: integer("final_total").notNull(),
  status: text("status").default("pending"), // pending, confirmed, cancelled, completed
  confirmationCode: text("confirmation_code").unique(),
  confirmedAt: timestamp("confirmed_at"),
  emailSent: boolean("email_sent").default(false),
  reminderSent: boolean("reminder_sent").default(false),
  cancelledAt: timestamp("cancelled_at"),
  cancellationReason: text("cancellation_reason"),
  // Payment fields
  paymentStatus: text("payment_status").default("pending"), // pending, paid, verified, failed
  upiTransactionId: text("upi_transaction_id"), // UTR number
  paymentVerifiedAt: timestamp("payment_verified_at"),
  paymentNotes: text("payment_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  icon: text("icon"),
  category: text("category"),
  active: boolean("active").default(true),
});

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  type: text("type").notNull(), // percentage, fixed
  value: integer("value").notNull(),
  minAmount: integer("min_amount").default(0),
  maxDiscount: integer("max_discount"),
  active: boolean("active").default(true),
  expiryDate: text("expiry_date"),
});

// Admin user table
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("admin"),
  createdAt: timestamp("created_at").defaultNow(),
});

// SEO settings table
export const seoSettings = pgTable("seo_settings", {
  id: serial("id").primaryKey(),
  page: text("page").notNull().unique(), // home, services, gallery, booking
  title: text("title").notNull(),
  description: text("description").notNull(),
  keywords: text("keywords"),
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogImage: text("og_image"),
  canonicalUrl: text("canonical_url"),
  score: integer("score").default(0),
  ranking: integer("ranking").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews management for SEO snippets
export const reviewSettings = pgTable("review_settings", {
  id: serial("id").primaryKey(),
  reviewCount: integer("review_count").notNull().default(0),
  averageRating: varchar("average_rating").notNull().default("0.0"), // Using varchar for precise decimal control
  businessName: text("business_name").notNull().default("Farm Feast Farm House"),
  ratingScale: text("rating_scale").notNull().default("5"), // Maximum rating (1-5 stars)
  reviewsEnabled: boolean("reviews_enabled").default(true),
  showInSnippets: boolean("show_in_snippets").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Gallery images table
export const galleryImages = pgTable("gallery_images", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  alt: text("alt").notNull(),
  category: text("category").notNull(),
  url: text("url").notNull(),
  order: integer("order").default(0),
  active: boolean("active").default(true),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Site settings table
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  type: text("type").default("text"), // text, number, boolean, json
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Amenities table
export const amenities = pgTable("amenities", {
  id: serial("id").primaryKey(),
  icon: text("icon").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  color: text("color").default("bg-blue-50 text-blue-600"),
  order: integer("order").default(0),
  active: boolean("active").default(true),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});

export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
});

export const insertSeoSettingsSchema = createInsertSchema(seoSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertReviewSettingsSchema = createInsertSchema(reviewSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertGalleryImageSchema = createInsertSchema(galleryImages).omit({
  id: true,
  uploadedAt: true,
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertAmenitySchema = createInsertSchema(amenities).omit({
  id: true,
});

// Admin login schema
export const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type SeoSettings = typeof seoSettings.$inferSelect;
export type InsertSeoSettings = z.infer<typeof insertSeoSettingsSchema>;
export type ReviewSettings = typeof reviewSettings.$inferSelect;
export type InsertReviewSettings = z.infer<typeof insertReviewSettingsSchema>;
export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryImage = z.infer<typeof insertGalleryImageSchema>;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type Amenity = typeof amenities.$inferSelect;
export type InsertAmenity = z.infer<typeof insertAmenitySchema>;
export type AdminLogin = z.infer<typeof adminLoginSchema>;
