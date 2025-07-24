import { 
  bookings, 
  services, 
  coupons, 
  adminUsers,
  seoSettings,
  reviewSettings,
  galleryImages,
  siteSettings,
  amenities,
  blogPosts,
  homepageImages,
  customScripts,
  contactMessages,
  type Booking, 
  type Service, 
  type Coupon, 
  type InsertBooking, 
  type InsertService, 
  type InsertCoupon,
  type AdminUser,
  type InsertAdminUser,
  type SeoSettings,
  type InsertSeoSettings,
  type ReviewSettings,
  type InsertReviewSettings,
  type GalleryImage,
  type InsertGalleryImage,
  type SiteSettings,
  type InsertSiteSettings,
  type Amenity,
  type InsertAmenity,
  type BlogPost,
  type InsertBlogPost,
  type HomepageImage,
  type InsertHomepageImage,
  type CustomScript,
  type InsertCustomScript,
  type ContactMessage,
  type InsertContactMessage
} from "@shared/schema";

export interface IStorage {
  // Bookings
  getAllBookings(): Promise<Booking[]>;
  getBookingById(id: number): Promise<Booking | undefined>;
  getBookingByConfirmationCode(code: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<Booking>): Promise<Booking | undefined>;
  deleteBooking(id: number): Promise<boolean>;
  updateBookingPaymentStatus(id: number, status: string, utrNumber?: string, notes?: string): Promise<boolean>;
  
  // Services
  getAllServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
  
  // Coupons
  getAllCoupons(): Promise<Coupon[]>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: number, coupon: Partial<InsertCoupon>): Promise<Coupon | undefined>;
  deleteCoupon(id: number): Promise<boolean>;

  // Admin Users
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;

  // SEO Settings
  getSeoSettingsByPage(page: string): Promise<SeoSettings | undefined>;
  getAllSeoSettings(): Promise<SeoSettings[]>;
  upsertSeoSettings(settings: InsertSeoSettings): Promise<SeoSettings>;

  // Review Settings
  getReviewSettings(): Promise<ReviewSettings | undefined>;
  upsertReviewSettings(settings: InsertReviewSettings): Promise<ReviewSettings>;

  // Gallery Images
  getAllGalleryImages(): Promise<GalleryImage[]>;
  getGalleryImagesByCategory(category: string): Promise<GalleryImage[]>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  updateGalleryImage(id: number, image: Partial<InsertGalleryImage>): Promise<GalleryImage | undefined>;
  deleteGalleryImage(id: number): Promise<boolean>;

  // Site Settings
  getAllSiteSettings(): Promise<SiteSettings[]>;
  getSiteSettingByKey(key: string): Promise<SiteSettings | undefined>;
  createSiteSetting(setting: InsertSiteSettings): Promise<SiteSettings>;
  updateSiteSettings(id: number, setting: Partial<InsertSiteSettings>): Promise<SiteSettings | undefined>;
  upsertSiteSettings(setting: InsertSiteSettings): Promise<SiteSettings>;
  deleteSiteSetting(id: number): Promise<boolean>;

  // Amenities
  getAllAmenities(): Promise<Amenity[]>;
  createAmenity(amenity: InsertAmenity): Promise<Amenity>;
  updateAmenity(id: number, amenity: Partial<InsertAmenity>): Promise<Amenity | undefined>;
  deleteAmenity(id: number): Promise<boolean>;

  // Blog Posts
  getAllBlogPosts(): Promise<BlogPost[]>;
  getBlogPostById(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
  getPublishedBlogPosts(): Promise<BlogPost[]>;

  // Homepage Images
  getAllHomepageImages(): Promise<HomepageImage[]>;
  getHomepageImagesBySection(section: string): Promise<HomepageImage[]>;
  createHomepageImage(image: InsertHomepageImage): Promise<HomepageImage>;
  updateHomepageImage(id: number, image: Partial<InsertHomepageImage>): Promise<HomepageImage | undefined>;
  deleteHomepageImage(id: number): Promise<boolean>;

  // Custom Scripts
  getAllCustomScripts(): Promise<CustomScript[]>;
  getCustomScriptById(id: number): Promise<CustomScript | undefined>;
  createCustomScript(script: InsertCustomScript): Promise<CustomScript>;
  updateCustomScript(id: number, script: Partial<InsertCustomScript>): Promise<CustomScript | undefined>;
  deleteCustomScript(id: number): Promise<boolean>;
  getActiveCustomScripts(): Promise<CustomScript[]>;
  
  // Contact Messages
  getAllContactMessages(): Promise<ContactMessage[]>;
  getContactMessageById(id: number): Promise<ContactMessage | undefined>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  updateContactMessage(id: number, message: Partial<ContactMessage>): Promise<ContactMessage | undefined>;
  deleteContactMessage(id: number): Promise<boolean>;
  markContactMessageAsRead(id: number): Promise<boolean>;
}

