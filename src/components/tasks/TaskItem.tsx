
import React, { useState } from "react";
import TaskItemHeader from "./TaskItemHeader";
import TaskItemFooter from "./TaskItemFooter";
import TaskEditDialog from "./TaskEditDialog";
import TaskDeleteDialog from "./TaskDeleteDialog";

interface TaskItemProps {
  task: any;
  getCategoryColor: (id: string) => string;
  onToggleComplete: (id: string) => void; // Changed from number to string
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
          title={task.title}
          description={task.description}
          completed={task.completed}
          categoryColor={categoryColor}
          priorityColor={priorityColors[task.priority]}
          onToggleComplete={() => onToggleComplete(task.id)}
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
