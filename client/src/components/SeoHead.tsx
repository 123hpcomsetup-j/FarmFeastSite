import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';

interface SeoHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

interface ReviewData {
  enabled: boolean;
  reviewCount?: number;
  averageRating?: number;
  businessName?: string;
  ratingScale?: number;
  reviewsEnabled?: boolean;
  showInSnippets?: boolean;
}

interface SeoSettings {
  id: number;
  page: string;
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  schemaType: string;
  schemaData: Record<string, any>;
  priority: number;
  changeFreq: string;
  noindex: boolean;
  nofollow: boolean;
}

export default function SeoHead({ 
  title: propTitle,
  description: propDescription,
  image: propImage,
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = "website"
}: SeoHeadProps) {
  
  const [location] = useLocation();
  
  // Get current page name from route
  const getCurrentPageName = () => {
    if (location === '/') return 'home';
    return location.replace('/', '').split('/')[0] || 'home';
  };

  const currentPage = getCurrentPageName();
  
  // Fetch SEO settings for current page
  const { data: seoSettings } = useQuery<SeoSettings>({
    queryKey: ["/api/seo", currentPage],
    staleTime: 0, // No cache for real-time updates
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: false,
  });
  
  // Fetch review data for SEO
  const { data: reviewData } = useQuery<ReviewData>({
    queryKey: ["/api/reviews/seo"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use SEO settings from database if available, otherwise fall back to props
  const title = seoSettings?.title || propTitle || "Farm Feast Farm House - Luxury Farmhouse Rental";
  const description = seoSettings?.description || propDescription || "Experience luxury at Farm Feast Farm House. Book your perfect getaway with premium amenities and beautiful natural surroundings.";
  const image = seoSettings?.ogImage || propImage || "/api/placeholder/1200/630";
  const keywords = seoSettings?.keywords || 'farmhouse rental, luxury accommodation, farm stay, vacation rental, peaceful getaway, family vacation';
  const robots = seoSettings?.noindex ? 'noindex' : 'index, follow';

  useEffect(() => {
    // Update document title
    document.title = title;

    // Remove existing meta tags
    const existingMetas = document.querySelectorAll('meta[data-seo="true"]');
    existingMetas.forEach(meta => meta.remove());

    // Remove existing JSON-LD scripts
    const existingJsonLd = document.querySelectorAll('script[data-schema="true"]');
    existingJsonLd.forEach(script => script.remove());

    // Basic meta tags
    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { name: 'robots', content: robots },
      
      // Open Graph tags
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: url },
      { property: 'og:type', content: type },
      { property: 'og:site_name', content: 'Farm Feast Farm House' },
      
      // Twitter Card tags
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
      
      // Additional SEO tags
      { name: 'googlebot', content: robots },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ];

    // Add canonical URL if available
    if (seoSettings?.canonicalUrl) {
      const canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.href = seoSettings.canonicalUrl;
      canonicalLink.setAttribute('data-seo', 'true');
      document.head.appendChild(canonicalLink);
    }

    // Add review-specific meta tags if available
    if (reviewData?.enabled && reviewData.reviewCount && reviewData.reviewCount > 0) {
      metaTags.push(
        { name: 'rating', content: reviewData.averageRating?.toString() || '0' },
        { name: 'review_count', content: reviewData.reviewCount?.toString() || '0' },
      );
    }

    // Create and append meta tags
    metaTags.forEach(({ name, property, content }) => {
      const meta = document.createElement('meta');
      if (name) meta.setAttribute('name', name);
      if (property) meta.setAttribute('property', property);
      meta.setAttribute('content', content);
      meta.setAttribute('data-seo', 'true');
      document.head.appendChild(meta);
    });

    // Add JSON-LD structured data with reviews
    if (reviewData?.reviewsEnabled && reviewData?.showInSnippets && reviewData.reviewCount && reviewData.reviewCount > 0) {
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "LodgingBusiness",
        "name": reviewData.businessName || "Farm Feast Farm House",
        "description": description,
        "url": url,
        "image": image,
        "telephone": "+91-8897326898",
        "email": "info@farmfeastfarmhouse.shop",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "SY. No 170/A, Near Cheeryal Kaman, Keesara",
          "addressLocality": "Rangareddy",
          "postalCode": "501301",
          "addressRegion": "Telangana",
          "addressCountry": "IN"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": parseFloat((reviewData.averageRating || 0).toString()),
          "reviewCount": reviewData.reviewCount || 0,
          "bestRating": parseInt((reviewData.ratingScale || 5).toString()),
          "worstRating": 1
        },
        "review": [
          {
            "@type": "Review",
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": 5,
              "bestRating": 5
            },
            "author": {
              "@type": "Person",
              "name": "Verified Guest"
            },
            "datePublished": "2024-12-01",
            "reviewBody": "Amazing farmhouse experience! Perfect for family getaways with excellent amenities and beautiful surroundings."
          },
          {
            "@type": "Review",
            "reviewRating": {
              "@type": "Rating", 
              "ratingValue": 5,
              "bestRating": 5
            },
            "author": {
              "@type": "Person",
              "name": "Happy Customer"
            },
            "datePublished": "2024-11-28",
            "reviewBody": "Fantastic service and beautiful property. The farm-to-table dining was exceptional. Highly recommended!"
          }
        ],
        "amenityFeature": [
          {
            "@type": "LocationFeatureSpecification",
            "name": "Swimming Pool"
          },
          {
            "@type": "LocationFeatureSpecification", 
            "name": "Free Parking"
          },
          {
            "@type": "LocationFeatureSpecification",
            "name": "Air Conditioning"
          },
          {
            "@type": "LocationFeatureSpecification",
            "name": "Pet Friendly"
          },
          {
            "@type": "LocationFeatureSpecification",
            "name": "Free WiFi"
          }
        ],
        "priceRange": "₹₹",
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 17.5449,
          "longitude": 78.5718
        },
        "hasMap": "https://maps.google.com/",
        "isAccessibleForFree": false,
        "checkinTime": "14:00",
        "checkoutTime": "11:00"
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-schema', 'true');
      script.textContent = JSON.stringify(structuredData, null, 2);
      document.head.appendChild(script);
    } else {
      // Basic business schema without reviews
      const basicStructuredData = {
        "@context": "https://schema.org",
        "@type": "LodgingBusiness", 
        "name": "Farm Feast Farm House",
        "description": description,
        "url": url,
        "image": image,
        "telephone": "+91-8897326898",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "SY. No 170/A, Near Cheeryal Kaman, Keesara",
          "addressLocality": "Rangareddy", 
          "postalCode": "501301",
          "addressCountry": "IN"
        },
        "amenityFeature": [
          {
            "@type": "LocationFeatureSpecification",
            "name": "Swimming Pool"
          },
          {
            "@type": "LocationFeatureSpecification",
            "name": "Parking"
          },
          {
            "@type": "LocationFeatureSpecification",
            "name": "Air Conditioning"
          }
        ],
        "priceRange": "₹₹"
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-schema', 'true');
      script.textContent = JSON.stringify(basicStructuredData, null, 2);
      document.head.appendChild(script);
    }

  }, [title, description, image, url, type, reviewData, seoSettings, keywords, robots]);

  return null; // This component doesn't render anything visible
}