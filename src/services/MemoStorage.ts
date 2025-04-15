
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
  return newMemo;
};

// Get all memos
export const getAllMemos = (): Memo[] => {
  return [...memos];
};

// Get memos by type
export const getMemosByType = (type: Memo['type']): Memo[] => {
  return memos.filter(memo => memo.type === type);
};

// Get a memo by ID
export const getMemoById = (id: string): Memo | undefined => {
  return memos.find(memo => memo.id === id);
};

// Update a memo
export const updateMemo = (id: string, updates: Partial<Omit<Memo, 'id' | 'createdAt'>>): Memo | null => {
  const index = memos.findIndex(memo => memo.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedMemo = {
    ...memos[index],
    ...updates
  };
  
  memos[index] = updatedMemo;
  return updatedMemo;
};

// Delete a memo
export const deleteMemo = (id: string): boolean => {
  const initialLength = memos.length;
  memos = memos.filter(memo => memo.id !== id);
  return memos.length < initialLength;
};

// Initialize with some sample data
export const initializeSampleData = () => {
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
};

// Initialize sample data right away
initializeSampleData();
