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
  type InsertBlogPost
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
  upsertSiteSettings(setting: InsertSiteSettings): Promise<SiteSettings>;
  
  // Amenities
  getAllAmenities(): Promise<Amenity[]>;
  createAmenity(amenity: InsertAmenity): Promise<Amenity>;
  updateAmenity(id: number, amenity: Partial<InsertAmenity>): Promise<Amenity | undefined>;
  deleteAmenity(id: number): Promise<boolean>;
  
  // Blog Posts
  getAllBlogPosts(): Promise<BlogPost[]>;
  getPublishedBlogPosts(): Promise<BlogPost[]>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private bookings: Booking[] = [
    {
      id: 1,
      fullName: "Anand Tiwari",
      contactNumber: "+91 9876543210",
      email: "anand@example.com",
      checkinDate: "2024-12-01",
      checkoutDate: "2024-12-03",
      guestCount: 4,
      checkinTime: "14:00",
      checkoutTime: "11:00",
      selectedServices: ["Pet Essentials", "Farm Tour"],
      couponCode: "",
      specialRequests: "Need extra towels",
      basePrice: 12000,
      servicesPrice: 3000,
      discountAmount: 0,
      finalTotal: 15000,
      status: "confirmed",
      confirmationCode: "FF240001",
      confirmedAt: new Date("2024-11-25T10:00:00Z"),
      emailSent: true,
      reminderSent: false,
      cancelledAt: null,
      cancellationReason: null,
      paymentStatus: "verified",
      upiTransactionId: "UTR123456789",
      paymentVerifiedAt: new Date("2024-11-25T11:00:00Z"),
      paymentNotes: "Payment verified via UPI",
      createdAt: new Date("2024-11-25T09:00:00Z"),
      updatedAt: new Date("2024-11-25T11:00:00Z"),
    }
  ];

  private services: Service[] = [
    { id: 1, name: "Pet Essentials", description: "Complete pet care package with food, bedding, and toys", price: 1500, icon: "PawPrint", category: "pets", active: true },
    { id: 2, name: "Farm Tour", description: "Guided tour of the entire farm with interactive experiences", price: 1500, icon: "MapPin", category: "experiences", active: true },
    { id: 3, name: "Breakfast", description: "Fresh farm-to-table breakfast served daily", price: 800, icon: "Coffee", category: "dining", active: true },
    { id: 4, name: "Dinner", description: "Traditional home-style dinner with local ingredients", price: 1200, icon: "UtensilsCrossed", category: "dining", active: true },
    { id: 5, name: "BBQ Setup", description: "Complete barbecue setup with fresh meat and vegetables", price: 2000, icon: "Flame", category: "dining", active: true },
    { id: 6, name: "Bonfire Evening", description: "Cozy bonfire setup with seating and marshmallows", price: 1000, icon: "Flame", category: "experiences", active: true }
  ];

  private coupons: Coupon[] = [
    { id: 1, code: "WELCOME10", type: "percentage", value: 10, minAmount: 5000, maxDiscount: 2000, active: true, expiryDate: "2024-12-31" },
    { id: 2, code: "SAVE500", type: "fixed", value: 500, minAmount: 3000, maxDiscount: null, active: true, expiryDate: "2024-12-25" }
  ];

  private adminUsers: AdminUser[] = [
    { id: 1, username: "Admin12", password: "$2b$10$Zrxraz7R9BlIBWZvkIgebeBA5.SwCEdalr0nVohcR.zau98bfoQre", role: "admin", createdAt: new Date() }
  ];

  private seoSettings: SeoSettings[] = [
    { 
      id: 1, 
      page: "home", 
      title: "Farm Feast Farm House - Luxury Farmhouse Rental & Events", 
      description: "Experience luxury farmhouse rental with modern amenities, pet-friendly accommodations, and farm-to-table dining. Book your perfect getaway today.", 
      keywords: "farmhouse rental, luxury accommodation, pet-friendly, farm stay, weekend getaway",
      ogTitle: "Farm Feast Farm House - Luxury Farmhouse Rental",
      ogDescription: "Book your luxury farmhouse getaway with modern amenities and farm-to-table experiences",
      ogImage: "/api/placeholder/1200/630",
      canonicalUrl: "https://farmfeastfarmhouse.shop",
      score: 95,
      ranking: 1,
      updatedAt: new Date()
    }
  ];

  private reviewSettings: ReviewSettings[] = [
    {
      id: 1,
      reviewCount: 127,
      averageRating: "4.8",
      businessName: "Farm Feast Farm House",
      ratingScale: "5",
      reviewsEnabled: true,
      showInSnippets: true,
      updatedAt: new Date()
    }
  ];

  private galleryImages: GalleryImage[] = [
    { id: 1, filename: "farmhouse-exterior.jpg", alt: "Beautiful farmhouse exterior", category: "exterior", url: "/api/placeholder/800/600", order: 1, active: true, uploadedAt: new Date() },
    { id: 2, filename: "bedroom-1.jpg", alt: "Spacious master bedroom", category: "bedrooms", url: "/api/placeholder/800/600", order: 1, active: true, uploadedAt: new Date() },
    { id: 3, filename: "kitchen.jpg", alt: "Modern farmhouse kitchen", category: "interior", url: "/api/placeholder/800/600", order: 1, active: true, uploadedAt: new Date() }
  ];

  private siteSettings: SiteSettings[] = [
    { id: 1, key: "upi_id", value: "ybl@ybl", type: "text", description: "UPI ID for payments", updatedAt: new Date() },
    { id: 2, key: "whatsapp_number", value: "+91 8897326898", type: "text", description: "WhatsApp contact number", updatedAt: new Date() },
    { id: 3, key: "support_email", value: "info@farmfeastfarmhouse.shop", type: "text", description: "Support email address", updatedAt: new Date() },
    { id: 4, key: "contact_phone", value: "+91 8897326898", type: "text", description: "Primary contact phone number", updatedAt: new Date() },
    { id: 5, key: "whatsapp_message", value: "I need to know more details about the farm feast farm house", type: "text", description: "Default WhatsApp message", updatedAt: new Date() },
    { id: 6, key: "email_notifications", value: "info@farmfeastfarmhouse.shop", type: "text", description: "Email for booking notifications", updatedAt: new Date() }
  ];

  private amenities: Amenity[] = [
    { id: 1, icon: "Wifi", title: "Free WiFi", description: "High-speed internet throughout the property", color: "bg-blue-50 text-blue-600", order: 1, active: true },
    { id: 2, icon: "Car", title: "Free Parking", description: "Ample parking space for multiple vehicles", color: "bg-green-50 text-green-600", order: 2, active: true },
    { id: 3, icon: "Flame", title: "Bonfire Area", description: "Cozy outdoor bonfire setup for evening relaxation", color: "bg-orange-50 text-orange-600", order: 3, active: true },
    { id: 4, icon: "PawPrint", title: "Pet Friendly", description: "Pets are welcome with special amenities", color: "bg-purple-50 text-purple-600", order: 4, active: true }
  ];

  private blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "Welcome to Farm Feast Farm House",
      slug: "welcome-to-farm-feast",
      excerpt: "Discover the perfect blend of luxury and nature at our farmhouse retreat",
      content: "# Welcome to Farm Feast Farm House\n\nExperience the perfect getaway...",
      featuredImage: "/api/placeholder/800/400",
      author: "Farm Feast Team",
      status: "published",
      tags: ["welcome", "farmhouse", "luxury"],
      metaTitle: "Welcome to Farm Feast Farm House - Luxury Farmhouse Experience",
      metaDescription: "Discover luxury farmhouse accommodation with modern amenities and farm experiences",
      readTime: 3,
      viewCount: 245,
      featured: true,
      publishedAt: new Date("2024-01-15"),
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-15")
    }
  ];

  private nextId = {
    bookings: 2,
    services: 7,
    coupons: 3,
    adminUsers: 2,
    seoSettings: 2,
    reviewSettings: 2,
    galleryImages: 4,
    siteSettings: 7,
    amenities: 5,
    blogPosts: 2
  };

  // Booking methods
  async getAllBookings(): Promise<Booking[]> {
    return [...this.bookings];
  }

  async getBookingById(id: number): Promise<Booking | undefined> {
    return this.bookings.find(b => b.id === id);
  }

  async getBookingByConfirmationCode(code: string): Promise<Booking | undefined> {
    return this.bookings.find(b => b.confirmationCode === code);
  }

  async getBookingByConfirmationCode(code: string): Promise<Booking | undefined> {
    return this.bookings.find(b => b.confirmationCode === code);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const confirmationCode = `FF${new Date().getFullYear().toString().slice(-2)}${this.nextId.bookings.toString().padStart(4, '0')}`;
    const newBooking: Booking = {
      ...booking,
      id: this.nextId.bookings++,
      status: "pending",
      confirmationCode,
      confirmedAt: null,
      emailSent: false,
      reminderSent: false,
      cancelledAt: null,
      cancellationReason: null,
      paymentStatus: "pending",
      upiTransactionId: null,
      paymentVerifiedAt: null,
      paymentNotes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.bookings.push(newBooking);
    return newBooking;
  }

  async updateBooking(id: number, booking: Partial<Booking>): Promise<Booking | undefined> {
    const index = this.bookings.findIndex(b => b.id === id);
    if (index === -1) return undefined;
    
    this.bookings[index] = { ...this.bookings[index], ...booking, updatedAt: new Date() };
    return this.bookings[index];
  }

  async deleteBooking(id: number): Promise<boolean> {
    const index = this.bookings.findIndex(b => b.id === id);
    if (index === -1) return false;
    this.bookings.splice(index, 1);
    return true;
  }

  async updateBookingPaymentStatus(id: number, status: string, utrNumber?: string, notes?: string): Promise<boolean> {
    const booking = this.bookings.find(b => b.id === id);
    if (!booking) return false;
    
    booking.paymentStatus = status;
    if (utrNumber) booking.upiTransactionId = utrNumber;
    if (notes) booking.paymentNotes = notes;
    if (status === "verified") booking.paymentVerifiedAt = new Date();
    booking.updatedAt = new Date();
    
    return true;
  }

  // Service methods
  async getAllServices(): Promise<Service[]> {
    return [...this.services];
  }

  async createService(service: InsertService): Promise<Service> {
    const newService: Service = { ...service, id: this.nextId.services++ };
    this.services.push(newService);
    return newService;
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined> {
    const index = this.services.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    this.services[index] = { ...this.services[index], ...service };
    return this.services[index];
  }

  async deleteService(id: number): Promise<boolean> {
    const index = this.services.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.services.splice(index, 1);
    return true;
  }

  // Coupon methods
  async getAllCoupons(): Promise<Coupon[]> {
    return [...this.coupons];
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    return this.coupons.find(c => c.code === code && c.active);
  }

  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const newCoupon: Coupon = { ...coupon, id: this.nextId.coupons++ };
    this.coupons.push(newCoupon);
    return newCoupon;
  }

  async updateCoupon(id: number, coupon: Partial<InsertCoupon>): Promise<Coupon | undefined> {
    const index = this.coupons.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    this.coupons[index] = { ...this.coupons[index], ...coupon };
    return this.coupons[index];
  }

  async deleteCoupon(id: number): Promise<boolean> {
    const index = this.coupons.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.coupons.splice(index, 1);
    return true;
  }

  // Admin user methods
  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    return this.adminUsers.find(u => u.username === username);
  }

  async createAdminUser(user: InsertAdminUser): Promise<AdminUser> {
    const newUser: AdminUser = { ...user, id: this.nextId.adminUsers++, createdAt: new Date() };
    this.adminUsers.push(newUser);
    return newUser;
  }

  // SEO Settings methods
  async getSeoSettingsByPage(page: string): Promise<SeoSettings | undefined> {
    return this.seoSettings.find(s => s.page === page);
  }

  async getAllSeoSettings(): Promise<SeoSettings[]> {
    return [...this.seoSettings];
  }

  async upsertSeoSettings(settings: InsertSeoSettings): Promise<SeoSettings> {
    const existingIndex = this.seoSettings.findIndex(s => s.page === settings.page);
    
    if (existingIndex !== -1) {
      this.seoSettings[existingIndex] = { 
        ...this.seoSettings[existingIndex], 
        ...settings, 
        updatedAt: new Date() 
      };
      return this.seoSettings[existingIndex];
    } else {
      const newSettings: SeoSettings = { 
        ...settings, 
        id: this.nextId.seoSettings++, 
        updatedAt: new Date() 
      };
      this.seoSettings.push(newSettings);
      return newSettings;
    }
  }

  // Review Settings methods
  async getReviewSettings(): Promise<ReviewSettings | undefined> {
    return this.reviewSettings[0];
  }

  async upsertReviewSettings(settings: InsertReviewSettings): Promise<ReviewSettings> {
    if (this.reviewSettings.length > 0) {
      this.reviewSettings[0] = { 
        ...this.reviewSettings[0], 
        ...settings, 
        updatedAt: new Date() 
      };
      return this.reviewSettings[0];
    } else {
      const newSettings: ReviewSettings = { 
        ...settings, 
        id: this.nextId.reviewSettings++, 
        updatedAt: new Date() 
      };
      this.reviewSettings.push(newSettings);
      return newSettings;
    }
  }

  // Gallery Image methods
  async getAllGalleryImages(): Promise<GalleryImage[]> {
    return [...this.galleryImages];
  }

  async getGalleryImagesByCategory(category: string): Promise<GalleryImage[]> {
    return this.galleryImages.filter(img => img.category === category && img.active);
  }

  async createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    const newImage: GalleryImage = { 
      ...image, 
      id: this.nextId.galleryImages++, 
      uploadedAt: new Date() 
    };
    this.galleryImages.push(newImage);
    return newImage;
  }

  async updateGalleryImage(id: number, image: Partial<InsertGalleryImage>): Promise<GalleryImage | undefined> {
    const index = this.galleryImages.findIndex(img => img.id === id);
    if (index === -1) return undefined;
    this.galleryImages[index] = { ...this.galleryImages[index], ...image };
    return this.galleryImages[index];
  }

  async deleteGalleryImage(id: number): Promise<boolean> {
    const index = this.galleryImages.findIndex(img => img.id === id);
    if (index === -1) return false;
    this.galleryImages.splice(index, 1);
    return true;
  }

  // Site Settings methods
  async getAllSiteSettings(): Promise<SiteSettings[]> {
    return [...this.siteSettings];
  }

  async getSiteSettingByKey(key: string): Promise<SiteSettings | undefined> {
    return this.siteSettings.find(s => s.key === key);
  }

  async upsertSiteSettings(setting: InsertSiteSettings): Promise<SiteSettings> {
    const existingIndex = this.siteSettings.findIndex(s => s.key === setting.key);
    
    if (existingIndex !== -1) {
      this.siteSettings[existingIndex] = { 
        ...this.siteSettings[existingIndex], 
        ...setting, 
        updatedAt: new Date() 
      };
      return this.siteSettings[existingIndex];
    } else {
      const newSetting: SiteSettings = { 
        ...setting, 
        id: this.nextId.siteSettings++, 
        updatedAt: new Date() 
      };
      this.siteSettings.push(newSetting);
      return newSetting;
    }
  }

  // Amenity methods
  async getAllAmenities(): Promise<Amenity[]> {
    return [...this.amenities];
  }

  async createAmenity(amenity: InsertAmenity): Promise<Amenity> {
    const newAmenity: Amenity = { ...amenity, id: this.nextId.amenities++ };
    this.amenities.push(newAmenity);
    return newAmenity;
  }

  async updateAmenity(id: number, amenity: Partial<InsertAmenity>): Promise<Amenity | undefined> {
    const index = this.amenities.findIndex(a => a.id === id);
    if (index === -1) return undefined;
    this.amenities[index] = { ...this.amenities[index], ...amenity };
    return this.amenities[index];
  }

  async deleteAmenity(id: number): Promise<boolean> {
    const index = this.amenities.findIndex(a => a.id === id);
    if (index === -1) return false;
    this.amenities.splice(index, 1);
    return true;
  }

  // Blog Post methods
  async getAllBlogPosts(): Promise<BlogPost[]> {
    return [...this.blogPosts];
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return this.blogPosts.filter(post => post.status === "published");
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return this.blogPosts.find(post => post.slug === slug);
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const newPost: BlogPost = { 
      ...post, 
      id: this.nextId.blogPosts++,
      viewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.blogPosts.push(newPost);
    return newPost;
  }

  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const index = this.blogPosts.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    this.blogPosts[index] = { ...this.blogPosts[index], ...post, updatedAt: new Date() };
    return this.blogPosts[index];
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    const index = this.blogPosts.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.blogPosts.splice(index, 1);
    return true;
  }
}

export const storage = new MemStorage();