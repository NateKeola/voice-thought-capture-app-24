
import React, { useState } from 'react';
import { getAllMemos } from '@/services/MemoStorage';
import MemoList from '@/components/MemoList';
import TypeFilter from '@/components/TypeFilter';
import { MemoType } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '@/components/BottomNavBar';
import ProfileIconButton from '@/components/ProfileIconButton';

const MemosPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [memos, setMemos] = useState(() => getAllMemos());
  const [activeFilter, setActiveFilter] = useState<MemoType | 'all'>('all');
  
  // Refresh memos when component mounts or a new memo is created
  const refreshMemos = () => {
    setMemos(getAllMemos());
  };

  return (
    <div className="container max-w-md mx-auto py-6 px-4 pb-20">
      <div className="flex justify-between mb-6 items-center">
        <h1 className="text-2xl font-bold text-center">Your Memos</h1>
        <ProfileIconButton />
      </div>
      <TypeFilter activeType={activeFilter} onChange={setActiveFilter} />
      <div className="my-6">
        <MemoList memos={memos} filter={activeFilter} />
      </div>
      <BottomNavBar activeTab="memos" onTabChange={(tab) => {
        if (tab === 'record') {
          navigate('/home');
        } else if (tab === 'relationships') {
          navigate('/relationships');
        }
      }} />
    </div>
  );
};

export default MemosPage;
