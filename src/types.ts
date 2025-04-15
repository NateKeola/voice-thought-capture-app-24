
export type MemoType = 'note' | 'task' | 'idea';

export interface Memo {
  id: string;
  text: string;
  type: MemoType;
  audioUrl: string | null;
  createdAt: string;
}

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  MemoDetail: { id: string };
};

export type TabParamList = {
  Home: undefined;
  Memos: undefined;
  Relationships: undefined;
};
