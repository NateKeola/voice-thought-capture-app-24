
import { supabase } from '@/integrations/supabase/client';
import { Memo } from '../types';

// Save a new memo
export const saveMemo = async (memo: Omit<Memo, 'id' | 'createdAt'>): Promise<Memo> => {
  const { data, error } = await supabase
    .from('memos')
    .insert([{
      text: memo.text,
      type: memo.type,
      audio_url: memo.audioUrl,
    }])
    .select()
    .single();

  if (error) {
    console.error('Error saving memo:', error);
    throw error;
  }

  return {
    id: data.id,
    text: data.text,
    type: data.type,
    audioUrl: data.audio_url,
    createdAt: data.created_at,
    completed: data.completed
  };
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

  return data.map(memo => ({
    id: memo.id,
    text: memo.text,
    type: memo.type,
    audioUrl: memo.audio_url,
    createdAt: memo.created_at,
    completed: memo.completed
  }));
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

  return {
    id: data.id,
    text: data.text,
    type: data.type,
    audioUrl: data.audio_url,
    createdAt: data.created_at,
    completed: data.completed
  };
};

// Update a memo
export const updateMemo = async (id: string, updates: Partial<Omit<Memo, 'id' | 'createdAt'>>): Promise<Memo | null> => {
  const { data, error } = await supabase
    .from('memos')
    .update({
      text: updates.text,
      type: updates.type,
      audio_url: updates.audioUrl,
      completed: updates.completed
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating memo:', error);
    throw error;
  }

  return {
    id: data.id,
    text: data.text,
    type: data.type,
    audioUrl: data.audio_url,
    createdAt: data.created_at,
    completed: data.completed
  };
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

// Remove the initializeSampleData function as we don't need it anymore
// since data will be persisted in Supabase
