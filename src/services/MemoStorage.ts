
import { supabase } from '@/integrations/supabase/client';
import { Memo, MemoType } from '../types';

// Maps between frontend Memo type and database schema
const toDbMemo = (memo: Omit<Memo, 'id' | 'createdAt'> | Partial<Omit<Memo, 'id' | 'createdAt'>>, userId: string) => {
  return {
    content: memo.text,
    category: memo.type,
    audio_url: memo.audioUrl,
    status: memo.completed ? 'completed' : 'active',
    user_id: userId
  };
};

const fromDbMemo = (dbMemo: any): Memo => {
  return {
    id: dbMemo.id,
    text: dbMemo.content,
    type: dbMemo.category as MemoType,
    audioUrl: dbMemo.audio_url,
    createdAt: dbMemo.created_at,
    completed: dbMemo.status === 'completed'
  };
};

// Save a new memo
export const saveMemo = async (memo: Omit<Memo, 'id' | 'createdAt'>): Promise<Memo> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to save memos');
  }
  
  const dbMemo = toDbMemo(memo, user.id);
  
  const { data, error } = await supabase
    .from('memos')
    .insert([dbMemo])
    .select()
    .single();

  if (error) {
    console.error('Error saving memo:', error);
    throw error;
  }

  return fromDbMemo(data);
};

// Get all memos
export const getAllMemos = async (): Promise<Memo[]> => {
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching memos:', error);
    throw error;
  }

  return data.map(fromDbMemo);
};

// Get a memo by ID
export const getMemoById = async (id: string): Promise<Memo | null> => {
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching memo:', error);
    throw error;
  }

  return fromDbMemo(data);
};

// Update a memo
export const updateMemo = async (id: string, updates: Partial<Omit<Memo, 'id' | 'createdAt'>>): Promise<Memo | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to update memos');
  }
  
  const dbUpdates = toDbMemo(updates, user.id);
  
  const { data, error } = await supabase
    .from('memos')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating memo:', error);
    throw error;
  }

  return fromDbMemo(data);
};

// Delete a memo
export const deleteMemo = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('memos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting memo:', error);
    throw error;
  }

  return true;
};
