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
import MemoEditScreen from './memo/MemoEditScreen';
import { MemoType } from '@/types';

interface TextMemoInputProps {
  onMemoCreated?: (memoId: string) => void;
  initialText?: string;
}

const TextMemoInput: React.FC<TextMemoInputProps> = ({ onMemoCreated, initialText = '' }) => {
  const [text, setText] = useState(initialText);
  const [showEditScreen, setShowEditScreen] = useState(false);
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

    // Show edit screen first
    setShowEditScreen(true);
  };

  const handleEditSave = async (memoData: { text: string; type: MemoType; title?: string; linkedPeople?: DetectedPerson[] }) => {
    try {
      let finalMemoData = {
        text: memoData.text,
        type: memoData.type,
        audioUrl: null,
        title: memoData.title
      };

      // If people were linked in the edit screen, add contact tags
      if (memoData.linkedPeople && memoData.linkedPeople.length > 0) {
        finalMemoData.text = PersonDetectionService.addContactTags(
          memoData.text, 
          memoData.linkedPeople
        );
      }

      // Create memo directly
      await createMemoDirectly(finalMemoData);
      setShowEditScreen(false);
    } catch (error) {
      console.error('Error processing memo:', error);
      toast({
        title: "Error processing memo",
        description: "There was a problem processing your memo.",
        variant: "destructive"
      });
    }
  };

  const handleEditCancel = () => {
    setShowEditScreen(false);
  };

  const createMemoDirectly = async (memoData: any) => {
    try {
      const memo = await createMemo(memoData);
      
      if (memo) {
        toast({
          title: "Memo saved!",
          description: `Your ${memoData.type} has been saved.`
        });

        // Navigate back to home screen instead of memo detail
        navigate('/home');
        
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

  const handleSaveAndAddToRelationships = async (confirmedPeople: DetectedPerson[]) => {
    if (!pendingMemoData) return;

    try {
      // Add contact tags to the memo text
      const enhancedText = PersonDetectionService.addContactTags(
        pendingMemoData.text, 
        confirmedPeople
      );

      // Create memo with enhanced text
      const memo = await createMemo({
        ...pendingMemoData,
        text: enhancedText
      });

      if (!memo) {
        throw new Error('Failed to create memo');
      }

      // Show success message
      toast({
        title: "Memo saved!",
        description: `Your memo has been saved and will be linked to ${confirmedPeople.length} contact${confirmedPeople.length !== 1 ? 's' : ''}.`
      });

      // Store selected people in session storage for the relationships page
      const peopleForRelationships = confirmedPeople.map(person => ({
        firstName: person.name.split(' ')[0] || person.name,
        lastName: person.name.split(' ').slice(1).join(' ') || '',
        type: person.relationship === 'colleague' || person.relationship === 'manager' || person.relationship === 'client' || person.relationship === 'teammate' ? 'work' : 'personal',
        relationshipDescription: `Mentioned in memo: "${person.context.substring(0, 100)}${person.context.length > 100 ? '...' : ''}"`
      }));

      sessionStorage.setItem('pendingRelationships', JSON.stringify(peopleForRelationships));
      
      // Clear the input
      setText('');
      
      // Navigate to relationships page
      navigate('/relationships');
      
      // Reset state
      setDetectedPeople([]);
      setPendingMemoData(null);
      
      // Notify parent component
      if (onMemoCreated) {
        onMemoCreated(memo.id);
      }
      
    } catch (error) {
      console.error('Error saving memo with relationships:', error);
      toast({
        title: "Error saving memo",
        description: "There was a problem saving your memo with relationships.",
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

  if (showEditScreen) {
    return (
      <MemoEditScreen
        initialMemo={{
          text,
          type: detectMemoType(text),
          title: TitleGenerationService.generateTitle(text, detectMemoType(text))
        }}
        onSave={handleEditSave}
        onCancel={handleEditCancel}
        isCreating={true}
      />
    );
  }

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
            Create Memo
          </Button>
        </div>
      </div>

      <PersonConfirmationDialog
        open={showPersonDialog}
        detectedPeople={detectedPeople}
        onConfirm={handlePersonConfirmation}
        onSkip={handlePersonSkip}
        onClose={() => setShowPersonDialog(false)}
        onSaveAndAddToRelationships={handleSaveAndAddToRelationships}
      />
    </>
  );
};

export default TextMemoInput;
