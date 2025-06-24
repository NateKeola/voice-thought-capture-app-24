
import React, { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { detectMemoType } from '@/services/SpeechToText';
import { TitleGenerationService } from '@/services/titleGeneration';
import { PersonDetectionService, DetectedPerson } from '@/services/PersonDetectionService';
import { useToast } from '@/components/ui/use-toast';
import { Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMemos } from '@/contexts/MemoContext';
import PersonConfirmationDialog from './PersonConfirmationDialog';

interface TextMemoInputProps {
  onMemoCreated?: (memoId: string) => void;
  initialText?: string;
}

const TextMemoInput: React.FC<TextMemoInputProps> = ({ onMemoCreated, initialText = '' }) => {
  const [text, setText] = useState(initialText);
  const [showPersonDialog, setShowPersonDialog] = useState(false);
  const [detectedPeople, setDetectedPeople] = useState<DetectedPerson[]>([]);
  const [pendingMemoData, setPendingMemoData] = useState<any>(null);
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
      
      // Detect people mentioned in the text
      const people = PersonDetectionService.detectPeople(text);
      
      // Generate title for the memo using the new service
      const generatedTitle = TitleGenerationService.generateTitle(text, memoType);
      
      if (people.length > 0) {
        // Show confirmation dialog for detected people
        setDetectedPeople(people);
        setPendingMemoData({
          text: text,
          type: memoType,
          audioUrl: null,
          title: generatedTitle
        });
        setShowPersonDialog(true);
      } else {
        // No people detected, create memo normally
        await createMemoDirectly({
          text: text,
          type: memoType,
          audioUrl: null,
          title: generatedTitle
        });
      }
    } catch (error) {
      console.error('Error processing memo:', error);
      toast({
        title: "Error processing memo",
        description: "There was a problem processing your memo.",
        variant: "destructive"
      });
    }
  };

  const createMemoDirectly = async (memoData: any) => {
    try {
      const memo = await createMemo(memoData);
      
      if (memo) {
        toast({
          title: "Memo saved!",
          description: `Your ${memoData.type} has been saved.`
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

  const handlePersonConfirmation = async (confirmedPeople: DetectedPerson[]) => {
    if (!pendingMemoData) return;

    try {
      // Add contact tags to the memo text
      const enhancedText = PersonDetectionService.addContactTags(
        pendingMemoData.text, 
        confirmedPeople
      );

      // Create memo with enhanced text
      await createMemoDirectly({
        ...pendingMemoData,
        text: enhancedText
      });

      // Show success message with contact info
      if (confirmedPeople.length > 0) {
        toast({
          title: "Memo saved with contacts!",
          description: `Added ${confirmedPeople.length} contact${confirmedPeople.length !== 1 ? 's' : ''} to your memo.`
        });
      }

      // Reset state
      setDetectedPeople([]);
      setPendingMemoData(null);
    } catch (error) {
      console.error('Error saving memo with contacts:', error);
      toast({
        title: "Error saving memo",
        description: "There was a problem saving your memo with contacts.",
        variant: "destructive"
      });
    }
  };

  const handlePersonSkip = async () => {
    if (!pendingMemoData) return;

    // Create memo without contact tags
    await createMemoDirectly(pendingMemoData);
    
    // Reset state
    setDetectedPeople([]);
    setPendingMemoData(null);
  };

  return (
    <>
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

      <PersonConfirmationDialog
        open={showPersonDialog}
        detectedPeople={detectedPeople}
        onConfirm={handlePersonConfirmation}
        onSkip={handlePersonSkip}
        onClose={() => setShowPersonDialog(false)}
      />
    </>
  );
};

export default TextMemoInput;
