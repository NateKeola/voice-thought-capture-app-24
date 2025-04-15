
import React, { useState } from 'react';
import { getAllMemos } from '@/services/MemoStorage';
import RecordButton from '@/components/RecordButton';
import MemoList from '@/components/MemoList';
import TypeFilter from '@/components/TypeFilter';
import { MemoType } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [memos, setMemos] = useState(() => getAllMemos());
  const [activeFilter, setActiveFilter] = useState<MemoType | 'all'>('all');

  // Refresh memos when component mounts or a new memo is created
  const refreshMemos = () => {
    setMemos(getAllMemos());
  };

  const handleMemoCreated = (memoId: string) => {
    refreshMemos();
    navigate(`/memo/${memoId}`);
  };

  return (
    <div className="container max-w-md mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Voice Memos</h1>
      </div>

      <TypeFilter activeType={activeFilter} onChange={setActiveFilter} />

      <div className="my-6">
        <MemoList memos={memos} filter={activeFilter} />
      </div>

      <div className="fixed bottom-8 left-0 right-0 flex justify-center">
        <RecordButton onMemoCreated={handleMemoCreated} />
      </div>
    </div>
  );
};

export default HomePage;
