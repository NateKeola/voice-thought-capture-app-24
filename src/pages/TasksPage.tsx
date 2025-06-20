import React, { useState, useEffect } from "react";
import TasksHeader from "@/components/tasks/TasksHeader";
import TaskCategoryCard from "@/components/tasks/TaskCategoryCard";
import TasksViewToggle from "@/components/tasks/TasksViewToggle";
import TaskList from "@/components/tasks/TaskList";
import TasksFAB from "@/components/tasks/TasksFAB";
import BottomNavBar from "@/components/BottomNavBar";
import TaskDialog from "@/components/tasks/TaskDialog";
import CategoryDialog from "@/components/tasks/CategoryDialog";
import { TaskDialogProvider, useTaskDialog } from "@/hooks/useTaskDialog";
import { Button } from "@/components/ui/button";
import { FolderPlus } from "lucide-react";
import { useMemos } from "@/contexts/MemoContext";
import { Memo } from "@/types";

// Default categories that match memo types
const defaultCategories = [
  { id: "task", name: "Tasks", color: "#3B82F6" },
  { id: "idea", name: "Ideas", color: "#8B5CF6" },
  { id: "note", name: "Notes", color: "#10B981" },
];

const priorityColors = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-blue-400"
};

// Map memo tasks to the task interface expected by the TaskList component
const mapMemoToTask = (memo: Memo) => {
  // Parse priority, due date, and deleted status from memo text
  let priority = "medium";
  let due = "today";
  let isDeleted = false;
  
  // Try to extract metadata from the memo text
  if (memo.text.includes("[priority:")) {
    const match = memo.text.match(/\[priority:\s*(\w+)\]/i);
    if (match && match[1]) priority = match[1].toLowerCase();
  }
  
  if (memo.text.includes("[due:")) {
    const match = memo.text.match(/\[due:\s*([\w\s]+)\]/i);
    if (match && match[1]) due = match[1].toLowerCase();
  }
  
  if (memo.text.includes("[deleted:")) {
    const match = memo.text.match(/\[deleted:\s*(\w+)\]/i);
    if (match && match[1]) isDeleted = match[1].toLowerCase() === 'true';
  }
  
  // Clean the text to remove metadata tags if present
  let cleanText = memo.text
    .replace(/\[priority:\s*\w+\]/gi, '')
    .replace(/\[due:\s*[\w\s]+\]/gi, '')
    .replace(/\[deleted:\s*\w+\]/gi, '')
    .trim();
  
  // Split into title and description if possible
  let title = cleanText;
  let description = "";
  
  const firstPeriod = cleanText.indexOf('. ');
  if (firstPeriod > 0 && firstPeriod < 50) {
    title = cleanText.substring(0, firstPeriod + 1);
    description = cleanText.substring(firstPeriod + 1).trim();
  }

  return {
    id: Number(memo.id),
    title: title,
    description: description,
    completed: memo.completed || false,
    category: memo.type,
    priority: priority as "high" | "medium" | "low",
    due: due,
    created: 0,
    hasAudio: !!memo.audioUrl,
    isDeleted: isDeleted
  };
};

// Inner component to use the TaskDialog context
const TasksPageContent: React.FC = () => {
  const { openCategoryDialog, openTaskDialog } = useTaskDialog();
  const [viewMode, setViewMode] = useState<"categories" | "timeline">("categories");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks");
  const [customCategories, setCustomCategories] = useState<any[]>([]);
  
  // Get memos from our unified context
  const { memos, isLoading, updateMemo } = useMemos();
  
  // Load custom categories from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('customCategories');
    if (stored) {
      setCustomCategories(JSON.parse(stored));
    }
  }, []);

  // Combine default and custom categories
  const allCategories = [...defaultCategories, ...customCategories];
  
  // Convert all memos to tasks and filter out deleted ones
  const tasks = memos
    .map(mapMemoToTask)
    .filter(task => !task.isDeleted);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleBackClick = () => {
    setSelectedCategory(null);
  };

  const onToggleComplete = async (id: number) => {
    // Find the corresponding memo
    const memo = memos.find(m => Number(m.id) === id);
    if (!memo) return;
    
    // Toggle its completed status
    await updateMemo(memo.id, {
      completed: !memo.completed
    });
  };

  const getCategoryColor = (categoryId: string) => {
    const category = allCategories.find((c) => c.id === categoryId);
    return category ? category.color : "#6B7280";
  };

  // Create a mapping of category IDs to names for the TaskList component
  const categoryNames = allCategories.reduce((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {} as { [key: string]: string });

  // Filter and sort logic
  let filteredTasks = tasks.filter((task) => {
    if (!showCompleted && task.completed) return false;
    if (viewMode === "categories" && selectedCategory) {
      return task.category === selectedCategory;
    }
    return true;
  });

  // Sort by completion, due, then priority
  const duePriority = { today: 0, tomorrow: 1, "this week": 2, "next week": 3, "next month": 4 };
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  filteredTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (duePriority[a.due] !== duePriority[b.due]) return duePriority[a.due] - duePriority[b.due];
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const handleCreateTaskForCategory = (categoryId: string) => {
    console.log("handleCreateTaskForCategory called with:", categoryId);
    openTaskDialog(categoryId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      <TasksHeader 
        taskCount={tasks.filter((t) => !t.completed).length} 
        selectedCategory={selectedCategory}
        categoryNames={categoryNames}
        onBackClick={handleBackClick}
      />
      <div className="container mx-auto max-w-md px-4 pt-4 pb-4">
        <TasksViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        {/* Toggle Show Completed and Add Category Button */}
        <div className="flex justify-between items-center my-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {viewMode === "categories"
              ? selectedCategory
                ? allCategories.find((c) => c.id === selectedCategory)?.name + " Items"
                : "All Categories"
              : "Item Timeline"}
          </h2>
          <div className="flex items-center gap-2">
            {viewMode === "categories" && !selectedCategory && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1" 
                onClick={openCategoryDialog}
              >
                <FolderPlus size={16} />
                <span className="hidden sm:inline">New Category</span>
              </Button>
            )}
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
          </div>
        </div>
        {/* Categories */}
        {viewMode === "categories" && !selectedCategory && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {allCategories.map((cat) => (
              <TaskCategoryCard
                key={cat.id}
                id={cat.id}
                name={cat.name}
                color={cat.color}
                count={tasks.filter((t) => t.category === cat.id && !t.completed).length}
                total={tasks.filter((t) => t.category === cat.id).length}
                onSelect={handleCategorySelect}
                onCreateTask={handleCreateTaskForCategory}
                selected={selectedCategory === cat.id}
              />
            ))}
          </div>
        )}
        {/* Task list */}
        <TaskList
          tasks={filteredTasks}
          getCategoryColor={getCategoryColor}
          onToggleComplete={onToggleComplete}
          priorityColors={priorityColors}
          viewMode={viewMode}
          selectedCategory={selectedCategory}
          categoryNames={categoryNames}
          onBackClick={handleBackClick}
        />
      </div>
      <TasksFAB />
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Dialogs */}
      <TaskDialog />
      <CategoryDialog />
    </div>
  );
};

// Wrapper component that provides the TaskDialog context
const TasksPage: React.FC = () => {
  return (
    <TaskDialogProvider>
      <TasksPageContent />
    </TaskDialogProvider>
  );
};

export default TasksPage;
