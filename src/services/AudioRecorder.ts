import { useState, useRef } from 'react';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const MAX_DURATION = 60; // 1 minute in seconds
  
  const startRecording = () => {
    try {
      setIsRecording(true);
      setRecordingDuration(0);
      setError(null);
      setIsPaused(false);
      
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
  
  const pauseRecording = () => {
    try {
      setIsPaused(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      console.log('Paused recording at', recordingDuration);
    } catch (err) {
      console.error('Failed to pause recording:', err);
      setError('Failed to pause recording.');
    }
  };
  
  const resumeRecording = () => {
    try {
      setIsPaused(false);
      
      timerRef.current = window.setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= MAX_DURATION) {
            stopRecording();
            return MAX_DURATION;
          }
          return prev + 1;
        });
      }, 1000);
      
      console.log('Resumed recording at', recordingDuration);
    } catch (err) {
      console.error('Failed to resume recording:', err);
      setError('Failed to resume recording.');
    }
  };
  
  const stopRecording = async (): Promise<string> => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setIsRecording(false);
      setIsPaused(false);
      
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
  
  const cancelRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsRecording(false);
    setRecordingDuration(0);
    setIsPaused(false);
  };
  
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
