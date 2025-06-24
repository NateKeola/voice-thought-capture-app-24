
import React, { useState, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { detectMemoType } from '@/services/SpeechToText';
import { TitleGenerationService } from '@/services/titleGeneration';
import { PersonDetectionService, DetectedPerson } from '@/services/PersonDetectionService';
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
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [detectedPeople, setDetectedPeople] = useState<DetectedPerson[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<DetectedPerson[]>([]);
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
        // Show save dialog with detected people
        setDetectedPeople(people);
        setSelectedPeople(people.filter(p => p.confidence > 0.8));
        setPendingMemoData({
          text: text,
          type: memoType,
          audioUrl: null,
          title: generatedTitle
        });
        setShowSaveDialog(true);
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

  const handleSaveMemo = async () => {
    if (!pendingMemoData) return;

    try {
      // Add contact tags to the memo text for selected people
      const enhancedText = PersonDetectionService.addContactTags(
        pendingMemoData.text, 
        selectedPeople
      );

      // Create memo with enhanced text
      await createMemoDirectly({
        ...pendingMemoData,
        text: enhancedText
      });

      // Show success message with contact info
      if (selectedPeople.length > 0) {
        toast({
          title: "Memo saved with contacts!",
          description: `Added ${selectedPeople.length} contact${selectedPeople.length !== 1 ? 's' : ''} to your memo.`
        });
      }

      // Reset state
      setShowSaveDialog(false);
      setDetectedPeople([]);
      setSelectedPeople([]);
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

  const handleAddToRelationships = () => {
    if (!pendingMemoData || selectedPeople.length === 0) return;

    // First save the memo with contact tags
    const enhancedText = PersonDetectionService.addContactTags(
      pendingMemoData.text, 
      selectedPeople
    );

    // Create the memo
    createMemoDirectly({
      ...pendingMemoData,
      text: enhancedText
    });

    // Store selected people in session storage for the relationships page
    const peopleForRelationships = selectedPeople.map(person => ({
      firstName: person.name.split(' ')[0] || person.name,
      lastName: person.name.split(' ').slice(1).join(' ') || '',
      type: person.relationship === 'colleague' || person.relationship === 'manager' || person.relationship === 'client' || person.relationship === 'teammate' ? 'work' : 'personal',
      relationshipDescription: `Mentioned in memo: "${person.context.substring(0, 100)}${person.context.length > 100 ? '...' : ''}"`
    }));

    sessionStorage.setItem('pendingRelationships', JSON.stringify(peopleForRelationships));
    
    // Navigate to relationships page
    navigate('/relationships');
    
    // Reset state
    setShowSaveDialog(false);
    setDetectedPeople([]);
    setSelectedPeople([]);
    setPendingMemoData(null);
  };

  const handlePersonToggle = (person: DetectedPerson, checked: boolean) => {
    if (checked) {
      setSelectedPeople(prev => [...prev, person]);
    } else {
      setSelectedPeople(prev => prev.filter(p => p.name !== person.name));
    }
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

      {/* Save Memo Dialog with Person Detection */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 mx-4 max-h-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-lg">Save Memo</h3>
              <button
                className="text-gray-500"
                onClick={() => setShowSaveDialog(false)}
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 text-sm mb-3">
                I detected these people in your memo:
              </p>
              
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {detectedPeople.map((person, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      checked={selectedPeople.some(p => p.name === person.name)}
                      onCheckedChange={(checked) => 
                        handlePersonToggle(person, checked as boolean)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{person.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(person.confidence * 100)}%
                        </Badge>
                      </div>
                      
                      {person.relationship && (
                        <div className="text-sm text-blue-600 mb-1">
                          {person.relationship}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 line-clamp-2">
                        "{person.context}"
                      </div>
                      
                      <Badge variant="outline" className="text-xs mt-1">
                        {person.mentionType}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button
                onClick={handleAddToRelationships}
                className="w-full bg-blue-500 hover:bg-blue-600"
                disabled={selectedPeople.length === 0}
              >
                Save & Add {selectedPeople.length} to Relationships
              </Button>
              <Button
                onClick={handleSaveMemo}
                variant="outline"
                className="w-full"
              >
                Save Memo Only
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TextMemoInput;
