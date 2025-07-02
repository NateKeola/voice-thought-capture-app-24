
import React, { useState } from 'react';
import MemoList from '@/components/MemoList';
import TypeFilter from '@/components/TypeFilter';
import { MemoType } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import BottomNavBar from '@/components/BottomNavBar';
import ProfileIconButton from '@/components/ProfileIconButton';
import { Loader2, SidebarOpen } from 'lucide-react';
import { useMemos } from '@/contexts/MemoContext';
import CategoryMemoLayout from '@/components/layouts/CategoryMemoLayout';
import { Button } from '@/components/ui/button';

const MemosPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<MemoType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Use our memo context
  const { memos, isLoading } = useMemos();

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  // Filter memos by selected category
  const filteredMemos = selectedCategory 
    ? memos.filter(memo => memo.text.includes(`[Category: ${selectedCategory}]`))
    : memos;

  const MemoContent = () => (
    <div className="container max-w-md mx-auto py-6 px-4 pb-20">
      <div className="flex justify-between mb-6 items-center">
        <div className="flex items-center gap-3">
          {!showSidebar && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(true)}
            >
              <SidebarOpen className="h-4 w-4" />
            </Button>
          )}
          <h1 className="text-2xl font-bold text-center">
            {selectedCategory ? 'Category Memos' : 'Your Memos'}
          </h1>
        </div>
        <ProfileIconButton />
      </div>
      
      <TypeFilter activeType={activeFilter} onChange={setActiveFilter} />
      
      <div className="my-6">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <MemoList 
            memos={filteredMemos} 
            filter={activeFilter}
          />
        )}
      </div>
      
      <BottomNavBar 
        activeTab="memos" 
        onTabChange={(tab) => {
          if (tab === 'record') {
            navigate('/home');
          } else if (tab === 'relationships') {
            navigate('/relationships');
          }
        }} 
      />
    </div>
  );

  if (!showSidebar) {
    return <MemoContent />;
  }

  return (
    <CategoryMemoLayout
      onCategorySelect={handleCategorySelect}
      selectedCategory={selectedCategory}
    >
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSidebar(false)}
          className="absolute top-4 right-4 z-10"
        >
          Hide Sidebar
        </Button>
        <MemoContent />
      </div>
    </CategoryMemoLayout>
  );
};

export default MemosPage;
