
import { supabase } from '@/integrations/supabase/client';

// Title generation service using Claude API
export class TitleGenerationService {
  /**
   * Generate a title using Claude API (ASYNC)
   */
  static async generateTitle(text: string, type: 'task' | 'note' | 'should'): Promise<string> {
    try {
      // Don't generate titles for very short text
      if (text.length < 10) {
        return this.generateFallbackTitle(text, type);
      }

      const { data, error } = await supabase.functions.invoke('generate-title-with-claude', {
        body: { text: text.trim(), type: type }
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
  static generateFallbackTitle(text: string, type: 'task' | 'note' | 'should'): string {
    console.log('🔍 Generating fallback title for:', { text: text?.substring(0, 50), type });
    
    // Clean the text
    const cleanText = text
      .replace(/\[Contact: [^\]]+\]/g, '')
      .replace(/\[category:\s*\w+\]/gi, '')
      .replace(/\[priority:\s*\w+\]/gi, '')
      .replace(/\[due:\s*[\w\s]+\]/gi, '')
      .trim();

    // Get the first meaningful part of the text
    const words = cleanText.split(/\s+/);
    let title = '';

    // Take first 4-6 words depending on length
    for (let i = 0; i < Math.min(words.length, 6); i++) {
      const word = words[i];
      if (title.length + word.length + 1 <= 45) { // Leave room for type prefix if needed
        title += (title ? ' ' : '') + word;
      } else {
        break;
      }
    }

    // Add ellipsis if we truncated
    if (words.length > 6 || (title.length < cleanText.length && cleanText.length > 45)) {
      title += '...';
    }

    // Ensure we have some title
    if (!title) {
      switch (type) {
        case 'task':
          title = 'New Task';
          break;
        case 'note':
          title = 'New Note';
          break;
        case 'should':
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
   * Generate immediate title (SYNC) - for use in components that need instant results
   */
  static generateImmediateTitle(text: string, type: 'task' | 'note' | 'should'): string {
    console.log('🔍 Generating immediate title for:', { text: text?.substring(0, 50), type });
    const title = this.generateFallbackTitle(text, type);
    console.log('🔍 Final immediate title:', title);
    return title;
  }

  /**
   * Generate title with caching to avoid redundant API calls
   */
  private static titleCache = new Map<string, string>();
  
  static async generateTitleWithCache(text: string, type: 'task' | 'note' | 'should'): Promise<string> {
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
