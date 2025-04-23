
import React from 'react';
import MemoCard from './MemoCard';
import { Memo, MemoType } from '@/types';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface MemoListProps {
  memos: Memo[];
  filter?: MemoType | 'all';
  onMemosUpdate?: (memos: Memo[]) => void;
}

const MemoList: React.FC<MemoListProps> = ({ memos, filter = 'all', onMemosUpdate }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Subscribe to realtime updates for memos
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
          let updatedMemos = [...memos];
          
          if (payload.eventType === 'INSERT') {
            updatedMemos = [payload.new as Memo, ...memos];
            toast({
              title: "New memo created",
              description: "A new memo has been added to your list."
            });
          } else if (payload.eventType === 'DELETE') {
            updatedMemos = memos.filter(memo => memo.id !== payload.old.id);
            toast({
              title: "Memo deleted",
              description: "A memo has been removed from your list."
            });
          } else if (payload.eventType === 'UPDATE') {
            updatedMemos = memos.map(memo => 
              memo.id === payload.new.id ? { ...memo, ...payload.new } : memo
            );
            toast({
              title: "Memo updated",
              description: "A memo has been updated in your list."
            });
          }
          
          if (onMemosUpdate) {
            onMemosUpdate(updatedMemos);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [memos, onMemosUpdate, toast]);

  const filteredMemos = filter === 'all' 
    ? memos 
    : memos.filter(memo => memo.type === filter);

  if (filteredMemos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>No memos found</p>
        {filter !== 'all' && (
          <p className="text-sm mt-1">Try changing your filter or create a new memo</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredMemos.map(memo => (
        <MemoCard 
          key={memo.id} 
          memo={memo} 
          onClick={() => navigate(`/memo/${memo.id}`)}
        />
      ))}
    </div>
  );
};

export default MemoList;
