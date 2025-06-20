
// I'll assume this file exists but wasn't provided in the code snippets
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMemoById } from '@/services/MemoStorage';
import MemoContent from '@/components/memo/MemoContent';
import MemoLoading from '@/components/memo/MemoLoading';
import MemoError from '@/components/memo/MemoError';
import { Memo, MemoType } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useMemos } from '@/contexts/MemoContext';

const MemoDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memo, setMemo] = useState<Memo | null>(null);
  
  // Use our memo context
  const { updateMemo: updateMemoContext, deleteMemo: deleteMemoContext } = useMemos();

  useEffect(() => {
    const fetchMemo = async () => {
      if (!id) {
        setError('Memo ID not provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const memoData = await getMemoById(id);
        if (!memoData) {
          setError('Memo not found');
        } else {
          setMemo(memoData);
        }
      } catch (error) {
        console.error('Error fetching memo details:', error);
        setError('Failed to load memo details');
        toast({
          title: "Error loading memo",
          description: "There was a problem loading this memo.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemo();
  }, [id, toast]);

  const handleSaveMemo = async (text: string, type: MemoType) => {
    if (!id || !memo) return;
    
    try {
      const updatedMemo = await updateMemoContext(id, { text, type });
      if (updatedMemo) {
        setMemo(updatedMemo);
        toast({
          title: "Memo updated",
          description: "Your changes have been saved."
        });
      }
    } catch (error) {
      console.error('Error updating memo:', error);
      toast({
        title: "Error updating memo",
        description: "There was a problem saving your changes.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMemo = async () => {
    if (!id) return;
    
    try {
      const success = await deleteMemoContext(id);
      if (success) {
        toast({
          title: "Memo deleted",
          description: "The memo has been deleted."
        });
        navigate(-1);
      }
    } catch (error) {
      console.error('Error deleting memo:', error);
      toast({
        title: "Error deleting memo",
        description: "There was a problem deleting the memo.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <MemoLoading />;
  }

  if (error || !memo) {
    return <MemoError message={error || 'Unknown error'} onBack={() => navigate(-1)} />;
  }

  return (
    <MemoContent
      memo={memo}
      onSave={handleSaveMemo}
      onDelete={handleDeleteMemo}
      onBack={() => navigate(-1)}
    />
  );
};

export default MemoDetailPage;
