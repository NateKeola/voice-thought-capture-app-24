import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Loader2, Save, Trash2 } from "lucide-react";
import { AudioRecorderService } from "@/services/AudioRecorder";
import { startLiveTranscription, detectMemoType, TranscriptionResult } from "@/services/SpeechToText";
import { PersonDetectionService, DetectedPerson } from "@/services/PersonDetectionService";
import { saveMemo } from "@/services/MemoStorage";
import { useToast } from "@/components/ui/use-toast";
import RecordingButton from "@/components/home/RecordingButton";
import PersonConfirmationDialog from "./PersonConfirmationDialog";

interface RecordButtonProps {
  onMemoCreated?: (memoId: string) => void;
  onLiveTranscription?: (text: string) => void;
}

const RecordButton: React.FC<RecordButtonProps> = ({ onMemoCreated, onLiveTranscription }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [showPersonDialog, setShowPersonDialog] = useState(false);
  const [detectedPeople, setDetectedPeople] = useState<DetectedPerson[]>([]);
  const [pendingMemoData, setPendingMemoData] = useState<any>(null);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [formattedDuration, setFormattedDuration] = useState('0:00');
  
  const audioServiceRef = useRef<AudioRecorderService | null>(null);
  const speechRecognitionRef = useRef<{ stop: () => void } | null>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize audio service
    audioServiceRef.current = new AudioRecorderService();
    
    return () => {
      // Cleanup
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
      audioServiceRef.current?.destroy();
    };
  }, []);

  const updateRecordingState = () => {
    if (audioServiceRef.current) {
      setIsRecording(audioServiceRef.current.getIsRecording());
      setIsPaused(audioServiceRef.current.getIsPaused());
      setRecordingDuration(audioServiceRef.current.getRecordingDuration());
      setFormattedDuration(audioServiceRef.current.getFormattedDuration());
    }
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      try {
        setIsProcessing(true);
        
        // Stop live transcription
        if (speechRecognitionRef.current) {
          speechRecognitionRef.current.stop();
          speechRecognitionRef.current = null;
        }
        
        // Stop duration tracking
        if (durationInterval.current) {
          clearInterval(durationInterval.current);
          durationInterval.current = null;
        }
        
        // Stop audio recording
        const blob = await audioServiceRef.current?.stopRecording();
        setAudioBlob(blob);
        updateRecordingState();
        
        // Use Whisper for final, high-quality transcription
        if (blob && audioServiceRef.current) {
          try {
            console.log('Getting high-quality transcription with Whisper...');
            const result = await audioServiceRef.current.transcribeAudio(blob);
            
            if (result.transcription.trim()) {
              setRecognizedText(result.transcription);
              
              if (onLiveTranscription) {
                onLiveTranscription(result.transcription);
              }
              
              toast({
                title: "Recording complete",
                description: "High-quality transcription ready"
              });
            } else {
              toast({
                title: "Recording complete",
                description: "No speech detected in recording",
                variant: "destructive"
              });
            }
          } catch (transcriptionError) {
            console.error('Whisper transcription failed:', transcriptionError);
            
            // Fallback to live transcription if Whisper fails
            if (recognizedText.trim()) {
              toast({
                title: "Recording complete",
                description: "Using live transcription (Whisper unavailable)"
              });
            } else {
              toast({
                title: "Transcription failed",
                description: "Could not transcribe the audio. Please try again.",
                variant: "destructive"
              });
            }
          }
        }
        
        setRecordingComplete(true);
        setIsProcessing(false);
      } catch (error) {
        console.error('Error processing recording:', error);
        toast({
          title: "Error saving memo",
          description: "There was a problem processing your recording.",
          variant: "destructive"
        });
        setIsProcessing(false);
      }
    } else {
      setRecordingComplete(false);
      setRecognizedText('');
      setAudioBlob(null);
      
      await audioServiceRef.current?.startRecording();
      updateRecordingState();
      
      // Start duration tracking
      durationInterval.current = setInterval(() => {
        updateRecordingState();
      }, 1000);
      
      // Start live transcription for real-time feedback
      try {
        speechRecognitionRef.current = startLiveTranscription(
          (interimText) => {
            if (onLiveTranscription) {
              onLiveTranscription(interimText);
            }
          },
          (result: TranscriptionResult) => {
            const newText = result.text.trim();
            setRecognizedText(prev => `${prev} ${newText}`.trim());
            
            if (onLiveTranscription) {
              onLiveTranscription(`${recognizedText} ${newText}`.trim());
            }
          },
          (error) => {
            console.error('Live speech recognition error:', error);
            // Don't show error toast for live transcription since Whisper is the fallback
          }
        );
      } catch (error) {
        console.error('Failed to start live speech recognition:', error);
        // Continue without live transcription, Whisper will handle it at the end
      }
    }
  };

  const handlePauseResume = () => {
    if (isPaused) {
      audioServiceRef.current?.resumeRecording();
      updateRecordingState();
      
      // Restart duration tracking
      durationInterval.current = setInterval(() => {
        updateRecordingState();
      }, 1000);
      
      try {
        speechRecognitionRef.current = startLiveTranscription(
          (interimText) => {
            if (onLiveTranscription) {
              onLiveTranscription(interimText);
            }
          },
          (result: TranscriptionResult) => {
            const newText = result.text.trim();
            setRecognizedText(prev => `${prev} ${newText}`.trim());
            
            if (onLiveTranscription) {
              onLiveTranscription(`${recognizedText} ${newText}`.trim());
            }
          },
          (error) => {
            console.error('Speech recognition error:', error);
          }
        );
      } catch (error) {
        console.error('Failed to restart speech recognition:', error);
      }
    } else {
      audioServiceRef.current?.pauseRecording();
      updateRecordingState();
      
      // Stop duration tracking
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }
      
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
        speechRecognitionRef.current = null;
      }
    }
  };

  const handleSaveMemo = async () => {
    try {
      setIsProcessing(true);
      
      const memoText = recognizedText || "Empty memo";
      const memoType = detectMemoType(memoText);
      const audioUrl = audioBlob ? URL.createObjectURL(audioBlob) : undefined;
      
      // Detect people mentioned in the text
      const people = PersonDetectionService.detectPeople(memoText);
      
      if (people.length > 0) {
        // Show confirmation dialog for detected people
        setDetectedPeople(people);
        setPendingMemoData({
          text: memoText,
          type: memoType,
          audioUrl: audioUrl
        });
        setShowPersonDialog(true);
        setIsProcessing(false);
      } else {
        // No people detected, create memo normally
        await createMemoDirectly({
          text: memoText,
          type: memoType,
          audioUrl: audioUrl
        });
      }
    } catch (error) {
      console.error('Error saving memo:', error);
      toast({
        title: "Error saving memo",
        description: "There was a problem saving your recording.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const createMemoDirectly = async (memoData: any) => {
    try {
      const memo = await saveMemo(memoData);
      
      toast({
        title: "Memo saved!",
        description: `Your ${memoData.type} has been saved.`
      });
      
      navigate(`/memo/${memo.id}`);
      
      if (onMemoCreated) {
        onMemoCreated(memo.id);
      }
      
      if (onLiveTranscription) {
        onLiveTranscription('');
      }
      
      setRecognizedText('');
      setRecordingComplete(false);
      setAudioBlob(null);
      setIsProcessing(false);
    } catch (error) {
      console.error('Error saving memo:', error);
      toast({
        title: "Error saving memo",
        description: "There was a problem saving your recording.",
        variant: "destructive"
      });
      setIsProcessing(false);
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

  const handleCancel = () => {
    setRecordingComplete(false);
    setRecognizedText('');
    setAudioBlob(null);
    
    audioServiceRef.current?.cancelRecording();
    updateRecordingState();
    
    if (onLiveTranscription) {
      onLiveTranscription('');
    }
    
    toast({
      title: "Recording discarded",
      description: "Your recording has been discarded."
    });
  };

  const renderRecordingControls = () => {
    if (recordingComplete) {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="text-center text-gray-700 mb-2">
            <p>Recording Complete</p>
            <p className="text-sm text-gray-500">{recognizedText.substring(0, 50)}{recognizedText.length > 50 ? '...' : ''}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="rounded-full h-12 px-4 border-gray-300"
              disabled={isProcessing}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Discard
            </Button>
            <Button
              onClick={handleSaveMemo}
              disabled={isProcessing}
              className="rounded-full h-12 px-6 bg-orange-500 hover:bg-orange-600"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Memo
            </Button>
          </div>
        </div>
      );
    }

    if (isRecording) {
      return (
        <div className="flex flex-col items-center gap-4">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 rounded-full text-sm">
            {formattedDuration}
          </div>
          <div className="relative">
            {!isPaused && (
              <div className="recording-animation pointer-events-none absolute -inset-8 rounded-full z-0"></div>
            )}
            <div className="relative z-10">
              <RecordingButton 
                onStartRecording={handleToggleRecording}
                onPauseResumeRecording={handlePauseResume}
                isRecording={isRecording}
                isPaused={isPaused}
              />
            </div>
          </div>
          <Button
            onClick={handleToggleRecording}
            disabled={isProcessing}
            className="rounded-full h-12 px-6 bg-red-500 hover:bg-red-600 relative z-10"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <>Stop</>
            )}
          </Button>
          {recognizedText && (
            <div className="flex justify-center w-full mt-4">
              <Button
                onClick={handleSaveMemo}
                disabled={isProcessing}
                className="rounded-full px-6 bg-orange-500 hover:bg-orange-600"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Memo
              </Button>
            </div>
          )}
        </div>
      );
    }

    return (
      <RecordingButton 
        onStartRecording={handleToggleRecording} 
        isRecording={false}
        isPaused={false}
      />
    );
  };

  return (
    <>
      <div className="relative flex flex-col items-center">
        {renderRecordingControls()}
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

export default RecordButton;
