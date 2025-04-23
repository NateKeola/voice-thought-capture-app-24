
import React from 'react';
import MemoList from '@/components/MemoList';
import TypeFilter from '@/components/TypeFilter';
import { MemoType, Memo } from '@/types';
import ProfileIconButton from '@/components/ProfileIconButton';
import { Loader2 } from 'lucide-react';

interface MemosSectionProps {
  memos: Memo[];
  activeFilter: MemoType | 'all';
  onFilterChange: (filter: MemoType | 'all') => void;
  onMemosUpdate: (memos: Memo[]) => void;
  isLoading?: boolean;
}

const MemosSection: React.FC<MemosSectionProps> = ({ 
  memos, 
  activeFilter, 
  onFilterChange,
  onMemosUpdate,
  isLoading = false
}) => {
  return (
    <section className="w-full flex flex-col items-center mt-8 mb-6">
      {/* Gorgeous header */}
      <div className="w-full max-w-md relative rounded-2xl overflow-hidden shadow-lg mb-4">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-400 to-orange-200 opacity-80"></div>
        <div className="relative z-10 flex items-center justify-between px-6 py-5">
          <h3 className="text-white text-xl font-bold drop-shadow">Your Memos</h3>
          <ProfileIconButton />
        </div>
      </div>

      <div className="w-full max-w-md bg-white/80 shadow-lg rounded-2xl p-4">
        <TypeFilter activeType={activeFilter} onChange={onFilterChange} />
        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : (
            <MemoList 
              memos={memos} 
              filter={activeFilter} 
              onMemosUpdate={onMemosUpdate}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default MemosSection;
