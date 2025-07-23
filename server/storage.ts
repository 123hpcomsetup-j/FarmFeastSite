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
  type InsertAmenity
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import bcrypt from 'bcrypt';

export interface IStorage {
  // Bookings
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  getAllBookings(): Promise<Booking[]>;
  updateBooking(id: number, updates: Partial<Booking>): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;

  // Services
  getAllServices(): Promise<Service[]>;
  getActiveServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;

  // Coupons
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  getAllCoupons(): Promise<Coupon[]>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: number, coupon: Partial<InsertCoupon>): Promise<Coupon | undefined>;
  deleteCoupon(id: number): Promise<boolean>;

  // Admin Users
  getAdminByUsername(username: string): Promise<AdminUser | undefined>;
  createAdmin(admin: InsertAdminUser): Promise<AdminUser>;
  
  // SEO Settings
  getAllSeoSettings(): Promise<SeoSettings[]>;
  getSeoSettingsByPage(page: string): Promise<SeoSettings | undefined>;
  upsertSeoSettings(seo: InsertSeoSettings): Promise<SeoSettings>;
  
  // Review Settings
  getReviewSettings(): Promise<ReviewSettings | undefined>;
  upsertReviewSettings(review: InsertReviewSettings): Promise<ReviewSettings>;
  
  // Gallery Images
  getAllGalleryImages(): Promise<GalleryImage[]>;
  getActiveGalleryImages(): Promise<GalleryImage[]>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  updateGalleryImage(id: number, image: Partial<InsertGalleryImage>): Promise<GalleryImage | undefined>;
  deleteGalleryImage(id: number): Promise<boolean>;
  
  // Site Settings
  getAllSiteSettings(): Promise<SiteSettings[]>;
  getSiteSettingByKey(key: string): Promise<SiteSettings | undefined>;
  upsertSiteSettings(setting: InsertSiteSettings): Promise<SiteSettings>;
  
  // Amenities
  getAllAmenities(): Promise<Amenity[]>;
  getActiveAmenities(): Promise<Amenity[]>;
  createAmenity(amenity: InsertAmenity): Promise<Amenity>;
  updateAmenity(id: number, amenity: Partial<InsertAmenity>): Promise<Amenity | undefined>;
  deleteAmenity(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    try {
      // Check if data already exists
      const existingServices = await db.select().from(services);
      if (existingServices.length > 0) return;

      // Initialize default admin user
      const hashedPassword = await bcrypt.hash("test@1234", 10);
      await db.insert(adminUsers).values({
        username: "Admin12",
        password: hashedPassword,
        role: "admin"
      }).onConflictDoNothing();

      // Initialize default services
      const defaultServices: InsertService[] = [
        {
          name: "Pet Essentials",
          description: "Pet-friendly amenities and care",
          price: 800,
          icon: "🐾",
          category: "amenities",
          active: true,
        },
        {
          name: "Box Cricket & Sand Volleyball",
          description: "Per Hour For Your Group",
          price: 1000,
          icon: "🏐",
          category: "activities",
          active: true,
        },
        {
          name: "Bonfire Arrangement",
          description: "Evening bonfire with seating arrangement",
          price: 1200,
          icon: "🔥",
          category: "activities",
          active: true,
        },
        {
          name: "BBQ Setup",
          description: "Complete BBQ setup with equipment and assistance",
          price: 1500,
          icon: "🍖",
          category: "food",
          active: true,
        },
        {
          name: "Utensils",
          description: "Utensils & Gas",
          price: 1500,
          icon: "🍽️",
          category: "food",
          active: true,
        },
        {
          name: "Personal Chef",
          description: "Professional chef service for your meals",
          price: 3000,
          icon: "👨‍🍳",
          category: "food",
          active: true,
        },
        {
          name: "Party Decorations",
          description: "Vendor Rates Starts from",
          price: 30000,
          icon: "🎉",
          category: "decorations",
          active: true,
        },
      ];

      await db.insert(services).values(defaultServices);

      // Initialize default coupons
      const defaultCoupons: InsertCoupon[] = [
        {
          code: "WELCOME10",
          type: "percentage",
          value: 10,
          minAmount: 2000,
          maxDiscount: 1000,
          active: true,
          expiryDate: "2025-12-31",
        },
        {
          code: "FIRST500",
          type: "fixed",
          value: 500,
          minAmount: 1500,
          active: true,
          expiryDate: "2025-12-31",
        },
        {
          code: "FAMILY20",
          type: "percentage",
          value: 20,
          minAmount: 5000,
          maxDiscount: 2000,
          active: true,
          expiryDate: "2025-12-31",
        },
      ];

      await db.insert(coupons).values(defaultCoupons);

      // Initialize default SEO settings
      const defaultSeoSettings: InsertSeoSettings[] = [
        {
          page: "home",
          title: "Farm Feast Farm House - Premium Farmhouse Rental Near Hyderabad",
          description: "Escape to luxury at Farm Feast Farm House. Premium farmhouse rental with swimming pool, modern amenities, and professional services. Perfect for events, family gatherings, and weekend getaways near Hyderabad.",
          keywords: "farmhouse rental, luxury farmhouse, swimming pool, Hyderabad, weekend getaway, event venue, family gathering",
          ogTitle: "Farm Feast Farm House - Your Perfect Getaway Near Hyderabad",
          ogDescription: "Premium farmhouse with luxury amenities, swimming pool, and professional services. Book your perfect weekend escape today!",
          score: 85,
          ranking: 1
        },
        {
          page: "services",
          title: "Premium Services - Farm Feast Farm House",
          description: "Enhance your farmhouse experience with our carefully curated services. BBQ setup, personal chef, party decorations, and more professional services available.",
          keywords: "farmhouse services, BBQ setup, personal chef, party decorations, bonfire arrangement",
          ogTitle: "Premium Farmhouse Services",
          ogDescription: "Professional services to make your farmhouse stay perfect and memorable.",
          score: 78,
          ranking: 2
        },
        {
          page: "gallery",
          title: "Gallery - Farm Feast Farm House Photos",
          description: "Browse our beautiful farmhouse gallery. See luxury amenities, spacious grounds, swimming pool, and memorable events at Farm Feast Farm House.",
          keywords: "farmhouse photos, gallery, luxury amenities, swimming pool, event photos",
          ogTitle: "Farm Feast Farm House Gallery",
          ogDescription: "Beautiful photos of our luxury farmhouse, amenities, and memorable events.",
          score: 72,
          ranking: 3
        },
        {
          page: "booking",
          title: "Book Your Stay - Farm Feast Farm House",
          description: "Reserve your perfect farmhouse getaway. Easy online booking with instant pricing, service selection, and availability checking.",
          keywords: "book farmhouse, online booking, reservation, availability, pricing",
          ogTitle: "Book Your Farmhouse Stay",
          ogDescription: "Easy online booking system with instant pricing and service selection.",
          score: 80,
          ranking: 2
        }
      ];

      await db.insert(seoSettings).values(defaultSeoSettings);

      // Initialize default site settings
      const defaultSiteSettings: InsertSiteSettings[] = [
        {
          key: "whatsapp_number",
          value: "918897326898",
          type: "text",
          description: "WhatsApp contact number"
        },
        {
          key: "phone_primary",
          value: "8897326898",
          type: "text",
          description: "Primary phone number"
        },
        {
          key: "phone_secondary",
          value: "8309001021",
          type: "text",
          description: "Secondary phone number"
        },
        {
          key: "address",
          value: "SY. No 170/A, Near Cheeryal Kaman, Keesara, Rangareddy - 501301",
          type: "text",
          description: "Farm house address"
        },
        {
          key: "base_price_per_guest",
          value: "1150",
          type: "number",
          description: "Base price per guest"
        },
        {
          key: "maintenance_fee",
          value: "500",
          type: "number",
          description: "Mandatory maintenance fee"
        },
        {
          key: "upi_id",
          value: "ybl@ybl",
          type: "text",
          description: "UPI ID for payments"
        }
      ];

      await db.insert(siteSettings).values(defaultSiteSettings);

      // Initialize default amenities
      const defaultAmenities: InsertAmenity[] = [
        {
          icon: "🏊‍♂️",
          title: "Swimming Pool",
          description: "Large outdoor pool with kids section for family fun",
          color: "bg-blue-50 text-blue-600",
          order: 1,
          active: true
        },
        {
          icon: "🚗",
          title: "Parking Available",
          description: "Spacious parking area for multiple vehicles",
          color: "bg-green-50 text-green-600",
          order: 2,
          active: true
        },
        {
          icon: "❄️",
          title: "Air Conditioned",
          description: "Comfortable AC rooms for a relaxing stay",
          color: "bg-blue-50 text-blue-600",
          order: 3,
          active: true
        },
        {
          icon: "🐕",
          title: "Pet-Friendly",
          description: "Bring your furry friends along for the adventure",
          color: "bg-amber-50 text-amber-600",
          order: 4,
          active: true
        }
      ];

      await db.insert(amenities).values(defaultAmenities);

      // Initialize default review settings
      const existingReviews = await db.select().from(reviewSettings).limit(1);
      if (existingReviews.length === 0) {
        await db.insert(reviewSettings).values({
          reviewCount: 127,
          averageRating: "4.8",
          businessName: "Farm Feast Farm House",
          ratingScale: "5",
          reviewsEnabled: true,
          showInSnippets: true
        });
      }

    } catch (error) {
      console.error("Error initializing default data:", error);
    }
  }

  // Booking methods
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db.insert(bookings).values(insertBooking).returning();
    return booking;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings);
  }

  async updateBooking(id: number, updates: Partial<Booking>): Promise<Booking> {
    const [booking] = await db.update(bookings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const [booking] = await db.update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return booking;
  }

  // Service methods
  async getAllServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async getActiveServices(): Promise<Service[]> {
    return await db.select().from(services).where(eq(services.active, true));
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db.insert(services).values(insertService).returning();
    return service;
  }

  async updateService(id: number, serviceData: Partial<InsertService>): Promise<Service | undefined> {
    const [service] = await db.update(services)
      .set(serviceData)
      .where(eq(services.id, id))
      .returning();
    return service;
  }

  async deleteService(id: number): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Coupon methods
  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons)
      .where(and(eq(coupons.code, code), eq(coupons.active, true)));
    return coupon;
  }

  async getAllCoupons(): Promise<Coupon[]> {
    return await db.select().from(coupons);
  }

  async createCoupon(insertCoupon: InsertCoupon): Promise<Coupon> {
    const [coupon] = await db.insert(coupons).values(insertCoupon).returning();
    return coupon;
  }

  async updateCoupon(id: number, couponData: Partial<InsertCoupon>): Promise<Coupon | undefined> {
    const [coupon] = await db.update(coupons)
      .set(couponData)
      .where(eq(coupons.id, id))
      .returning();
    return coupon;
  }

  async deleteCoupon(id: number): Promise<boolean> {
    const result = await db.delete(coupons).where(eq(coupons.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Admin methods
  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return admin;
  }

  async createAdmin(admin: InsertAdminUser): Promise<AdminUser> {
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    const [newAdmin] = await db.insert(adminUsers)
      .values({ ...admin, password: hashedPassword })
      .returning();
    return newAdmin;
  }

  // SEO methods
  async getAllSeoSettings(): Promise<SeoSettings[]> {
    return await db.select().from(seoSettings);
  }

  async getSeoSettingsByPage(page: string): Promise<SeoSettings | undefined> {
    const [seo] = await db.select().from(seoSettings).where(eq(seoSettings.page, page));
    return seo;
  }

  async upsertSeoSettings(seo: InsertSeoSettings): Promise<SeoSettings> {
    const [result] = await db.insert(seoSettings)
      .values(seo)
      .onConflictDoUpdate({
        target: seoSettings.page,
        set: { ...seo, updatedAt: new Date() }
      })
      .returning();
    return result;
  }

  // Review Settings methods
  async getReviewSettings(): Promise<ReviewSettings | undefined> {
    const [settings] = await db.select().from(reviewSettings).limit(1);
    return settings;
  }

  async upsertReviewSettings(review: InsertReviewSettings): Promise<ReviewSettings> {
    // Get existing record if any
    const existing = await this.getReviewSettings();
    
    if (existing) {
      const [result] = await db.update(reviewSettings)
        .set({ ...review, updatedAt: new Date() })
        .where(eq(reviewSettings.id, existing.id))
        .returning();
      return result;
    } else {
      const [result] = await db.insert(reviewSettings)
        .values(review)
        .returning();
      return result;
    }
  }

  // Gallery methods
  async getAllGalleryImages(): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages);
  }

  async getActiveGalleryImages(): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages).where(eq(galleryImages.active, true));
  }

  async createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    const [newImage] = await db.insert(galleryImages).values(image).returning();
    return newImage;
  }

  async updateGalleryImage(id: number, imageData: Partial<InsertGalleryImage>): Promise<GalleryImage | undefined> {
    const [image] = await db.update(galleryImages)
      .set(imageData)
      .where(eq(galleryImages.id, id))
      .returning();
    return image;
  }

  async deleteGalleryImage(id: number): Promise<boolean> {
    const result = await db.delete(galleryImages).where(eq(galleryImages.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Site settings methods
  async getAllSiteSettings(): Promise<SiteSettings[]> {
    return await db.select().from(siteSettings);
  }

  async getSiteSettingByKey(key: string): Promise<SiteSettings | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting;
  }

  async upsertSiteSettings(setting: InsertSiteSettings): Promise<SiteSettings> {
    const [result] = await db.insert(siteSettings)
      .values(setting)
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { ...setting, updatedAt: new Date() }
      })
      .returning();
    return result;
  }

  // Amenities methods
  async getAllAmenities(): Promise<Amenity[]> {
    return await db.select().from(amenities);
  }

  async getActiveAmenities(): Promise<Amenity[]> {
    return await db.select().from(amenities).where(eq(amenities.active, true));
  }

  async createAmenity(amenity: InsertAmenity): Promise<Amenity> {
    const [newAmenity] = await db.insert(amenities).values(amenity).returning();
    return newAmenity;
  }

  async updateAmenity(id: number, amenityData: Partial<InsertAmenity>): Promise<Amenity | undefined> {
    const [amenity] = await db.update(amenities)
      .set(amenityData)
      .where(eq(amenities.id, id))
      .returning();
    return amenity;
  }

  async deleteAmenity(id: number): Promise<boolean> {
    const result = await db.delete(amenities).where(eq(amenities.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Gallery methods
  async getGalleryImages(): Promise<GalleryImage[]> {
    try {
      return await db.select().from(galleryImages).where(eq(galleryImages.active, true)).orderBy(galleryImages.order);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      return []; // Return empty array instead of throwing
    }
  }

  async getAllGalleryImages(): Promise<GalleryImage[]> {
    return await db.select().from(galleryImages).orderBy(galleryImages.order);
  }

  async createGalleryImage(imageData: InsertGalleryImage): Promise<GalleryImage> {
    const [image] = await db.insert(galleryImages).values(imageData).returning();
    return image;
  }

  async updateGalleryImage(id: number, imageData: Partial<InsertGalleryImage>): Promise<GalleryImage | undefined> {
    const [image] = await db.update(galleryImages)
      .set(imageData)
      .where(eq(galleryImages.id, id))
      .returning();
    return image;
  }

  async deleteGalleryImage(id: number): Promise<boolean> {
    const result = await db.delete(galleryImages).where(eq(galleryImages.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();
