
import React from "react";
import { Plus } from "lucide-react";

interface TaskCategoryCardProps {
  id: string;
  name: string;
  color: string;
  count: number;
  total: number;
  onSelect: (id: string) => void;
  onCreateTask?: (categoryId: string) => void;
  selected: boolean;
}

const TaskCategoryCard: React.FC<TaskCategoryCardProps> = ({ 
  id, 
  name, 
  color, 
  count, 
  total, 
  onSelect, 
  onCreateTask,
  selected 
}) => {
  const handleCreateTask = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection when clicking the button
    console.log("Create task button clicked for category:", id);
    onCreateTask?.(id);
  };

  return (
    <div
      onClick={() => onSelect(id)}
      className={`bg-white rounded-xl p-4 shadow-sm cursor-pointer transition-all duration-200 border-l-4 relative ${
        selected ? 'shadow-md translate-y-[-2px]' : 'hover:shadow-md hover:translate-y-[-1px]'
      }`}
      style={{ 
        borderColor: color, 
        ...(selected && { 
          boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 0 2px ${color}40`,
        })
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-gray-800">{name}</h3>
        <span
          className="w-6 h-6 rounded-full text-xs flex items-center justify-center text-white font-medium shadow-sm"
          style={{ backgroundColor: color }}
        >
          {count}
        </span>
      </div>
      
      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{ 
            backgroundColor: color, 
            width: `${total > 0 ? (count / total) * 100 : 0}%`,
            opacity: selected ? 0.9 : 0.7
          }}
        ></div>
      </div>
      
      <button
        onClick={handleCreateTask}
        className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-800 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Plus size={16} />
        <span>Create New Task</span>
      </button>
      
      {selected && (
        <div 
          className="absolute inset-0 rounded-xl border-2 pointer-events-none" 
          style={{ borderColor: `${color}80` }}
        ></div>
      )}
    </div>
  );
};

export default TaskCategoryCard;
