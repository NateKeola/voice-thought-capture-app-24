
import React from "react";
import { Check } from "lucide-react";

interface TaskItemHeaderProps {
  title: string;
  description: string;
  completed: boolean;
  categoryColor: string;
  priorityColor: string;
  onToggleComplete: () => void;
}

const TaskItemHeader: React.FC<TaskItemHeaderProps> = ({
  title,
  description,
  completed,
  categoryColor,
  priorityColor,
  onToggleComplete,
}) => {
  return (
    <div className="flex items-start">
      <button
        onClick={onToggleComplete}
        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 border-2 transition-all duration-200 cursor-pointer ${
          completed 
            ? 'bg-green-500 border-green-500 hover:bg-green-600' 
            : 'bg-white hover:bg-gray-50 border-gray-300'
        }`}
        style={{
          borderColor: completed ? "#10B981" : categoryColor,
          backgroundColor: completed ? "#10B981" : "white",
        }}
        aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
      >
        {completed && <Check size={16} className="text-white" />}
      </button>
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h3 className={`font-medium transition-all duration-200 ${completed ? "text-gray-500 line-through" : "text-gray-800"}`}>
              {title}
            </h3>
            {description && (
              <p className={`text-sm transition-all duration-200 ${completed ? "text-gray-400 line-through" : "text-gray-600"} mt-1`}>
                {description}
              </p>
            )}
          </div>
          <div className="flex space-x-1.5 mt-1">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryColor }} />
            <div className={`h-2.5 w-2.5 rounded-full ${priorityColor}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItemHeader;
