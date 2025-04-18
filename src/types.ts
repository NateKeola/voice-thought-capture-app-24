
export type MemoType = 'note' | 'task' | 'idea';

export interface Memo {
  id: string;
  text: string;
  type: MemoType;
  audioUrl: string;
  createdAt: string;
  completed?: boolean;
}

export interface RecordingState {
  isRecording: boolean;
  duration: number;
  audioUrl: string | null;
}
