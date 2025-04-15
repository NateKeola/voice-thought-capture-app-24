
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { useAudioRecorder } from "@/services/AudioRecorder";
import { transcribeAudio, detectMemoType } from "@/services/SpeechToText";
import { saveMemo } from "@/services/MemoStorage";
import { useToast } from "@/components/ui/use-toast";

interface RecordButtonProps {
  onMemoCreated?: (memoId: string) => void;
  onLiveTranscription?: (text: string) => void;
}

const RecordButton: React.FC<RecordButtonProps> = ({ onMemoCreated, onLiveTranscription }) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptionInterval, setTranscriptionInterval] = useState<number | null>(null);
  
  const {
    isRecording,
    recordingDuration,
    formattedDuration,
    startRecording,
    stopRecording
  } = useAudioRecorder();

  // Simulate live transcription during recording
  useEffect(() => {
    if (isRecording && onLiveTranscription) {
      // Clear any existing interval
      if (transcriptionInterval) {
        window.clearInterval(transcriptionInterval);
      }
      
      // Set up a new interval to update the live transcription every few seconds
      const interval = window.setInterval(() => {
        const mockPhrases = [
          "I'm thinking about...",
          "I need to remember to...",
          "It's important that I...",
          "Don't forget to..."
        ];
        
        // Get random phrase as base
        const basePhrase = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
        
        // Build up transcription based on duration
        let words = [];
        const wordCount = Math.min(20, Math.floor(recordingDuration / 2) + 1);
        
        for (let i = 0; i < wordCount; i++) {
          words.push(`word${i}`);
        }
        
        // Combine base phrase with additional words
        const liveText = `${basePhrase} ${words.join(' ')}`;
        onLiveTranscription(liveText);
      }, 1500);
      
      setTranscriptionInterval(interval);
      
      // Cleanup on unmount
      return () => {
        if (interval) window.clearInterval(interval);
      };
    } else if (!isRecording && transcriptionInterval) {
      // Clear interval when not recording
      window.clearInterval(transcriptionInterval);
      setTranscriptionInterval(null);
    }
  }, [isRecording, recordingDuration, onLiveTranscription]);

  const handleToggleRecording = async () => {
    if (isRecording) {
      try {
        setIsProcessing(true);
        const audioUrl = await stopRecording();
        
        toast({
          title: "Processing your memo...",
          description: "Converting speech to text"
        });
        
        // Process the recording
        const result = await transcribeAudio(audioUrl);
        
        // Detect the memo type
        const memoType = detectMemoType(result.text);
        
        // Save the memo
        const memo = saveMemo({
          text: result.text,
          type: memoType,
          audioUrl: audioUrl
        });
        
        toast({
          title: "Memo saved!",
          description: `Your ${memoType} has been saved.`
        });
        
        // Notify parent component
        if (onMemoCreated) {
          onMemoCreated(memo.id);
        }
        
        // Clear live transcription
        if (onLiveTranscription) {
          onLiveTranscription('');
        }
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
      startRecording();
      // Initial empty transcription
      if (onLiveTranscription) {
        onLiveTranscription('');
      }
    }
  };

  return (
    <div className="relative">
      {isRecording && (
        <>
          <div className="recording-animation" />
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 rounded-full text-sm">
            {formattedDuration}
          </div>
        </>
      )}
      
      <Button
        onClick={handleToggleRecording}
        disabled={isProcessing}
        size="lg"
        className={`h-16 w-16 rounded-full shadow-lg ${isRecording ? 'bg-red-500 hover:bg-red-600 recording-button' : 'bg-orange-500 hover:bg-orange-600'}`}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
      >
        {isProcessing ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : isRecording ? (
          <Square className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
};

export default RecordButton;
