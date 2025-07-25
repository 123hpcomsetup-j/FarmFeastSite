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
  visitorSessions,
  pageViews,
  analyticsEvents,
  chatSessions,
  chatMessages,
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
  type InsertContactMessage,
  type VisitorSession,
  type InsertVisitorSession,
  type PageView,
  type InsertPageView,
  type AnalyticsEvent,
  type InsertAnalyticsEvent,
  type ChatSession,
  type InsertChatSession,
  type ChatMessage,
  type InsertChatMessage
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

  // Analytics
  createVisitorSession(session: InsertVisitorSession): Promise<VisitorSession>;
  getVisitorSession(sessionId: string): Promise<VisitorSession | undefined>;
  updateVisitorSession(sessionId: string, updates: Partial<VisitorSession>): Promise<VisitorSession | undefined>;
  getActiveVisitorSessions(): Promise<VisitorSession[]>;
  createPageView(pageView: InsertPageView): Promise<PageView>;
  getPageViewsBySession(sessionId: string): Promise<PageView[]>;
  createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  getAnalyticsOverview(days?: number): Promise<{
    totalVisitors: number;
    uniqueVisitors: number;
    totalPageViews: number;
    averageSessionDuration: number;
    topPages: { page: string; views: number }[];
    deviceBreakdown: { device: string; count: number }[];
    visitorsByHour: { hour: number; visitors: number }[];
  }>;
  getRealtimeVisitors(): Promise<{
    activeVisitors: number;
    sessionsLast30Min: VisitorSession[];
    currentPageViews: { page: string; visitors: number }[];
  }>;

  // Live Chat methods
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(id: number): Promise<ChatSession | undefined>;
  getChatSessionByVisitorId(visitorSessionId: string): Promise<ChatSession | undefined>;
  updateChatSession(id: number, updates: Partial<ChatSession>): Promise<ChatSession | undefined>;
  getActiveChatSessions(adminId?: number): Promise<ChatSession[]>;
  getAllChatSessions(): Promise<ChatSession[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(chatSessionId: number): Promise<ChatMessage[]>;
  markMessagesAsRead(chatSessionId: number, senderType: string): Promise<void>;
  getUnreadMessageCount(chatSessionId: number, senderType: string): Promise<number>;
}

// Response cache for faster API responses
const responseCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Helper function for cached database queries
function getCachedResult<T>(cacheKey: string, ttlMs: number = 5 * 60 * 1000): T | null {
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data as T;
  }
  return null;
}

function setCachedResult<T>(cacheKey: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
  responseCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs
  });
}

