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
        setIsProcessing(true);
        
        if (speechRecognitionRef.current) {
          speechRecognitionRef.current.stop();
          speechRecognitionRef.current = null;
        }
        
        const url = await stopAudioRecording();
        setAudioUrl(url);
        
        toast({
          title: "Recording complete",
          description: "You can now save your memo"
        });
        
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
      
      startAudioRecording();
      
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
      
      const memoType = await detectMemoType(memoText);
      
      const memo = await saveMemo({
        text: memoText,
        type: memoType,
        audioUrl: audioUrl
      });
      
      toast({
        title: "Memo saved!",
        description: `Your ${memoType} has been saved and categorized using AI.`
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
    setRecordingComplete(false);
    setRecognizedText('');
    setAudioUrl(null);
    
    cancelRecording();
    
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
    <div className="relative flex flex-col items-center">
      {renderRecordingControls()}
    </div>
  );
};

export default RecordButton;
