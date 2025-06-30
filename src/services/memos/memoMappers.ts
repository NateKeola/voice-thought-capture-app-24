
import { Memo, MemoType } from '@/types';
import { DatabaseTables } from '@/types/database.types';

export type DbMemo = DatabaseTables['memos'];

// Maps between frontend Memo type and database schema
export const toDbMemo = (memo: Omit<Memo, 'id' | 'createdAt'> | Partial<Omit<Memo, 'id' | 'createdAt'>>, userId: string) => {
  return {
    content: memo.text,
    category: memo.type,
    audio_url: memo.audioUrl,
    status: memo.completed ? 'completed' : 'active',
    user_id: userId
  };
};

export const fromDbMemo = (dbMemo: DbMemo): Memo => {
  return {
    id: dbMemo.id,
    text: dbMemo.content,
    content: dbMemo.content, // Add content property
    category: dbMemo.category, // Add category property
    type: dbMemo.category as MemoType,
    audioUrl: dbMemo.audio_url,
    createdAt: dbMemo.created_at,
    completed: dbMemo.status === 'completed',
    title: dbMemo.title || undefined
  };
};