// Database Storage Implementation
class DatabaseStorage implements IStorage {
  constructor(private db: any) {}

  // Bookings
  async getAllBookings(): Promise<Booking[]> {
    return await this.db.select().from(bookings).orderBy(bookings.createdAt);
  }

  async getBookingById(id: number): Promise<Booking | undefined> {
    const [booking] = await this.db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingByConfirmationCode(code: string): Promise<Booking | undefined> {
    const [booking] = await this.db.select().from(bookings).where(eq(bookings.confirmationCode, code));
    return booking;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    // Generate unique confirmation code
    const confirmationCode = await this.generateUniqueConfirmationCode();
    const bookingWithCode = {
      ...booking,
      confirmationCode,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const [newBooking] = await this.db.insert(bookings).values(bookingWithCode).returning();
    return newBooking;
  }

  private async generateUniqueConfirmationCode(): Promise<string> {
    let code: string;
    let isUnique = false;
    
    while (!isUnique) {
      // Generate code in format: BK + 6 digit random number
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      code = `BK${randomNum}`;
      
      // Check if code already exists
      const existingBooking = await this.getBookingByConfirmationCode(code);
      isUnique = !existingBooking;
    }
    
    return code!;
  }

  async updateBooking(id: number, booking: Partial<Booking>): Promise<Booking | undefined> {
    const [updatedBooking] = await this.db
      .update(bookings)
      .set({ ...booking, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  async deleteBooking(id: number): Promise<boolean> {
    const result = await this.db.delete(bookings).where(eq(bookings.id, id));
    return result.rowCount > 0;
  }

  async updateBookingPaymentStatus(id: number, status: string, utrNumber?: string, notes?: string): Promise<boolean> {
    const updateData: any = { paymentStatus: status, updatedAt: new Date() };
    if (utrNumber) updateData.upiTransactionId = utrNumber;
    if (notes) updateData.paymentNotes = notes;
    if (status === 'paid') updateData.paymentVerifiedAt = new Date();

    const result = await this.db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, id));
    return result.rowCount > 0;
  }

  // Services
  async getAllServices(): Promise<Service[]> {
    return await this.db.select().from(services).orderBy(services.id);
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await this.db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined> {
    const [updatedService] = await this.db
      .update(services)
      .set(service)
      .where(eq(services.id, id))
      .returning();
    return updatedService;
  }

  async deleteService(id: number): Promise<boolean> {
    const result = await this.db.delete(services).where(eq(services.id, id));
    return result.rowCount > 0;
  }

  // Coupons
  async getAllCoupons(): Promise<Coupon[]> {
    return await this.db.select().from(coupons);
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [coupon] = await this.db.select().from(coupons).where(eq(coupons.code, code));
    return coupon;
  }

  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const [newCoupon] = await this.db.insert(coupons).values(coupon).returning();
    return newCoupon;
  }

  async updateCoupon(id: number, coupon: Partial<InsertCoupon>): Promise<Coupon | undefined> {
    const [updatedCoupon] = await this.db
      .update(coupons)
      .set(coupon)
      .where(eq(coupons.id, id))
      .returning();
    return updatedCoupon;
  }

  async deleteCoupon(id: number): Promise<boolean> {
    const result = await this.db.delete(coupons).where(eq(coupons.id, id));
    return result.rowCount > 0;
  }

  // Admin Users
  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const [admin] = await this.db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return admin;
  }

  async createAdminUser(user: InsertAdminUser): Promise<AdminUser> {
    const [newAdmin] = await this.db.insert(adminUsers).values(user).returning();
    return newAdmin;
  }

  // SEO Settings
  async getSeoSettingsByPage(page: string): Promise<SeoSettings | undefined> {
    const [settings] = await this.db.select().from(seoSettings).where(eq(seoSettings.page, page));
    return settings;
  }

  async getAllSeoSettings(): Promise<SeoSettings[]> {
    return await this.db.select().from(seoSettings);
  }

  async upsertSeoSettings(settings: InsertSeoSettings): Promise<SeoSettings> {
    const existingSettings = await this.getSeoSettingsByPage(settings.page);
    
    if (existingSettings) {
      const [updated] = await this.db
        .update(seoSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(seoSettings.page, settings.page))
        .returning();
      return updated;
    } else {
      const [created] = await this.db.insert(seoSettings).values(settings).returning();
      return created;
    }
  }

  // Review Settings
  async getReviewSettings(): Promise<ReviewSettings | undefined> {
    const [settings] = await this.db.select().from(reviewSettings).limit(1);
    return settings;
  }

  async upsertReviewSettings(settings: InsertReviewSettings): Promise<ReviewSettings> {
    const existingSettings = await this.getReviewSettings();
    
    if (existingSettings) {
      const [updated] = await this.db
        .update(reviewSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(reviewSettings.id, existingSettings.id))
        .returning();
      return updated;
    } else {
      const [created] = await this.db.insert(reviewSettings).values(settings).returning();
      return created;
    }
  }

  // Gallery Images
  async getAllGalleryImages(): Promise<GalleryImage[]> {
    return await this.db.select().from(galleryImages).orderBy(galleryImages.id);
  }

  async getGalleryImagesByCategory(category: string): Promise<GalleryImage[]> {
    return await this.db
      .select()
      .from(galleryImages)
      .where(and(eq(galleryImages.category, category), eq(galleryImages.active, true)))
      .orderBy(galleryImages.id);
  }

  async createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    const [newImage] = await this.db.insert(galleryImages).values(image).returning();
    return newImage;
  }

  async updateGalleryImage(id: number, image: Partial<InsertGalleryImage>): Promise<GalleryImage | undefined> {
    const [updatedImage] = await this.db
      .update(galleryImages)
      .set(image)
      .where(eq(galleryImages.id, id))
      .returning();
    return updatedImage;
  }

  async deleteGalleryImage(id: number): Promise<boolean> {
    const result = await this.db.delete(galleryImages).where(eq(galleryImages.id, id));
    return result.rowCount > 0;
  }

  // Site Settings
  async getAllSiteSettings(): Promise<SiteSettings[]> {
    return await this.db.select().from(siteSettings).orderBy(siteSettings.key);
  }

  async getSiteSettingByKey(key: string): Promise<SiteSettings | undefined> {
    const [setting] = await this.db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting;
  }

  async createSiteSetting(setting: InsertSiteSettings): Promise<SiteSettings> {
    const [newSetting] = await this.db.insert(siteSettings).values(setting).returning();
    return newSetting;
  }

  async updateSiteSettings(id: number, setting: Partial<InsertSiteSettings>): Promise<SiteSettings | undefined> {
    const [updatedSetting] = await this.db
      .update(siteSettings)
      .set({ ...setting, updatedAt: new Date() })
      .where(eq(siteSettings.id, id))
      .returning();
    return updatedSetting;
  }

  async upsertSiteSettings(setting: InsertSiteSettings): Promise<SiteSettings> {
    const existingSetting = await this.getSiteSettingByKey(setting.key);
    
    if (existingSetting) {
      const [updated] = await this.db
        .update(siteSettings)
        .set({ ...setting, updatedAt: new Date() })
        .where(eq(siteSettings.key, setting.key))
        .returning();
      return updated;
    } else {
      const [created] = await this.db.insert(siteSettings).values(setting).returning();
      return created;
    }
  }

  async deleteSiteSetting(id: number): Promise<boolean> {
    const result = await this.db.delete(siteSettings).where(eq(siteSettings.id, id));
    return result.rowCount > 0;
  }

  // Amenities
  async getAllAmenities(): Promise<Amenity[]> {
    return await this.db.select().from(amenities).orderBy(amenities.id);
  }

  async createAmenity(amenity: InsertAmenity): Promise<Amenity> {
    const [newAmenity] = await this.db.insert(amenities).values(amenity).returning();
    return newAmenity;
  }

  async updateAmenity(id: number, amenity: Partial<InsertAmenity>): Promise<Amenity | undefined> {
    const [updatedAmenity] = await this.db
      .update(amenities)
      .set(amenity)
      .where(eq(amenities.id, id))
      .returning();
    return updatedAmenity;
  }

  async deleteAmenity(id: number): Promise<boolean> {
    const result = await this.db.delete(amenities).where(eq(amenities.id, id));
    return result.rowCount > 0;
  }

  // Blog Posts
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return await this.db.select().from(blogPosts).orderBy(blogPosts.createdAt);
  }

