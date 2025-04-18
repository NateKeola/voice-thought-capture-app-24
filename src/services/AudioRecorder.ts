
import { useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Request permissions when the component mounts
    const getPermissions = async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          setError('Recording permission not granted');
        }
      } catch (error) {
        console.error('Error requesting permissions:', error);
        setError('Error requesting recording permissions');
      }
    };

    getPermissions();
    
    // Clean up timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const startRecording = async () => {
    try {
      // Clear previous data
      setRecordingDuration(0);
      setAudioUri(null);
      setError(null);
      setIsPaused(false);
      
      // Configure audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
      
      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      console.log('Started recording');
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording');
    }
  };
  
  const pauseRecording = async () => {
    try {
      if (recordingRef.current && isRecording && !isPaused) {
        if (Platform.OS === 'ios') {
          await recordingRef.current.pauseAsync();
        }
        setIsPaused(true);
        
        // Pause timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        console.log('Paused recording');
      }
    } catch (err) {
      console.error('Error pausing recording:', err);
      setError('Failed to pause recording');
    }
  };
  
  const resumeRecording = async () => {
    try {
      if (recordingRef.current && isRecording && isPaused) {
        if (Platform.OS === 'ios') {
          // Using startAsync instead of resumeAsync which doesn't exist
          await recordingRef.current.startAsync();
        }
        setIsPaused(false);
        
        // Resume timer
        timerRef.current = setInterval(() => {
          setRecordingDuration(prev => prev + 1);
        }, 1000);
        
        console.log('Resumed recording');
      }
    } catch (err) {
      console.error('Error resuming recording:', err);
      setError('Failed to resume recording');
    }
  };
  
  const stopRecording = async () => {
    try {
      if (!recordingRef.current) {
        return null;
      }
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      
      // Reset recording state
      setIsRecording(false);
      setIsPaused(false);
      
      // If we have a URI, save it
      if (uri) {
        setAudioUri(uri);
        console.log('Recording saved to', uri);
        return uri;
      }
      
      return null;
    } catch (err) {
      console.error('Error stopping recording:', err);
      setError('Failed to stop recording');
      setIsRecording(false);
      setIsPaused(false);
      return null;
    }
  };
  
  const cancelRecording = async () => {
    try {
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Stop recording if it's ongoing
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }
      
      // Reset state
      setIsRecording(false);
      setIsPaused(false);
      setRecordingDuration(0);
      setAudioUri(null);
      
      console.log('Recording cancelled');
    } catch (err) {
      console.error('Error cancelling recording:', err);
    }
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
    audioUri,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording
  };
};
