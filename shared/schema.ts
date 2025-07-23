import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
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
  status: text("status").default("pending"), // pending, confirmed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
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

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
