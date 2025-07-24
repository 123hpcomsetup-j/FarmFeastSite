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

// SEO settings table with integrated review management
export const seoSettings = pgTable("seo_settings", {
  id: serial("id").primaryKey(),
  page: text("page").notNull().unique(), // home, services, gallery, booking, privacy-policy, terms-conditions, etc.
  title: text("title").notNull(),
  description: text("description").notNull(),
  keywords: text("keywords"),
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogImage: text("og_image"),
  canonicalUrl: text("canonical_url"),
  schemaType: text("schema_type").default("WebPage"), // WebPage, Article, Service, LodgingBusiness
  schemaData: json("schema_data").$type<Record<string, any>>(),
  priority: integer("priority").default(50), // 0-100 priority scale
  changeFreq: text("change_freq").default("monthly"),
  noindex: boolean("noindex").default(false),
  nofollow: boolean("nofollow").default(false),
  score: integer("score").default(0),
  ranking: integer("ranking").default(0),
  // Integrated review fields for dynamic SEO optimization
  reviewCount: integer("review_count").default(0),
  averageRating: varchar("average_rating").default("0.0"),
  businessName: text("business_name").default("Farm Feast Farm House"),
  ratingScale: text("rating_scale").default("5"),
  reviewsEnabled: boolean("reviews_enabled").default(true),
  showInSnippets: boolean("show_in_snippets").default(true),
  reviewTitle: text("review_title"), // Dynamic review title for SEO
  reviewDescription: text("review_description"), // Dynamic review description
  reviewKeywords: text("review_keywords"), // Dynamic review keywords
  // Individual review snippets for rich search results
  reviewSnippet1Author: text("review_snippet_1_author").default("Kinididoddi Pradeep"),
  reviewSnippet1Date: text("review_snippet_1_date").default("2025-07-23"),
  reviewSnippet1Rating: text("review_snippet_1_rating").default("5"),
  reviewSnippet1Body: text("review_snippet_1_body").default("Awesome! It's very good and perfectly suited for couples and families. ❤️💯"),
  reviewSnippet2Author: text("review_snippet_2_author").default("Ravi Kumar"),
  reviewSnippet2Date: text("review_snippet_2_date").default("2025-07-21"),
  reviewSnippet2Rating: text("review_snippet_2_rating").default("5"),
  reviewSnippet2Body: text("review_snippet_2_body").default("Great place for a peaceful weekend. The pool and garden area were beautifully maintained!"),
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
  filename: text("filename"), // Optional for URL-based images
  alt: text("alt").notNull(),
  category: text("category").notNull(),
  url: text("url").notNull(),
  source: text("source").default("upload"), // 'upload' or 'url'
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

// Blog posts table
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  featuredImage: text("featured_image"),
  author: text("author").default("Farm Feast Team"),
  status: text("status").default("draft"), // draft, published, archived
  tags: json("tags").$type<string[]>().default([]),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  readTime: integer("read_time").default(5),
  viewCount: integer("view_count").default(0),
  featured: boolean("featured").default(false),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contact messages table
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  message: text("message").notNull(),
  status: text("status").default("new"), // new, read, replied, closed
  replied: boolean("replied").default(false),
  replyMessage: text("reply_message"),
  repliedAt: timestamp("replied_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  confirmationCode: true,
  confirmedAt: true,
  emailSent: true,
  reminderSent: true,
  cancelledAt: true,
  cancellationReason: true,
  paymentStatus: true,
  upiTransactionId: true,
  paymentVerifiedAt: true,
  paymentNotes: true,
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
  score: true,
  ranking: true,
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

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
});

// Dynamic content management for all static text
export const dynamicContent = pgTable("dynamic_content", {
  id: serial("id").primaryKey(),
  identifier: text("identifier").notNull().unique(), // unique identifier like "hero_title", "services_subtitle"
  content: text("content").notNull(),
  contentType: text("content_type").default("text"), // text, html, markdown
  description: text("description"), // admin description of what this content is for
  category: text("category").default("general"), // general, hero, services, gallery, footer, etc.
  page: text("page").default("home"), // home, services, gallery, about, etc.
  editable: boolean("editable").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Analytics and visitor tracking tables
export const visitorSessions = pgTable("visitor_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  fingerprint: text("fingerprint"), // browser fingerprint for tracking
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  country: text("country"),
  city: text("city"),
  device: text("device"), // mobile, desktop, tablet
  browser: text("browser"),
  os: text("os"),
  referrer: text("referrer"),
  landingPage: text("landing_page"),
  isActive: boolean("is_active").default(true),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  page: text("page").notNull(),
  url: text("url").notNull(),
  title: text("title"),
  timeOnPage: integer("time_on_page"), // seconds
  scrollDepth: integer("scroll_depth"), // percentage
  exitPage: boolean("exit_page").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  eventType: text("event_type").notNull(), // click, form_submit, scroll, download, etc.
  eventCategory: text("event_category"), // navigation, form, social, etc.
  eventAction: text("event_action"), // button_click, form_submit, etc.
  eventLabel: text("event_label"), // specific element or identifier
  value: integer("value"), // numeric value if applicable
  metadata: json("metadata"), // additional event data
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  status: true,
  replied: true,
  replyMessage: true,
  repliedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDynamicContentSchema = createInsertSchema(dynamicContent).omit({
  id: true,
  updatedAt: true,
});

// Admin login schema
export const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const insertVisitorSessionSchema = createInsertSchema(visitorSessions).omit({
  id: true,
  createdAt: true,
  lastActiveAt: true,
});

export const insertPageViewSchema = createInsertSchema(pageViews).omit({
  id: true,
  createdAt: true,
});

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({
  id: true,
  createdAt: true,
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Coupon = typeof coupons.$inferSelect;
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
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type DynamicContent = typeof dynamicContent.$inferSelect;
export type InsertDynamicContent = z.infer<typeof insertDynamicContentSchema>;
export type VisitorSession = typeof visitorSessions.$inferSelect;
export type InsertVisitorSession = z.infer<typeof insertVisitorSessionSchema>;
export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = z.infer<typeof insertPageViewSchema>;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;

// Homepage Images table
export const homepageImages = pgTable("homepage_images", {
  id: serial("id").primaryKey(),
  section: varchar("section", { length: 50 }).notNull(), // hero, amenities, gallery, etc.
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  altText: varchar("alt_text", { length: 200 }),
  order: integer("order").default(0),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertHomepageImageSchema = createInsertSchema(homepageImages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertHomepageImage = z.infer<typeof insertHomepageImageSchema>;
export type HomepageImage = typeof homepageImages.$inferSelect;

// Custom Scripts table for chatbots, analytics, etc.
export const customScripts = pgTable("custom_scripts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  script: text("script").notNull(),
  location: varchar("location", { length: 20 }).notNull(), // head, body_start, body_end
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCustomScriptSchema = createInsertSchema(customScripts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCustomScript = z.infer<typeof insertCustomScriptSchema>;
export type CustomScript = typeof customScripts.$inferSelect;