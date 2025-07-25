import type { Service, GalleryImage, SeoSettings } from "@shared/schema";
import { storage } from "./storage";

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
}

export class SitemapService {
  private baseUrl: string;
  private storage: any;

  constructor(baseUrlOrStorage: string | any = 'https://farmfeastfarmhouse.co.in', storageInstance?: any) {
    if (typeof baseUrlOrStorage === 'string') {
      // Ensure production domain always uses HTTPS
      let cleanUrl = baseUrlOrStorage.replace(/\/$/, ''); // Remove trailing slash
      if (cleanUrl.includes('farmfeastfarmhouse.co.in') && cleanUrl.startsWith('http://')) {
        cleanUrl = cleanUrl.replace('http://', 'https://');
      }
      this.baseUrl = cleanUrl;
      this.storage = storageInstance || storage;
    } else {
      // Legacy constructor for backward compatibility
      this.storage = baseUrlOrStorage;
      this.baseUrl = 'https://farmfeastfarmhouse.co.in';
    }
  }

  private formatDate(date: Date | string | null): string {
    if (!date) return new Date().toISOString().split('T')[0];
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  }

  private async getStaticPages(): Promise<SitemapUrl[]> {
    const now = new Date();
    const today = this.formatDate(now);

    // Get SEO settings to determine if pages exist and their importance
    const seoSettings = await this.storage.getAllSeoSettings();
    const seoMap = seoSettings.reduce((acc: any, setting: any) => {
      acc[setting.page] = setting;
      return acc;
    }, {} as { [key: string]: any });

    const staticPages: SitemapUrl[] = [
      {
        loc: `${this.baseUrl}/`,
        lastmod: today,
        changefreq: 'daily',
        priority: '1.0'
      },
      {
        loc: `${this.baseUrl}/services`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.9'
      },
      {
        loc: `${this.baseUrl}/gallery`,
        lastmod: today,
        changefreq: 'weekly',
        priority: '0.8'
      },
      {
        loc: `${this.baseUrl}/booking`,
        lastmod: today,
        changefreq: 'monthly',
        priority: '0.9'
      },
      {
        loc: `${this.baseUrl}/booking-confirmation`,
        lastmod: today,
        changefreq: 'monthly',
        priority: '0.6'
      },
      {
        loc: `${this.baseUrl}/contact`,
        lastmod: today,
        changefreq: 'monthly',
        priority: '0.7'
      }
    ];

    // Add crawler endpoints for enhanced SEO
    const crawlerPages: SitemapUrl[] = [
      {
        loc: `${this.baseUrl}/api/crawler/home`,
        lastmod: today,
        changefreq: 'daily' as const,
        priority: '1.0'
      },
      {
        loc: `${this.baseUrl}/api/crawler/services`,
        lastmod: today,
        changefreq: 'weekly' as const,
        priority: '0.9'
      },
      {
        loc: `${this.baseUrl}/api/crawler/gallery`,
        lastmod: today,
        changefreq: 'weekly' as const,
        priority: '0.8'
      },
      {
        loc: `${this.baseUrl}/api/crawler/booking`,
        lastmod: today,
        changefreq: 'monthly' as const,
        priority: '0.9'
      },
      {
        loc: `${this.baseUrl}/api/crawler/contact`,
        lastmod: today,
        changefreq: 'monthly' as const,
        priority: '0.7'
      }
    ];

    staticPages.push(...crawlerPages);

    // Adjust priorities based on SEO settings
    staticPages.forEach(page => {
      const pageName = page.loc.replace(`${this.baseUrl}/`, '') || 'home';
      const seoData = seoMap[pageName];
      if (seoData && seoData.ranking) {
        // Higher ranking = higher priority
        const normalizedRanking = Math.max(0.5, Math.min(1.0, seoData.ranking / 100));
        page.priority = normalizedRanking.toFixed(1);
      }
    });

    return staticPages;
  }

  private async getServicePages(): Promise<SitemapUrl[]> {
    try {
      const services = await this.storage.getAllServices();
      const activeServices = services.filter((service: any) => service.active);
      
      return activeServices.map((service: any) => ({
        loc: `${this.baseUrl}/services/${this.slugify(service.name)}`,
        lastmod: this.formatDate(new Date()),
        changefreq: 'monthly' as const,
        priority: '0.7'
      }));
    } catch (error) {
      console.error('Error fetching services for sitemap:', error);
      return [];
    }
  }

