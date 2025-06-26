
import { supabase } from '@/integrations/supabase/client';
import { MemoType } from '@/types';

export const generateTitleWithClaude = async (text: string, type: MemoType): Promise<string> => {
  try {
    console.log('Generating title with Claude for text:', text.substring(0, 100) + '...');
    
    const { data, error } = await supabase.functions.invoke('generate-title-with-claude', {
      body: { text, type }
    });

    if (error) {
      console.error('Error calling Claude title generation:', error);
      return 'Untitled Memo';
    }

    console.log('Claude response:', data);
    return data.title || 'Untitled Memo';
  } catch (error) {
    console.error('Error generating title with Claude:', error);
    return 'Untitled Memo';
  }
};
