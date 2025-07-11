
import { Memo, MemoType } from '@/types';
import { isAuthenticated, getUserId } from '@/utils/authUtils';
import { TitleGenerationService } from '@/services/titleGeneration';
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
      // Try async title generation first
      const memoTypeForTitle = memo.type === 'idea' ? 'idea' : (memo.type === 'task' ? 'task' : 'note');
      const generatedTitle = await TitleGenerationService.generateTitleWithCache(memo.text, memoTypeForTitle);
      memoWithTitle.title = generatedTitle;
      console.log('Generated title:', generatedTitle);
    } catch (error) {
      console.error('Error generating title, using fallback:', error);
      // Use the intelligent fallback from TitleGenerationService
      const memoTypeForTitle = memo.type === 'idea' ? 'idea' : (memo.type === 'task' ? 'task' : 'note');
      memoWithTitle.title = TitleGenerationService.generateImmediateTitle(memo.text, memoTypeForTitle);
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
  
  // If user provides a title, use it as-is. Only generate if no title is provided and text is being updated
  if (updates.text && updates.title === undefined) {
    console.log('No title provided with text update, generating title...');
    try {
      // Try async title generation first
      const memoTypeForTitle = (updates.type === 'idea' ? 'idea' : (updates.type === 'task' ? 'task' : 'note')) as 'task' | 'note' | 'idea';
      const generatedTitle = await TitleGenerationService.generateTitleWithCache(updates.text, memoTypeForTitle);
      updates.title = generatedTitle;
      console.log('Generated title for updated memo:', generatedTitle);
    } catch (error) {
      console.error('Error generating title, using fallback:', error);
      // Use the intelligent fallback from TitleGenerationService
      const memoTypeForTitle = (updates.type === 'idea' ? 'idea' : (updates.type === 'task' ? 'task' : 'note')) as 'task' | 'note' | 'idea';
      updates.title = TitleGenerationService.generateImmediateTitle(updates.text, memoTypeForTitle);
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
