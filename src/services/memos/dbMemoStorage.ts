
import { supabase } from '@/integrations/supabase/client';
import { Memo } from '@/types';
import { DbMemo, toDbMemo, fromDbMemo } from './memoMappers';

// Save a new memo to the database
export const saveDbMemo = async (memo: Omit<Memo, 'id' | 'createdAt'>, userId: string): Promise<Memo> => {
  const dbMemo = toDbMemo(memo, userId);
  
  const { data, error } = await supabase
    .from('memos')
    .insert([dbMemo])
    .select()
    .single() as { data: DbMemo | null, error: any };

  if (error) {
    console.error('Error saving memo to DB:', error);
    throw error;
  }

  return fromDbMemo(data!);
};

// Get all memos from the database
export const getAllDbMemos = async (): Promise<Memo[]> => {
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .order('created_at', { ascending: false }) as { data: DbMemo[] | null, error: any };

  if (error) {
    console.error('Error fetching memos from DB:', error);
    throw error;
  }

  return (data || []).map(fromDbMemo);
};

// Get a memo by ID from the database
export const getDbMemoById = async (id: string): Promise<Memo | null> => {
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .eq('id', id)
    .single() as { data: DbMemo | null, error: any };

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching memo from DB:', error);
    throw error;
  }

  return fromDbMemo(data!);
};

// Update a memo in the database
export const updateDbMemo = async (id: string, updates: Partial<Omit<Memo, 'id' | 'createdAt'>>, userId: string): Promise<Memo | null> => {
  const dbUpdates = toDbMemo(updates, userId);
  
  const { data, error } = await supabase
    .from('memos')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single() as { data: DbMemo | null, error: any };

  if (error) {
    console.error('Error updating memo in DB:', error);
    throw error;
  }

  return fromDbMemo(data!);
};

// Delete a memo from the database
export const deleteDbMemo = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('memos')
    .delete()
    .eq('id', id) as { error: any };

  if (error) {
    console.error('Error deleting memo from DB:', error);
    throw error;
  }

  return true;
};
