
import React, { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { detectMemoType } from '@/services/SpeechToText';
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
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { createMemo } = useMemos();

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast({
        title: "Cannot create empty memo",
        description: "Please enter some text for your memo",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const memoType = detectMemoType(text);
      
      console.log('Creating memo with auto-title generation...');
      const memo = await createMemo({
        text: text.trim(),
        type: memoType,
        audioUrl: null,
        title: undefined // Let the service generate the title
      });

      if (memo) {
        console.log('Memo created with title:', memo.title);
        navigate(`/memo/${memo.id}`);
        setText('');
        
        if (onMemoCreated) {
          onMemoCreated(memo.id);
        }
      }
    } catch (error) {
      console.error('Error creating memo:', error);
      toast({
        title: "Error creating memo",
        description: "There was a problem creating your memo.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
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
        disabled={isCreating}
      />
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          className="bg-orange-500 hover:bg-orange-600"
          size="sm"
          disabled={isCreating || !text.trim()}
        >
          <Send className="mr-2 h-4 w-4" />
          {isCreating ? 'Creating...' : 'Create Memo'}
        </Button>
      </div>
    </div>
  );
};

export default TextMemoInput;
