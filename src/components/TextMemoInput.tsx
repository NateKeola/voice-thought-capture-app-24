
import React, { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { detectMemoType } from '@/services/SpeechToText';
import { useToast } from '@/components/ui/use-toast';
import { Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMemos } from '@/contexts/MemoContext';
import { useRelationshipSuggestions } from '@/hooks/useRelationshipSuggestions';
import { useProfiles } from '@/hooks/useProfiles';
import RelationshipSuggestion from '@/components/relationships/RelationshipSuggestion';
import AddRelationshipModal from '@/components/relationships/AddRelationshipModal';

interface TextMemoInputProps {
  onMemoCreated?: (memoId: string) => void;
  initialText?: string;
}

const TextMemoInput: React.FC<TextMemoInputProps> = ({ onMemoCreated, initialText = '' }) => {
  const [text, setText] = useState(initialText);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { createMemo } = useMemos();
  const { suggestions, analyzeTextForPeople, dismissSuggestion, acceptSuggestion } = useRelationshipSuggestions();
  const { createProfile } = useProfiles();
  const [showAddRelationshipModal, setShowAddRelationshipModal] = useState(false);
  const [selectedPersonForRelationship, setSelectedPersonForRelationship] = useState(null);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  // Analyze text for people when it changes
  useEffect(() => {
    if (text.trim().length > 10) {
      analyzeTextForPeople(text);
    }
  }, [text, analyzeTextForPeople]);

  const handleAcceptRelationshipSuggestion = (detectedPerson) => {
    setSelectedPersonForRelationship(detectedPerson);
    setShowAddRelationshipModal(true);
    acceptSuggestion(detectedPerson.fullName);
  };

  const handleCreateRelationship = async (profileData) => {
    try {
      await createProfile.mutateAsync(profileData);
      setShowAddRelationshipModal(false);
      setSelectedPersonForRelationship(null);
      toast({
        title: "Relationship created",
        description: "New relationship has been added successfully."
      });
    } catch (error) {
      console.error('Error creating relationship:', error);
    }
  };

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
      // Detect the memo type using Claude API
      const memoType = await detectMemoType(text);
      
      // Save the memo using our context
      const memo = await createMemo({
        text: text,
        type: memoType,
        audioUrl: null // No audio for text-only memos
      });
      
      if (memo) {
        toast({
          title: "Memo saved!",
          description: `Your ${memoType} has been saved and categorized using AI.`
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
    <>
      <div className="bg-white rounded-lg shadow p-3 mb-20">
        {/* Relationship Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2 mb-4">
            {suggestions.map((person, index) => (
              <RelationshipSuggestion
                key={`${person.fullName}-${index}`}
                detectedPerson={person}
                onAccept={handleAcceptRelationshipSuggestion}
                onDismiss={() => dismissSuggestion(person.fullName)}
              />
            ))}
          </div>
        )}
        
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

      {/* Add Relationship Modal */}
      {selectedPersonForRelationship && (
        <AddRelationshipModal
          isOpen={showAddRelationshipModal}
          onClose={() => {
            setShowAddRelationshipModal(false);
            setSelectedPersonForRelationship(null);
          }}
          onSubmit={handleCreateRelationship}
          prefilledData={{
            firstName: selectedPersonForRelationship.firstName,
            lastName: selectedPersonForRelationship.lastName,
            type: selectedPersonForRelationship.suggestedCategory,
            relationshipDescription: `Detected from: ${selectedPersonForRelationship.context}`
          }}
        />
      )}
    </>
  );
};

export default TextMemoInput;
