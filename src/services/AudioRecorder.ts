
import { transcribeAudio } from './SpeechToText';

interface AudioRecorderHook {
  isRecording: boolean;
  isPaused: boolean;
  recordingDuration: number;
  formattedDuration: string;
  startRecording: () => void;
  stopRecording: () => Promise<string | null>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  cancelRecording: () => void;
  transcribeRecording: () => Promise<string>;
}

export const useAudioRecorder = (): AudioRecorderHook => {
  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: Blob[] = [];
  let stream: MediaStream | null = null;
  let recordingInterval: NodeJS.Timeout | null = null;
  let startTime = 0;
  let pausedDuration = 0;
  let lastPauseTime = 0;
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      console.log('Starting audio recording...');
      
      stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunks = [];
      startTime = Date.now();
      pausedDuration = 0;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      
      // Update duration every second
      recordingInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime - pausedDuration) / 1000);
        setRecordingDuration(elapsed);
      }, 1000);
      
      console.log('Recording started successfully');
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  };

  const stopRecording = (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      console.log('Stopping audio recording...');
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Cleanup
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          stream = null;
        }
        
        if (recordingInterval) {
          clearInterval(recordingInterval);
          recordingInterval = null;
        }
        
        setIsRecording(false);
        setIsPaused(false);
        setRecordingDuration(0);
        
        console.log('Recording stopped, audio URL created');
        resolve(audioUrl);
      };
      
      mediaRecorder.stop();
    });
  };

  const pauseRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      console.log('Pausing recording...');
      mediaRecorder.pause();
      setIsPaused(true);
      lastPauseTime = Date.now();
      
      if (recordingInterval) {
        clearInterval(recordingInterval);
        recordingInterval = null;
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'paused') {
      console.log('Resuming recording...');
      mediaRecorder.resume();
      setIsPaused(false);
      
      // Add paused time to total paused duration
      pausedDuration += Date.now() - lastPauseTime;
      
      // Restart duration timer
      recordingInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime - pausedDuration) / 1000);
        setRecordingDuration(elapsed);
      }, 1000);
    }
  };

  const cancelRecording = () => {
    console.log('Cancelling recording...');
    
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    
    if (recordingInterval) {
      clearInterval(recordingInterval);
      recordingInterval = null;
    }
    
    audioChunks = [];
    setIsRecording(false);
    setIsPaused(false);
    setRecordingDuration(0);
  };

  const transcribeRecording = async (): Promise<string> => {
    if (audioChunks.length === 0) {
      throw new Error('No audio data to transcribe');
    }
    
    console.log('Transcribing audio with Whisper...');
    
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const result = await transcribeAudio(audioBlob);
    
    console.log('Transcription completed:', result.text);
    return result.text;
  };

  return {
    isRecording,
    isPaused,
    recordingDuration,
    formattedDuration: formatDuration(recordingDuration),
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    cancelRecording,
    transcribeRecording
  };
};
