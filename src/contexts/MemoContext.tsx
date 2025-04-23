
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getAllMemos, saveMemo, updateMemo, deleteMemo } from '@/services/MemoStorage';
import { Memo, MemoType } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface MemoContextType {
  memos: Memo[];
  isLoading: boolean;
  error: string | null;
  refreshMemos: () => Promise<void>;
  createMemo: (memo: Omit<Memo, 'id' | 'createdAt'>) => Promise<Memo | null>;
  updateMemo: (id: string, updates: Partial<Omit<Memo, 'id' | 'createdAt'>>) => Promise<Memo | null>;
  deleteMemo: (id: string) => Promise<boolean>;
  filterMemos: (filter: MemoType | 'all') => Memo[];
}

const MemoContext = createContext<MemoContextType | undefined>(undefined);

export const MemoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshMemos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedMemos = await getAllMemos();
      setMemos(fetchedMemos);
    } catch (err) {
      console.error('Error fetching memos:', err);
      setError('Failed to load memos');
      toast({
        title: "Error loading memos",
        description: "There was a problem loading your memos.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createMemo = async (memoData: Omit<Memo, 'id' | 'createdAt'>) => {
    try {
      const newMemo = await saveMemo(memoData);
      // Real-time updates will handle adding this to the state
      return newMemo;
    } catch (err) {
      console.error('Error creating memo:', err);
      toast({
        title: "Error creating memo",
        description: "There was a problem creating your memo.",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateMemoItem = async (id: string, updates: Partial<Omit<Memo, 'id' | 'createdAt'>>) => {
    try {
      const updatedMemo = await updateMemo(id, updates);
      // Real-time updates will handle updating the state
      return updatedMemo;
    } catch (err) {
      console.error('Error updating memo:', err);
      toast({
        title: "Error updating memo",
        description: "There was a problem updating your memo.",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteMemoItem = async (id: string) => {
    try {
      const success = await deleteMemo(id);
      if (success) {
        // Real-time updates will handle removing from the state
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting memo:', err);
      toast({
        title: "Error deleting memo",
        description: "There was a problem deleting your memo.",
        variant: "destructive"
      });
      return false;
    }
  };

  const filterMemos = (filter: MemoType | 'all') => {
    if (filter === 'all') {
      return memos;
    }
    return memos.filter(memo => memo.type === filter);
  };

  // Set up real-time listeners for memo changes
  useEffect(() => {
    refreshMemos();

    // Subscribe to changes
    const channel = supabase
      .channel('memo-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memos'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMemo = {
              id: payload.new.id,
              text: payload.new.content,
              type: payload.new.category as MemoType,
              audioUrl: payload.new.audio_url,
              createdAt: payload.new.created_at,
              completed: payload.new.status === 'completed'
            };
            setMemos(current => [newMemo, ...current]);
            
            toast({
              title: "New memo created",
              description: `A new ${newMemo.type} has been added.`
            });
          } else if (payload.eventType === 'UPDATE') {
            setMemos(current => current.map(memo => 
              memo.id === payload.new.id ? {
                ...memo,
                text: payload.new.content,
                type: payload.new.category as MemoType,
                audioUrl: payload.new.audio_url,
                completed: payload.new.status === 'completed'
              } : memo
            ));
            
            toast({
              title: "Memo updated",
              description: "A memo has been updated."
            });
          } else if (payload.eventType === 'DELETE') {
            setMemos(current => current.filter(memo => memo.id !== payload.old.id));
            
            toast({
              title: "Memo deleted",
              description: "A memo has been removed."
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const value = {
    memos,
    isLoading,
    error,
    refreshMemos,
    createMemo,
    updateMemo: updateMemoItem,
    deleteMemo: deleteMemoItem,
    filterMemos
  };

  return <MemoContext.Provider value={value}>{children}</MemoContext.Provider>;
};

export const useMemos = () => {
  const context = useContext(MemoContext);
  if (context === undefined) {
    throw new Error('useMemos must be used within a MemoProvider');
  }
  return context;
};
