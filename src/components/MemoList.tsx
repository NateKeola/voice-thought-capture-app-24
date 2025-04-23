
import React from 'react';
import MemoCard from './MemoCard';
import { Memo, MemoType } from '@/types';
import { useNavigate } from 'react-router-dom';

interface MemoListProps {
  memos: Memo[];
  filter?: MemoType | 'all';
}

const MemoList: React.FC<MemoListProps> = ({ memos, filter = 'all' }) => {
  const navigate = useNavigate();
  
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
