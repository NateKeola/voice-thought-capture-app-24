import React, { useState, useEffect } from "react";
import TasksHeader from "@/components/tasks/TasksHeader";
import TaskCategoryCard from "@/components/tasks/TaskCategoryCard";
import TasksViewToggle from "@/components/tasks/TasksViewToggle";
import TaskList from "@/components/tasks/TaskList";
import TasksFAB from "@/components/tasks/TasksFAB";
import BottomNavBar from "@/components/BottomNavBar";
import TaskDialog from "@/components/tasks/TaskDialog";
import CategoryDialog from "@/components/tasks/CategoryDialog";
import SearchBar from "@/components/home/SearchBar";
import SearchResults from "@/components/home/SearchResults";
import { TaskDialogProvider, useTaskDialog } from "@/hooks/useTaskDialog";
import { CategoryProvider, useCategories } from "@/contexts/CategoryContext";
import { ListsProvider, useListsCategories } from "@/contexts/ListsContext";
import ListCategoryDialog from "@/components/tasks/ListCategoryDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderPlus, Check } from "lucide-react";
import { useMemos } from "@/contexts/MemoContext";
import { Memo } from "@/types";
import { TitleGenerationService } from "@/services/titleGeneration";
import { detectMemoType } from "@/services/SpeechToText";
import { toast } from "sonner";

const priorityColors = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-blue-400"
};

// Smart categorization mapping for notes based on memo content
const smartCategorizeNote = (text: string, listCategories: any[]) => {
  const lowerText = text.toLowerCase();
  
  // Try to match content to existing categories first
  for (const category of listCategories) {
    const categoryName = category.name.toLowerCase();
    if (lowerText.includes(categoryName)) {
      return category.id;
    }
  }
  
  // Smart categorization based on content keywords
  if (lowerText.includes('idea') || lowerText.includes('concept') || lowerText.includes('brainstorm') || 
      lowerText.includes('innovation') || lowerText.includes('creative') || lowerText.includes('inspiration')) {
    const ideasCategory = listCategories.find(cat => cat.name.toLowerCase().includes('idea'));
    if (ideasCategory) return ideasCategory.id;
  }
  
  if (lowerText.includes('meeting') || lowerText.includes('notes') || lowerText.includes('discussion') || 
      lowerText.includes('agenda') || lowerText.includes('minutes') || lowerText.includes('takeaway')) {
    const meetingCategory = listCategories.find(cat => cat.name.toLowerCase().includes('meeting'));
    if (meetingCategory) return meetingCategory.id;
  }
  
  if (lowerText.includes('research') || lowerText.includes('study') || lowerText.includes('learn') || 
      lowerText.includes('article') || lowerText.includes('book') || lowerText.includes('documentation')) {
    const researchCategory = listCategories.find(cat => cat.name.toLowerCase().includes('research') || 
                                                            cat.name.toLowerCase().includes('learning'));
    if (researchCategory) return researchCategory.id;
  }
  
  if (lowerText.includes('project') || lowerText.includes('plan') || lowerText.includes('roadmap') || 
      lowerText.includes('timeline') || lowerText.includes('milestone') || lowerText.includes('goal')) {
    const projectCategory = listCategories.find(cat => cat.name.toLowerCase().includes('project') || 
                                                       cat.name.toLowerCase().includes('planning'));
    if (projectCategory) return projectCategory.id;
  }
  
  // Default to general if no smart match found
  const generalCategory = listCategories.find(cat => cat.name.toLowerCase().includes('general'));
  return generalCategory ? generalCategory.id : (listCategories[0]?.id || "general");
};

