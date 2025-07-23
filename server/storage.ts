import { bookings, services, coupons, type Booking, type Service, type Coupon, type InsertBooking, type InsertService, type InsertCoupon } from "@shared/schema";

export interface IStorage {
  // Bookings
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  getAllBookings(): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;

  // Services
  getAllServices(): Promise<Service[]>;
  getActiveServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;

  // Coupons
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  getAllCoupons(): Promise<Coupon[]>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
}

export class MemStorage implements IStorage {
  private bookings: Map<number, Booking>;
  private services: Map<number, Service>;
  private coupons: Map<number, Coupon>;
  private currentBookingId: number;
  private currentServiceId: number;
  private currentCouponId: number;

  constructor() {
    this.bookings = new Map();
    this.services = new Map();
    this.coupons = new Map();
    this.currentBookingId = 1;
    this.currentServiceId = 1;
    this.currentCouponId = 1;

    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize default services
    const defaultServices: InsertService[] = [
      {
        name: "Pet Essentials",
        description: "Pet-friendly amenities and care",
        price: 800,
        icon: "fas fa-paw",
        category: "amenities",
        active: true,
      },
      {
        name: "Box Cricket & Sand Volleyball",
        description: "Per Hour For Your Group",
        price: 1000,
        icon: "fas fa-volleyball-ball",
        category: "activities",
        active: true,
      },
      {
        name: "Bonfire Arrangement",
        description: "Evening bonfire with seating arrangement",
        price: 1200,
        icon: "fas fa-fire",
        category: "activities",
        active: true,
      },
      {
        name: "BBQ Setup",
        description: "Complete BBQ setup with equipment and assistance",
        price: 1500,
        icon: "fas fa-utensils",
        category: "food",
        active: true,
      },
      {
        name: "Utensils",
        description: "Utensils & Gas",
        price: 1500,
        icon: "fas fa-kitchen-set",
        category: "food",
        active: true,
      },
      {
        name: "Personal Chef",
        description: "Professional chef service for your meals",
        price: 3000,
        icon: "fas fa-chef-hat",
        category: "food",
        active: true,
      },
      {
        name: "Party Decorations",
        description: "Vendor Rates Starts from",
        price: 30000,
        icon: "fas fa-magic",
        category: "decorations",
        active: true,
      },
    ];

    defaultServices.forEach(service => {
      this.createService(service);
    });

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

    defaultCoupons.forEach(coupon => {
      this.createCoupon(coupon);
    });
  }

  // Booking methods
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const booking: Booking = {
      ...insertBooking,
      id,
      status: "pending",
      createdAt: new Date(),
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getAllBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (booking) {
      booking.status = status;
      this.bookings.set(id, booking);
      return booking;
    }
    return undefined;
  }

  // Service methods
  async getAllServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async getActiveServices(): Promise<Service[]> {
    return Array.from(this.services.values()).filter(service => service.active);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.currentServiceId++;
    const service: Service = {
      ...insertService,
      id,
    };
    this.services.set(id, service);
    return service;
  }

  // Coupon methods
  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    return Array.from(this.coupons.values()).find(
      coupon => coupon.code.toLowerCase() === code.toLowerCase() && coupon.active
    );
  }

  async getAllCoupons(): Promise<Coupon[]> {
    return Array.from(this.coupons.values());
  }

  async createCoupon(insertCoupon: InsertCoupon): Promise<Coupon> {
    const id = this.currentCouponId++;
    const coupon: Coupon = {
      ...insertCoupon,
      id,
    };
    this.coupons.set(id, coupon);
    return coupon;
  }
}

export const storage = new MemStorage();
