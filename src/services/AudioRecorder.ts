
import { transcribeAudio } from './SpeechToText';

export interface AudioRecorderConfig {
  sampleRate?: number;
  channelCount?: number;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
}

export interface TranscriptionResult {
  transcription: string;
  confidence?: number;
  duration?: number;
}

export class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private recordingInterval: NodeJS.Timeout | null = null;
  private startTime = 0;
  private pausedDuration = 0;
  private lastPauseTime = 0;
  private config: AudioRecorderConfig;
  
  private isRecording = false;
  private isPaused = false;
  private recordingDuration = 0;

  constructor(config: AudioRecorderConfig = {}) {
    this.config = {
      sampleRate: 44100,
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      ...config
    };
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }

  public getRecordingDuration(): number {
    return this.recordingDuration;
  }

  public getFormattedDuration(): string {
    const mins = Math.floor(this.recordingDuration / 60);
    const secs = this.recordingDuration % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  public async startRecording(): Promise<void> {
    try {
      console.log('Starting audio recording...');
      
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: this.config.sampleRate,
          channelCount: this.config.channelCount,
          echoCancellation: this.config.echoCancellation,
          noiseSuppression: this.config.noiseSuppression,
          autoGainControl: this.config.autoGainControl
        }
      });
      
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      this.audioChunks = [];
      this.startTime = Date.now();
      this.pausedDuration = 0;
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.start();
      this.isRecording = true;
      this.isPaused = false;
      
      // Update duration every second
      this.recordingInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - this.startTime - this.pausedDuration) / 1000);
        this.recordingDuration = elapsed;
      }, 1000);
      
      console.log('Recording started successfully');
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  public stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      console.log('Stopping audio recording...');
      
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        
        // Cleanup
        this.cleanup();
        
        console.log('Recording stopped, audio blob created');
        resolve(audioBlob);
      };
      
      this.mediaRecorder.stop();
    });
  }

  public pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      console.log('Pausing recording...');
      this.mediaRecorder.pause();
      this.isPaused = true;
      this.lastPauseTime = Date.now();
      
      if (this.recordingInterval) {
        clearInterval(this.recordingInterval);
        this.recordingInterval = null;
      }
    }
  }

  public resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      console.log('Resuming recording...');
      this.mediaRecorder.resume();
      this.isPaused = false;
      
      // Add paused time to total paused duration
      this.pausedDuration += Date.now() - this.lastPauseTime;
      
      // Restart duration timer
      this.recordingInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - this.startTime - this.pausedDuration) / 1000);
        this.recordingDuration = elapsed;
      }, 1000);
    }
  }

  public cancelRecording(): void {
    console.log('Cancelling recording...');
    
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    this.cleanup();
    this.audioChunks = [];
  }

  public async transcribeAudio(audioBlob: Blob): Promise<TranscriptionResult> {
    try {
      console.log('Transcribing audio with Whisper...');
      
      const result = await transcribeAudio(audioBlob);
      
      console.log('Transcription completed:', result.text);
      return {
        transcription: result.text,
        confidence: result.confidence,
        duration: this.recordingDuration
      };
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }

  public destroy(): void {
    this.cleanup();
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
    
    this.isRecording = false;
    this.isPaused = false;
    this.recordingDuration = 0;
  }
}

// For backward compatibility, export a hook that uses the service
export const useAudioRecorder = () => {
  // This is now just a simple wrapper that creates the service
  const audioService = new AudioRecorderService();
  
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
