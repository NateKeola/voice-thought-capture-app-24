
import React from "react";
import { MessageCircle, Edit, Trash } from "lucide-react";

interface TaskItemFooterProps {
  due: string;
  hasAudio: boolean;
  category: string;
  getCategoryColor: (id: string) => string;
  onEdit: () => void;
  onDelete: () => void;
}

const TaskItemFooter: React.FC<TaskItemFooterProps> = ({ 
  due, 
  hasAudio, 
  category, 
  getCategoryColor,
  onEdit,
  onDelete
}) => {
  const categoryColor = getCategoryColor(category);
  
  return (
    <div className="flex justify-between items-center mt-3">
      <div className="flex items-center space-x-2">
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{due}</span>
        <span 
          className="text-xs px-2 py-1 rounded-full flex items-center" 
          style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
        >
          <span className="w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: categoryColor }}></span>
          {category}
        </span>
        {hasAudio && (
          <button className="flex items-center text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
            <MessageCircle size={16} />
          </button>
        )}
      </div>
      <div className="flex space-x-2">
        <button 
          onClick={onEdit}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-50" 
          aria-label="Edit Task"
        >
          <Edit size={16} />
        </button>
        <button 
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-50" 
          aria-label="Delete Task"
        >
          <Trash size={16} />
        </button>
      </div>
    </div>
  );
};

export default TaskItemFooter;
