
import React from "react";
import { Check } from "lucide-react";

interface TaskCompletionButtonProps {
  taskId: number;
  isCompleted: boolean;
  categoryColor: string;
  onComplete: (taskId: number) => void;
}

const TaskCompletionButton: React.FC<TaskCompletionButtonProps> = ({
  taskId,
  isCompleted,
  categoryColor,
  onComplete,
}) => {
  const handleClick = () => {
    onComplete(taskId);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 border-2 ${
        isCompleted 
          ? 'shadow-md' 
          : 'bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400'
      }`}
      style={{
        backgroundColor: isCompleted ? categoryColor : "white",
        borderColor: isCompleted ? categoryColor : undefined,
      }}
      aria-label={isCompleted ? "Mark as incomplete" : "Complete task"}
    >
      {isCompleted && <Check size={18} className="text-white font-bold" />}
    </button>
  );
};

export default TaskCompletionButton;
