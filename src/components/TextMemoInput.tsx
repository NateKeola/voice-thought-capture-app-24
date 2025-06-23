
import React, { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { detectMemoType } from '@/services/SpeechToText';
import { generateEnhancedTitle } from '@/services/titleGeneration';
import { useToast } from '@/components/ui/use-toast';
import { Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMemos } from '@/contexts/MemoContext';

interface TextMemoInputProps {
  onMemoCreated?: (memoId: string) => void;
  initialText?: string;
}

const TextMemoInput: React.FC<TextMemoInputProps> = ({ onMemoCreated, initialText = '' }) => {
  const [text, setText] = useState(initialText);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { createMemo } = useMemos();

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast({
        title: "Cannot save empty memo",
        description: "Please enter some text for your memo",
        variant: "destructive"
      });
      return;
    }

    try {
      // Detect the memo type
      const memoType = detectMemoType(text);
      
      // Generate title for the memo
      const generatedTitle = generateEnhancedTitle(text, memoType);
      
      // Save the memo using our context
      const memo = await createMemo({
        text: text,
        type: memoType,
        audioUrl: null, // No audio for text-only memos
        title: generatedTitle
      });
      
      if (memo) {
        toast({
          title: "Memo saved!",
          description: `Your ${memoType} has been saved.`
        });

        // Navigate to the memo detail page
        navigate(`/memo/${memo.id}`);
        
        // Clear the input
        setText('');
        
        // Notify parent component
        if (onMemoCreated) {
          onMemoCreated(memo.id);
        }
      }
    } catch (error) {
      console.error('Error saving memo:', error);
      toast({
        title: "Error saving memo",
        description: "There was a problem saving your memo.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-3 mb-20">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your memo here..."
        className="w-full border-blue-100 focus-visible:ring-orange-500 mb-2"
        rows={3}
      />
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          className="bg-orange-500 hover:bg-orange-600"
          size="sm"
        >
          <Send className="mr-2 h-4 w-4" />
          Save Memo
        </Button>
      </div>
    </div>
  );
};

export default TextMemoInput;
