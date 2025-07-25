import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

// Image optimization middleware for faster loading
export class ImageOptimizer {
  
  // Optimize image serving with compression and format conversion
  static optimizeImageResponse(req: Request, res: Response, imagePath: string) {
    const acceptHeader = req.headers.accept || '';
    const userAgent = req.headers['user-agent'] || '';
    
    // Check if browser supports modern formats
    const supportsWebP = acceptHeader.includes('image/webp');
    const supportsAVIF = acceptHeader.includes('image/avif');
    
    // Get original file extension
    const ext = path.extname(imagePath).toLowerCase();
    const isOptimizable = ['.jpg', '.jpeg', '.png'].includes(ext);
    
    if (isOptimizable) {
      // Try to serve optimized format
      let optimizedPath = imagePath;
      
      if (supportsAVIF) {
        optimizedPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.avif');
      } else if (supportsWebP) {
        optimizedPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      }
      
      // Check if optimized version exists
      if (optimizedPath !== imagePath && fs.existsSync(optimizedPath)) {
        imagePath = optimizedPath;
      }
    }
    
    // Set aggressive caching headers
    res.set({
      'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
      'ETag': `"${path.basename(imagePath)}-${Date.now()}"`,
      'Vary': 'Accept-Encoding, Accept',
      'X-Optimized': 'true'
    });
    
    // Check if client has cached version
    if (req.headers['if-none-match']) {
      return res.status(304).end();
    }
    
    // Serve the image
    res.sendFile(path.resolve(imagePath));
  }
  
  // Generate responsive image sizes
  static generateResponsiveSizes(width: number, height: number): Array<{width: number, height: number}> {
    const aspectRatio = width / height;
    const sizes = [
      { width: 320, height: Math.round(320 / aspectRatio) },   // Mobile
      { width: 768, height: Math.round(768 / aspectRatio) },   // Tablet
      { width: 1024, height: Math.round(1024 / aspectRatio) }, // Desktop
      { width: 1920, height: Math.round(1920 / aspectRatio) }  // Large Desktop
    ];
    
    // Filter out sizes larger than original
    return sizes.filter(size => size.width <= width && size.height <= height);
  }
  
  // Create placeholder for progressive loading
  static createLowQualityPlaceholder(width: number, height: number): string {
    // Generate SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f4f4f4;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e5e5e5;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#grad)" />
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
              font-family="Arial" font-size="14" fill="#999">Loading...</text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
  
  // Optimize image parameters from URL
  static parseImageParams(query: any): {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
    compress?: boolean;
  } {
    return {
      width: query.w ? parseInt(query.w) : query.width ? parseInt(query.width) : undefined,
      height: query.h ? parseInt(query.h) : query.height ? parseInt(query.height) : undefined,
      quality: query.q ? parseInt(query.q) : query.quality ? parseInt(query.quality) : 85,
      format: query.format || 'auto',
      compress: query.compress === 'true' || query.compress === '1'
    };
  }
}

// Enhanced placeholder endpoint with compression
export function setupOptimizedPlaceholder(app: any) {
  app.get('/api/placeholder/:width/:height', (req: Request, res: Response) => {
    const width = parseInt(req.params.width) || 300;
    const height = parseInt(req.params.height) || 200;
    const params = ImageOptimizer.parseImageParams(req.query);
    
    // Set compression headers
    res.set({
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Vary': 'Accept-Encoding'
    });
    
    // Generate optimized placeholder
    const placeholder = ImageOptimizer.createLowQualityPlaceholder(
      Math.min(width, 1920), 
      Math.min(height, 1080)
    );
    
    res.send(placeholder.replace('data:image/svg+xml;base64,', ''));
  });
}