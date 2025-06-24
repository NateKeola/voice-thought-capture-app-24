
// Re-export all components for backward compatibility
export { AudioRecorder } from './audio/AudioRecorderCore';
export { useAudioRecorder } from './audio/AudioRecorderHook';
export type { AudioRecorderConfig, TranscriptionResult } from './audio/AudioRecorderConfig';

// Legacy service class for backward compatibility
export class AudioRecorderService extends AudioRecorder {}
