
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Loader2, Save, Trash2 } from "lucide-react";
import { useAudioRecorder } from "@/services/AudioRecorder";
import { startLiveTranscription, detectMemoType, TranscriptionResult } from "@/services/SpeechToText";
import { saveMemo } from "@/services/MemoStorage";
import { useToast } from "@/components/ui/use-toast";
import RecordingButton from "@/components/home/RecordingButton";

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
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const speechRecognitionRef = useRef<{ stop: () => void } | null>(null);
  
  const {
    isRecording,
    isPaused,
    recordingDuration,
    formattedDuration,
    startRecording: startAudioRecording,
    stopRecording: stopAudioRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording
  } = useAudioRecorder();

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, []);

  const handleToggleRecording = async () => {
    if (isRecording) {
      try {
        // Stop recording
        setIsProcessing(true);
        
        // Stop speech recognition
        if (speechRecognitionRef.current) {
          speechRecognitionRef.current.stop();
          speechRecognitionRef.current = null;
        }
        
        // Stop audio recording
        const url = await stopAudioRecording();
        setAudioUrl(url);
        
        toast({
          title: "Recording complete",
          description: "You can now save your memo"
        });
        
        // Set recording complete state
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
      // Reset states for new recording
      setRecordingComplete(false);
      setRecognizedText('');
      
      // Start recording
      startAudioRecording();
      
      // Start speech recognition
      try {
        speechRecognitionRef.current = startLiveTranscription(
          // Interim results handler
          (interimText) => {
            if (onLiveTranscription) {
              onLiveTranscription(interimText);
            }
          },
          // Final result handler
          (result: TranscriptionResult) => {
            const newText = result.text.trim();
            setRecognizedText(prev => `${prev} ${newText}`.trim());
            
            if (onLiveTranscription) {
              onLiveTranscription(`${recognizedText} ${newText}`.trim());
            }
          },
          // Error handler
          (error) => {
            console.error('Speech recognition error:', error);
            toast({
              title: "Voice recognition error",
              description: error.message,
              variant: "destructive"
            });
          }
        );
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        toast({
          title: "Voice recognition not available",
          description: "Your browser may not support this feature.",
          variant: "destructive"
        });
      }
    }
  };

  const handlePauseResume = () => {
    if (isPaused) {
      resumeRecording();
      
      // If we're resuming, start speech recognition again
      try {
        speechRecognitionRef.current = startLiveTranscription(
          // Interim results handler
          (interimText) => {
            if (onLiveTranscription) {
              onLiveTranscription(interimText);
            }
          },
          // Final result handler
          (result: TranscriptionResult) => {
            const newText = result.text.trim();
            setRecognizedText(prev => `${prev} ${newText}`.trim());
            
            if (onLiveTranscription) {
              onLiveTranscription(`${recognizedText} ${newText}`.trim());
            }
          },
          // Error handler
          (error) => {
            console.error('Speech recognition error:', error);
            toast({
              title: "Voice recognition error",
              description: error.message,
              variant: "destructive"
            });
          }
        );
      } catch (error) {
        console.error('Failed to restart speech recognition:', error);
      }
    } else {
      pauseRecording();
      
      // Stop speech recognition while paused
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
        speechRecognitionRef.current = null;
      }
    }
  };

  const handleSaveMemo = () => {
    try {
      setIsProcessing(true);
      
      // We already have the transcript from live recognition
      const memoText = recognizedText || "Empty memo";
      
      // Detect the memo type
      const memoType = detectMemoType(memoText);
      
      // Save the memo
      const memo = saveMemo({
        text: memoText,
        type: memoType,
        audioUrl: audioUrl
      });
      
      toast({
        title: "Memo saved!",
        description: `Your ${memoType} has been saved.`
      });
      
      // Navigate to the memo detail page
      navigate(`/memo/${memo.id}`);
      
      // Notify parent component (if needed)
      if (onMemoCreated) {
        onMemoCreated(memo.id);
      }
      
      // Clear live transcription
      if (onLiveTranscription) {
        onLiveTranscription('');
      }
      
      // Reset states
      setRecognizedText('');
      setRecordingComplete(false);
      setAudioUrl(null);
      
    } catch (error) {
      console.error('Error saving memo:', error);
      toast({
        title: "Error saving memo",
        description: "There was a problem saving your recording.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    // Reset states
    setRecordingComplete(false);
    setRecognizedText('');
    setAudioUrl(null);
    
    // Make sure recording is cancelled
    cancelRecording();
    
    // Clear live transcription
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
          
          <div className="flex gap-3">
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
          
          <RecordingButton 
            onStartRecording={() => {}}
            onPauseResumeRecording={handlePauseResume}
            isRecording={isRecording}
            isPaused={isPaused}
          />
          
          <Button
            onClick={handleToggleRecording}
            disabled={isProcessing}
            className="rounded-full h-12 px-6 bg-red-500 hover:bg-red-600"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <>Stop</>
            )}
          </Button>
          
          {recognizedText && (
            <Button
              onClick={handleSaveMemo}
              disabled={isProcessing}
              className="mt-4 rounded-full px-6 bg-orange-500 hover:bg-orange-600"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Memo
            </Button>
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
    <div className="relative flex flex-col items-center">
      {renderRecordingControls()}
      
      {isRecording && !isPaused && (
        <div className="recording-animation absolute w-full h-full rounded-full"></div>
      )}
    </div>
  );
};

export default RecordButton;
