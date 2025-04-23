
import React, { useState, useEffect } from 'react';
import { getAllMemos } from '@/services/MemoStorage';
import MemoList from '@/components/MemoList';
import TypeFilter from '@/components/TypeFilter';
import { MemoType, Memo } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '@/components/BottomNavBar';
import ProfileIconButton from '@/components/ProfileIconButton';
import { Loader2 } from 'lucide-react';

const MemosPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [memos, setMemos] = useState<Memo[]>([]);
  const [activeFilter, setActiveFilter] = useState<MemoType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch memos when component mounts
  useEffect(() => {
    const fetchMemos = async () => {
      try {
        setIsLoading(true);
        const fetchedMemos = await getAllMemos();
        setMemos(fetchedMemos);
      } catch (error) {
        console.error('Error fetching memos:', error);
        toast({
          title: "Error loading memos",
          description: "There was a problem loading your memos.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMemos();
  }, [toast]);

  return (
    <div className="container max-w-md mx-auto py-6 px-4 pb-20">
      <div className="flex justify-between mb-6 items-center">
        <h1 className="text-2xl font-bold text-center">Your Memos</h1>
        <ProfileIconButton />
      </div>
      <TypeFilter activeType={activeFilter} onChange={setActiveFilter} />
      <div className="my-6">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <MemoList memos={memos} filter={activeFilter} />
        )}
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
