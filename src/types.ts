export type MemoType = 'note' | 'task' | 'idea';

export interface Memo {
  id: string;
  text: string;
  type: MemoType;
  audioUrl?: string | null;
  createdAt: string;
  completed?: boolean;
  title?: string; // Add optional title field for generated synopsis
}

export interface RecordingState {
  isRecording: boolean;
  duration: number;
  audioUrl: string | null;
}

export interface Badge {
  id: number;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  date?: string;
  progress: number;
}
