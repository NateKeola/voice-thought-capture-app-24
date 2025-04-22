
import React from "react";
import TaskItem from "./TaskItem";

interface TaskListProps {
  tasks: any[];
  getCategoryColor: (id: string) => string;
  onToggleComplete: (id: number) => void;
  priorityColors: { [key: string]: string };
  viewMode: "categories" | "timeline";
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  getCategoryColor,
  onToggleComplete,
  priorityColors,
  viewMode,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-xl shadow-sm">
        <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-gray-600 mb-2">No tasks found</p>
        <p className="text-gray-400 text-sm mb-4">All caught up! Create a new task to get started.</p>
        <button className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium">
          Create New Task
        </button>
      </div>
    );
  }

  return (
    <div className={viewMode === "timeline" ? "space-y-6" : "space-y-3"}>
      {tasks.map((task) => (
        <div key={task.id} className={viewMode === "timeline" ? "ml-2 pl-4 border-l-2 border-gray-200 pb-6 relative" : ""}>
          {viewMode === "timeline" && (
            <div className="absolute top-0 left-0 transform -translate-x-[9px] w-4 h-4 rounded-full border-2 border-white"
              style={{ backgroundColor: getCategoryColor(task.category) }}></div>
          )}
          <TaskItem 
            task={task}
            getCategoryColor={getCategoryColor}
            onToggleComplete={onToggleComplete}
            priorityColors={priorityColors}
          />
        </div>
      ))}
    </div>
  );
};

export default TaskList;