// Map memo to the interface expected by the TaskList component
const mapMemoToItem = (memo: Memo, type: 'task' | 'note', categories: any[], listCategories: any[]) => {
  // Parse category and priority from memo text or use defaults
  let category = type === 'task' ? "personal" : "general";
  let priority = "medium";
  let due = "today";
  
  // Try to extract metadata from the memo text
  if (memo.text.includes("[category:")) {
    const match = memo.text.match(/\[category:\s*(\w+)\]/i);
    if (match && match[1]) category = match[1].toLowerCase();
  } else {
    // Smart categorization if no explicit category is set
    if (type === 'task') {
      // Use existing smart categorization for tasks
      const taskCategories = categories;
      for (const cat of taskCategories) {
        if (memo.text.toLowerCase().includes(cat.name.toLowerCase())) {
          category = cat.id;
          break;
        }
      }
    } else {
      // Use smart categorization for notes
      category = smartCategorizeNote(memo.text, listCategories);
    }
  }
  
  if (memo.text.includes("[priority:")) {
    const match = memo.text.match(/\[priority:\s*(\w+)\]/i);
    if (match && match[1]) priority = match[1].toLowerCase();
  }
  
  if (memo.text.includes("[due:")) {
    const match = memo.text.match(/\[due:\s*([\w\s]+)\]/i);
    if (match && match[1]) due = match[1].toLowerCase();
  }
  
  // Clean the text to remove metadata tags and contact tags
  let cleanText = memo.text
    .replace(/\[Contact: [^\]]+\]/g, '')
    .replace(/\[category:\s*\w+\]/gi, '')
    .replace(/\[priority:\s*\w+\]/gi, '')
    .replace(/\[due:\s*[\w\s]+\]/gi, '')
    .trim();
  
  // Use the generated title if available, otherwise generate one
  let title = memo.title || TitleGenerationService.generateTitle(cleanText, type);
  let description = cleanText;
  
  // If the title is too long or looks like raw text, regenerate it
  if (title.length > 50 || title === cleanText) {
    title = TitleGenerationService.generateTitle(cleanText, type);
    description = cleanText;
  }
  
  // If description is the same as title, clear it to avoid duplication
  if (description === title) {
    description = "";
  }

  // Use string ID to avoid NaN issues
  const itemId = String(memo.id);

  return {
    id: itemId,
    title: title,
    description: description,
    completed: memo.completed || false,
    category: category,
    priority: priority as "high" | "medium" | "low",
    due: due,
    created: 0,
    hasAudio: !!memo.audioUrl
  };
};

