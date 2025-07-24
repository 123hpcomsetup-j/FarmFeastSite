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
    schemaType: "LodgingBusiness"
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
  
  // Handle blog post URLs specially
  if (path.startsWith('/blog/') && path.split('/').length === 3) {
    return 'blog-post';
  }
  
  const pageName = path.replace('/', '').split('/')[0] || 'home';
  return pageName;
}

// Generate blog post SEO metadata
async function generateBlogPostSEO(slug: string, req: any): Promise<any> {
  try {
    const blogPost = await storage.getBlogPostBySlug(slug);
    
    if (!blogPost) {
      return null;
    }
    
    const fullUrl = `${req.protocol}://${req.get('host')}/blog/${slug}`;
    const tags = blogPost.tags ? (Array.isArray(blogPost.tags) ? blogPost.tags : JSON.parse(blogPost.tags as string)) : [];
    
    return {
      title: blogPost.metaTitle || `${blogPost.title} - Farm Feast Farm House Blog`,
      description: blogPost.metaDescription || blogPost.excerpt || '',
      keywords: `${tags.join(', ')}, farm activities, farmhouse blog, keesara experiences, rural tourism, farm house rental`,
      ogTitle: blogPost.metaTitle || blogPost.title,
      ogDescription: blogPost.metaDescription || blogPost.excerpt || '',
      ogImage: blogPost.featuredImage || '/api/placeholder/1200/630',
      canonicalUrl: fullUrl,
      author: blogPost.author,
      publishedAt: blogPost.publishedAt,
      modifiedAt: blogPost.updatedAt,
      readTime: blogPost.readTime,
      tags: tags,
      content: blogPost.content,
      excerpt: blogPost.excerpt
    };
  } catch (error) {
    console.error('Error generating blog post SEO:', error);
    return null;
  }
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

    // Add dynamic review snippets for rich snippets
    if (seoSettings?.reviewsEnabled && seoSettings?.showInSnippets) {
      const reviews = [];
      
      // Add review snippet 1 if available
      if (seoSettings.reviewSnippet1Body && seoSettings.reviewSnippet1Author) {
        reviews.push({
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": seoSettings.reviewSnippet1Author
          },
          "datePublished": seoSettings.reviewSnippet1Date || "2025-07-23",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": seoSettings.reviewSnippet1Rating || "5"
          },
          "reviewBody": seoSettings.reviewSnippet1Body
        });
      }
      
      // Add review snippet 2 if available
      if (seoSettings.reviewSnippet2Body && seoSettings.reviewSnippet2Author) {
        reviews.push({
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": seoSettings.reviewSnippet2Author
          },
          "datePublished": seoSettings.reviewSnippet2Date || "2025-07-21",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": seoSettings.reviewSnippet2Rating || "5"
          },
          "reviewBody": seoSettings.reviewSnippet2Body
        });
      }
      
      // Only add reviews if we have at least one
      if (reviews.length > 0) {
        structuredData.review = reviews;
      }
    }
  }

  return structuredData;
}

// Generate blog post HTML for crawlers
function generateBlogPostHTML(blogSEO: any, structuredData: any): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${blogSEO.title}</title>
  <meta name="description" content="${blogSEO.description}">
  <meta name="keywords" content="${blogSEO.keywords}">
  <meta name="author" content="${blogSEO.author}">
  <meta name="robots" content="index,follow">
  <meta name="googlebot" content="index,follow">
  <meta name="article:published_time" content="${blogSEO.publishedAt}">
  <meta name="article:modified_time" content="${blogSEO.modifiedAt}">
  <meta name="article:author" content="${blogSEO.author}">
  <meta name="article:section" content="Farm Activities">
  <meta name="article:tag" content="${blogSEO.tags.join(', ')}">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${blogSEO.ogTitle}">
  <meta property="og:description" content="${blogSEO.ogDescription}">
  <meta property="og:image" content="${blogSEO.ogImage}">
  <meta property="og:url" content="${blogSEO.canonicalUrl}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Farm Feast Farm House">
  <meta property="article:published_time" content="${blogSEO.publishedAt}">
  <meta property="article:modified_time" content="${blogSEO.modifiedAt}">
  <meta property="article:author" content="${blogSEO.author}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${blogSEO.ogTitle}">
  <meta name="twitter:description" content="${blogSEO.ogDescription}">
  <meta name="twitter:image" content="${blogSEO.ogImage}">
  <meta name="twitter:creator" content="@FarmFeastFarmHouse">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${blogSEO.canonicalUrl}">
  
  <!-- Breadcrumb Schema -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://farmfeastfarmhouse.co.in/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://farmfeastfarmhouse.co.in/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "${blogSEO.title}",
        "item": "${blogSEO.canonicalUrl}"
      }
    ]
  }
  </script>
  
  <!-- Main Structured Data -->
  <script type="application/ld+json">
  ${JSON.stringify(structuredData, null, 2)}
  </script>
  
  <!-- Additional SEO optimizations -->
  <meta name="format-detection" content="telephone=no">
  <meta name="msapplication-TileColor" content="#16a34a">
  <meta name="theme-color" content="#16a34a">
  
  <!-- Performance hints -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="dns-prefetch" href="//farmfeastfarmhouse.co.in">
