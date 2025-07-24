import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

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
}

export default function SeoHead({ 
  title = "Farm Feast Farm House - Luxury Farmhouse Rental",
  description = "Experience luxury at Farm Feast Farm House. Book your perfect getaway with premium amenities and beautiful natural surroundings.",
  image = "/api/placeholder/1200/630",
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = "website"
}: SeoHeadProps) {
  
  // Fetch review data for SEO
  const { data: reviewData } = useQuery<ReviewData>({
    queryKey: ["/api/reviews/seo"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

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
      { name: 'keywords', content: 'farmhouse rental, luxury accommodation, farm stay, vacation rental, peaceful getaway, family vacation' },
      
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
      { name: 'robots', content: 'index, follow' },
      { name: 'googlebot', content: 'index, follow' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ];

    // Add review-specific meta tags if available
    if (reviewData?.enabled && reviewData.reviewCount && reviewData.reviewCount > 0) {
      metaTags.push(
        { name: 'rating', content: reviewData.averageRating?.toString() || '0' },
        { name: 'review_count', content: reviewData.reviewCount.toString() },
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
          "ratingValue": parseFloat(reviewData.averageRating),
          "reviewCount": reviewData.reviewCount,
          "bestRating": parseInt(reviewData.ratingScale) || 5,
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

  }, [title, description, image, url, type, reviewData]);

  return null; // This component doesn't render anything visible
}