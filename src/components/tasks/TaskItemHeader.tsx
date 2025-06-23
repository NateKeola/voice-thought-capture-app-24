
import React from "react";
import TaskCompletionButton from "./TaskCompletionButton";

interface TaskItemHeaderProps {
  title: string;
  description: string;
  completed: boolean;
  categoryColor: string;
  priorityColor: string;
  taskId: number;
  onToggleComplete: (id: number) => void;
}

const TaskItemHeader: React.FC<TaskItemHeaderProps> = ({
  title,
  description,
  completed,
  categoryColor,
  priorityColor,
  taskId,
  onToggleComplete,
}) => {
  return (
    <div className="flex items-start gap-3 mb-3">
      <TaskCompletionButton
        isCompleted={completed}
        taskId={taskId}
        categoryColor={categoryColor}
        onComplete={onToggleComplete}
      />
      <div className="flex-1">
        {/* Display title in bold */}
        <h3 className={`font-bold text-gray-800 mb-1 text-sm leading-tight ${
          completed ? 'line-through text-gray-500' : ''
        }`}>
          {title}
        </h3>
        
        {/* Display description if different from title */}
        {description && description !== title && (
          <p className={`text-sm leading-relaxed ${
            completed ? 'line-through text-gray-400' : 'text-gray-600'
          }`}>
            {description}
          </p>
        )}
      </div>
      
      {/* Priority indicator */}
      <div
        className={`w-3 h-3 rounded-full ${priorityColor} flex-shrink-0 mt-1`}
        title="Priority indicator"
      />
    </div>
  );
};

export default TaskItemHeader;
