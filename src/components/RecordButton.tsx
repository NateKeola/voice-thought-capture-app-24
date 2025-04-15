
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import { useAudioRecorder } from "@/services/AudioRecorder";
import { transcribeAudio, detectMemoType } from "@/services/SpeechToText";
import { saveMemo } from "@/services/MemoStorage";
import { useToast } from "@/components/ui/use-toast";

interface RecordButtonProps {
  onMemoCreated?: (memoId: string) => void;
}

const RecordButton: React.FC<RecordButtonProps> = ({ onMemoCreated }) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const {
    isRecording,
    recordingDuration,
    formattedDuration,
    startRecording,
    stopRecording
  } = useAudioRecorder();

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
        className={`h-16 w-16 rounded-full shadow-lg ${isRecording ? 'bg-red-500 hover:bg-red-600 recording-button' : 'bg-primary hover:bg-primary/90'}`}
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
