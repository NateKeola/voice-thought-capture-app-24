
// Re-export all components for backward compatibility
export { AudioRecorder } from './audio/AudioRecorderCore';
export { useAudioRecorder } from './audio/AudioRecorderHook';
export type { AudioRecorderConfig, TranscriptionResult } from './audio/AudioRecorderConfig';

// Legacy service class for backward compatibility - fix the reference
import { AudioRecorder as AudioRecorderCore } from './audio/AudioRecorderCore';
export class AudioRecorderService extends AudioRecorderCore {}
