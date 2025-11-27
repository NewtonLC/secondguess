/**
 * SOP Text Generator Service
 * Uses Gemini to generate ISO-formatted SOP documentation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger';

export interface SOPTextInput {
  title: string;
  description: string;
  steps: any[];
  inputs: any[];
  outputs: any[];
  actors?: string[];
  risks?: any[];
  dependencies?: any[];
}

export interface SOPSection {
  number: string;
  title: string;
  content: string;
  subsections?: SOPSection[];
}

export interface GeneratedSOPText {
  title: string;
  documentNumber: string;
  version: string;
  effectiveDate: string;
  sections: SOPSection[];
}

export class SOPTextGenerator {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    // Use flash model for text generation (pro not available in free tier)
    this.model = this.genAI.getGenerativeModel({ 
      model: process.env.GEMINI_TEXT_MODEL || 'gemini-2.0-flash-lite' 
    });

    logger.info('SOP Text Generator initialized');
  }

  /**
   * Generate complete ISO-formatted SOP text
   */
  async generateSOPText(input: SOPTextInput): Promise<GeneratedSOPText> {
    try {
      logger.info('Generating SOP text', { title: input.title });

      const prompt = this.buildSOPPrompt(input);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const sopDocument = this.parseSOPResponse(text, input);

      logger.info('SOP text generated successfully');
      return sopDocument;
    } catch (error) {
      logger.error('Failed to generate SOP text:', error);
      throw new Error('Failed to generate SOP text');
    }
  }

  /**
   * Build comprehensive prompt for SOP generation
   */
  private buildSOPPrompt(input: SOPTextInput): string {
    return `You are an expert technical writer specializing in Standard Operating Procedures (SOPs) following ISO 9001 standards.

Generate a comprehensive, professional SOP document with the following information:

PROCESS TITLE: ${input.title}
DESCRIPTION: ${input.description}

PROCESS STEPS:
${input.steps.map((step, i) => `${i + 1}. ${step.description || step.title || step}`).join('\n')}

INPUTS REQUIRED:
${input.inputs.map((inp, i) => `${i + 1}. ${inp.name || inp}${inp.description ? ` - ${inp.description}` : ''}`).join('\n')}

EXPECTED OUTPUTS:
${input.outputs.map((out, i) => `${i + 1}. ${out.name || out}${out.description ? ` - ${out.description}` : ''}`).join('\n')}

${input.actors && input.actors.length > 0 ? `ROLES/ACTORS INVOLVED:\n${input.actors.join(', ')}` : ''}

${input.risks && input.risks.length > 0 ? `IDENTIFIED RISKS:\n${input.risks.map((r, i) => `${i + 1}. ${r.description || r}`).join('\n')}` : ''}

Create a complete SOP document following ISO 9001 structure with these sections:

### PURPOSE
   - Clear statement of why this SOP exists
   - Scope of application
   - Benefits and objectives

### SCOPE
   - What is covered by this SOP
   - What is NOT covered
   - Applicable departments/areas

### DEFINITIONS AND ABBREVIATIONS
   - Key terms used in the document
   - Acronyms and their meanings
   - Technical terminology

### RESPONSIBILITIES
   - Roles and their specific responsibilities
   - Authority levels
   - Accountability matrix

### PROCEDURE
   CRITICAL FORMATTING REQUIREMENTS:
   - Main steps MUST use format: "1. Step Title - Brief description"
   - Number, title, dash, and description MUST be on ONE LINE
   - Related sub-steps MUST use sub-numbering: 1.1, 1.2, 1.3 (NOT separate numbers)
   - Sub-steps should be additional details or warnings related to the main step
   - Each sub-step on its own line with proper numbering
   
   EXACT FORMAT TO FOLLOW:
   
   1. Prepare Materials - Gather all required materials and tools
   1.1 Check material quality and expiration dates
   1.2 Verify quantities match requirements
   1.3 Organize materials in work area
   
   2. Execute Process - Follow the documented procedure
   2.1 Monitor progress at each checkpoint
   2.2 Record observations and measurements
   2.3 Address any deviations immediately
   
   3. Complete Documentation - Record all results and observations
   3.1 Fill out required forms
   3.2 Sign and date all documents
   3.3 File records in appropriate location

### REQUIRED RESOURCES
   - Materials and supplies
   - Equipment and tools
   - Personnel requirements
   - Information systems

### DOCUMENTATION AND RECORDS
   - Forms to be completed
   - Records to be maintained
   - Retention periods
   - Storage requirements

### QUALITY CONTROL
   - Quality standards
   - Inspection points
   - Acceptance criteria
   - Non-conformance handling

### SAFETY AND COMPLIANCE
   - Safety precautions
   - Regulatory requirements
   - Environmental considerations
   - Risk mitigation measures

### REFERENCES
    - Related SOPs
    - Regulatory standards
    - Supporting documents

### REVISION HISTORY
    - Create a table with columns: Version, Date, Description, Author
    - Add ONE row: Version 1.0, today's date (${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}), Initial release, AI Voice SOP Agent
    - Use markdown table format

Requirements:
- Use professional, clear, and concise language
- Write in imperative mood for procedures (e.g., "Complete the form", not "The form should be completed")
- Include specific details and avoid ambiguity

CRITICAL PROCEDURE FORMATTING (MUST FOLLOW EXACTLY):
- Main steps: "1. Step Title - Brief description" (ALL on ONE line)
- Sub-steps: Use sub-numbering "1.1", "1.2", "1.3" (NOT dashes, NOT separate numbers)
- Sub-steps are additional details, warnings, or notes for the main step
- Example:
  1. Prepare Materials - Gather all required materials and tools
  1.1 Check material quality and expiration dates
  1.2 Verify quantities match requirements
  1.3 Organize materials in work area
  2. Execute Process - Follow the documented procedure
  2.1 Monitor progress at each checkpoint
  2.2 Record observations and measurements
  2.3 Address any deviations immediately

OTHER FORMATTING:
- Use numbered lists (1. 2. 3.) for main sequential steps in PROCEDURE section
- Use bullet points (use - not *) for non-sequential items and sub-details
- Maintain consistent formatting throughout
- Include quality checkpoints
- Address potential issues and their solutions
- DO NOT add numbers before section titles - they will be added automatically
- Use "###" for main section titles (without numbers)
- Use "####" for subsection titles (without numbers)

Format your response as structured sections with clear headings. Use "###" for section titles and "####" for subsection titles. DO NOT include section numbers in the headings.`;
  }

  /**
   * Parse AI response into structured SOP document
   */
  private parseSOPResponse(text: string, input: SOPTextInput): GeneratedSOPText {
    const sections: SOPSection[] = [];
    const lines = text.split('\n');
    
    let currentSection: SOPSection | null = null;
    let currentSubsection: SOPSection | null = null;
    let sectionNumber = 1;
    let subsectionNumber = 1;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Main section (### Title or ### 1. Title)
      if (trimmedLine.startsWith('###') && !trimmedLine.startsWith('####')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        
        // Remove ### and any existing numbering
        const title = trimmedLine
          .replace(/^###\s*/, '')
          .replace(/^\d+\.\s*/, '')
          .replace(/^\d+\s+/, '')
          .trim();
        
        currentSection = {
          number: `${sectionNumber}`,
          title,
          content: '' as string,
          subsections: []
        };
        sectionNumber++;
        subsectionNumber = 1;
        currentSubsection = null;
      }
      // Subsection (#### Title or #### 1.1 Title)
      else if (trimmedLine.startsWith('####')) {
        if (currentSection) {
          // Remove #### and any existing numbering
          const title = trimmedLine
            .replace(/^####\s*/, '')
            .replace(/^\d+\.\d+\s*/, '')
            .replace(/^\d+\.\d+\.\s*/, '')
            .trim();
          
          currentSubsection = {
            number: `${currentSection.number}.${subsectionNumber}`,
            title,
            content: '' as string
          };
          currentSection.subsections = currentSection.subsections || [];
          currentSection.subsections.push(currentSubsection);
          subsectionNumber++;
        }
      }
      // Content
      else if (trimmedLine.length > 0) {
        if (currentSubsection) {
          currentSubsection.content = (currentSubsection.content || '') + line + '\n';
        } else if (currentSection) {
          currentSection.content = (currentSection.content || '') + line + '\n';
        }
      }
    }

    // Add last section
    if (currentSection) {
      sections.push(currentSection);
    }

    // Generate document metadata
    const now = new Date();
    const documentNumber = `SOP-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

    return {
      title: input.title,
      documentNumber,
      version: '1.0',
      effectiveDate: now.toISOString().split('T')[0] as string,
      sections: sections as SOPSection[]
    };
  }
}
