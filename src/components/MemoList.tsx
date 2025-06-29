
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
  
  // Apply proper filtering based on the selected filter
  const filteredMemos = React.useMemo(() => {
    if (filter === 'all') {
      // Sort all memos by creation date (most recent first)
      return [...memos].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    // Filter by specific type and sort by creation date
    return memos
      .filter(memo => memo.type === filter)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [memos, filter]);

  if (filteredMemos.length === 0) {
    const getEmptyMessage = () => {
      switch (filter) {
        case 'note':
          return 'No notes found';
        case 'task':
          return 'No tasks found';
        case 'idea':
          return 'No ideas found';
        default:
          return 'No memos found';
      }
    };

    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p>{getEmptyMessage()}</p>
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
