
import { Memo, MemoType } from '@/types';
import { isAuthenticated, getUserId } from '@/utils/authUtils';
import { generateTitleWithClaude } from '@/services/claudeTitleService';
import {
  saveLocalMemo,
  getAllLocalMemos,
  getLocalMemoById,
  updateLocalMemo,
  deleteLocalMemo
} from './localMemoStorage';
import {
  saveDbMemo,
  getAllDbMemos,
  getDbMemoById,
  updateDbMemo,
  deleteDbMemo
} from './dbMemoStorage';

// Save a new memo with auto-generated title
export const saveMemo = async (memo: Omit<Memo, 'id' | 'createdAt'>): Promise<Memo> => {
  const authenticated = await isAuthenticated();
  
  // Generate title if not provided
  let memoWithTitle = { ...memo };
  if (!memo.title) {
    console.log('Generating title for new memo...');
    const generatedTitle = await generateTitleWithClaude(memo.text, memo.type);
    memoWithTitle.title = generatedTitle;
    console.log('Generated title:', generatedTitle);
  }
  
  if (!authenticated) {
    return saveLocalMemo(memoWithTitle);
  }
  
  const userId = await getUserId();
  if (!userId) {
    throw new Error('User ID not found');
  }
  return saveDbMemo(memoWithTitle, userId);
};

// Get all memos
export const getAllMemos = async (): Promise<Memo[]> => {
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    return getAllLocalMemos();
  }
  
  return getAllDbMemos();
};

// Get a memo by ID
export const getMemoById = async (id: string): Promise<Memo | null> => {
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    return getLocalMemoById(id);
  }
  
  return getDbMemoById(id);
};

// Update a memo
export const updateMemo = async (id: string, updates: Partial<Omit<Memo, 'id' | 'createdAt'>>): Promise<Memo | null> => {
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    return updateLocalMemo(id, updates);
  }
  
  const userId = await getUserId();
  if (!userId) {
    throw new Error('User ID not found');
  }
  return updateDbMemo(id, updates, userId);
};

// Delete a memo
export const deleteMemo = async (id: string): Promise<boolean> => {
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    return deleteLocalMemo(id);
  }
  
  return deleteDbMemo(id);
};
