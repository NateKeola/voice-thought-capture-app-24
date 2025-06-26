
import { supabase } from '@/integrations/supabase/client';

// Title generation service using Claude API
export class TitleGenerationService {
  /**
   * Generate a title using Claude API (ASYNC)
   */
  static async generateTitle(text: string, type: 'task' | 'note' | 'idea'): Promise<string> {
    try {
      // Don't generate titles for very short text
      if (text.length < 10) {
        return this.generateFallbackTitle(text, type);
      }

      // Map 'idea' to 'note' for the API call since backend expects task/note/should
      const apiType = type === 'idea' ? 'note' : type;

      const { data, error } = await supabase.functions.invoke('generate-title-with-claude', {
        body: { text: text.trim(), type: apiType }
      });

      if (error) {
        console.warn('Title generation API failed, using fallback:', error);
        return this.generateFallbackTitle(text, type);
      }

      // Validate and clean the generated title
      const generatedTitle = data?.title?.trim();
      if (generatedTitle && generatedTitle.length > 0 && generatedTitle.length <= 50) {
        return generatedTitle;
      }

      return this.generateFallbackTitle(text, type);
      
    } catch (error) {
      console.error('Title generation failed:', error);
      return this.generateFallbackTitle(text, type);
    }
  }

  /**
   * Generate a fallback title synchronously (SYNC)
   */
  static generateFallbackTitle(text: string, type: 'task' | 'note' | 'idea'): string {
    console.log('🔍 Generating fallback title for:', { text: text?.substring(0, 50), type });
    
    // Clean the text
    const cleanText = text
      .replace(/\[Contact: [^\]]+\]/g, '')
      .replace(/\[category:\s*\w+\]/gi, '')
      .replace(/\[priority:\s*\w+\]/gi, '')
      .replace(/\[due:\s*[\w\s]+\]/gi, '')
      .trim();

    // If text is very short, return as-is
    if (cleanText.length <= 30) {
      return cleanText;
    }

    // Generate smart synopsis based on content type and patterns
    let title = this.extractSmartTitle(cleanText, type);
    
    // Ensure we have some title
    if (!title) {
      switch (type) {
        case 'task':
          title = 'New Task';
          break;
        case 'note':
          title = 'New Note';
          break;
        case 'idea':
          title = 'New Idea';
          break;
        default:
          title = 'New Memo';
      }
    }

