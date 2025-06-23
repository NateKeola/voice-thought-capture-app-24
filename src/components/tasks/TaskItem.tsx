
import React, { useState } from "react";
import TaskItemHeader from "./TaskItemHeader";
import TaskItemFooter from "./TaskItemFooter";
import TaskEditDialog from "./TaskEditDialog";
import TaskDeleteDialog from "./TaskDeleteDialog";
import { TitleGenerationService } from "@/services/titleGeneration";

interface TaskItemProps {
  task: any;
  getCategoryColor: (id: string) => string;
  onToggleComplete: (id: number) => void;
  priorityColors: { [key: string]: string };
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  getCategoryColor,
  onToggleComplete,
  priorityColors,
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const categoryColor = getCategoryColor(task.category);
  
  // Clean the description text and generate a proper title
  const cleanDescription = task.description
    .replace(/\[Contact: [^\]]+\]/g, '')
    .replace(/\[category:\s*\w+\]/gi, '')
    .replace(/\[priority:\s*\w+\]/gi, '')
    .replace(/\[due:\s*[\w\s]+\]/gi, '')
    .trim();
  
  // Generate a proper title if the current title looks like raw text
  const displayTitle = task.title && task.title.length < 50 
    ? task.title 
    : TitleGenerationService.generateTitle(task.title + ' ' + cleanDescription, 'task');
  
  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };
  
  return (
    <>
      <div 
        className={`bg-white rounded-xl p-4 shadow-sm ${
          task.completed ? 'opacity-60' : ''
        } hover:shadow-md transition-all duration-200 border-l-4`}
        style={{ borderColor: categoryColor }}
      >
        <TaskItemHeader 
          title={displayTitle}
          description={cleanDescription}
          completed={task.completed}
          categoryColor={categoryColor}
          priorityColor={priorityColors[task.priority]}
          taskId={task.id}
          onToggleComplete={onToggleComplete}
        />
        <TaskItemFooter 
          due={task.due}
          hasAudio={task.hasAudio}
          category={task.category}
          getCategoryColor={getCategoryColor}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <TaskEditDialog 
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        task={task}
      />

      <TaskDeleteDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        task={task}
      />
    </>
  );
};

export default TaskItem;
