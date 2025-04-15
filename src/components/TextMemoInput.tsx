import React, { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { saveMemo } from '@/services/MemoStorage';
import { detectMemoType } from '@/services/SpeechToText';
import { useToast } from '@/components/ui/use-toast';
import { Send } from 'lucide-react';

interface TextMemoInputProps {
  onMemoCreated?: (memoId: string) => void;
  initialText?: string;
}

const TextMemoInput: React.FC<TextMemoInputProps> = ({ onMemoCreated, initialText = '' }) => {
  const [text, setText] = useState(initialText);
  const { toast } = useToast();

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const handleSubmit = () => {
    if (!text.trim()) {
      toast({
        title: "Cannot save empty memo",
        description: "Please enter some text for your memo",
        variant: "destructive"
      });
      return;
    }

    try {
      const memoType = detectMemoType(text);
      
      const memo = saveMemo({
        text: text,
        type: memoType,
        audioUrl: null
      });
      
      toast({
        title: "Memo saved!",
        description: `Your ${memoType} has been saved.`
      });
      
      setText('');
      
      if (onMemoCreated) {
        onMemoCreated(memo.id);
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
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your memo here..."
        className="w-full focus-visible:ring-orange-500 mb-3 min-h-24"
      />
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          className="bg-orange-500 hover:bg-orange-600 text-white"
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
