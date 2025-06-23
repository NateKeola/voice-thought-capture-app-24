
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

// Save a new memo
export const saveMemo = async (memo: Omit<Memo, 'id' | 'createdAt'>): Promise<Memo> => {
  // Generate title if not provided using the new service
  const memoWithTitle = {
    ...memo,
    title: memo.title || TitleGenerationService.generateTitle(memo.text, memo.type)
  };
  
  // Check if user is logged in
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    // Handle case for unauthenticated users by storing in local storage
    return saveLocalMemo(memoWithTitle);
  }
  
  // Regular database storage for authenticated users
  const userId = await getUserId();
  if (!userId) {
    throw new Error('User ID not found');
  }
  return saveDbMemo(memoWithTitle, userId);
};

// Get all memos
export const getAllMemos = async (): Promise<Memo[]> => {
  // Check if user is logged in
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    // Return local memos for unauthenticated users
    return getAllLocalMemos();
  }
  
  return getAllDbMemos();
};

// Get a memo by ID
export const getMemoById = async (id: string): Promise<Memo | null> => {
  // Check if user is logged in
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    // Find memo in local storage for unauthenticated users
    return getLocalMemoById(id);
  }
  
  return getDbMemoById(id);
};

// Update a memo
export const updateMemo = async (id: string, updates: Partial<Omit<Memo, 'id' | 'createdAt'>>): Promise<Memo | null> => {
  // Check if user is logged in
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    // Update memo in local storage for unauthenticated users
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
  // Check if user is logged in
  const authenticated = await isAuthenticated();
  
  if (!authenticated) {
    // Delete memo from local storage for unauthenticated users
    return deleteLocalMemo(id);
  }
  
  return deleteDbMemo(id);
};
