
export interface AudioRecorderConfig {
  sampleRate?: number;
  channelCount?: number;
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
  onTranscriptionUpdate?: (text: string) => void;
  onTranscriptionComplete?: (transcript: string, audioUrl?: string) => void;
  onError?: (error: Error) => void;
}

export interface TranscriptionResult {
  transcription: string;
  confidence?: number;
  duration?: number;
}
