import { storage } from "./storage";
import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

// SEO template fallbacks
const seoTemplates = {
  home: {
    title: "Farm Feast Farm House - Luxury Farmhouse Rental Near Hyderabad",
    description: "Escape to luxury at Farm Feast Farm House. Premium farmhouse rental with swimming pool, modern amenities, and professional services. Perfect for events, family gatherings, and weekend getaways near Hyderabad.",
    keywords: "farmhouse rental, luxury farmhouse, swimming pool, Hyderabad, weekend getaway, event venue, family gathering",
    schemaType: "LodgingBusiness"
  },
  services: {
    title: "Premium Services - Farm Feast Farm House",
    description: "Enhance your farmhouse experience with our carefully curated services. BBQ setup, personal chef, party decorations, and more professional services available.",
    keywords: "farmhouse services, BBQ setup, personal chef, party decorations, bonfire arrangement",
    schemaType: "Service"
  },
  gallery: {
    title: "Gallery - Farm Feast Farm House Photos",
    description: "Browse our beautiful farmhouse gallery. See luxury amenities, spacious grounds, swimming pool, and memorable events at Farm Feast Farm House.",
    keywords: "farmhouse photos, gallery, luxury amenities, swimming pool, event photos",
    schemaType: "ImageGallery"
  },
  booking: {
    title: "Book Your Stay - Farm Feast Farm House",
    description: "Reserve your perfect farmhouse getaway. Easy online booking with instant pricing, service selection, and availability checking.",
    keywords: "book farmhouse, online booking, reservation, availability, pricing",
    schemaType: "Service"
  },
  contact: {
    title: "Contact Us - Farm Feast Farm House",
    description: "Get in touch with Farm Feast Farm House. Contact us for bookings, inquiries, or any assistance. We're here to help plan your perfect getaway.",
    keywords: "contact farmhouse, booking inquiries, customer support, farm house location",
    schemaType: "ContactPage"
  }
};

// Get page name from URL path
function getPageFromPath(path: string): string {
  if (path === '/' || path === '') return 'home';
  const pageName = path.replace('/', '').split('/')[0] || 'home';
  return pageName;
}

// Generate structured data (JSON-LD)
function generateStructuredData(seoSettings: any, reviewData: any, url: string): any {
  // Use admin-defined schema if available and has JSON structured data
  if (seoSettings?.schemaData && typeof seoSettings.schemaData === 'object' && Object.keys(seoSettings.schemaData).length > 0) {
    try {
      // Parse schema_data if it's a string
      const parsedSchema = typeof seoSettings.schemaData === 'string' 
        ? JSON.parse(seoSettings.schemaData) 
        : seoSettings.schemaData;
      
      return {
        "@context": "https://schema.org",
        "@type": seoSettings.schemaType || "LocalBusiness",
        ...parsedSchema,
        "name": seoSettings.title,
        "description": seoSettings.description,
        "url": url,
        "image": seoSettings.ogImage || "/api/placeholder/1200/630"
      };
    } catch (e) {
      console.log('Error parsing schema data, using fallback');
    }
  }

  // Generate dynamic schema based on page type
  const schemaType = seoSettings?.schemaType || "LocalBusiness";
  let structuredData: any = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "name": seoSettings?.title || "Farm Feast Farm House",
    "description": seoSettings?.description || "Luxury farmhouse rental experience",
    "url": url,
    "image": seoSettings?.ogImage || "/api/placeholder/1200/630"
  };

  // Add business contact info for LocalBusiness and LodgingBusiness
  if (schemaType === "LocalBusiness" || schemaType === "LodgingBusiness") {
    structuredData = {
      ...structuredData,
      "telephone": "+91-8897326898",
      "email": "info@farmfeastfarmhouse.shop",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "SY. No 170/A, Near Cheeryal Kaman, Keesara",
        "addressLocality": "Keesara",
        "postalCode": "501301",
        "addressRegion": "Telangana",
        "addressCountry": "IN"
      },
      "amenityFeature": [
        { "@type": "LocationFeatureSpecification", "name": "Swimming Pool" },
        { "@type": "LocationFeatureSpecification", "name": "Free Parking" },
        { "@type": "LocationFeatureSpecification", "name": "Air Conditioning" },
        { "@type": "LocationFeatureSpecification", "name": "Pet Friendly" },
        { "@type": "LocationFeatureSpecification", "name": "Free WiFi" }
      ],
      "priceRange": "₹5500-15000",
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 17.5099358,
        "longitude": 78.6273986
      }
    };
  }

  // Add review data for ALL page types if available and enabled
  if (reviewData?.reviewsEnabled && reviewData?.reviewCount > 0) {
    structuredData.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": parseFloat(reviewData.averageRating || "0"),
      "reviewCount": reviewData.reviewCount,
      "bestRating": parseInt(reviewData.ratingScale || "5"),
      "worstRating": 1
    };

    // Add sample reviews for rich snippets
    if (seoSettings?.reviewsEnabled && seoSettings?.showInSnippets) {
      structuredData.review = [
        {
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": "Kinididoddi Pradeep"
          },
          "datePublished": "2025-07-23",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5"
          },
          "reviewBody": "Awesome! It's very good and perfectly suited for couples and families. ❤️💯"
        },
        {
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": "Ravi Kumar"
          },
          "datePublished": "2025-07-21",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5"
          },
          "reviewBody": "Great place for a peaceful weekend. The pool and garden area were beautifully maintained!"
        }
      ];
    }
  }

  return structuredData;
}

