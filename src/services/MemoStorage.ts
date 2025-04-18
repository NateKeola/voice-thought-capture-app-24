
import { Memo } from '../types';

// In-memory storage for development purposes
// In a real app, this would use AsyncStorage or a database
let memos: Memo[] = [];

// Generate a unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Save a new memo
export const saveMemo = (memo: Omit<Memo, 'id' | 'createdAt'>): Memo => {
  const newMemo: Memo = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    ...memo
  };
  
  memos = [newMemo, ...memos];
  console.log('Saved memo:', newMemo);
  
  // Save to localStorage for persistence between page refreshes
  try {
    const existingMemos = JSON.parse(localStorage.getItem('memos') || '[]');
    localStorage.setItem('memos', JSON.stringify([newMemo, ...existingMemos]));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
  
  return newMemo;
};

// Get all memos
export const getAllMemos = (): Memo[] => {
  // Try to load from localStorage first
  try {
    const storedMemos = localStorage.getItem('memos');
    if (storedMemos) {
      memos = JSON.parse(storedMemos);
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  
  return [...memos];
};

// Get memos by type
export const getMemosByType = (type: Memo['type']): Memo[] => {
  // Ensure memos are loaded from localStorage
  if (memos.length === 0) {
    getAllMemos();
  }
  
  return memos.filter(memo => memo.type === type);
};

// Get a memo by ID
export const getMemoById = (id: string): Memo | undefined => {
  // Ensure memos are loaded from localStorage
  if (memos.length === 0) {
    getAllMemos();
  }
  
  return memos.find(memo => memo.id === id);
};

// Update a memo
export const updateMemo = (id: string, updates: Partial<Omit<Memo, 'id' | 'createdAt'>>): Memo | null => {
  // Ensure memos are loaded from localStorage
  if (memos.length === 0) {
    getAllMemos();
  }
  
  const index = memos.findIndex(memo => memo.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedMemo = {
    ...memos[index],
    ...updates
  };
  
  memos[index] = updatedMemo;
  
  // Update localStorage
  try {
    localStorage.setItem('memos', JSON.stringify(memos));
  } catch (error) {
    console.error('Error updating localStorage:', error);
  }
  
  return updatedMemo;
};

// Delete a memo
export const deleteMemo = (id: string): boolean => {
  // Ensure memos are loaded from localStorage
  if (memos.length === 0) {
    getAllMemos();
  }
  
  const initialLength = memos.length;
  memos = memos.filter(memo => memo.id !== id);
  
  // Update localStorage if a memo was deleted
  if (memos.length < initialLength) {
    try {
      localStorage.setItem('memos', JSON.stringify(memos));
    } catch (error) {
      console.error('Error updating localStorage after delete:', error);
    }
    return true;
  }
  
  return false;
};

// Initialize with some sample data
export const initializeSampleData = () => {
  // Only initialize if no data exists in localStorage
  try {
    const storedMemos = localStorage.getItem('memos');
    if (storedMemos) {
      const parsedMemos = JSON.parse(storedMemos);
      if (parsedMemos.length > 0) {
        memos = parsedMemos;
        return; // Don't override existing data
      }
    }
  } catch (error) {
    console.error('Error checking localStorage for existing memos:', error);
  }
  
  const now = new Date();
  
  const sampleMemos: Memo[] = [
    {
      id: 'sample1',
      text: 'Remember to pick up groceries tonight after work, especially milk and eggs.',
      type: 'task',
      audioUrl: 'sample_audio_1.m4a',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
      id: 'sample2',
      text: 'I should look into that new JavaScript framework for the project.',
      type: 'idea',
      audioUrl: 'sample_audio_2.m4a',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    },
    {
      id: 'sample3',
      text: 'The client meeting went well. They liked our proposal but want some changes to the timeline.',
      type: 'note',
      audioUrl: 'sample_audio_3.m4a',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
      id: 'sample4',
      text: 'Need to schedule a dentist appointment for next week.',
      type: 'task',
      audioUrl: 'sample_audio_4.m4a',
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    }
  ];
  
  memos = sampleMemos;
  
  // Save sample data to localStorage
  try {
    localStorage.setItem('memos', JSON.stringify(memos));
  } catch (error) {
    console.error('Error saving sample data to localStorage:', error);
  }
};

// Initialize sample data right away
initializeSampleData();
