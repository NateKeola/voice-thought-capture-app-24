
import React from 'react';
import MemoList from '@/components/MemoList';
import TypeFilter from '@/components/TypeFilter';
import { MemoType, Memo } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import ProfileIconButton from '@/components/ProfileIconButton';

interface MemosSectionProps {
  memos: Memo[];
  activeFilter: MemoType | 'all';
  onFilterChange: (filter: MemoType | 'all') => void;
}

const MemosSection: React.FC<MemosSectionProps> = ({ 
  memos, 
  activeFilter, 
  onFilterChange 
}) => {
  return (
    <div className="w-full max-w-md mt-10 flex-1 flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-gray-700 font-semibold text-base">Your Memos</h3>
        <ProfileIconButton />
      </div>
      <TypeFilter activeType={activeFilter} onChange={onFilterChange} />
      <div className="mt-3 flex-1 min-h-40">
        <ScrollArea className="h-64 rounded-lg border bg-white shadow-sm">
          <div className="p-3">
            <MemoList memos={memos} filter={activeFilter} />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default MemosSection;
