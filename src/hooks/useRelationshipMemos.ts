
import { useState, useEffect } from 'react';
import { useMemos } from '@/contexts/MemoContext';
import { Memo, MemoType } from '@/types';

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

    // Filter memos that contain the contact tag for this relationship
    const filteredMemos = memos.filter(memo => {
      // Check if memo contains the contact tag with this relationship ID
      return memo.text.includes(`[Contact: ${relationshipId}]`);
    });
    
    setRelationshipMemos(filteredMemos);
  }, [memos, relationshipId]);

  // Create a memo associated with this relationship
  const createRelationshipMemo = async (
    text: string, 
    type: MemoType = 'note'
  ) => {
    if (!relationshipId) return null;
    
    // Add the contact tag at the beginning of the memo text
    const memoText = `[Contact: ${relationshipId}] ${text}`;
    
    const newMemo = await createMemo({
      text: memoText,
      content: memoText, // Add content property
      category: type, // Add category property
      type: type,
      audioUrl: null
    });

    return newMemo;
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
