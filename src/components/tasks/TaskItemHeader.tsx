
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
        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 border-2 transition-all duration-200 ${
          completed ? 'bg-gray-100' : 'hover:bg-gray-50'
        }`}
        style={{
          borderColor: completed ? "#D1D5DB" : categoryColor,
        }}
        aria-label="Toggle complete"
      >
        {completed && <Check size={16} className="text-gray-500" />}
      </button>
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h3 className={`font-medium ${completed ? "text-gray-500 line-through" : "text-gray-800"}`}>
              {title}
            </h3>
            {description && (
              <p className={`text-sm ${completed ? "text-gray-400" : "text-gray-600"} mt-1`}>
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
