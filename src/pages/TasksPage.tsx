
import React, { useState } from "react";
import TasksHeader from "@/components/tasks/TasksHeader";
import TaskCategoryCard from "@/components/tasks/TaskCategoryCard";
import TasksViewToggle from "@/components/tasks/TasksViewToggle";
import TaskList from "@/components/tasks/TaskList";
import TasksFAB from "@/components/tasks/TasksFAB";

const initialTasks = [
  { id: 1, title: "Remember to pick up groceries", description: "Tonight after work, especially milk and eggs.", completed: false, category: "personal", priority: "high", due: "today", created: 7, hasAudio: true },
  { id: 2, title: "Schedule dentist appointment", description: "Need to book for next week.", completed: false, category: "health", priority: "medium", due: "this week", created: 9, hasAudio: true },
  { id: 3, title: "Call mom for birthday", description: "Tomorrow morning, don't forget!", completed: false, category: "personal", priority: "high", due: "tomorrow", created: 1, hasAudio: false },
  { id: 4, title: "Renew car insurance", description: "Due by the end of the month.", completed: true, category: "finance", priority: "medium", due: "next month", created: 3, hasAudio: true },
  { id: 5, title: "Prepare presentation", description: "For the client meeting on Thursday.", completed: false, category: "work", priority: "high", due: "this week", created: 2, hasAudio: false },
  { id: 6, title: "Order new desk chair", description: "The current one is falling apart.", completed: true, category: "home", priority: "low", due: "next month", created: 14, hasAudio: false }
];

const categories = [
  { id: "personal", name: "Personal", color: "#8B5CF6" },
  { id: "work", name: "Work", color: "#3B82F6" },
  { id: "health", name: "Health", color: "#EC4899" },
  { id: "finance", name: "Finance", color: "#10B981" },
  { id: "home", name: "Home", color: "#F59E0B" },
];

const priorityColors = {
  high: "bg-red-500",
  medium: "bg-yellow-500",
  low: "bg-blue-400"
};

const TasksPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<"categories" | "timeline">("categories");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [tasks, setTasks] = useState(initialTasks);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const onToggleComplete = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.color : "#6B7280";
  };

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

  // Count for pending tasks/category
  const categoryTaskCounts = categories.map((cat) => ({
    ...cat,
    count: tasks.filter((t) => t.category === cat.id && !t.completed).length,
    total: tasks.filter((t) => t.category === cat.id).length,
  }));

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      <TasksHeader taskCount={tasks.filter((t) => !t.completed).length} />
      <div className="container mx-auto max-w-md px-4 pt-4">
        <TasksViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        {/* Toggle Show Completed */}
        <div className="flex justify-between items-center my-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {viewMode === "categories"
              ? selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.name + " Tasks"
                : "All Categories"
              : "Task Timeline"}
          </h2>
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
        {/* Categories */}
        {viewMode === "categories" && !selectedCategory && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {categoryTaskCounts.map((cat) => (
              <TaskCategoryCard
                key={cat.id}
                id={cat.id}
                name={cat.name}
                color={cat.color}
                count={cat.count}
                total={cat.total}
                onSelect={handleCategorySelect}
                selected={false}
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
        />
      </div>
      <TasksFAB />
    </div>
  );
};

export default TasksPage;