// Generate complete meta tags HTML
function generateMetaTags(seoSettings: any, reviewData: any, url: string): string {
  const title = seoSettings?.title || "Farm Feast Farm House - Luxury Farmhouse Rental";
  const description = seoSettings?.description || "Experience luxury at Farm Feast Farm House. Book your perfect getaway with premium amenities.";
  const image = seoSettings?.ogImage || "/api/placeholder/1200/630";
  const keywords = seoSettings?.keywords || "farmhouse rental, luxury accommodation, farm stay";
  const robots = seoSettings?.noindex ? "noindex,nofollow" : "index,follow";

  const structuredData = generateStructuredData(seoSettings, reviewData, url);

  return `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="keywords" content="${keywords}" />
    <meta name="robots" content="${robots}" />
    <meta name="googlebot" content="${robots}" />
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Farm Feast Farm House" />
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
    
    ${seoSettings?.canonicalUrl ? `<link rel="canonical" href="${seoSettings.canonicalUrl}" />` : ''}
    
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    ${JSON.stringify(structuredData, null, 2)}
    </script>
  `;
}

// SEO middleware for server-side rendering
export async function seoMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only process GET requests for HTML pages
  if (req.method !== 'GET' || req.url.startsWith('/api/') || req.url.startsWith('/src/') || req.url.startsWith('/@vite/') || req.url.startsWith('/assets/')) {
    return next();
  }

  // Skip in development mode for now (Vite handles HTML serving)
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  // Check if this is a search engine crawler or social media bot
  const userAgent = req.get('User-Agent') || '';
  const isCrawler = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest|slackbot|vkShare|W3C_Validator/i.test(userAgent);
  
  // Only serve server-side rendered HTML to crawlers, let regular users get the React app
  if (!isCrawler) {
    return next();
  }

  try {
    const pageName = getPageFromPath(req.path);
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    
    // Fetch SEO settings from database
    let seoSettings = await storage.getSeoSettingsByPage(pageName);
    
    // Fall back to template if no custom settings
    if (!seoSettings && seoTemplates[pageName as keyof typeof seoTemplates]) {
      const template = seoTemplates[pageName as keyof typeof seoTemplates];
      seoSettings = {
        id: 0,
        page: pageName,
        title: template.title,
        description: template.description,
        keywords: template.keywords,
        ogTitle: template.title,
        ogDescription: template.description,
        ogImage: "/api/placeholder/1200/630",
        canonicalUrl: fullUrl,
        schemaType: template.schemaType,
        schemaData: {},
        priority: 0.8,
        changeFreq: "weekly",
        noindex: false,
        nofollow: false,
        updatedAt: new Date(),
        score: 80,
        ranking: 1,
        reviewCount: 0,
        averageRating: "0.0",
        businessName: "Farm Feast Farm House",
        ratingScale: "5",
        reviewsEnabled: true,
        showInSnippets: true,
        reviewTitle: null,
        reviewDescription: null,
        reviewKeywords: null
      };
    }

    // Get review data for SEO
    const reviewData = await storage.getReviewSettings();
    
    // Read the production HTML template
    const htmlPath = path.join(process.cwd(), 'dist/public/index.html');
    
    if (!fs.existsSync(htmlPath)) {
      return next(); // Skip if no production build exists
    }

    const html = fs.readFileSync(htmlPath, 'utf8');

    // Generate meta tags
    const metaTags = generateMetaTags(seoSettings, reviewData, fullUrl);
    
    // Inject meta tags into HTML head
    const injectedHtml = html.replace(
      /<head[^>]*>/i,
      `<head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
        ${metaTags}`
    );

    // Set appropriate headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes cache
    
    // Send the modified HTML
    res.send(injectedHtml);
    
  } catch (error) {
    console.error('SEO middleware error:', error);
    next(); // Continue to next middleware on error
  }
}