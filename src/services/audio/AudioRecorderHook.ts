
import { AudioRecorder } from './AudioRecorderCore';

// For backward compatibility, export a hook that uses the service
export const useAudioRecorder = () => {
  // This is now just a simple wrapper that creates the service
  const audioService = new AudioRecorder();
  
  return {
    isRecording: audioService.getIsRecording(),
    isPaused: audioService.getIsPaused(),
    recordingDuration: audioService.getRecordingDuration(),
    formattedDuration: audioService.getFormattedDuration(),
    startRecording: () => audioService.startRecording(),
    stopRecording: () => audioService.stopRecording(),
    pauseRecording: () => audioService.pauseRecording(),
    resumeRecording: () => audioService.resumeRecording(),
    cancelRecording: () => audioService.cancelRecording(),
    transcribeRecording: async () => {
      if (audioService['audioChunks'].length === 0) {
        throw new Error('No audio data to transcribe');
      }
      
      const audioBlob = new Blob(audioService['audioChunks'], { type: 'audio/webm' });
      const result = await audioService.transcribeAudio(audioBlob);
      return result.transcription;
    }
  };
};
