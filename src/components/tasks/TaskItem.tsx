
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
}) => (
  <div className={`bg-white rounded-xl p-4 shadow-sm ${task.completed ? 'opacity-60' : ''} hover:shadow-md transition-all duration-200`}>
    <TaskItemHeader 
      title={task.title}
      description={task.description}
      completed={task.completed}
      categoryColor={getCategoryColor(task.category)}
      priorityColor={priorityColors[task.priority]}
      onToggleComplete={() => onToggleComplete(task.id)}
    />
    <TaskItemFooter 
      due={task.due}
      hasAudio={task.hasAudio}
    />
  </div>
);

export default TaskItem;
