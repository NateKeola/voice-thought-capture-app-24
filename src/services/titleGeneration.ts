
import { MemoType } from '@/types';

export class TitleGenerationService {
  static generateTitle(text: string, type: MemoType): string {
    // Remove any contact tags for title generation
    const cleanText = text.replace(/\[Contact: [^\]]+\]/g, '').trim();
    
    // Get first 80 characters for analysis
    const snippet = cleanText.substring(0, 80).trim();
    
    switch (type) {
      case 'task':
        return this.generateTaskTitle(cleanText, snippet);
      case 'idea':
        return this.generateIdeaTitle(cleanText, snippet);
      case 'note':
      default:
        return this.generateNoteTitle(cleanText, snippet);
    }
  }

  private static generateTaskTitle(cleanText: string, snippet: string): string {
    // For tasks, try to extract the main action
    const taskWords = ['complete', 'finish', 'do', 'make', 'create', 'buy', 'call', 'email', 'schedule', 'plan', 'need to', 'should', 'must'];
    const lowerSnippet = snippet.toLowerCase();
    
    for (const word of taskWords) {
      if (lowerSnippet.includes(word)) {
        // Take the sentence containing the action word
        const sentences = cleanText.split(/[.!?]/);
        const actionSentence = sentences.find(s => s.toLowerCase().includes(word));
        if (actionSentence) {
          return this.truncateTitle(actionSentence.trim());
        }
      }
    }
    
    // Fallback: use first sentence
    const taskFirstSentence = cleanText.split(/[.!?]/)[0];
    return this.truncateTitle(taskFirstSentence);
  }

  private static generateIdeaTitle(cleanText: string, snippet: string): string {
    // For ideas, look for creative keywords
    const ideaKeywords = ['idea', 'concept', 'thought', 'innovation', 'solution', 'plan', 'what if', 'maybe we could'];
    const ideaLower = snippet.toLowerCase();
    
    // If contains idea keywords, use the context
    for (const keyword of ideaKeywords) {
      if (ideaLower.includes(keyword)) {
        const sentences = cleanText.split(/[.!?]/);
        const ideaSentence = sentences.find(s => s.toLowerCase().includes(keyword));
        if (ideaSentence) {
          return this.truncateTitle(ideaSentence.trim());
        }
      }
    }
    
    // Fallback: use first meaningful part
    const ideaFirstPart = cleanText.split(/[.!?]/)[0];
    return this.truncateTitle(ideaFirstPart);
  }

  private static generateNoteTitle(cleanText: string, snippet: string): string {
    // For notes, use the first sentence or key phrase
    const sentences = cleanText.split(/[.!?]/);
    const noteFirstSentence = sentences[0] || cleanText;
    
    // If it's a short sentence, use it as is
    if (noteFirstSentence.length <= 40) {
      return noteFirstSentence.trim();
    }
    
    return this.truncateTitle(noteFirstSentence);
  }

  private static truncateTitle(text: string): string {
    const maxLength = 40;
    
    if (text.length <= maxLength) {
      return text.trim();
    }
    
    // Find a natural break point
    const words = text.split(' ');
    let title = '';
    for (const word of words) {
      if ((title + ' ' + word).length <= maxLength - 3) {
        title += (title ? ' ' : '') + word;
      } else {
        break;
      }
    }
    
    return title + (title.length < text.length ? '...' : '');
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
