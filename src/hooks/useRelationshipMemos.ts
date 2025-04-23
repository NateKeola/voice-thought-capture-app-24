
import { useState, useEffect } from 'react';
import { useMemos } from '@/contexts/MemoContext';
import { Memo } from '@/types';

interface RelationshipMemo extends Memo {
  relationshipId?: string;
}

export const useRelationshipMemos = (relationshipId?: string) => {
  const { memos, isLoading, error, createMemo, updateMemo, deleteMemo } = useMemos();
  const [relationshipMemos, setRelationshipMemos] = useState<RelationshipMemo[]>([]);

  // Filter memos for this relationship
  useEffect(() => {
    if (!relationshipId) {
      setRelationshipMemos([]);
      return;
    }

    // In a real implementation, we would filter by relationship ID in the metadata
    // This is a simplified approach - it would be better to add a relationship_id column
    // to the memos table for a proper implementation
    const filteredMemos = memos.filter(memo => 
      memo.text.toLowerCase().includes(relationshipId.toLowerCase())
    );
    
    setRelationshipMemos(filteredMemos);
  }, [memos, relationshipId]);

  // Create a memo associated with this relationship
  const createRelationshipMemo = async (
    text: string, 
    type: 'note' | 'task' | 'should' = 'note'
  ) => {
    if (!relationshipId) return null;
    
    // In a real implementation, we would store the relationship ID in the memo metadata
    const memoText = `[Contact: ${relationshipId}] ${text}`;
    
    return await createMemo({
      text: memoText,
      type: type,
      audioUrl: null
    });
  };

  return {
    memos: relationshipMemos,
    isLoading,
    error,
    createMemo: createRelationshipMemo,
    updateMemo,
    deleteMemo
  };
};
