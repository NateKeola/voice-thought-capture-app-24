
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
  
  // Generate title if not provided or invalid
  let memoWithTitle = { ...memo };
  const hasValidTitle = memo.title && 
    typeof memo.title === 'string' && 
    memo.title.trim() !== '' &&
    memo.title !== 'undefined' &&
    !memo.title.includes('_type') &&
    !memo.title.includes('value');
    
  if (!hasValidTitle) {
    console.log('Generating title for new memo...');
    try {
      const generatedTitle = await generateTitleWithClaude(memo.text, memo.type);
      memoWithTitle.title = generatedTitle;
      console.log('Generated title:', generatedTitle);
    } catch (error) {
      console.error('Error generating title:', error);
      // Fallback to a simple title based on content
      const fallbackTitle = memo.text.substring(0, 50).trim() + (memo.text.length > 50 ? '...' : '');
      memoWithTitle.title = fallbackTitle || `${memo.type} - ${new Date().toLocaleDateString()}`;
    }
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
  
  // If updating text and no valid title, regenerate title
  if (updates.text && (!updates.title || updates.title === 'undefined' || typeof updates.title !== 'string')) {
    try {
      const generatedTitle = await generateTitleWithClaude(updates.text, updates.type || 'note');
      updates.title = generatedTitle;
      console.log('Regenerated title for updated memo:', generatedTitle);
    } catch (error) {
      console.error('Error regenerating title:', error);
      // Fallback title
      const fallbackTitle = updates.text.substring(0, 50).trim() + (updates.text.length > 50 ? '...' : '');
      updates.title = fallbackTitle || `Updated ${new Date().toLocaleDateString()}`;
    }
  }
  
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
