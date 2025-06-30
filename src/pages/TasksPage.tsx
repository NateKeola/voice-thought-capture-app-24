
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import BottomNavBar from '@/components/BottomNavBar';
import TasksPageHeader from '@/components/tasks/TasksPageHeader';
import TasksTabBar from '@/components/tasks/TasksTabBar';
import NotesTimeline from '@/components/tasks/NotesTimeline';
import TaskDialog from '@/components/tasks/TaskDialog';
import TaskEditDialog from '@/components/tasks/TaskEditDialog';
import TaskDeleteDialog from '@/components/tasks/TaskDeleteDialog';
import CategoryDialog from '@/components/tasks/CategoryDialog';
import ListCategoryDialog from '@/components/tasks/ListCategoryDialog';
import TaskList from '@/components/tasks/TaskList';
import TasksViewToggle from '@/components/tasks/TasksViewToggle';
import EmptyTaskState from '@/components/tasks/EmptyTaskState';
import { useMemos } from '@/contexts/MemoContext';
import { useCategories } from '@/contexts/CategoryContext';
import { useLists } from '@/contexts/ListsContext';
import { useAuth } from '@/hooks/useAuth';

const TasksPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { memos, isLoading: memosLoading } = useMemos();
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  const { lists, createList, updateList, deleteList } = useLists();

  // State variables
  const [activeTab, setActiveTab] = useState('personal');
  const [personalTab, setPersonalTab] = useState('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState<"categories" | "timeline">("categories");
  const [sortBy, setSortBy] = useState('dueDate');
  const [showCompleted, setShowCompleted] = useState(false);

  // Modal states
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showListDialog, setShowListDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingList, setEditingList] = useState(null);

  const isLoading = authLoading || memosLoading;

  // Handle note item click to navigate to memo detail
  const handleNoteItemClick = (noteId: string) => {
    console.log('Note clicked:', noteId);
    
    // Find the corresponding memo
    const memo = memos.find(m => m.id === noteId);
    
    if (memo) {
      // Navigate to memo detail page
      navigate(`/memo/${memo.id}`);
    } else {
      // Show error if memo not found
      toast({
        title: "Memo not found",
        description: "Could not find the selected memo.",
        variant: "destructive"
      });
      console.error('Memo not found for ID:', noteId);
    }
  };

  // Extract and format notes from memos
  const getFormattedNotes = () => {
    return memos
      .filter(memo => memo.type !== 'task')
      .map(memo => {
        let type = memo.type;
        if (type === 'idea') type = 'idea'; // Fix: remove "should" type assignment
        
        const date = memo.createdAt ? new Date(memo.createdAt) : new Date();
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let dateStr = 'Just now';
        if (diffDays === 1) dateStr = 'Yesterday';
        else if (diffDays > 1) dateStr = `${diffDays} days ago`;
        
        return {
          id: memo.id,
          text: memo.text,
          date: dateStr,
          type
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const formattedNotes = getFormattedNotes();

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <TasksPageHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddTask={() => setShowTaskDialog(true)}
      />

      <TasksTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        personalTab={personalTab}
        onPersonalTabChange={setPersonalTab}
      />

      <div className="flex-1 px-6 py-4 overflow-hidden">
        {activeTab === 'personal' && personalTab === 'notes' ? (
          <div className="bg-white rounded-2xl shadow-sm p-6 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-gray-800 text-xl">Recent Notes</h2>
              <span className="text-gray-500 text-sm">{formattedNotes.length} notes</span>
            </div>
            <NotesTimeline notes={formattedNotes} onItemClick={handleNoteItemClick} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm h-full overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-gray-800 text-xl">Tasks</h2>
                <TasksViewToggle 
                  viewMode={viewMode} 
                  onViewModeChange={setViewMode} 
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <EmptyTaskState onAddTask={() => setShowTaskDialog(true)} />
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <TaskDialog 
        isOpen={showTaskDialog}
        onClose={() => setShowTaskDialog(false)}
      />

      <TaskEditDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        task={selectedTask}
      />

      <TaskDeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        task={selectedTask}
      />

      <CategoryDialog
        isOpen={showCategoryDialog}
        onClose={() => setShowCategoryDialog(false)}
        category={editingCategory}
      />

      <ListCategoryDialog
        isOpen={showListDialog}
        onClose={() => setShowListDialog(false)}
        list={editingList}
      />

      <BottomNavBar activeTab="tasks" onTabChange={() => {}} />
    </div>
  );
};

export default TasksPage;
