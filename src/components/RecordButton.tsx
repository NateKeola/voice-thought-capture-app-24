
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { useAudioRecorder } from "@/services/AudioRecorder";
import { startLiveTranscription, detectMemoType, TranscriptionResult } from "@/services/SpeechToText";
import { saveMemo } from "@/services/MemoStorage";
import { useToast } from "@/components/ui/use-toast";

interface RecordButtonProps {
  onMemoCreated?: (memoId: string) => void;
  onLiveTranscription?: (text: string) => void;
}

const RecordButton: React.FC<RecordButtonProps> = ({ onMemoCreated, onLiveTranscription }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const speechRecognitionRef = useRef<{ stop: () => void } | null>(null);
  
  const {
    isRecording,
    recordingDuration,
    formattedDuration,
    startRecording: startAudioRecording,
    stopRecording: stopAudioRecording
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
        const audioUrl = await stopAudioRecording();
        
        toast({
          title: "Processing your memo...",
          description: "Converting speech to text"
        });
        
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
        
        // Reset recognized text
        setRecognizedText('');
      } catch (error) {
        console.error('Error processing recording:', error);
        toast({
          title: "Error saving memo",
          description: "There was a problem processing your recording.",
          variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    } else {
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

  return (
    <div className="relative">
      {isRecording && (
        <>
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 rounded-full text-sm">
            {formattedDuration}
          </div>
          <div className="absolute -inset-4 rounded-full bg-red-500 opacity-20 animate-pulse"></div>
        </>
      )}
      
      <Button
        onClick={handleToggleRecording}
        disabled={isProcessing}
        className={`h-20 w-20 rounded-full shadow-lg ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'}`}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
      >
        {isProcessing ? (
          <Loader2 className="h-8 w-8 animate-spin" />
        ) : isRecording ? (
          <Square className="h-8 w-8" />
        ) : (
          <Mic className="h-8 w-8" />
        )}
      </Button>
    </div>
  );
};

export default RecordButton;
