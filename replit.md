# Farm Feast Farm House - Booking System

## Overview

This is a modern farmhouse booking system built with React + TypeScript frontend and Node.js/Express backend. The application allows customers to browse services, view gallery images, and make bookings for a farmhouse rental business. It features a comprehensive booking form with service selection, coupon validation, pricing calculations, and a complete booking confirmation system with email notifications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API with JSON responses
- **Session Management**: In-memory storage with fallback to database

## Key Components

### Frontend Components
- **Navigation**: Sticky navbar with mobile responsiveness
- **Pages**: Home, Services, Gallery, and Booking pages
- **Booking Form**: Complex form with service selection, pricing, and coupon validation
- **UI Components**: Comprehensive set of accessible components from Shadcn/ui

### Backend Components
- **Route Handlers**: Express routes for services, coupons, and bookings
- **Storage Layer**: Abstract storage interface with in-memory implementation
- **Schema Validation**: Zod schemas for request/response validation
- **Error Handling**: Centralized error handling middleware

### Database Schema
- **bookings**: Customer booking records with pricing, status, confirmation tracking, and payment information
  - Payment fields: paymentStatus, upiTransactionId, paymentVerifiedAt, paymentNotes
- **services**: Available services with pricing and categories
- **coupons**: Discount coupons with validation rules
- **reviewSettings**: SEO review data for search engine snippets
- **adminUsers**: Admin authentication and user management
- **seoSettings**: Page-specific SEO meta data and optimization
- **galleryImages**: Image management for photo gallery
- **siteSettings**: Dynamic site configuration including UPI ID, WhatsApp numbers, and support contacts
- **amenities**: Property amenities and features management

## Data Flow

1. **Service Display**: Frontend fetches services from `/api/services` endpoint
2. **Booking Process**: 
   - User fills booking form with dates, guest count, and service selection
   - Form calculates pricing in real-time based on selections
   - Coupon validation occurs via `/api/coupons/validate` endpoint
   - Final booking submission to `/api/bookings` endpoint with automatic confirmation code generation
3. **Payment Integration System**:
   - Real UPI payment flow with configurable UPI ID (ybl@ybl) managed from admin panel
   - Customer submits UTR number after making UPI payment
   - Admin verification workflow for payment approval/decline
   - Automatic email notifications sent after payment status changes
   - Payment status tracking: pending → paid → verified → confirmed
4. **Dynamic Sitemap Generation**:
   - Automatic sitemap.xml generation including all active pages, services, and gallery categories
   - Dynamic robots.txt with proper crawling instructions and sitemap reference
   - Admin panel for sitemap management and regeneration
   - SEO-optimized with proper priorities and change frequencies
   - Updates automatically when content is added or modified
5. **Booking Confirmation System**:
   - Automatic confirmation code generation for each booking
   - Email notifications with detailed booking information and payment status
   - Admin management interface for confirming/cancelling bookings and verifying payments
   - Check-in reminder system for confirmed bookings
   - Public booking lookup by confirmation code with payment status
6. **SEO Management**:
   - Dynamic review snippets for search engine results
   - Structured data (JSON-LD) for rich search snippets
   - Meta tag optimization for organic visibility
7. **Data Persistence**: All data stored in PostgreSQL via Drizzle ORM
8. **State Management**: TanStack Query handles caching and synchronization

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React with TypeScript support
- **Component Library**: Radix UI primitives with Shadcn/ui wrapper
- **Styling**: Tailwind CSS with PostCSS processing
- **Forms**: React Hook Form with Hookform resolvers
- **HTTP Client**: Built-in fetch with TanStack Query wrapper
- **Date Handling**: date-fns for date manipulation

### Backend Dependencies
- **Database**: Neon Database (serverless PostgreSQL)
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod for schema validation
- **Development**: TSX for TypeScript execution, ESBuild for production builds

### Development Tools
- **Replit Integration**: Custom Vite plugins for Replit environment
- **Hot Reload**: Vite HMR for fast development
- **Type Checking**: TypeScript with strict mode enabled

## Deployment Strategy

### Development
- **Local Development**: `npm run dev` starts both frontend and backend
- **Hot Reload**: Vite dev server with Express middleware integration
- **Database**: Drizzle Kit for schema migrations with `npm run db:push`

### Production Build
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Deployment**: Single command `npm start` serves both frontend and backend
- **Environment**: NODE_ENV=production enables production optimizations

### Database Management
- **Schema**: Defined in `shared/schema.ts` using Drizzle schema syntax
- **Migrations**: Drizzle Kit handles schema synchronization
- **Connection**: Environment variable `DATABASE_URL` for database connection
- **Fallback**: In-memory storage implementation for development/testing

The architecture emphasizes developer experience with fast builds, type safety, and modern tooling while maintaining simplicity in deployment and maintenance.

## GDPR & Legal Compliance

### Comprehensive Privacy Framework
- **Complete GDPR Compliance**: Full privacy policy, terms & conditions, cookie policy, and data processing agreements
- **Cookie Consent Management**: Granular consent system with accept/decline options for essential, analytics, marketing, and preference cookies
- **Data Subject Rights**: Complete implementation of GDPR rights including access, rectification, erasure, restriction, portability, and objection
- **Consent Manager**: Advanced consent management with opt-in/opt-out controls and consent withdrawal mechanisms
- **Legal Pages**: All required legal documents with proper structure and compliance language

### Privacy Features
- **Cookie Banner**: GDPR-compliant cookie consent banner with customizable preferences
- **Data Processing Rights**: User interface for exercising GDPR rights including data download, correction, and deletion requests
- **Consent Tracking**: Local storage of consent preferences with proper versioning and date tracking
- **Privacy Dashboard**: Comprehensive privacy management interface accessible from footer
- **International Compliance**: Support for data transfers with appropriate safeguards and adequacy decisions

### Legal Documentation
- **Privacy Policy**: Comprehensive privacy policy covering all data collection, processing, and sharing practices
- **Terms & Conditions**: Complete terms covering booking, payments, cancellations, liability, and dispute resolution
- **Cookie Policy**: Detailed cookie policy with types, purposes, retention, and management instructions
- **Data Processing Agreement**: User rights and data processing information with contact details for Data Protection Officer