    console.log('🔍 Generated fallback title:', title);
    return title;
  }

  /**
   * Extract smart title based on content patterns
   */
  private static extractSmartTitle(text: string, type: 'task' | 'note' | 'idea'): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const firstSentence = sentences[0]?.trim() || text;
    
    // For tasks, extract action-oriented titles
    if (type === 'task') {
      return this.extractTaskTitle(firstSentence);
    }
    
    // For ideas, extract the core concept
    if (type === 'idea') {
      return this.extractIdeaTitle(firstSentence);
    }
    
    // For notes, extract the main subject
    return this.extractNoteTitle(firstSentence);
  }

  /**
   * Extract task-oriented title
   */
  private static extractTaskTitle(sentence: string): string {
    const taskPatterns = [
      // "I need to X" -> "X"
      /(?:I need to|need to|remember to|don't forget to?)\s+(.+)/i,
      // "Should/must/have to X" -> "X"
      /(?:should|must|have to)\s+(.+)/i,
      // "X today/tomorrow" -> "X"
      /(.+?)(?:\s+(?:today|tomorrow|this week|next week|later))/i,
      // "Call/Email/Buy X" -> "Call/Email/Buy X"
      /^((?:call|email|text|message|buy|get|pick up|schedule|book|meet|contact)\s+.+)/i
    ];
    
    for (const pattern of taskPatterns) {
      const match = sentence.match(pattern);
      if (match && match[1]) {
        const extracted = match[1].trim();
        // Capitalize first letter and limit length
        const title = extracted.charAt(0).toUpperCase() + extracted.slice(1);
        return title.length > 35 ? title.substring(0, 32) + '...' : title;
      }
    }
    
    // Fallback: take meaningful words from the beginning
    return this.extractMeaningfulWords(sentence, 4);
  }

  /**
   * Extract idea-oriented title
   */
  private static extractIdeaTitle(sentence: string): string {
    const ideaPatterns = [
      // "What if X" -> "X"
      /(?:what if|how about|maybe we could)\s+(.+)/i,
      // "I think X" -> "X"
      /(?:I think|I believe|perhaps)\s+(.+)/i,
      // "X would be great/good/cool" -> "X"
      /(.+?)\s+(?:would be|could be|might be)\s+(?:great|good|cool|awesome|interesting)/i
    ];
    
    for (const pattern of ideaPatterns) {
      const match = sentence.match(pattern);
      if (match && match[1]) {
        const extracted = match[1].trim();
        const title = extracted.charAt(0).toUpperCase() + extracted.slice(1);
        return title.length > 35 ? title.substring(0, 32) + '...' : title;
      }
    }
    
    // Fallback: extract key concept words
    return this.extractMeaningfulWords(sentence, 3);
  }

  /**
   * Extract note-oriented title
   */
  private static extractNoteTitle(sentence: string): string {
    const notePatterns = [
      // "About X" -> "X"
      /(?:about|regarding|concerning)\s+(.+)/i,
      // "X happened" -> "X"
      /(.+?)\s+(?:happened|occurred|took place)/i,
      // "Meeting with X" -> "Meeting with X"
      /^(meeting|discussion|call|conversation)\s+(?:with|about)\s+(.+)/i
    ];
    
    for (const pattern of notePatterns) {
      const match = sentence.match(pattern);
      if (match) {
        const extracted = (match[2] || match[1]).trim();
        const title = extracted.charAt(0).toUpperCase() + extracted.slice(1);
        return title.length > 35 ? title.substring(0, 32) + '...' : title;
      }
    }
    
    // Fallback: extract subject matter
    return this.extractMeaningfulWords(sentence, 4);
  }

  /**
   * Extract meaningful words, skipping filler words
   */
  private static extractMeaningfulWords(sentence: string, maxWords: number): string {
    const words = sentence.split(/\s+/);
    
    // Remove common filler words from the beginning
    const fillerWords = ['so', 'well', 'um', 'uh', 'like', 'you know', 'i think', 'maybe', 'actually', 'basically'];
    let startIndex = 0;
    while (startIndex < words.length && fillerWords.includes(words[startIndex].toLowerCase())) {
      startIndex++;
    }
    
    // Take meaningful words
    let title = '';
    for (let i = startIndex; i < Math.min(words.length, startIndex + maxWords); i++) {
      const word = words[i];
      if (title.length + word.length + 1 <= 40) {
        title += (title ? ' ' : '') + word;
      } else {
        break;
      }
    }
    
    // Add ellipsis if we truncated
    if (words.length > startIndex + maxWords || (title.length < sentence.length && sentence.length > 40)) {
      title += '...';
    }
    
    // Capitalize first letter
    if (title) {
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }
    
    return title;
  }

  /**
   * Generate immediate title (SYNC) - for use in components that need instant results
   */
  static generateImmediateTitle(text: string, type: 'task' | 'note' | 'idea'): string {
    console.log('🔍 Generating immediate title for:', { text: text?.substring(0, 50), type });
    const title = this.generateFallbackTitle(text, type);
    console.log('🔍 Final immediate title:', title);
    return title;
  }

  /**
   * Generate title with caching to avoid redundant API calls
   */
  private static titleCache = new Map<string, string>();
  
  static async generateTitleWithCache(text: string, type: 'task' | 'note' | 'idea'): Promise<string> {
    const cacheKey = `${type}:${text.substring(0, 100)}`;
    
    if (this.titleCache.has(cacheKey)) {
      return this.titleCache.get(cacheKey)!;
    }

    const title = await this.generateTitle(text, type);
    this.titleCache.set(cacheKey, title);
    
    // Limit cache size
    if (this.titleCache.size > 100) {
      const firstKey = this.titleCache.keys().next().value;
      this.titleCache.delete(firstKey);
    }

    return title;
  }

  /**
   * Clear the title cache
   */
  static clearCache(): void {
    this.titleCache.clear();
  }
}