</head>
<body>
  <header>
    <h1>${blogSEO.title}</h1>
    <p>By ${blogSEO.author} | Published on ${new Date(blogSEO.publishedAt).toLocaleDateString()} | ${blogSEO.readTime} min read</p>
  </header>
  
  <main>
    <article>
      ${blogSEO.ogImage ? `<img src="${blogSEO.ogImage}" alt="${blogSEO.title}" width="800" height="400">` : ''}
      <div class="content">
        <p><strong>${blogSEO.excerpt}</strong></p>
        ${blogSEO.content}
      </div>
      
      <footer>
        <p>Tags: ${blogSEO.tags.join(', ')}</p>
        <p>Visit <a href="https://farmfeastfarmhouse.co.in">Farm Feast Farm House</a> for luxury farmhouse rentals near Hyderabad.</p>
      </footer>
    </article>
  </main>
  
  <nav>
    <a href="https://farmfeastfarmhouse.co.in/">Home</a> |
    <a href="https://farmfeastfarmhouse.co.in/blog">Blog</a> |
    <a href="https://farmfeastfarmhouse.co.in/services">Services</a> |
    <a href="https://farmfeastfarmhouse.co.in/booking">Book Now</a>
  </nav>
</body>
</html>`;
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
    
    // Handle blog posts specially
    if (pageName === 'blog-post') {
      const slug = req.path.split('/')[2];
      const blogSEO = await generateBlogPostSEO(slug, req);
      
      if (blogSEO) {
        // Generate blog post structured data
        const structuredData = {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": blogSEO.title,
          "description": blogSEO.excerpt,
          "author": {
            "@type": "Organization",
            "name": blogSEO.author
          },
          "publisher": {
            "@type": "Organization",
            "name": "Farm Feast Farm House",
            "logo": {
              "@type": "ImageObject",
              "url": `${req.protocol}://${req.get('host')}/api/placeholder/400/400`
            }
          },
          "datePublished": blogSEO.publishedAt,
          "dateModified": blogSEO.modifiedAt,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": blogSEO.canonicalUrl
          },
          "image": {
            "@type": "ImageObject",
            "url": blogSEO.ogImage,
            "width": 1200,
            "height": 630
          },
          "keywords": blogSEO.keywords,
          "wordCount": blogSEO.content ? blogSEO.content.replace(/<[^>]*>/g, '').length : 0,
          "timeRequired": `PT${blogSEO.readTime || 5}M`,
          "articleSection": "Farm Activities",
          "articleBody": blogSEO.excerpt,
          "url": blogSEO.canonicalUrl,
          "isPartOf": {
            "@type": "Blog",
            "@id": `${req.protocol}://${req.get('host')}/blog`,
            "name": "Farm Feast Farm House Blog"
          },
          "about": {
            "@type": "Thing",
            "name": "Farm Activities"
          }
        };
        
        // Generate complete HTML for blog posts
        const html = generateBlogPostHTML(blogSEO, structuredData);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes cache
        return res.send(html);
      }
    }
    
    // Fetch SEO settings from database for regular pages
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