  private async getGalleryPages(): Promise<SitemapUrl[]> {
    try {
      const images = await this.storage.getAllGalleryImages();
      const activeImages = images.filter((img: any) => img.active);
      
      // Get unique categories
      const categorySet = new Set(activeImages.map((img: any) => img.category));
      const categories = Array.from(categorySet);
      
      return categories.map((category) => ({
        loc: `${this.baseUrl}/gallery/${this.slugify(category)}`,
        lastmod: this.formatDate(new Date()),
        changefreq: 'weekly' as const,
        priority: '0.6'
      }));
    } catch (error) {
      console.error('Error fetching gallery categories for sitemap:', error);
      return [];
    }
  }

  private async getBlogPages(): Promise<SitemapUrl[]> {
    try {
      const blogPosts = await this.storage.getPublishedBlogPosts();
      
      const blogUrls: SitemapUrl[] = [];
      
      // Add blog listing page
      blogUrls.push({
        loc: `${this.baseUrl}/blog`,
        lastmod: this.formatDate(new Date()),
        changefreq: 'weekly' as const,
        priority: '0.8'
      });
      
      // Add individual blog posts
      blogPosts.forEach((post: any) => {
        // Add user-facing blog post URL
        blogUrls.push({
          loc: `${this.baseUrl}/blog/${post.slug}`,
          lastmod: this.formatDate(post.updatedAt || post.createdAt),
          changefreq: 'weekly' as const,
          priority: '0.7'
        });
        
        // Add crawler endpoint for better SEO indexing
        blogUrls.push({
          loc: `${this.baseUrl}/api/crawler/blog/${post.slug}`,
          lastmod: this.formatDate(post.updatedAt || post.createdAt),
          changefreq: 'weekly' as const,
          priority: '0.6'
        });
      });
      
      return blogUrls;
    } catch (error) {
      console.error('Error fetching blog posts for sitemap:', error);
      return [];
    }
  }

  private slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')        // Replace spaces with -
      .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
      .replace(/\-\-+/g, '-')      // Replace multiple - with single -
      .replace(/^-+/, '')          // Trim - from start of text
      .replace(/-+$/, '');         // Trim - from end of text
  }

  async generateSitemap(): Promise<string> {
    try {
      // Get all URL types
      const [staticPages, servicePages, galleryPages, blogPages] = await Promise.all([
        this.getStaticPages(),
        this.getServicePages(),
        this.getGalleryPages(),
        this.getBlogPages()
      ]);

      // Combine all URLs
      const allUrls = [
        ...staticPages,
        ...servicePages,
        ...galleryPages,
        ...blogPages
      ];

      // Sort by priority (descending) then by URL
      allUrls.sort((a, b) => {
        const priorityDiff = parseFloat(b.priority) - parseFloat(a.priority);
        if (priorityDiff !== 0) return priorityDiff;
        return a.loc.localeCompare(b.loc);
      });

      // Generate XML
      let xml = this.generateSitemapXML(allUrls);
      
      // Ensure production domain always uses HTTPS
      if (this.baseUrl.includes('farmfeastfarmhouse.co.in')) {
        xml = xml.replace(/http:\/\/farmfeastfarmhouse\.co\.in/g, 'https://farmfeastfarmhouse.co.in');
      }
      
      return xml;
    } catch (error) {
      console.error('Error generating sitemap:', error);
      throw error;
    }
  }

  private generateSitemapXML(urls: SitemapUrl[]): string {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const sitemapOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    const sitemapClose = '</urlset>';

    const urlEntries = urls.map(url => {
      return `  <url>
    <loc>${this.escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`;
    }).join('\n');

    return `${xmlHeader}
${sitemapOpen}
${urlEntries}
${sitemapClose}`;
  }

  private escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case "'": return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }

  async generateRobotsTxt(): Promise<string> {
    // Ensure production domain uses HTTPS for sitemap reference
    const sitemapUrl = this.baseUrl.includes('farmfeastfarmhouse.co.in') 
      ? this.baseUrl.replace('http://', 'https://') 
      : this.baseUrl;
      
    const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${sitemapUrl}/sitemap.xml

# SEO-optimized crawler endpoints for better indexing
Allow: /api/crawler/home
Allow: /api/crawler/services
Allow: /api/crawler/gallery
Allow: /api/crawler/booking
Allow: /api/crawler/contact

# Optimize crawl budget
Crawl-delay: 1

# Block admin and internal pages
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /uploads/temp/

# Allow important directories and SEO endpoints
Allow: /uploads/gallery/
Allow: /assets/
Allow: /api/crawler/`;

    return robotsTxt;
  }
}

export const sitemapService = new SitemapService();