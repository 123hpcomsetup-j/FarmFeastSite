import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface StructuredDataProps {
  page?: string;
  includeReviews?: boolean;
}

export default function StructuredData({ page = "home", includeReviews = true }: StructuredDataProps) {
  // Fetch SEO settings for structured data
  const { data: seoSettings } = useQuery({
    queryKey: ['/api/seo', page],
    queryFn: async () => {
      const response = await fetch(`/api/seo/${page}`);
      if (!response.ok) return null;
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch review settings
  const { data: reviewData } = useQuery({
    queryKey: ['/api/reviews/seo'],
    queryFn: async () => {
      const response = await fetch('/api/reviews/seo');
      if (!response.ok) return null;
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  useEffect(() => {
    if (!seoSettings && !reviewData) return;

    // Remove existing structured data
    const existingScript = document.getElementById('structured-data');
    if (existingScript) {
      existingScript.remove();
    }

    // Create structured data
    const structuredData: any = {
      "@context": "https://schema.org",
      "@type": "LodgingBusiness",
      "name": seoSettings?.title || "Farm Feast Farm House",
      "description": seoSettings?.description || "Luxury farmhouse rental with modern amenities, swimming pool, and professional services near Hyderabad.",
      "url": "https://farmfeastfarmhouse.co.in",
      "image": seoSettings?.ogImage || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfxFLqe3vFnzqcS4aLNemEBwmROuxSMEBJHA&s",
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

    // Add review data if enabled and available
    if (includeReviews && reviewData?.enabled && seoSettings?.showInSnippets !== false) {
      const finalReviewCount = seoSettings?.reviewCount || reviewData?.reviewCount || 1008;
      const finalAverageRating = seoSettings?.averageRating || reviewData?.averageRating || "4.5";
      
      if (finalReviewCount > 0) {
        structuredData.aggregateRating = {
          "@type": "AggregateRating",
          "ratingValue": parseFloat(finalAverageRating),
          "reviewCount": finalReviewCount,
          "bestRating": parseInt(seoSettings?.ratingScale || "5"),
          "worstRating": 1
        };

        // Add individual review snippets from admin panel
        if (seoSettings?.showInSnippets) {
          const reviews = [];
          
          // Review snippet 1 from admin panel
          if (seoSettings?.reviewSnippet1Author && seoSettings?.reviewSnippet1Body) {
            reviews.push({
              "@type": "Review",
              "author": {
                "@type": "Person",
                "name": seoSettings.reviewSnippet1Author
              },
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": seoSettings.reviewSnippet1Rating || "5",
                "bestRating": "5",
                "worstRating": "1"
              },
              "reviewBody": seoSettings.reviewSnippet1Body,
              "datePublished": seoSettings.reviewSnippet1Date || "2025-07-23"
            });
          }
          
          // Review snippet 2 from admin panel
          if (seoSettings?.reviewSnippet2Author && seoSettings?.reviewSnippet2Body) {
            reviews.push({
              "@type": "Review",
              "author": {
                "@type": "Person",
                "name": seoSettings.reviewSnippet2Author
              },
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": seoSettings.reviewSnippet2Rating || "5",
                "bestRating": "5",
                "worstRating": "1"
              },
              "reviewBody": seoSettings.reviewSnippet2Body,
              "datePublished": seoSettings.reviewSnippet2Date || "2025-07-21"
            });
          }
          
          if (reviews.length > 0) {
            structuredData.review = reviews;
          }
        }
      }
    }

    // Create and inject script tag
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'structured-data';
    script.textContent = JSON.stringify(structuredData, null, 2);
    document.head.appendChild(script);

    console.log("Structured data injected:", structuredData);
    
    // Cleanup function
    return () => {
      const scriptToRemove = document.getElementById('structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [seoSettings, reviewData, page, includeReviews]);

  return null; // This component doesn't render anything visible
}