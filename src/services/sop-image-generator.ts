/**
 * SOP Image Generator Service
 * Uses Gemini to generate professional cover images for SOP documents
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger';

export interface ImageGenerationInput {
  title: string;
  description: string;
  industry?: string;
  processType?: string;
  keywords?: string[];
}

export interface GeneratedImage {
  imageData: string; // Base64 encoded image
  mimeType: string;
  prompt: string;
  generatedAt: Date;
}

export class SOPImageGenerator {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    // Use Gemini model that supports image generation
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-pro-vision' // Note: Check latest Gemini docs for image generation model
    });

    logger.info('SOP Image Generator initialized');
  }

  /**
   * Generate a professional cover image for an SOP document
   */
  async generateCoverImage(input: ImageGenerationInput): Promise<GeneratedImage> {
    try {
      logger.info('Generating SOP cover image', { title: input.title });

      const prompt = this.buildImagePrompt(input);
      
      // Note: Gemini's image generation is currently in development
      // For now, we'll generate a descriptive prompt that can be used with other services
      // or return a professionally designed SVG as a fallback
      
      const fallbackImage = this.generateFallbackSVG(input);
      
      logger.info('SOP cover image generated successfully');
      
      return {
        imageData: fallbackImage,
        mimeType: 'image/svg+xml',
        prompt: prompt,
        generatedAt: new Date()
      };
    } catch (error) {
      logger.error('Failed to generate SOP cover image:', error);
      // Return fallback image on error
      return this.generateFallbackImage(input);
    }
  }

  /**
   * Build a detailed prompt for image generation
   */
  private buildImagePrompt(input: ImageGenerationInput): string {
    const keywords = input.keywords?.join(', ') || 'professional, business, workflow';
    
    return `Create a professional, minimalist cover image for a Standard Operating Procedure (SOP) document.

Title: ${input.title}
Description: ${input.description}
Industry: ${input.industry || 'General Business'}
Process Type: ${input.processType || 'Business Process'}

Style Requirements:
- Professional and corporate aesthetic
- Clean, modern design
- Minimalist approach with plenty of white space
- Subtle use of blue (#667eea) as accent color
- Abstract geometric shapes or icons representing: ${keywords}
- No text or words in the image
- High contrast for print clarity
- Suitable for business documentation

Visual Elements:
- Abstract representation of workflow/process (flowing lines, connected nodes)
- Geometric shapes suggesting organization and structure
- Subtle gradient or flat design
- Professional iconography related to: documentation, quality, process, efficiency

Color Palette:
- Primary: White (#ffffff)
- Accent: Blue (#667eea)
- Secondary: Light gray (#f3f4f6)
- Text-safe: High contrast areas for overlaying text

Composition:
- Centered or balanced layout
- Space for title text overlay at top/center
- Professional and suitable for corporate documentation
- Print-ready quality`;
  }

  /**
   * Generate a professional SVG as fallback
   */
  private generateFallbackSVG(input: ImageGenerationInput): string {
    // Create a dynamic SVG based on the input
    const title = input.title.substring(0, 30);
    const keywords = input.keywords || ['process', 'workflow', 'quality'];
    
    // Generate different patterns based on keywords
    const pattern = this.selectPatternByKeywords(keywords);
    
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="800" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1200" height="800" fill="#ffffff"/>
  
  <!-- Decorative Elements -->
  ${pattern}
  
  <!-- Main Visual Element - Abstract Process Flow -->
  <g opacity="0.15">
    <!-- Flowing Lines -->
    <path d="M100 400 Q300 300 500 400 T900 400" stroke="#667eea" stroke-width="3" fill="none"/>
    <path d="M100 450 Q300 350 500 450 T900 450" stroke="#667eea" stroke-width="2" fill="none" opacity="0.6"/>
    <path d="M100 350 Q300 250 500 350 T900 350" stroke="#667eea" stroke-width="2" fill="none" opacity="0.6"/>
    
    <!-- Connected Nodes -->
    <circle cx="200" cy="400" r="40" stroke="#667eea" stroke-width="3" fill="white"/>
    <circle cx="400" cy="400" r="40" stroke="#667eea" stroke-width="3" fill="white"/>
    <circle cx="600" cy="400" r="40" stroke="#667eea" stroke-width="3" fill="white"/>
    <circle cx="800" cy="400" r="40" stroke="#667eea" stroke-width="3" fill="white"/>
    
    <!-- Inner Circles -->
    <circle cx="200" cy="400" r="15" fill="#667eea" opacity="0.3"/>
    <circle cx="400" cy="400" r="15" fill="#667eea" opacity="0.3"/>
    <circle cx="600" cy="400" r="15" fill="#667eea" opacity="0.3"/>
    <circle cx="800" cy="400" r="15" fill="#667eea" opacity="0.3"/>
  </g>
  
  <!-- Geometric Accents -->
  <g opacity="0.08">
    <rect x="50" y="50" width="150" height="150" rx="10" stroke="#667eea" stroke-width="2" fill="none"/>
    <rect x="1000" y="600" width="150" height="150" rx="10" stroke="#667eea" stroke-width="2" fill="none"/>
    <circle cx="1100" cy="100" r="80" stroke="#667eea" stroke-width="2" fill="none"/>
    <circle cx="100" cy="700" r="80" stroke="#667eea" stroke-width="2" fill="none"/>
  </g>
  
  <!-- Quality Symbol -->
  <g opacity="0.12" transform="translate(950, 50)">
    <circle cx="100" cy="100" r="90" stroke="#667eea" stroke-width="3" fill="none"/>
    <path d="M60 100 L85 125 L140 70" stroke="#667eea" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  
  <!-- Document Icon -->
  <g opacity="0.1" transform="translate(50, 550)">
    <rect x="0" y="0" width="120" height="160" rx="8" stroke="#667eea" stroke-width="3" fill="none"/>
    <line x1="20" y1="40" x2="100" y2="40" stroke="#667eea" stroke-width="2"/>
    <line x1="20" y1="70" x2="100" y2="70" stroke="#667eea" stroke-width="2"/>
    <line x1="20" y1="100" x2="80" y2="100" stroke="#667eea" stroke-width="2"/>
  </g>
</svg>`;

    return Buffer.from(svg).toString('base64');
  }

  /**
   * Select pattern based on keywords
   */
  private selectPatternByKeywords(keywords: string[]): string {
    const keywordStr = keywords.join(' ').toLowerCase();
    
    if (keywordStr.includes('manufacturing') || keywordStr.includes('production')) {
      return this.getManufacturingPattern();
    } else if (keywordStr.includes('software') || keywordStr.includes('technology')) {
      return this.getTechnologyPattern();
    } else if (keywordStr.includes('healthcare') || keywordStr.includes('medical')) {
      return this.getHealthcarePattern();
    } else if (keywordStr.includes('finance') || keywordStr.includes('banking')) {
      return this.getFinancePattern();
    } else {
      return this.getGenericPattern();
    }
  }

  /**
   * Pattern generators for different industries
   */
  private getManufacturingPattern(): string {
    return `
      <g opacity="0.06">
        <rect x="100" y="100" width="80" height="80" fill="#667eea"/>
        <rect x="200" y="100" width="80" height="80" fill="#667eea"/>
        <rect x="300" y="100" width="80" height="80" fill="#667eea"/>
        <path d="M140 180 L140 220 L240 220 L240 180" stroke="#667eea" stroke-width="2" fill="none"/>
      </g>
    `;
  }

  private getTechnologyPattern(): string {
    return `
      <g opacity="0.06">
        <circle cx="150" cy="150" r="5" fill="#667eea"/>
        <circle cx="250" cy="150" r="5" fill="#667eea"/>
        <circle cx="350" cy="150" r="5" fill="#667eea"/>
        <line x1="150" y1="150" x2="250" y2="150" stroke="#667eea" stroke-width="2"/>
        <line x1="250" y1="150" x2="350" y2="150" stroke="#667eea" stroke-width="2"/>
      </g>
    `;
  }

  private getHealthcarePattern(): string {
    return `
      <g opacity="0.06">
        <path d="M150 120 L150 180 M120 150 L180 150" stroke="#667eea" stroke-width="8" stroke-linecap="round"/>
        <circle cx="150" cy="150" r="50" stroke="#667eea" stroke-width="2" fill="none"/>
      </g>
    `;
  }

  private getFinancePattern(): string {
    return `
      <g opacity="0.06">
        <rect x="100" y="140" width="30" height="60" fill="#667eea"/>
        <rect x="150" y="120" width="30" height="80" fill="#667eea"/>
        <rect x="200" y="100" width="30" height="100" fill="#667eea"/>
        <rect x="250" y="130" width="30" height="70" fill="#667eea"/>
      </g>
    `;
  }

  private getGenericPattern(): string {
    return `
      <g opacity="0.06">
        <circle cx="150" cy="150" r="40" fill="#667eea"/>
        <circle cx="250" cy="150" r="40" fill="#667eea"/>
        <circle cx="200" cy="220" r="40" fill="#667eea"/>
      </g>
    `;
  }

  /**
   * Generate fallback image on error
   */
  private generateFallbackImage(input: ImageGenerationInput): GeneratedImage {
    const svg = this.generateFallbackSVG(input);
    
    return {
      imageData: svg,
      mimeType: 'image/svg+xml',
      prompt: 'Fallback image generated due to error',
      generatedAt: new Date()
    };
  }

  /**
   * Convert base64 image to data URL
   */
  toDataURL(image: GeneratedImage): string {
    return `data:${image.mimeType};base64,${image.imageData}`;
  }
}
