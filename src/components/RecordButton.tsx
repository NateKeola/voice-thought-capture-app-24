
import React, { useState } from 'react';
import { Mic, MicOff, Play, Pause, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAudioRecorder } from '@/services/AudioRecorder';
import { useMemos } from '@/contexts/MemoContext';
import { detectMemoType } from '@/services/SpeechToText';
import { TitleGenerationService } from '@/services/titleGeneration';
import { PersonDetectionService, DetectedPerson } from '@/services/PersonDetectionService';

interface RecordButtonProps {
  onMemoCreated?: (memoId: string) => void;
  onLiveTranscription?: (text: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const RecordButton: React.FC<RecordButtonProps> = ({ 
  onMemoCreated, 
  onLiveTranscription,
  size = 'lg',
  className = ''
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState<AudioRecorder | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [detectedPeople, setDetectedPeople] = useState<DetectedPerson[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<DetectedPerson[]>([]);
  const [pendingMemoData, setPendingMemoData] = useState<any>(null);

  const { createMemo } = useMemos();
  const { toast } = useToast();
  const navigate = useNavigate();

  const startRecording = async () => {
    try {
      const recorder = new AudioRecorder({
        onTranscriptionUpdate: onLiveTranscription || (() => {}),
        onTranscriptionComplete: handleTranscriptionComplete,
        onError: (error) => {
          console.error('Recording error:', error);
          toast({
            title: "Recording Error",
            description: "There was an issue with the recording. Please try again.",
            variant: "destructive"
          });
          setIsRecording(false);
          setIsProcessing(false);
        }
      });

      await recorder.startRecording();
      setAudioRecorder(recorder);
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone"
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: "Recording Failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = async () => {
    if (audioRecorder) {
      setIsRecording(false);
      setIsProcessing(true);
      
      toast({
        title: "Processing...",
        description: "Converting speech to text"
      });
      
      await audioRecorder.stopRecording();
    }
  };

  const handleTranscriptionComplete = async (transcript: string, audioUrl?: string) => {
    setIsProcessing(false);
    setAudioRecorder(null);

    if (!transcript || transcript.trim().length === 0) {
      toast({
        title: "No speech detected",
        description: "Please try recording again",
        variant: "destructive"
      });
      return;
    }

    try {
      // Detect memo type and generate title
      const memoType = detectMemoType(transcript);
      const generatedTitle = TitleGenerationService.generateTitle(transcript, memoType);
      
      // Detect people mentioned in the transcript
      const people = PersonDetectionService.detectPeople(transcript);
      
      if (people.length > 0) {
        // Show save dialog with detected people
        setDetectedPeople(people);
        setSelectedPeople(people.filter(p => p.confidence > 0.8));
        setPendingMemoData({
          text: transcript,
          type: memoType,
          audioUrl: audioUrl || null,
          title: generatedTitle
        });
        setShowSaveDialog(true);
      } else {
        // No people detected, create memo normally
        await createMemoDirectly({
          text: transcript,
          type: memoType,
          audioUrl: audioUrl || null,
          title: generatedTitle
        });
      }
    } catch (error) {
      console.error('Error processing recording:', error);
      toast({
        title: "Processing Error",
        description: "There was an error processing your recording.",
        variant: "destructive"
      });
    }
  };

  const createMemoDirectly = async (memoData: any) => {
    try {
      const memo = await createMemo(memoData);
      
      if (memo) {
        toast({
          title: "Voice memo saved!",
          description: `Your ${memoData.type} has been saved.`
        });

        // Navigate to the memo detail page
        navigate(`/memo/${memo.id}`);
        
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
          title: "Voice memo saved with contacts!",
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

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'w-12 h-12';
      case 'md': return 'w-16 h-16';
      case 'lg': return 'w-20 h-20';
      default: return 'w-20 h-20';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 'h-5 w-5';
      case 'md': return 'h-7 w-7';
      case 'lg': return 'h-8 w-8';
      default: return 'h-8 w-8';
    }
  };

  return (
    <>
      <Button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`${getButtonSize()} rounded-full ${className} ${
          isRecording 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : isProcessing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-orange-500 hover:bg-orange-600'
        } text-white shadow-lg transition-all duration-200`}
        variant="default"
      >
        {isProcessing ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        ) : isRecording ? (
          <Square className={getIconSize()} />
        ) : (
          <Mic className={getIconSize()} />
        )}
      </Button>

      {/* Save Memo Dialog with Person Detection */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 mx-4 max-h-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-lg">Save Voice Memo</h3>
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
                I detected these people in your voice memo:
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

export default RecordButton;
