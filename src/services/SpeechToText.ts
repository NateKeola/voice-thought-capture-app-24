
import * as Speech from 'expo-speech';

// Detect memo type from text content
export const detectMemoType = (text: string): 'note' | 'task' | 'idea' => {
  const lowerText = text.toLowerCase();
  
  // Task detection
  if (
    lowerText.includes('need to') ||
    lowerText.includes('have to') ||
    lowerText.includes('must') ||
    lowerText.includes('don\'t forget') ||
    lowerText.startsWith('remember to')
  ) {
    return 'task';
  }
  
  // Idea detection
  if (
    lowerText.includes('i should') ||
    lowerText.includes('maybe i could') ||
    lowerText.includes('what if') ||
    lowerText.includes('idea') ||
    lowerText.includes('thinking about')
  ) {
    return 'idea';
  }
  
  // Default to note
  return 'note';
};
