
import React from "react";
import TaskCompletionButton from "./TaskCompletionButton";

interface TaskItemHeaderProps {
  title: string;
  description: string;
  completed: boolean;
  categoryColor: string;
  priorityColor: string;
  taskId: number;
  onToggleComplete: (taskId: number) => void;
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
    <div className="flex items-start gap-3">
      <TaskCompletionButton
        taskId={taskId}
        isCompleted={completed}
        categoryColor={categoryColor}
        onComplete={onToggleComplete}
      />
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
