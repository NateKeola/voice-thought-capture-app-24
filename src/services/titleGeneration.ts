
// src/services/titleGeneration.ts
// Simple, intelligent title generation - NO API REQUIRED

import { MemoType } from '@/types';

export class TitleGenerationService {
  static generateTitle(text: string, memoType: MemoType = 'note'): string {
    if (!text || text.trim().length === 0) {
      return 'Untitled Memo';
    }

    const cleanText = text.trim();
    
    // If already short, just clean it up
    if (cleanText.length <= 30) {
      return this.cleanShortText(cleanText);
    }

    // Generate based on type
    switch (memoType) {
      case 'task':
        return this.generateTaskTitle(cleanText);
      case 'idea':
        return this.generateIdeaTitle(cleanText);
      case 'note':
      default:
        return this.generateNoteTitle(cleanText);
    }
  }

  private static generateTaskTitle(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Look for action patterns
    const actionPatterns = [
      { pattern: /(?:schedule|book)\s+([^.,!?]{1,25})/i, prefix: 'Schedule' },
      { pattern: /(?:call|phone)\s+([^.,!?]{1,25})/i, prefix: 'Call' },
      { pattern: /(?:email|message)\s+([^.,!?]{1,25})/i, prefix: 'Email' },
      { pattern: /(?:buy|purchase|get)\s+([^.,!?]{1,25})/i, prefix: 'Buy' },
      { pattern: /(?:send|deliver)\s+([^.,!?]{1,25})/i, prefix: 'Send' },
      { pattern: /(?:remind|remember)\s+(?:me\s+)?(?:to\s+)?([^.,!?]{1,25})/i, prefix: 'Remind' },
      { pattern: /(?:need to|have to|should|must)\s+([^.,!?]{1,25})/i, prefix: 'Task' },
    ];

    for (const { pattern, prefix } of actionPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const object = this.cleanTitleText(match[1]);
        return `${prefix} ${object}`;
      }
    }

    // Fallback: look for first meaningful phrase
    const firstSentence = text.split(/[.!?]/)[0];
    const words = firstSentence.split(' ').filter(w => w.length > 2);
    const meaningfulWords = words.slice(0, 4).join(' ');
    
    return this.cleanTitleText(meaningfulWords) || 'Task Item';
  }

  private static generateIdeaTitle(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Look for idea patterns
    const ideaPatterns = [
      /(?:idea|concept|thought)(?:\s+for|\s+about)?\s+([^.,!?]{1,30})/i,
      /(?:what if|maybe|could)\s+(?:we\s+)?([^.,!?]{1,30})/i,
      /(?:new|innovative)\s+([^.,!?]{1,30})/i,
      /(?:feature|solution|improvement)\s+(?:for|to|that)\s+([^.,!?]{1,30})/i,
    ];

    for (const pattern of ideaPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return this.cleanTitleText(match[1]);
      }
    }

    // Look for key concepts (nouns and important words)
    const firstSentence = text.split(/[.!?]/)[0];
    const words = firstSentence.split(' ');
    
    // Find capitalized words (proper nouns) and important words
    const importantWords = words.filter(word => {
      const clean = word.replace(/[^\w]/g, '');
      return clean.length > 3 && 
             (clean[0] === clean[0].toUpperCase() || 
              this.isImportantWord(clean.toLowerCase()));
    });

    if (importantWords.length > 0) {
      return this.cleanTitleText(importantWords.slice(0, 3).join(' '));
    }

    // Fallback
    const meaningfulWords = words.filter(w => w.length > 3).slice(0, 3);
    return this.cleanTitleText(meaningfulWords.join(' ')) || 'New Idea';
  }

  private static generateNoteTitle(text: string): string {
    const firstSentence = text.split(/[.!?]/)[0];
    
    // Look for people and topics
    const patterns = [
      /(?:met with|talked to|called|spoke with)\s+([^.,!?]{1,20})/i,
      /(?:meeting|call|discussion)\s+(?:with|about)\s+([^.,!?]{1,20})/i,
      /([A-Z][a-z]+)\s+(?:said|mentioned|told|explained)/,
      /(?:about|regarding)\s+([^.,!?]{1,25})/i,
    ];

    for (const pattern of patterns) {
      const match = firstSentence.match(pattern);
      if (match && match[1]) {
        return this.cleanTitleText(match[1]);
      }
    }

    // Look for capitalized words (names, places, etc.)
    const words = firstSentence.split(' ');
    const capitalizedWords = words.filter(word => 
      /^[A-Z][a-z]+/.test(word) && word.length > 1
    );

    if (capitalizedWords.length > 0) {
      return capitalizedWords.slice(0, 3).join(' ');
    }

    // Extract key topics
    const meaningfulWords = words.filter(word => {
      const clean = word.toLowerCase().replace(/[^\w]/g, '');
      return clean.length > 3 && !this.isStopWord(clean);
    });

    if (meaningfulWords.length > 0) {
      return this.cleanTitleText(meaningfulWords.slice(0, 3).join(' '));
    }

    return 'Note';
  }

  private static isImportantWord(word: string): boolean {
    const important = [
      'app', 'feature', 'system', 'project', 'meeting', 'team', 'client',
      'design', 'development', 'marketing', 'sales', 'product', 'service',
      'business', 'strategy', 'plan', 'idea', 'concept', 'solution'
    ];
    return important.includes(word);
  }

  private static isStopWord(word: string): boolean {
    const stopWords = [
      'the', 'and', 'for', 'with', 'that', 'this', 'have', 'can', 'could',
      'would', 'should', 'will', 'was', 'were', 'been', 'being', 'are',
      'said', 'told', 'went', 'came', 'when', 'where', 'what', 'how'
    ];
    return stopWords.includes(word);
  }

  private static cleanTitleText(text: string): string {
    if (!text) return '';
    
    // Remove extra whitespace and punctuation
    let cleaned = text
      .replace(/[^\w\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Capitalize properly
    cleaned = cleaned
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    // Limit length
    if (cleaned.length > 30) {
      const words = cleaned.split(' ');
      cleaned = words.slice(0, 4).join(' ');
    }

    return cleaned;
  }

  private static cleanShortText(text: string): string {
    return text
      .replace(/[^\w\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}

// Enhanced title generation for better results
export const generateEnhancedTitle = (text: string, type: MemoType): string => {
  const cleanText = text.replace(/\[Contact: [^\]]+\]/g, '').trim();
  
  // Remove metadata tags from tasks
  const textWithoutMetadata = cleanText
    .replace(/\[category:\s*\w+\]/gi, '')
    .replace(/\[priority:\s*\w+\]/gi, '')
    .replace(/\[due:\s*[\w\s]+\]/gi, '')
    .trim();
  
  return TitleGenerationService.generateTitle(textWithoutMetadata, type);
};

// Legacy function for backward compatibility
export const generateMemoTitle = (text: string, type: MemoType): string => {
  return TitleGenerationService.generateTitle(text, type);
};
