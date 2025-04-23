
import React from "react";
import { MessageCircle, Edit, Trash } from "lucide-react";

interface TaskItemFooterProps {
  due: string;
  hasAudio: boolean;
}

const TaskItemFooter: React.FC<TaskItemFooterProps> = ({ due, hasAudio }) => {
  return (
    <div className="flex justify-between items-center mt-3">
      <div className="flex items-center space-x-3">
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{due}</span>
        {hasAudio && (
          <button className="flex items-center text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
            <MessageCircle size={16} />
          </button>
        )}
      </div>
      <div className="flex space-x-2">
        <button className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Edit Task">
          <Edit size={18} />
        </button>
        <button className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Delete Task">
          <Trash size={18} />
        </button>
      </div>
    </div>
  );
};

export default TaskItemFooter;
