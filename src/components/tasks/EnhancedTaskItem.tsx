
import React, { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { TitleGenerationService } from "@/services/titleGeneration";
import TaskDeleteConfirmationDialog from "./TaskDeleteConfirmationDialog";

interface EnhancedTaskItemProps {
  task: {
    id: string;
    text: string;
    completed?: boolean;
    createdAt: string;
    title?: string;
  };
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const EnhancedTaskItem: React.FC<EnhancedTaskItemProps> = ({
  task,
  onToggleComplete,
  onDelete,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Clean the text and generate title
  const cleanText = task.text
    .replace(/\[Contact: [^\]]+\]/g, '')
    .replace(/\[category:\s*\w+\]/gi, '')
    .replace(/\[priority:\s*\w+\]/gi, '')
    .replace(/\[due:\s*[\w\s]+\]/gi, '')
    .trim();

  const taskTitle = task.title || TitleGenerationService.generateTitle(cleanText, 'task');
  const isCompleted = task.completed || false;

  const handleToggleComplete = () => {
    onToggleComplete(task.id);
  };

  const handleDeleteConfirm = () => {
    onDelete(task.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className={`bg-white rounded-lg p-4 shadow-sm border transition-all duration-200 ${
        isCompleted ? 'opacity-60 bg-gray-50' : 'hover:shadow-md'
      }`}>
        <div className="flex items-start gap-3">
          {/* Completion Button */}
          <button
            onClick={handleToggleComplete}
            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              isCompleted
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
            }`}
          >
            {isCompleted && <Check size={14} className="font-bold" />}
          </button>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-sm mb-1 ${
              isCompleted ? 'line-through text-gray-500' : 'text-gray-800'
            }`}>
              {taskTitle}
            </h3>
            
            {cleanText && cleanText !== taskTitle && (
              <p className={`text-sm ${
                isCompleted ? 'line-through text-gray-400' : 'text-gray-600'
              }`}>
                {cleanText}
              </p>
            )}
            
            <p className="text-xs text-gray-400 mt-2">
              {new Date(task.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Delete Button */}
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <TaskDeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        taskTitle={taskTitle}
      />
    </>
  );
};

export default EnhancedTaskItem;