  async getBlogPostById(id: number): Promise<BlogPost | undefined> {
    const [post] = await this.db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await this.db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [newPost] = await this.db.insert(blogPosts).values(post).returning();
    return newPost;
  }

  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const [updatedPost] = await this.db
      .update(blogPosts)
      .set({ ...post, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return updatedPost;
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    const result = await this.db.delete(blogPosts).where(eq(blogPosts.id, id));
    return result.rowCount > 0;
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return await this.db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"))
      .orderBy(blogPosts.publishedAt);
  }

  // Homepage Images
  async getAllHomepageImages(): Promise<HomepageImage[]> {
    return await this.db.select().from(homepageImages).orderBy(homepageImages.order);
  }

  async getHomepageImagesBySection(section: string): Promise<HomepageImage[]> {
    return await this.db
      .select()
      .from(homepageImages)
      .where(and(eq(homepageImages.section, section), eq(homepageImages.active, true)))
      .orderBy(homepageImages.order);
  }

  async createHomepageImage(image: InsertHomepageImage): Promise<HomepageImage> {
    const [newImage] = await this.db.insert(homepageImages).values(image).returning();
    return newImage;
  }

  async updateHomepageImage(id: number, image: Partial<InsertHomepageImage>): Promise<HomepageImage | undefined> {
    const [updatedImage] = await this.db
      .update(homepageImages)
      .set({ ...image, updatedAt: new Date() })
      .where(eq(homepageImages.id, id))
      .returning();
    return updatedImage;
  }

  async deleteHomepageImage(id: number): Promise<boolean> {
    const result = await this.db.delete(homepageImages).where(eq(homepageImages.id, id));
    return result.rowCount > 0;
  }

  // Custom Scripts
  async getAllCustomScripts(): Promise<CustomScript[]> {
    return await this.db.select().from(customScripts).orderBy(customScripts.createdAt);
  }

  async getCustomScriptById(id: number): Promise<CustomScript | undefined> {
    const [script] = await this.db.select().from(customScripts).where(eq(customScripts.id, id));
    return script;
  }

  async createCustomScript(script: InsertCustomScript): Promise<CustomScript> {
    const [newScript] = await this.db.insert(customScripts).values(script).returning();
    return newScript;
  }

  async updateCustomScript(id: number, script: Partial<InsertCustomScript>): Promise<CustomScript | undefined> {
    const [updatedScript] = await this.db
      .update(customScripts)
      .set({ ...script, updatedAt: new Date() })
      .where(eq(customScripts.id, id))
      .returning();
    return updatedScript;
  }

  async deleteCustomScript(id: number): Promise<boolean> {
    const result = await this.db.delete(customScripts).where(eq(customScripts.id, id));
    return result.rowCount > 0;
  }

  async getActiveCustomScripts(): Promise<CustomScript[]> {
    return await this.db
      .select()
      .from(customScripts)
      .where(eq(customScripts.isActive, true))
      .orderBy(customScripts.createdAt);
  }

  // Contact Messages
  async getAllContactMessages(): Promise<ContactMessage[]> {
    return await this.db.select().from(contactMessages).orderBy(contactMessages.createdAt);
  }

  async getContactMessageById(id: number): Promise<ContactMessage | undefined> {
    const [message] = await this.db.select().from(contactMessages).where(eq(contactMessages.id, id));
    return message;
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await this.db.insert(contactMessages).values(message).returning();
    return newMessage;
  }

  async updateContactMessage(id: number, message: Partial<ContactMessage>): Promise<ContactMessage | undefined> {
    const [updatedMessage] = await this.db
      .update(contactMessages)
      .set({ ...message, updatedAt: new Date() })
      .where(eq(contactMessages.id, id))
      .returning();
    return updatedMessage;
  }

  async deleteContactMessage(id: number): Promise<boolean> {
    const result = await this.db.delete(contactMessages).where(eq(contactMessages.id, id));
    return result.rowCount > 0;
  }

  async markContactMessageAsRead(id: number): Promise<boolean> {
    const [updated] = await this.db
      .update(contactMessages)
      .set({ status: "read", updatedAt: new Date() })
      .where(eq(contactMessages.id, id))
      .returning();
    return !!updated;
  }
}

// Import database connection
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export const storage = new DatabaseStorage(db);