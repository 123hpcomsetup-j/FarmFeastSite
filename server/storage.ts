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
  type InsertHomepageImage
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

  // Homepage Images
  getAllHomepageImages(): Promise<HomepageImage[]>;
  getHomepageImagesBySection(section: string): Promise<HomepageImage[]>;
  createHomepageImage(image: InsertHomepageImage): Promise<HomepageImage>;
  updateHomepageImage(id: number, image: Partial<InsertHomepageImage>): Promise<HomepageImage | undefined>;
  deleteHomepageImage(id: number): Promise<boolean>;
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
    { id: 1, username: "Admin12", password: "$2b$10$v7yL4thgGlrAmKVgZZ6ww.VOOZfcSj9CpXrmwzBSzTL8LF0YTPjji", role: "admin", createdAt: new Date() }
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
      schemaType: "LodgingBusiness",
      schemaData: {
        "@type": "LodgingBusiness",
        "name": "Farm Feast Farm House",
        "amenityFeature": ["Swimming Pool", "Parking", "Air Conditioning", "Pet Friendly"],
        "priceRange": "₹₹"
      },
      priority: 100,
      changeFreq: "weekly",
      noindex: false,
      nofollow: false,
      score: 95,
      ranking: 1,
      updatedAt: new Date()
    },
    { 
      id: 2, 
      page: "services", 
      title: "Premium Services - Farm Feast Farm House", 
      description: "Explore our premium services including farm tours, dining experiences, BBQ setups, and pet-friendly amenities for an unforgettable stay.",
      keywords: "farm services, dining, BBQ, pet friendly, farm tour, breakfast, dinner",
      ogTitle: "Premium Services at Farm Feast Farm House",
      ogDescription: "From farm-to-table dining to exciting farm tours, discover all our premium services.",
      ogImage: "/api/placeholder/1200/630",
      canonicalUrl: "https://farmfeastfarmhouse.shop/services",
      schemaType: "Service",
      schemaData: {
        "@type": "Service",
        "serviceType": "Hospitality Services",
        "provider": "Farm Feast Farm House"
      },
      priority: 80,
      changeFreq: "monthly",
      noindex: false,
      nofollow: false,
      score: 85,
      ranking: 2,
      updatedAt: new Date()
    },
    { 
      id: 3, 
      page: "gallery", 
      title: "Photo Gallery - Farm Feast Farm House", 
      description: "Browse our stunning photo gallery showcasing beautiful farmhouse interiors, scenic landscapes, and memorable guest experiences.",
      keywords: "farmhouse photos, gallery, interiors, landscapes, accommodation photos",
      ogTitle: "Photo Gallery - See Our Beautiful Farmhouse",
      ogDescription: "Take a visual tour of our luxury farmhouse and beautiful surroundings.",
      ogImage: "/api/placeholder/1200/630",
      canonicalUrl: "https://farmfeastfarmhouse.shop/gallery",
      schemaType: "ImageGallery",
      schemaData: {
        "@type": "ImageGallery",
        "about": "Farm Feast Farm House Photo Gallery"
      },
      priority: 60,
      changeFreq: "monthly",
      noindex: false,
      nofollow: false,
      score: 78,
      ranking: 3,
      updatedAt: new Date()
    },
    { 
      id: 4, 
      page: "booking", 
      title: "Book Your Stay - Farm Feast Farm House", 
      description: "Book your luxury farmhouse stay online. Easy booking process with instant confirmation and flexible payment options.",
      keywords: "book farmhouse, online booking, reservation, luxury accommodation booking",
      ogTitle: "Book Your Perfect Getaway",
      ogDescription: "Secure your dates at our luxury farmhouse with our easy online booking system.",
      ogImage: "/api/placeholder/1200/630",
      canonicalUrl: "https://farmfeastfarmhouse.shop/booking",
      schemaType: "WebPage",
      schemaData: {
        "@type": "WebPage",
        "mainEntity": {
          "@type": "ReservationAction",
          "object": "Farm Feast Farm House"
        }
      },
      priority: 90,
      changeFreq: "weekly",
      noindex: false,
      nofollow: false,
      score: 88,
      ranking: 1,
      updatedAt: new Date()
    },
    { 
      id: 5, 
      page: "privacy-policy", 
      title: "Privacy Policy - Farm Feast Farm House", 
      description: "Our comprehensive privacy policy outlines how we collect, use, and protect your personal information in compliance with GDPR.",
      keywords: "privacy policy, data protection, GDPR, personal information, cookies",
      ogTitle: "Privacy Policy - Farm Feast Farm House",
      ogDescription: "Learn about our privacy practices and data protection policies.",
      ogImage: "/api/placeholder/1200/630",
      canonicalUrl: "https://farmfeastfarmhouse.shop/privacy-policy",
      schemaType: "WebPage",
      schemaData: {
        "@type": "WebPage",
        "about": "Privacy Policy and Data Protection"
      },
      priority: 30,
      changeFreq: "yearly",
      noindex: false,
      nofollow: false,
      score: 65,
      ranking: 8,
      updatedAt: new Date()
    },
    { 
      id: 6, 
      page: "terms-conditions", 
      title: "Terms & Conditions - Farm Feast Farm House", 
      description: "Read our terms and conditions for booking and staying at Farm Feast Farm House, including cancellation policies and house rules.",
      keywords: "terms conditions, booking policy, cancellation, house rules, legal terms",
      ogTitle: "Terms & Conditions - Farm Feast Farm House",
      ogDescription: "Important terms and conditions for your stay at our farmhouse.",
      ogImage: "/api/placeholder/1200/630",
      canonicalUrl: "https://farmfeastfarmhouse.shop/terms-conditions",
      schemaType: "WebPage",
      schemaData: {
        "@type": "WebPage",
        "about": "Terms and Conditions"
      },
      priority: 30,
      changeFreq: "yearly",
      noindex: false,
      nofollow: false,
      score: 62,
      ranking: 9,
      updatedAt: new Date()
    },
    { 
      id: 7, 
      page: "cookie-policy", 
      title: "Cookie Policy - Farm Feast Farm House", 
      description: "Learn about how we use cookies and similar technologies on our website to enhance your browsing experience.",
      keywords: "cookie policy, cookies, website analytics, user preferences, GDPR compliance",
      ogTitle: "Cookie Policy - Farm Feast Farm House",
      ogDescription: "Understand our cookie usage and how to manage your preferences.",
      ogImage: "/api/placeholder/1200/630",
      canonicalUrl: "https://farmfeastfarmhouse.shop/cookie-policy",
      schemaType: "WebPage",
      schemaData: {
        "@type": "WebPage",
        "about": "Cookie Policy and Usage"
      },
      priority: 20,
      changeFreq: "yearly",
      noindex: false,
      nofollow: false,
      score: 58,
      ranking: 10,
      updatedAt: new Date()
    },
    { 
      id: 8, 
      page: "data-processing", 
      title: "Data Processing Rights - Farm Feast Farm House", 
      description: "Exercise your GDPR data rights including access, correction, deletion, and portability of your personal information.",
      keywords: "data processing, GDPR rights, data access, data deletion, data portability",
      ogTitle: "Data Processing Rights - Farm Feast Farm House",
      ogDescription: "Manage your personal data and exercise your GDPR rights.",
      ogImage: "/api/placeholder/1200/630",
      canonicalUrl: "https://farmfeastfarmhouse.shop/data-processing",
      schemaType: "WebPage",
      schemaData: {
        "@type": "WebPage",
        "about": "Data Processing and User Rights"
      },
      priority: 20,
      changeFreq: "yearly",
      noindex: false,
      nofollow: false,
      score: 55,
      ranking: 11,
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

  private homepageImages: HomepageImage[] = [
    // Hero Section Images
    { id: 1, section: "hero", title: "Hero Background", description: "Main hero section background image", imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600", altText: "Beautiful farmhouse exterior with green surroundings", order: 1, active: true, createdAt: new Date(), updatedAt: new Date() },
    // Amenities Section Images
    { id: 2, section: "amenities", title: "Swimming Pool", description: "Luxurious swimming pool image", imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300", altText: "Luxurious swimming pool with clear blue water and deck area", order: 1, active: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 3, section: "amenities", title: "Bedroom", description: "Spacious air-conditioned bedroom", imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300", altText: "Spacious air-conditioned bedroom with modern furnishing", order: 2, active: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 4, section: "amenities", title: "BBQ Setup", description: "Outdoor BBQ area", imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300", altText: "Outdoor BBQ setup with grilling equipment and seating area", order: 3, active: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 5, section: "amenities", title: "Parking Area", description: "Large parking space", imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300", altText: "Large parking area with vehicles and green surroundings", order: 4, active: true, createdAt: new Date(), updatedAt: new Date() },
    // Gallery Section Images
    { id: 6, section: "gallery", title: "Event Celebration", description: "Outdoor party setup", imageUrl: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400", altText: "Event celebration with outdoor party setup and happy guests", order: 1, active: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 7, section: "gallery", title: "Wedding Ceremony", description: "Beautiful wedding setup", imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400", altText: "Outdoor wedding ceremony with beautiful decorations and seating", order: 2, active: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 8, section: "gallery", title: "Birthday Party", description: "Colorful birthday celebration", imageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400", altText: "Birthday party celebration with colorful decorations and cake", order: 3, active: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 9, section: "gallery", title: "Luxury Bedroom", description: "Comfortable accommodation", imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400", altText: "Luxury bedroom with comfortable bedding and modern amenities", order: 4, active: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 10, section: "gallery", title: "BBQ Experience", description: "Outdoor dining setup", imageUrl: "https://images.unsplash.com/photo-1565301660306-29e08751cc53?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400", altText: "Outdoor BBQ area with grilling equipment and dining setup", order: 5, active: true, createdAt: new Date(), updatedAt: new Date() },
    { id: 11, section: "gallery", title: "Family Gathering", description: "People enjoying outdoor time", imageUrl: "https://images.unsplash.com/photo-1529636798458-92182e662485?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=400", altText: "Family gathering with people enjoying time together outdoors", order: 6, active: true, createdAt: new Date(), updatedAt: new Date() }
  ];

  private nextId = {
    bookings: 2,
    services: 7,
    coupons: 3,
    adminUsers: 2,
    seoSettings: 9,
    reviewSettings: 2,
    galleryImages: 4,
    siteSettings: 7,
    amenities: 5,
    blogPosts: 2,
    homepageImages: 12
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

  async updateSeoSettings(id: number, settings: Partial<InsertSeoSettings>): Promise<SeoSettings | undefined> {
    const index = this.seoSettings.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    
    this.seoSettings[index] = { 
      ...this.seoSettings[index], 
      ...settings, 
      updatedAt: new Date() 
    };
    return this.seoSettings[index];
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

  async updateSiteSettings(id: number, setting: Partial<InsertSiteSettings>): Promise<SiteSettings | undefined> {
    const index = this.siteSettings.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    
    this.siteSettings[index] = { 
      ...this.siteSettings[index], 
      ...setting, 
      updatedAt: new Date() 
    };
    return this.siteSettings[index];
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

  // Homepage Images methods
  async getAllHomepageImages(): Promise<HomepageImage[]> {
    return [...this.homepageImages];
  }

  async getHomepageImagesBySection(section: string): Promise<HomepageImage[]> {
    return this.homepageImages.filter(img => img.section === section && img.active);
  }

  async createHomepageImage(image: InsertHomepageImage): Promise<HomepageImage> {
    const newImage: HomepageImage = { 
      ...image, 
      id: this.nextId.homepageImages++,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.homepageImages.push(newImage);
    return newImage;
  }

  async updateHomepageImage(id: number, image: Partial<InsertHomepageImage>): Promise<HomepageImage | undefined> {
    const index = this.homepageImages.findIndex(img => img.id === id);
    if (index === -1) return undefined;
    this.homepageImages[index] = { 
      ...this.homepageImages[index], 
      ...image, 
      updatedAt: new Date() 
    };
    return this.homepageImages[index];
  }

  async deleteHomepageImage(id: number): Promise<boolean> {
    const index = this.homepageImages.findIndex(img => img.id === id);
    if (index === -1) return false;
    this.homepageImages.splice(index, 1);
    return true;
  }
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
    const [user] = await this.db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return user;
  }

  async createAdminUser(user: InsertAdminUser): Promise<AdminUser> {
    const [newUser] = await this.db.insert(adminUsers).values(user).returning();
    return newUser;
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
    const [upsertedSettings] = await this.db
      .insert(seoSettings)
      .values(settings)
      .onConflictDoUpdate({
        target: seoSettings.page,
        set: { ...settings, updatedAt: new Date() }
      })
      .returning();
    return upsertedSettings;
  }

  // Review Settings
  async getReviewSettings(): Promise<ReviewSettings | undefined> {
    const [settings] = await this.db.select().from(reviewSettings).limit(1);
    return settings;
  }

  async upsertReviewSettings(settings: InsertReviewSettings): Promise<ReviewSettings> {
    // Try to update first, then insert if not exists
    const existing = await this.getReviewSettings();
    if (existing) {
      const [updated] = await this.db
        .update(reviewSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(reviewSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [inserted] = await this.db.insert(reviewSettings).values(settings).returning();
      return inserted;
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
    return await this.db.select().from(siteSettings);
  }

  async getSiteSettingByKey(key: string): Promise<SiteSettings | undefined> {
    const [setting] = await this.db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting;
  }

  async createSiteSetting(setting: InsertSiteSettings): Promise<SiteSettings> {
    const [newSetting] = await this.db.insert(siteSettings).values(setting).returning();
    return newSetting;
  }

  async updateSiteSettings(key: string, value: string): Promise<SiteSettings | undefined> {
    const [updated] = await this.db
      .update(siteSettings)
      .set({ value, updatedAt: new Date() })
      .where(eq(siteSettings.key, key))
      .returning();
    return updated;
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

  // SEO Settings
  async updateSeoSettings(id: number, settings: Partial<InsertSeoSettings>): Promise<SeoSettings | undefined> {
    const [updatedSettings] = await this.db
      .update(seoSettings)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(seoSettings.id, id))
      .returning();
    return updatedSettings;
  }

  // Missing methods for Blog Posts
  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    return await this.db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"))
      .orderBy(blogPosts.publishedAt);
  }
}

// Import database connection
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export const storage = new DatabaseStorage(db);