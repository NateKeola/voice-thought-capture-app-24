import { MemoType } from '@/types';

// Simple title generation based on memo content and type
export const generateMemoTitle = (text: string, type: MemoType): string => {
  // Remove any contact tags for title generation
  const cleanText = text.replace(/\[Contact: [^\]]+\]/g, '').trim();
  
  // Get first 50 characters for analysis
  const snippet = cleanText.substring(0, 50).trim();
  
  switch (type) {
    case 'task':
      // For tasks, try to extract the main action
      const taskWords = ['complete', 'finish', 'do', 'make', 'create', 'buy', 'call', 'email', 'schedule', 'plan'];
      const lowerSnippet = snippet.toLowerCase();
      
      for (const word of taskWords) {
        if (lowerSnippet.includes(word)) {
          // Take the sentence containing the action word
          const sentences = cleanText.split(/[.!?]/);
          const actionSentence = sentences.find(s => s.toLowerCase().includes(word));
          if (actionSentence) {
            return actionSentence.trim().substring(0, 40) + (actionSentence.length > 40 ? '...' : '');
          }
        }
      }
      
      // Fallback: use first sentence
      const firstSentence = cleanText.split(/[.!?]/)[0];
      return firstSentence.substring(0, 40) + (firstSentence.length > 40 ? '...' : '');
      
    case 'idea':
      // For ideas, look for creative keywords
      const ideaKeywords = ['idea', 'concept', 'thought', 'innovation', 'solution', 'plan'];
      const ideaLower = snippet.toLowerCase();
      
      // If contains idea keywords, use the context
      for (const keyword of ideaKeywords) {
        if (ideaLower.includes(keyword)) {
          const sentences = cleanText.split(/[.!?]/);
          const ideaSentence = sentences.find(s => s.toLowerCase().includes(keyword));
          if (ideaSentence) {
            return ideaSentence.trim().substring(0, 40) + (ideaSentence.length > 40 ? '...' : '');
          }
        }
      }
      
      // Fallback: use first meaningful part
      const firstPart = cleanText.split(/[.!?]/)[0];
      return firstPart.substring(0, 40) + (firstPart.length > 40 ? '...' : '');
      
    case 'note':
    default:
      // For notes, use the first sentence or key phrase
      const sentences = cleanText.split(/[.!?]/);
      const firstSentence = sentences[0] || cleanText;
      
      // If it's a short sentence, use it as is
      if (firstSentence.length <= 40) {
        return firstSentence.trim();
      }
      
      // Otherwise, find a natural break point
      const words = firstSentence.split(' ');
      let title = '';
      for (const word of words) {
        if ((title + ' ' + word).length <= 37) {
          title += (title ? ' ' : '') + word;
        } else {
          break;
        }
      }
      
      return title + (title.length < firstSentence.length ? '...' : '');
  }
};

// Enhanced title generation for better results
export const generateEnhancedTitle = (text: string, type: MemoType): string => {
  const cleanText = text.replace(/\[Contact: [^\]]+\]/g, '').trim();
  
  // Remove metadata tags from tasks
  const textWithoutMetadata = cleanText
    .replace(/\[category:\s*\w+\]/gi, '')
    .replace(/\[priority:\s*\w+\]/gi, '')
    .replace(/\[due:\s*[\w\s]+\]/gi, '')
    .trim();
  
  return generateMemoTitle(textWithoutMetadata, type);
};