// Database Storage Implementation with caching
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
    const cacheKey = 'all_services';
    const cached = getCachedResult<Service[]>(cacheKey, 10 * 60 * 1000); // 10 minutes cache
    if (cached) {
      return cached;
    }

    const result = await this.db.select().from(services).orderBy(services.id);
    setCachedResult(cacheKey, result, 10 * 60 * 1000);
    return result;
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

  async updateSeoSettings(id: number, settings: Partial<InsertSeoSettings>): Promise<SeoSettings | undefined> {
    const [updatedSettings] = await this.db
      .update(seoSettings)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(seoSettings.id, id))
      .returning();
    return updatedSettings;
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

  // Analytics Methods
  async createVisitorSession(session: InsertVisitorSession): Promise<VisitorSession> {
    const [newSession] = await this.db.insert(visitorSessions).values(session).returning();
    return newSession;
  }

  async getVisitorSession(sessionId: string): Promise<VisitorSession | undefined> {
    const [session] = await this.db.select().from(visitorSessions).where(eq(visitorSessions.sessionId, sessionId));
    return session;
  }

  async updateVisitorSession(sessionId: string, updates: Partial<VisitorSession>): Promise<VisitorSession | undefined> {
    const [updatedSession] = await this.db
      .update(visitorSessions)
      .set({ ...updates, lastActiveAt: new Date() })
      .where(eq(visitorSessions.sessionId, sessionId))
      .returning();
    return updatedSession;
  }

  async getActiveVisitorSessions(): Promise<VisitorSession[]> {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    return await this.db
      .select()
      .from(visitorSessions)
      .where(and(
        eq(visitorSessions.isActive, true),
        gt(visitorSessions.lastActiveAt, thirtyMinutesAgo)
      ));
  }

  async createPageView(pageView: InsertPageView): Promise<PageView> {
    const [newPageView] = await this.db.insert(pageViews).values(pageView).returning();
    return newPageView;
  }

  async getPageViewsBySession(sessionId: string): Promise<PageView[]> {
    return await this.db.select().from(pageViews).where(eq(pageViews.sessionId, sessionId));
  }

  async createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const [newEvent] = await this.db.insert(analyticsEvents).values(event).returning();
    return newEvent;
  }

  async getAnalyticsOverview(days: number = 30): Promise<{
    totalVisitors: number;
    uniqueVisitors: number;
    totalPageViews: number;
    averageSessionDuration: number;
    topPages: { page: string; views: number }[];
    deviceBreakdown: { device: string; count: number }[];
    visitorsByHour: { hour: number; visitors: number }[];
  }> {
    const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // Get basic stats
    const totalVisitors = (await this.db
      .select({ count: sql`count(*)` })
      .from(visitorSessions)
      .where(gt(visitorSessions.createdAt, daysAgo)))[0]?.count || 0;

    const totalPageViews = (await this.db
      .select({ count: sql`count(*)` })
      .from(pageViews)
      .where(gt(pageViews.createdAt, daysAgo)))[0]?.count || 0;

    // Get top pages
    const topPages = await this.db
      .select({
        page: pageViews.page,
        views: sql`count(*)`
      })
      .from(pageViews)
      .where(gt(pageViews.createdAt, daysAgo))
      .groupBy(pageViews.page)
      .orderBy(sql`count(*) desc`)
      .limit(5);

    // Get device breakdown
    const deviceBreakdown = await this.db
      .select({
        device: visitorSessions.device,
        count: sql`count(*)`
      })
      .from(visitorSessions)
      .where(gt(visitorSessions.createdAt, daysAgo))
      .groupBy(visitorSessions.device);

    // Get visitors by hour (last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const visitorsByHour = await this.db
      .select({
        hour: sql`extract(hour from ${visitorSessions.createdAt})`,
        visitors: sql`count(*)`
      })
      .from(visitorSessions)
      .where(gt(visitorSessions.createdAt, last24Hours))
      .groupBy(sql`extract(hour from ${visitorSessions.createdAt})`);

    return {
      totalVisitors: parseInt(totalVisitors as string) || 0,
      uniqueVisitors: parseInt(totalVisitors as string) || 0, // Same as total for now
      totalPageViews: parseInt(totalPageViews as string) || 0,
      averageSessionDuration: 0, // TODO: Calculate from page views
      topPages: topPages.map((p: any) => ({ page: p.page, views: parseInt(p.views as string) || 0 })),
      deviceBreakdown: deviceBreakdown.map((d: any) => ({ device: d.device || 'unknown', count: parseInt(d.count as string) || 0 })),
      visitorsByHour: visitorsByHour.map((v: any) => ({ hour: parseInt(v.hour as string) || 0, visitors: parseInt(v.visitors as string) || 0 }))
    };
  }

  async getRealtimeVisitors(): Promise<{
    activeVisitors: number;
    onlineVisitors: number;
    visitors: any[];
    lastUpdated: string;
    currentPageViews: { page: string; visitors: number }[];
  }> {
    try {
      // Consider visitors active if they were active in the last 2 minutes (real-time)
      const cutoffTime = new Date(Date.now() - 2 * 60 * 1000);
      
      const activeVisitors = await this.db
        .select({
          id: visitorSessions.id,
          sessionId: visitorSessions.sessionId,
          device: visitorSessions.device,
          browser: visitorSessions.browser,
          currentPage: visitorSessions.currentPage,
          lastActiveAt: visitorSessions.lastActiveAt,
          startedAt: visitorSessions.startedAt,
          userAgent: visitorSessions.userAgent
        })
        .from(visitorSessions)
        .where(gte(visitorSessions.lastActiveAt, cutoffTime))
        .orderBy(desc(visitorSessions.lastActiveAt));

      // Get current page views for active visitors
      const activeSessions = activeVisitors.map(v => v.sessionId);
      let currentPageViews = [];
      
      if (activeSessions.length > 0) {
        currentPageViews = await this.db
          .select({
            sessionId: pageViews.sessionId,
            page: pageViews.page,
            viewedAt: pageViews.viewedAt
          })
          .from(pageViews)
          .where(and(
            inArray(pageViews.sessionId, activeSessions),
            gte(pageViews.viewedAt, cutoffTime)
          ))
          .orderBy(desc(pageViews.viewedAt));
      }

      // Enhanced visitor data with current activity
      const enhancedVisitors = activeVisitors.map(visitor => {
        const recentPages = currentPageViews
          .filter(pv => pv.sessionId === visitor.sessionId)
          .slice(0, 3); // Last 3 pages
        
        const sessionDuration = Math.floor(
          (visitor.lastActiveAt.getTime() - visitor.startedAt.getTime()) / 1000
        );

        return {
          ...visitor,
          sessionDuration,
          recentPages,
          isActive: (Date.now() - visitor.lastActiveAt.getTime()) < 60000, // Active in last minute
          status: (Date.now() - visitor.lastActiveAt.getTime()) < 30000 ? 'online' : 'away'
        };
      });

      // Page views summary
      const pageViewsSummary = await this.db
        .select({
          page: pageViews.page,
          visitors: sql`count(distinct ${pageViews.sessionId})`
        })
        .from(pageViews)
        .where(gte(pageViews.createdAt, cutoffTime))
        .groupBy(pageViews.page);

      return {
        activeVisitors: enhancedVisitors.length,
        onlineVisitors: enhancedVisitors.filter(v => v.status === 'online').length,
        visitors: enhancedVisitors,
        lastUpdated: new Date().toISOString(),
        currentPageViews: pageViewsSummary.map((p: any) => ({ 
          page: p.page, 
          visitors: parseInt(p.visitors as string) || 0 
        }))
      };
    } catch (error) {
      console.error('Error fetching real-time visitors:', error);
      return { 
        activeVisitors: 0, 
        onlineVisitors: 0, 
        visitors: [], 
        lastUpdated: new Date().toISOString(),
        currentPageViews: []
      };
    }
  }

  // Live Chat methods
  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const [newSession] = await this.db.insert(chatSessions).values(session).returning();
    return newSession;
  }

  async getChatSession(id: number): Promise<ChatSession | undefined> {
    const [session] = await this.db.select().from(chatSessions).where(eq(chatSessions.id, id));
    return session;
  }

  async getChatSessionByVisitorId(visitorSessionId: string): Promise<ChatSession | undefined> {
    const [session] = await this.db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.visitorSessionId, visitorSessionId))
      .orderBy(desc(chatSessions.startedAt));
    return session;
  }

  async updateChatSession(id: number, updates: Partial<ChatSession>): Promise<ChatSession | undefined> {
    const [updatedSession] = await this.db
      .update(chatSessions)
      .set(updates)
      .where(eq(chatSessions.id, id))
      .returning();
    return updatedSession;
  }

  async getActiveChatSessions(adminId?: number): Promise<ChatSession[]> {
    const baseQuery = this.db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.status, "active"));

    if (adminId) {
      return await baseQuery.where(eq(chatSessions.adminId, adminId));
    }
    
    return await baseQuery.orderBy(desc(chatSessions.lastMessageAt));
  }

  async getAllChatSessions(): Promise<ChatSession[]> {
    return await this.db.select().from(chatSessions).orderBy(desc(chatSessions.startedAt));
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await this.db.insert(chatMessages).values(message).returning();
    
    // Update last message time in chat session
    await this.db
      .update(chatSessions)
      .set({ lastMessageAt: new Date() })
      .where(eq(chatSessions.id, message.chatSessionId));
    
    return newMessage;
  }

  async getChatMessages(chatSessionId: number): Promise<ChatMessage[]> {
    return await this.db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.chatSessionId, chatSessionId))
      .orderBy(chatMessages.createdAt);
  }

  async markMessagesAsRead(chatSessionId: number, senderType: string): Promise<void> {
    await this.db
      .update(chatMessages)
      .set({ isRead: true })
      .where(and(
        eq(chatMessages.chatSessionId, chatSessionId),
        eq(chatMessages.senderType, senderType === "admin" ? "visitor" : "admin")
      ));
  }

  async getUnreadMessageCount(chatSessionId: number, senderType: string): Promise<number> {
    const result = await this.db
      .select({ count: sql`count(*)` })
      .from(chatMessages)
      .where(and(
        eq(chatMessages.chatSessionId, chatSessionId),
        eq(chatMessages.senderType, senderType === "admin" ? "visitor" : "admin"),
        eq(chatMessages.isRead, false)
      ));
    
    return parseInt(result[0]?.count as string) || 0;
  }
}

// Import database connection
import { db } from "./db";
import { eq, and, sql, gt, desc } from "drizzle-orm";

export const storage = new DatabaseStorage(db);