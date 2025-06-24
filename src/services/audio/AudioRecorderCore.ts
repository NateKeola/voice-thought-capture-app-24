
import { transcribeAudio } from '../SpeechToText';
import { AudioRecorderConfig, TranscriptionResult } from './AudioRecorderConfig';

export class AudioRecorder {
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
      
      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        try {
          const result = await this.transcribeAudio(audioBlob);
          this.config.onTranscriptionComplete?.(result.transcription, audioUrl);
        } catch (error) {
          this.config.onError?.(error as Error);
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
      this.config.onError?.(error as Error);
      throw error;
    }
  }

  public async stopRecording(): Promise<void> {
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      return;
    }

    console.log('Stopping audio recording...');
    this.mediaRecorder.stop();
    this.cleanup();
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
