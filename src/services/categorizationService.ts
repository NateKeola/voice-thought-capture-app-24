
import { supabase } from '@/integrations/supabase/client';
import { MemoType } from '@/types';

export const categorizeMemoWithClaude = async (text: string): Promise<MemoType> => {
  try {
    const { data, error } = await supabase.functions.invoke('categorize-memo', {
      body: { text }
    });

    if (error) {
      console.error('Error calling categorize-memo function:', error);
      // Fallback to existing detection logic
      return detectMemoTypeFallback(text);
    }

    return data.category as MemoType;
  } catch (error) {
    console.error('Error in categorizeMemoWithClaude:', error);
    // Fallback to existing detection logic
    return detectMemoTypeFallback(text);
  }
};

// Fallback detection logic (from existing SpeechToText service)
const detectMemoTypeFallback = (text: string): MemoType => {
  const lowerText = text.toLowerCase();
  
  // Task indicators
  const taskKeywords = [
    'need to', 'have to', 'must', 'should', 'todo', 'to do', 'task',
    'remind me', 'don\'t forget', 'remember to', 'deadline', 'due',
    'schedule', 'appointment', 'meeting', 'call', 'email', 'buy',
    'pick up', 'complete', 'finish', 'submit', 'send'
  ];
  
  // Idea indicators
  const ideaKeywords = [
    'idea', 'concept', 'thought', 'brainstorm', 'what if', 'maybe',
    'could', 'might', 'potential', 'possibility', 'innovation',
    'creative', 'invention', 'solution', 'approach', 'strategy'
  ];
  
  // Check for task indicators
  if (taskKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'task';
  }
  
  // Check for idea indicators
  if (ideaKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'idea';
  }
  
  // Default to note
  return 'note';
};
