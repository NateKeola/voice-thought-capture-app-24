
import React from "react";
import TaskItemHeader from "./TaskItemHeader";
import TaskItemFooter from "./TaskItemFooter";

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
  const categoryColor = getCategoryColor(task.category);
  
  return (
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
      />
    </div>
  );
};

export default TaskItem;
