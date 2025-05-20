
import { supabase } from '@/integrations/supabase/client';
import { Memo, MemoType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseTables } from '@/types/database.types';

type DbMemo = DatabaseTables['memos'];

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

const fromDbMemo = (dbMemo: DbMemo): Memo => {
  return {
    id: dbMemo.id,
    text: dbMemo.content,
    type: dbMemo.category as MemoType,
    audioUrl: dbMemo.audio_url,
    createdAt: dbMemo.created_at,
    completed: dbMemo.status === 'completed'
  };
};

// Check if user is authenticated
const isAuthenticated = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getUser();
  return !!data.user;
};

// Get current user ID or generate a guest ID
const getUserId = async (): Promise<string> => {
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    return data.user.id;
  }
  
  // For users not logged in, use a local storage guest ID
  let guestId = localStorage.getItem('memo_guest_id');
  if (!guestId) {
    guestId = `guest-${uuidv4()}`;
    localStorage.setItem('memo_guest_id', guestId);
  }
  return guestId;
};

// Save a new memo
export const saveMemo = async (memo: Omit<Memo, 'id' | 'createdAt'>): Promise<Memo> => {
  // Check if user is logged in
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    // Handle case for unauthenticated users by storing in local storage
    const memoId = uuidv4();
    const newMemo: Memo = {
      id: memoId,
      text: memo.text,
      type: memo.type,
      audioUrl: memo.audioUrl,
      createdAt: new Date().toISOString(),
      completed: memo.completed || false
    };
    
    // Get existing local memos
    const localMemosString = localStorage.getItem('local_memos') || '[]';
    const localMemos = JSON.parse(localMemosString);
    
    // Add new memo to local storage
    localMemos.unshift(newMemo);
    localStorage.setItem('local_memos', JSON.stringify(localMemos));
    
    return newMemo;
  }
  
  // Regular database storage for authenticated users
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be logged in to save memos');
  }
  
  const dbMemo = toDbMemo(memo, user.id);
  
  const { data, error } = await supabase
    .from('memos')
    .insert([dbMemo])
    .select()
    .single() as { data: DbMemo | null, error: any };

  if (error) {
    console.error('Error saving memo:', error);
    throw error;
  }

  return fromDbMemo(data!);
};

// Get all memos
export const getAllMemos = async (): Promise<Memo[]> => {
  // Check if user is logged in
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    // Return local memos for unauthenticated users
    const localMemosString = localStorage.getItem('local_memos') || '[]';
    return JSON.parse(localMemosString);
  }
  
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .order('created_at', { ascending: false }) as { data: DbMemo[] | null, error: any };

  if (error) {
    console.error('Error fetching memos:', error);
    throw error;
  }

  return (data || []).map(fromDbMemo);
};

// Get a memo by ID
export const getMemoById = async (id: string): Promise<Memo | null> => {
  // Check if user is logged in
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    // Find memo in local storage for unauthenticated users
    const localMemosString = localStorage.getItem('local_memos') || '[]';
    const localMemos = JSON.parse(localMemosString);
    const memo = localMemos.find((m: Memo) => m.id === id);
    return memo || null;
  }
  
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .eq('id', id)
    .single() as { data: DbMemo | null, error: any };

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching memo:', error);
    throw error;
  }

  return fromDbMemo(data!);
};

// Update a memo
export const updateMemo = async (id: string, updates: Partial<Omit<Memo, 'id' | 'createdAt'>>): Promise<Memo | null> => {
  // Check if user is logged in
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    // Update memo in local storage for unauthenticated users
    const localMemosString = localStorage.getItem('local_memos') || '[]';
    const localMemos = JSON.parse(localMemosString);
    const memoIndex = localMemos.findIndex((m: Memo) => m.id === id);
    
    if (memoIndex >= 0) {
      const updatedMemo = {
        ...localMemos[memoIndex],
        ...updates,
        text: updates.text || localMemos[memoIndex].text,
        type: updates.type || localMemos[memoIndex].type,
        audioUrl: updates.audioUrl !== undefined ? updates.audioUrl : localMemos[memoIndex].audioUrl,
        completed: updates.completed !== undefined ? updates.completed : localMemos[memoIndex].completed
      };
      
      localMemos[memoIndex] = updatedMemo;
      localStorage.setItem('local_memos', JSON.stringify(localMemos));
      
      return updatedMemo;
    }
    
    return null;
  }
  
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
    .single() as { data: DbMemo | null, error: any };

  if (error) {
    console.error('Error updating memo:', error);
    throw error;
  }

  return fromDbMemo(data!);
};

// Delete a memo
export const deleteMemo = async (id: string): Promise<boolean> => {
  // Check if user is logged in
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    // Delete memo from local storage for unauthenticated users
    const localMemosString = localStorage.getItem('local_memos') || '[]';
    const localMemos = JSON.parse(localMemosString);
    const updatedMemos = localMemos.filter((m: Memo) => m.id !== id);
    localStorage.setItem('local_memos', JSON.stringify(updatedMemos));
    
    return true;
  }
  
  const { error } = await supabase
    .from('memos')
    .delete()
    .eq('id', id) as { error: any };

  if (error) {
    console.error('Error deleting memo:', error);
    throw error;
  }

  return true;
};
