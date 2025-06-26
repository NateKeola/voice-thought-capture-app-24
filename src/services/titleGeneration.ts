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
   * Generate a fallback title synchronously (SYNC) - This creates SYNOPSES not repetitions
   */
  static generateFallbackTitle(text: string, type: 'task' | 'note' | 'idea'): string {
    console.log('🔍 Creating synopsis for:', { text: text?.substring(0, 50), type });
    
    // Clean the text
    const cleanText = text
      .replace(/\[Contact: [^\]]+\]/g, '')
      .replace(/\[category:\s*\w+\]/gi, '')
      .replace(/\[priority:\s*\w+\]/gi, '')
      .replace(/\[due:\s*[\w\s]+\]/gi, '')
      .trim();

    // If text is very short, return as-is
    if (cleanText.length <= 25) {
      return cleanText;
    }

    // Generate smart synopsis based on content type and patterns
    let synopsis = this.extractSmartSynopsis(cleanText, type);
    
    // Ensure we have some title
    if (!synopsis) {
      switch (type) {
        case 'task':
          synopsis = 'New Task';
          break;
        case 'note':
          synopsis = 'New Note';
          break;
        case 'idea':
          synopsis = 'New Idea';
          break;
        default:
          synopsis = 'New Memo';
      }
    }

    console.log('🔍 Generated synopsis:', synopsis);
    return synopsis;
  }

  /**
   * Extract smart synopsis - NOT just repetition of content
   */
  private static extractSmartSynopsis(text: string, type: 'task' | 'note' | 'idea'): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const firstSentence = sentences[0]?.trim() || text;
    
    // For tasks, extract action-oriented synopses
    if (type === 'task') {
      return this.extractTaskSynopsis(firstSentence);
    }
    
    // For ideas, extract the core concept
    if (type === 'idea') {
      return this.extractIdeaSynopsis(firstSentence);
    }
    
    // For notes, extract the main subject
    return this.extractNoteSynopsis(firstSentence);
  }

  /**
   * Extract task-oriented synopsis - focus on the ACTION
   */
  private static extractTaskSynopsis(sentence: string): string {
    const taskPatterns = [
      // "I need to call John" -> "Call John"
      /(?:I need to|need to|remember to|don't forget to?)\s+(.+)/i,
      // "Should call the dentist" -> "Call the dentist"  
      /(?:should|must|have to)\s+(.+)/i,
      // "Call John today" -> "Call John"
      /(.+?)(?:\s+(?:today|tomorrow|this week|next week|later|soon))/i,
      // "Buy groceries at store" -> "Buy groceries"
      /^((?:call|email|text|message|buy|get|pick up|schedule|book|meet|contact|finish|complete|send|review|update|prepare|organize|plan|create|write|read)\s+[^,]+)/i
    ];
    
    for (const pattern of taskPatterns) {
      const match = sentence.match(pattern);
      if (match && match[1]) {
        let extracted = match[1].trim();
        
        // Clean up common unnecessary words at the end
        extracted = extracted.replace(/\s+(and|with|for|at|in|on|by|from|to)\s+.*$/i, '');
        
        // Capitalize first letter
        extracted = extracted.charAt(0).toUpperCase() + extracted.slice(1);
        
        // Limit length
        return extracted.length > 35 ? extracted.substring(0, 32) + '...' : extracted;
      }
    }
    
    // Fallback: extract subject + verb if possible
    const words = sentence.split(/\s+/);
    const actionWords = ['call', 'email', 'buy', 'get', 'schedule', 'meet', 'finish', 'complete', 'send', 'review', 'update', 'prepare', 'organize', 'plan', 'create', 'write', 'read'];
    
    for (let i = 0; i < words.length; i++) {
      if (actionWords.includes(words[i].toLowerCase())) {
        const action = words.slice(i, Math.min(i + 3, words.length)).join(' ');
        const capitalized = action.charAt(0).toUpperCase() + action.slice(1);
        return capitalized.length > 35 ? capitalized.substring(0, 32) + '...' : capitalized;
      }
    }
    
    // Last resort: meaningful words from the beginning
    return this.extractMeaningfulWords(sentence, 3);
  }

  /**
   * Extract idea-oriented synopsis - focus on the CONCEPT
   */
  private static extractIdeaSynopsis(sentence: string): string {
    const ideaPatterns = [
      // "What if we created an app" -> "App concept"
      /(?:what if|how about|maybe we could|we should)\s+(.+)/i,
      // "I think we need a better system" -> "Better system idea"
      /(?:I think|I believe|perhaps|maybe)\s+(.+)/i,
      // "New app idea for tracking" -> "App for tracking"
      /(.+?)\s+(?:idea|concept|thought|notion)/i,
      // "App would be great" -> "App concept"
      /(.+?)\s+(?:would be|could be|might be)\s+(?:great|good|cool|awesome|interesting)/i
    ];
    
    for (const pattern of ideaPatterns) {
      const match = sentence.match(pattern);
      if (match && match[1]) {
        let extracted = match[1].trim();
        
        // Add "concept" or "idea" if not present
        if (!extracted.toLowerCase().includes('idea') && !extracted.toLowerCase().includes('concept')) {
          extracted += ' concept';
        }
        
        const capitalized = extracted.charAt(0).toUpperCase() + extracted.slice(1);
        return capitalized.length > 35 ? capitalized.substring(0, 32) + '...' : capitalized;
      }
    }
    
    // Fallback: extract key concept words
    return this.extractMeaningfulWords(sentence, 2) + ' idea';
  }

  /**
   * Extract note-oriented synopsis - focus on the SUBJECT
   */
  private static extractNoteSynopsis(sentence: string): string {
    const notePatterns = [
      // "Meeting about project planning" -> "Project planning meeting"
      /(?:meeting|discussion|call|conversation)\s+(?:about|regarding|concerning)\s+(.+)/i,
      // "About the new marketing strategy" -> "Marketing strategy"
      /(?:about|regarding|concerning)\s+(.+)/i,
      // "Project update happened today" -> "Project update"
      /(.+?)\s+(?:happened|occurred|took place)/i,
      // "Notes from the client call" -> "Client call notes"
      /(?:notes|summary|recap)\s+(?:from|about|on)\s+(.+)/i
    ];
    
    for (const pattern of notePatterns) {
      const match = sentence.match(pattern);
      if (match && match[1]) {
        let extracted = match[1].trim();
        
        // Clean up
        extracted = extracted.replace(/\s+(?:today|yesterday|this week|last week)$/i, '');
        
        const capitalized = extracted.charAt(0).toUpperCase() + extracted.slice(1);
        return capitalized.length > 35 ? capitalized.substring(0, 32) + '...' : capitalized;
      }
    }
    
    // Fallback: extract subject matter
    return this.extractMeaningfulWords(sentence, 3);
  }

  /**
   * Extract meaningful words, skipping filler words - creates SUMMARY not repetition
   */
  private static extractMeaningfulWords(sentence: string, maxWords: number): string {
    const words = sentence.split(/\s+/);
    
    // Remove common filler words from the beginning
    const fillerWords = ['so', 'well', 'um', 'uh', 'like', 'you know', 'i think', 'maybe', 'actually', 'basically', 'just', 'really', 'very', 'quite'];
    let startIndex = 0;
    while (startIndex < words.length && fillerWords.includes(words[startIndex].toLowerCase())) {
      startIndex++;
    }
    
    // Take meaningful words but summarize, don't repeat
    let synopsis = '';
    const importantWords = [];
    
    for (let i = startIndex; i < Math.min(words.length, startIndex + maxWords + 2); i++) {
      const word = words[i].toLowerCase();
      // Skip articles and prepositions to create a summary
      if (!['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'].includes(word)) {
        importantWords.push(words[i]);
        if (importantWords.length >= maxWords) break;
      }
    }
    
    synopsis = importantWords.join(' ');
    
    // Ensure it's not just repeating the original text
    if (synopsis.length > sentence.length * 0.8) {
      // Too similar to original, create a real summary
      const keyWords = words.slice(startIndex, startIndex + 2);
      synopsis = keyWords.join(' ') + '...';
    }
    
    // Capitalize first letter
    if (synopsis) {
      synopsis = synopsis.charAt(0).toUpperCase() + synopsis.slice(1);
    }
    
    return synopsis || 'Summary';
  }

  /**
   * Generate immediate title (SYNC) - for use in components that need instant results
   */
  static generateImmediateTitle(text: string, type: 'task' | 'note' | 'idea'): string {
    console.log('🔍 Generating immediate synopsis for:', { text: text?.substring(0, 50), type });
    const synopsis = this.generateFallbackTitle(text, type);
    console.log('🔍 Final synopsis:', synopsis);
    return synopsis;
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
