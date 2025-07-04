import React, { useState } from "react";
import ProfileIconButton from "@/components/ProfileIconButton";
import { ArrowLeft, Search, X, Brain } from "lucide-react";
import MemoAIChat from "@/components/MemoAIChat";
import { useMemos } from "@/contexts/MemoContext";

interface TasksHeaderProps {
  taskCount: number;
  selectedCategory: string | null;
  categoryNames?: { [key: string]: string };
  onBackClick?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  isSearchActive?: boolean;
  onClearSearch?: () => void;
}

const TasksHeader: React.FC<TasksHeaderProps> = ({ 
  taskCount, 
  selectedCategory, 
  categoryNames = {}, 
  onBackClick,
  searchQuery = "",
  onSearchChange,
  isSearchActive = false,
  onClearSearch
}) => {
  const [showMemoAI, setShowMemoAI] = useState(false);
  const { memos } = useMemos();

  return (
    <>
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 pt-12 pb-8 px-6 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 bottom-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-48 h-48 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute top-5 right-10 w-32 h-32 bg-pink-300 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-purple-300 rounded-full filter blur-3xl"></div>
        </div>
        <div className="flex justify-between items-center relative z-10 mb-4">
          <div className="flex items-center gap-2">
            {selectedCategory && (
              <button 
                onClick={onBackClick}
                className="bg-white/20 rounded-full p-1.5 mr-1 hover:bg-white/30 transition-colors duration-200"
                aria-label="Go back"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">
                {selectedCategory ? categoryNames[selectedCategory] || selectedCategory : "Personal"}
              </h1>
              <p className="text-purple-100 text-sm mt-1">
                {taskCount} {taskCount === 1 ? 'task' : 'tasks'} pending
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMemoAI(true)}
              className="bg-white/20 rounded-full p-2 hover:bg-white/30 transition-all duration-200"
              title="Chat with Memo AI"
            >
              <Brain className="w-5 h-5 text-white" />
            </button>
            <ProfileIconButton />
          </div>
        </div>
        
        <div className="relative z-10 mt-2 bg-white bg-opacity-20 rounded-lg overflow-hidden">
          <div className="flex items-center">
            <Search className="h-5 w-5 ml-3 text-white opacity-70" />
            <input 
              type="text" 
              placeholder="Search your memos and connections..." 
              className="flex-1 py-2.5 px-2 bg-transparent placeholder-white placeholder-opacity-70 text-white outline-none text-sm"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
            {searchQuery && onClearSearch && (
              <button 
                onClick={onClearSearch}
                className="mr-2 p-1 rounded-full hover:bg-white/20"
              >
                <X className="h-5 w-5 text-white opacity-70" />
              </button>
            )}
          </div>
        </div>
      </div>

      {showMemoAI && (
        <MemoAIChat onClose={() => setShowMemoAI(false)} />
      )}
    </>
  );
};

export default TasksHeader;
