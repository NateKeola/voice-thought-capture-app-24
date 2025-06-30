
import React from "react";
import { ListTodo, Plus, ArrowLeft } from "lucide-react";

interface EmptyTaskStateProps {
  selectedCategory?: string | null;
  categoryName?: string;
  onBackClick?: () => void;
  onAddTask: () => void;
}

const EmptyTaskState: React.FC<EmptyTaskStateProps> = ({ 
  selectedCategory, 
  categoryName, 
  onBackClick,
  onAddTask
}) => {
  return (
    <div className="text-center py-12 bg-white rounded-xl shadow-sm px-6">
      {selectedCategory && onBackClick && (
        <button 
          onClick={onBackClick} 
          className="flex items-center text-indigo-500 mb-4 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to all tasks</span>
        </button>
      )}
      <div className="w-16 h-16 mx-auto mb-5 bg-indigo-100 rounded-full flex items-center justify-center">
        <ListTodo className="h-8 w-8 text-indigo-500" />
      </div>
      <h3 className="text-xl font-medium text-gray-800 mb-2">
        {selectedCategory 
          ? `No ${categoryName || selectedCategory} tasks found` 
          : "No tasks found"}
      </h3>
      <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
        All caught up! Create a new task to get started on your productivity journey.
      </p>
      <button 
        onClick={onAddTask}
        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium flex items-center mx-auto hover:opacity-90 transition-opacity"
      >
        <Plus size={18} className="mr-1" />
        Create New Task
      </button>
    </div>
  );
};

export default EmptyTaskState;
