
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMemoById, updateMemo, deleteMemo } from '@/services/MemoStorage';
import { Memo, MemoType } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import MemoLoading from '@/components/memo/MemoLoading';
import MemoError from '@/components/memo/MemoError';
import MemoContent from '@/components/memo/MemoContent';

const MemoDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [memo, setMemo] = useState<Memo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchMemo = async () => {
        try {
          setIsLoading(true);
          const fetchedMemo = await getMemoById(id);
          setMemo(fetchedMemo);
        } catch (error) {
          console.error('Error fetching memo:', error);
          toast({
            title: "Error",
            description: "Could not load the memo",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchMemo();
    }
  }, [id, toast]);

  const handleSave = async (text: string, type: MemoType) => {
    if (!memo || !id) return;
    
    try {
      const updatedMemo = await updateMemo(id, { text, type });
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
        title: "Error",
        description: "Could not update the memo",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteMemo(id);
      toast({
        title: "Memo deleted",
        description: "Your memo has been deleted."
      });
      navigate('/home');
    } catch (error) {
      console.error('Error deleting memo:', error);
      toast({
        title: "Error",
        description: "Could not delete the memo",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <MemoLoading />;
  }

  if (!memo) {
    return <MemoError />;
  }

  return (
    <MemoContent 
      memo={memo} 
      onSave={handleSave}
      onDelete={handleDelete}
      onBack={() => navigate('/home')}
    />
  );
};

export default MemoDetailPage;
