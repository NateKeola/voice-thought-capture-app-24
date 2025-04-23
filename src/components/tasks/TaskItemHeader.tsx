
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
        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 border-2 transition-colors duration-200"
        style={{
          borderColor: completed ? "#D1D5DB" : categoryColor,
          background: completed ? "#f3f4f6" : "#fff"
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
            <p className={`text-sm ${completed ? "text-gray-400" : "text-gray-600"} mt-1`}>
              {description}
            </p>
          </div>
          <div className="flex space-x-1">
            <div className="h-2 w-2 rounded-full mt-1.5" style={{ backgroundColor: categoryColor }} />
            <div className={`h-2 w-2 rounded-full mt-1.5 ${priorityColor}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItemHeader;
