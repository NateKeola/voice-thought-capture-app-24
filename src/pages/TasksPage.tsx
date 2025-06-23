
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
import { CategoryProvider, useCategories } from "@/contexts/CategoryContext";
import { Button } from "@/components/ui/button";
import { FolderPlus, Check } from "lucide-react";
import { useMemos } from "@/contexts/MemoContext";
import { Memo } from "@/types";
import { useTaskCompletion } from "@/hooks/useTaskCompletion";
import { TitleGenerationService } from "@/services/titleGeneration";

const priorityColors = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-blue-400"
};

// Map memo tasks to the task interface expected by the TaskList component
const mapMemoToTask = (memo: Memo) => {
  // Parse category and priority from memo text or use defaults
  let category = "personal";
  let priority = "medium";
  let due = "today";
  
  // Try to extract metadata from the memo text
  if (memo.text.includes("[category:")) {
    const match = memo.text.match(/\[category:\s*(\w+)\]/i);
    if (match && match[1]) category = match[1].toLowerCase();
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
  let title = memo.title || TitleGenerationService.generateTitle(cleanText, 'task');
  let description = cleanText;
  
  // If the title is too long or looks like raw text, regenerate it
  if (title.length > 50 || title === cleanText) {
    title = TitleGenerationService.generateTitle(cleanText, 'task');
    description = cleanText;
  }
  
  // If description is the same as title, clear it to avoid duplication
  if (description === title) {
    description = "";
  }

  return {
    id: Number(memo.id), // Convert to number to match expected interface
    title: title,
    description: description,
    completed: memo.completed || false,
    category: category,
    priority: priority as "high" | "medium" | "low",
    due: due,
    created: 0, // Not tracking this currently
    hasAudio: !!memo.audioUrl
  };
};

// Enhanced Task Item Component with visual completion feedback
const EnhancedTaskItem: React.FC<{
  task: any;
  getCategoryColor: (id: string) => string;
  priorityColors: { [key: string]: string };
  isCompleted: boolean;
  onToggleComplete: (id: number) => void;
}> = ({ task, getCategoryColor, priorityColors, isCompleted, onToggleComplete }) => {
  const categoryColor = getCategoryColor(task.category);
  
  const handleToggle = () => {
    onToggleComplete(task.id);
  };

  return (
    <div 
      className={`bg-white rounded-xl p-4 shadow-sm border-l-4 transition-all duration-200 ${
        isCompleted ? 'opacity-60 bg-gray-50' : 'hover:shadow-md'
      }`}
      style={{ borderColor: categoryColor }}
    >
      <div className="flex items-start gap-3 mb-3">
        {/* Completion Button */}
        <button
          onClick={handleToggle}
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 border-2 ${
            isCompleted 
              ? 'bg-green-500 border-green-500 shadow-md' 
              : 'bg-white hover:bg-gray-50 border-gray-300 hover:border-green-400'
          }`}
          aria-label={isCompleted ? "Mark as incomplete" : "Complete task"}
        >
          {isCompleted && <Check size={18} className="text-white font-bold" />}
        </button>

        <div className="flex-1">
          {/* Task Title */}
          <h3 className={`font-bold text-gray-800 mb-1 text-sm leading-tight transition-all duration-200 ${
            isCompleted ? 'line-through text-gray-500' : ''
          }`}>
            {task.title}
          </h3>
          
          {/* Task Description */}
          {task.description && task.description !== task.title && (
            <p className={`text-sm leading-relaxed transition-all duration-200 ${
              isCompleted ? 'line-through text-gray-400' : 'text-gray-600'
            }`}>
              {task.description}
            </p>
          )}

          {/* Completed Label */}
          {isCompleted && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                ✓ Completed
              </span>
            </div>
          )}
        </div>
        
        {/* Priority indicator */}
        <div
          className={`w-3 h-3 rounded-full ${priorityColors[task.priority]} flex-shrink-0 mt-1 ${
            isCompleted ? 'opacity-50' : ''
          }`}
          title="Priority indicator"
        />
      </div>

      {/* Task Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: categoryColor }}
          ></div>
          <span className={isCompleted ? 'line-through' : ''}>{task.category}</span>
          {task.hasAudio && (
            <span className="text-blue-500">🎵</span>
          )}
        </div>
        <span className={`${isCompleted ? 'line-through' : ''}`}>Due {task.due}</span>
      </div>
    </div>
  );
};

// Inner component to use the TaskDialog context
const TasksPageContent: React.FC = () => {
  const { openCategoryDialog, openTaskDialog } = useTaskDialog();
  const { categories } = useCategories();
  const [viewMode, setViewMode] = useState<"categories" | "timeline">("categories");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks");
  
  // Simple state to track completed tasks
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());
  
  // Get memos from our unified context
  const { memos, isLoading } = useMemos();
  
  // Convert memos to tasks
  const tasks = memos
    .filter(memo => memo.type === 'task')
    .map(mapMemoToTask);

  // Handle task completion toggle
  const handleToggleComplete = (taskId: number) => {
    setCompletedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleBackClick = () => {
    setSelectedCategory(null);
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.color : "#6B7280";
  };

  // Create a mapping of category IDs to names for the TaskList component
  const categoryNames = categories.reduce((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {} as { [key: string]: string });

  // Filter and sort logic
  let filteredTasks = tasks.filter((task) => {
    const isTaskCompleted = completedTasks.has(task.id);
    if (!showCompleted && isTaskCompleted) return false;
    if (viewMode === "categories" && selectedCategory) {
      return task.category === selectedCategory;
    }
    return true;
  });

  // Sort by completion, due, then priority
  const duePriority = { today: 0, tomorrow: 1, "this week": 2, "next week": 3, "next month": 4 };
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  filteredTasks = [...filteredTasks].sort((a, b) => {
    const aCompleted = completedTasks.has(a.id);
    const bCompleted = completedTasks.has(b.id);
    
    if (aCompleted !== bCompleted) return aCompleted ? 1 : -1;
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
        taskCount={tasks.filter((t) => !completedTasks.has(t.id)).length} 
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
                ? categories.find((c) => c.id === selectedCategory)?.name + " Tasks"
                : "All Categories"
              : "Task Timeline"}
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
            {categories.map((cat) => (
              <TaskCategoryCard
                key={cat.id}
                id={cat.id}
                name={cat.name}
                color={cat.color}
                count={tasks.filter((t) => t.category === cat.id && !completedTasks.has(t.id)).length}
                total={tasks.filter((t) => t.category === cat.id).length}
                onSelect={handleCategorySelect}
                onCreateTask={handleCreateTaskForCategory}
                selected={selectedCategory === cat.id}
              />
            ))}
          </div>
        )}
        {/* Enhanced Task list with visual completion feedback */}
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <EnhancedTaskItem
              key={task.id}
              task={task}
              getCategoryColor={getCategoryColor}
              priorityColors={priorityColors}
              isCompleted={completedTasks.has(task.id)}
              onToggleComplete={handleToggleComplete}
            />
          ))}
          {filteredTasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No tasks found.</p>
            </div>
          )}
        </div>
      </div>
      <TasksFAB />
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Dialogs */}
      <TaskDialog />
      <CategoryDialog />
    </div>
  );
};

// Wrapper component that provides both contexts
const TasksPage: React.FC = () => {
  return (
    <CategoryProvider>
      <TaskDialogProvider>
        <TasksPageContent />
      </TaskDialogProvider>
    </CategoryProvider>
  );
};

export default TasksPage;
