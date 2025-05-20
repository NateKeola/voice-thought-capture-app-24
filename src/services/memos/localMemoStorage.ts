
import { Memo, MemoType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Save a new memo to local storage
export const saveLocalMemo = (memo: Omit<Memo, 'id' | 'createdAt'>): Memo => {
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
};

// Get all memos from local storage
export const getAllLocalMemos = (): Memo[] => {
  const localMemosString = localStorage.getItem('local_memos') || '[]';
  return JSON.parse(localMemosString);
};

// Get a memo by ID from local storage
export const getLocalMemoById = (id: string): Memo | null => {
  const localMemosString = localStorage.getItem('local_memos') || '[]';
  const localMemos = JSON.parse(localMemosString);
  const memo = localMemos.find((m: Memo) => m.id === id);
  return memo || null;
};

// Update a memo in local storage
export const updateLocalMemo = (id: string, updates: Partial<Omit<Memo, 'id' | 'createdAt'>>): Memo | null => {
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
};

// Delete a memo from local storage
export const deleteLocalMemo = (id: string): boolean => {
  const localMemosString = localStorage.getItem('local_memos') || '[]';
  const localMemos = JSON.parse(localMemosString);
  const updatedMemos = localMemos.filter((m: Memo) => m.id !== id);
  localStorage.setItem('local_memos', JSON.stringify(updatedMemos));
  
  return true;
};