// Enhanced Item Component with single completion tracking
const EnhancedItemComponent: React.FC<{
  item: any;
  getCategoryColor: (id: string) => string;
  priorityColors: { [key: string]: string };
  completedItemIds: string[];
  onToggleComplete: (id: string) => void;
}> = ({ item, getCategoryColor, priorityColors, completedItemIds, onToggleComplete }) => {
  const categoryColor = getCategoryColor(item.category);
  const isCompleted = completedItemIds.includes(item.id);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Button clicked for item ID:', item.id, 'Type:', typeof item.id);
    onToggleComplete(item.id);
  };

  return (
    <div 
      className={`bg-white rounded-xl p-4 shadow-sm border-l-4 transition-all duration-200 ${
        isCompleted ? 'opacity-60 bg-gray-50' : 'hover:shadow-md'
      }`}
      style={{ borderColor: categoryColor }}
    >
      <div className="flex items-start gap-3 mb-3">
        <button
          onClick={handleToggle}
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 border-2 ${
            isCompleted 
              ? 'bg-green-500 border-green-500 shadow-md' 
              : 'bg-white hover:bg-gray-50 border-gray-300 hover:border-green-400'
          }`}
          aria-label={isCompleted ? "Mark as incomplete" : "Complete item"}
        >
          {isCompleted && <Check size={18} className="text-white font-bold" />}
        </button>

        <div className="flex-1">
          <h3 className={`font-bold text-gray-800 mb-1 text-sm leading-tight transition-all duration-200 ${
            isCompleted ? 'line-through text-gray-500' : ''
          }`}>
            {item.title}
            {isCompleted && (
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full ml-2">
                ✓ Completed
              </span>
            )}
          </h3>
          
          {item.description && item.description !== item.title && (
            <p className={`text-sm leading-relaxed transition-all duration-200 ${
              isCompleted ? 'line-through text-gray-400' : 'text-gray-600'
            }`}>
              {item.description}
            </p>
          )}
        </div>
        
        <div
          className={`w-3 h-3 rounded-full ${priorityColors[item.priority]} flex-shrink-0 mt-1 ${
            isCompleted ? 'opacity-50' : ''
          }`}
          title="Priority indicator"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: categoryColor }}
          ></div>
          <span className={isCompleted ? 'line-through' : ''}>{item.category}</span>
          {item.hasAudio && (
            <span className="text-blue-500">🎵</span>
          )}
        </div>
        <span className={`${isCompleted ? 'line-through' : ''}`}>Due {item.due}</span>
      </div>
    </div>
  );
};

// Inner component to use the TaskDialog context
const TasksPageContent: React.FC = () => {
  const { openCategoryDialog, openTaskDialog, openListCategoryDialog } = useTaskDialog();
  const { categories, deleteCategory } = useCategories();
  const { listCategories, deleteListCategory } = useListsCategories();
  const [viewMode, setViewMode] = useState<"categories" | "timeline">("categories");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [personalTab, setPersonalTab] = useState("tasks");
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  // SINGLE completion tracking state with localStorage persistence
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('completedTaskIds');
    return saved ? JSON.parse(saved) : [];
  });

  const [completedNoteIds, setCompletedNoteIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('completedNoteIds');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Save to localStorage whenever completed IDs change
  useEffect(() => {
    localStorage.setItem('completedTaskIds', JSON.stringify(completedTaskIds));
  }, [completedTaskIds]);

  useEffect(() => {
    localStorage.setItem('completedNoteIds', JSON.stringify(completedNoteIds));
  }, [completedNoteIds]);
  
  // Get memos from our unified context
  const { memos, isLoading, updateMemo } = useMemos();
  
  // Convert memos to tasks and notes with smart categorization
  const tasks = memos
    .filter(memo => memo.type === 'task')
    .map(memo => mapMemoToItem(memo, 'task', categories, listCategories));

  const notes = memos
    .filter(memo => memo.type === 'note')
    .map(memo => mapMemoToItem(memo, 'note', categories, listCategories));

  // FIX: Define context-aware current variables
  const currentCategories = personalTab === "tasks" ? categories : listCategories;
  const currentItems = personalTab === "tasks" ? tasks : notes;
  const currentCompletedIds = personalTab === "tasks" ? completedTaskIds : completedNoteIds;

  // Search through current items
  const handleSearchResults = (results: any[]) => {
    const itemType = personalTab === "tasks" ? 'task' : 'note';
    const itemMemos = results.filter(memo => memo.type === itemType);
    const itemResults = itemMemos.map(memo => mapMemoToItem(memo, itemType, categories, listCategories));
    setSearchResults(itemResults);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchActive(false);
  };

  // Toggle completion functions
  const toggleTaskCompletion = (taskId: string) => {
    console.log('Toggling task:', taskId);
    setCompletedTaskIds(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  const toggleNoteCompletion = (noteId: string) => {
    console.log('Toggling note:', noteId);
    setCompletedNoteIds(prev => {
      if (prev.includes(noteId)) {
        return prev.filter(id => id !== noteId);
      } else {
        return [...prev, noteId];
      }
    });
  };

  const toggleItemCompletion = personalTab === "tasks" ? toggleTaskCompletion : toggleNoteCompletion;

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleBackClick = () => {
    setSelectedCategory(null);
  };

  const handleCategoriesViewSelected = () => {
    setSelectedCategory(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    deleteCategory(categoryId);
    toast.success("Category deleted successfully");
    
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
    }
  };

  const handleDeleteListCategory = (categoryId: string) => {
    deleteListCategory(categoryId);
    toast.success("List category deleted successfully");
    
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
    }
  };

  const getCategoryColor = (categoryId: string) => {
    const category = currentCategories.find((c) => c.id === categoryId);
    return category ? category.color : "#6B7280";
  };

  // Create a mapping of category IDs to names
  const categoryNames = currentCategories.reduce((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {} as { [key: string]: string });

  // Filter items by category and completion status
  let filteredItems = currentItems.filter((item) => {
    if (viewMode === "categories" && selectedCategory) {
      if (item.category !== selectedCategory) return false;
    }
    
    const isItemCompleted = currentCompletedIds.includes(item.id);
    if (!showCompleted && isItemCompleted) {
      return false;
    }
    
    return true;
  });

  // Sort by completion, due, then priority
  const duePriority = { today: 0, tomorrow: 1, "this week": 2, "next week": 3, "next month": 4 };
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  filteredItems = [...filteredItems].sort((a, b) => {
    const aCompleted = currentCompletedIds.includes(a.id);
    const bCompleted = currentCompletedIds.includes(b.id);
    if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
    if (duePriority[a.due] !== duePriority[b.due]) return duePriority[a.due] - duePriority[b.due];
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const handleCreateItemForCategory = (categoryId: string) => {
    console.log("handleCreateItemForCategory called with:", categoryId);
    openTaskDialog(categoryId);
  };

  // Context-aware category creation handlers
  const handleOpenCategoryDialog = () => {
    if (personalTab === "tasks") {
      openCategoryDialog();
    } else {
      openListCategoryDialog();
    }
  };

  // Context-aware create handlers
  const handleCreateForCategory = (categoryId: string) => {
    handleCreateItemForCategory(categoryId);
  };

  // Context-aware delete handlers
  const handleDeleteCurrentCategory = personalTab === "tasks" ? handleDeleteCategory : handleDeleteListCategory;

  // If search is active, show search results
  if (isSearchActive) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
        <TasksHeader 
          taskCount={currentItems.filter((t) => !currentCompletedIds.includes(t.id)).length} 
          selectedCategory={null}
          categoryNames={categoryNames}
          onBackClick={handleBackClick}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isSearchActive={isSearchActive}
        />
        
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          memos={memos}
          onSearchResults={handleSearchResults}
          isSearchActive={isSearchActive}
          onSearchActiveChange={setIsSearchActive}
        />

        <div className="container mx-auto max-w-md px-4">
          <SearchResults
            searchQuery={searchQuery}
            searchResults={searchResults.map(item => ({
              id: item.id,
              text: item.description || item.title,
              type: personalTab === "tasks" ? 'task' as const : 'note' as const,
              createdAt: new Date().toISOString(),
              title: item.title
            }))}
            onClearSearch={handleClearSearch}
          />
        </div>

        <TasksFAB />
        <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <TaskDialog />
        <CategoryDialog />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      <TasksHeader 
        taskCount={currentItems.filter((t) => !currentCompletedIds.includes(t.id)).length} 
        selectedCategory={selectedCategory}
        categoryNames={categoryNames}
        onBackClick={handleBackClick}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearchActive={isSearchActive}
      />

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        memos={memos}
        onSearchResults={handleSearchResults}
        isSearchActive={isSearchActive}
        onSearchActiveChange={setIsSearchActive}
      />

      <div className="container mx-auto max-w-md px-4 pt-4 pb-4">
        <Tabs value={personalTab} onValueChange={setPersonalTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tasks" className="mt-4">
            <TasksViewToggle 
              viewMode={viewMode} 
              setViewMode={setViewMode} 
              onCategoriesViewSelected={handleCategoriesViewSelected}
            />
            
            <div className="flex justify-between items-center my-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {viewMode === "categories"
                  ? selectedCategory
                    ? categories.find((c) => c.id === selectedCategory)?.name + " Tasks"
                    : "All Task Categories"
                  : "Recent Tasks"}
              </h2>
              <div className="flex items-center gap-2">
                {viewMode === "categories" && !selectedCategory && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1" 
                    onClick={handleOpenCategoryDialog}
                  >
                    <FolderPlus size={16} />
                    <span className="hidden sm:inline">New Category</span>
                  </Button>
                )}
                {!(viewMode === "categories" && !selectedCategory) && (
                  <button
                    className="flex items-center text-sm text-gray-500"
                    onClick={() => setShowCompleted((v) => !v)}
                  >
                    <div
                      className={`w-4 h-4 rounded mr-2 border ${
                        showCompleted ? "bg-purple-500 border-purple-500" : "border-gray-400"
                      } flex items-center justify-center`}
                    >
                      {showCompleted && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    Show completed
                  </button>
                )}
              </div>
            </div>

            {viewMode === "categories" && !selectedCategory && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {categories.map((cat) => (
                  <TaskCategoryCard
                    key={cat.id}
                    id={cat.id}
                    name={cat.name}
                    color={cat.color}
                    count={tasks.filter((t) => t.category === cat.id && !completedTaskIds.includes(t.id)).length}
                    total={tasks.filter((t) => t.category === cat.id).length}
                    onSelect={handleCategorySelect}
                    onCreateTask={handleCreateForCategory}
                    onDeleteCategory={handleDeleteCategory}
                    selected={selectedCategory === cat.id}
                  />
                ))}
              </div>
            )}

            {!(viewMode === "categories" && !selectedCategory) && (
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <EnhancedItemComponent
                    key={item.id}
                    item={item}
                    getCategoryColor={getCategoryColor}
                    priorityColors={priorityColors}
                    completedItemIds={currentCompletedIds}
                    onToggleComplete={toggleItemCompletion}
                  />
                ))}
                {filteredItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No tasks found.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="notes" className="mt-4">
            <TasksViewToggle 
              viewMode={viewMode} 
              setViewMode={setViewMode} 
              onCategoriesViewSelected={handleCategoriesViewSelected}
            />
            
            <div className="flex justify-between items-center my-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {viewMode === "categories"
                  ? selectedCategory
                    ? listCategories.find((c) => c.id === selectedCategory)?.name + " Notes"
                    : "All Note Categories"
                  : "Recent Notes"}
              </h2>
              <div className="flex items-center gap-2">
                {viewMode === "categories" && !selectedCategory && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1" 
                    onClick={handleOpenCategoryDialog}
                  >
                    <FolderPlus size={16} />
                    <span className="hidden sm:inline">New Category</span>
                  </Button>
                )}
                {!(viewMode === "categories" && !selectedCategory) && (
                  <button
                    className="flex items-center text-sm text-gray-500"
                    onClick={() => setShowCompleted((v) => !v)}
                  >
                    <div
                      className={`w-4 h-4 rounded mr-2 border ${
                        showCompleted ? "bg-purple-500 border-purple-500" : "border-gray-400"
                      } flex items-center justify-center`}
                    >
                      {showCompleted && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    Show completed
                  </button>
                )}
              </div>
            </div>

            {viewMode === "categories" && !selectedCategory && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                {listCategories.map((cat) => (
                  <TaskCategoryCard
                    key={cat.id}
                    id={cat.id}
                    name={cat.name}
                    color={cat.color}
                    count={notes.filter((l) => l.category === cat.id && !completedNoteIds.includes(l.id)).length}
                    total={notes.filter((l) => l.category === cat.id).length}
                    onSelect={handleCategorySelect}
                    onCreateTask={handleCreateForCategory}
                    onDeleteCategory={handleDeleteListCategory}
                    selected={selectedCategory === cat.id}
                  />
                ))}
              </div>
            )}

            {!(viewMode === "categories" && !selectedCategory) && (
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <EnhancedItemComponent
                    key={item.id}
                    item={item}
                    getCategoryColor={getCategoryColor}
                    priorityColors={priorityColors}
                    completedItemIds={currentCompletedIds}
                    onToggleComplete={toggleItemCompletion}
                  />
                ))}
                {filteredItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No notes found.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <TasksFAB />
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <TaskDialog />
      <CategoryDialog />
      <ListCategoryDialog />
    </div>
  );
};

// Wrapper component that provides both contexts
const TasksPage: React.FC = () => {
  return (
    <CategoryProvider>
      <ListsProvider>
        <TaskDialogProvider>
          <TasksPageContent />
        </TaskDialogProvider>
      </ListsProvider>
    </CategoryProvider>
  );
};

export default TasksPage;
