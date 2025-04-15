
import { useState, useRef } from 'react';

// This is a mock service for audio recording
// In a real app with Expo, you would use expo-av for audio recording
export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  
  // Start recording function
  const startRecording = () => {
    try {
      // In a real implementation, we would use expo-av's Audio.Recording
      // For now, we'll simulate recording with a timer
      setIsRecording(true);
      setRecordingDuration(0);
      setError(null);
      setIsPaused(false);
      
      // Start a timer to track recording duration
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      console.log('Started recording');
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start recording.');
      setIsRecording(false);
    }
  };
  
  // Pause recording function
  const pauseRecording = () => {
    setIsPaused(true);
    
    // Pause the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    console.log('Paused recording at', recordingDuration);
  };
  
  // Resume recording function
  const resumeRecording = () => {
    setIsPaused(false);
    
    // Resume the timer
    timerRef.current = window.setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
    
    console.log('Resumed recording at', recordingDuration);
  };
  
  // Stop recording function
  const stopRecording = async (): Promise<string> => {
    try {
      // Clear the duration timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // In a real implementation, we would stop the Audio.Recording
      // and get the file URI
      setIsRecording(false);
      setIsPaused(false);
      
      // For demo purposes, create a fake file URL
      const fakeAudioUrl = `memo_${Date.now()}.m4a`;
      setAudioUrl(fakeAudioUrl);
      
      console.log('Stopped recording, duration:', recordingDuration);
      return fakeAudioUrl;
    } catch (err) {
      console.error('Failed to stop recording:', err);
      setError('Failed to stop recording.');
      setIsRecording(false);
      throw new Error('Failed to stop recording');
    }
  };
  
  // Cancel recording function
  const cancelRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsRecording(false);
    setRecordingDuration(0);
    setIsPaused(false);
  };
  
  // Format seconds as MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return {
    isRecording,
    isPaused,
    recordingDuration,
    formattedDuration: formatDuration(recordingDuration),
    audioUrl,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording
  };
};
