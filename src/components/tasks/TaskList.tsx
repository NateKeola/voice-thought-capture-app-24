
import React from "react";
import TaskItem from "./TaskItem";
import EmptyTaskState from "./EmptyTaskState";
import TaskTimelineIndicator from "./TaskTimelineIndicator";

interface TaskListProps {
  tasks: any[];
  getCategoryColor: (id: string) => string;
  onToggleComplete: (id: number) => void;
  priorityColors: { [key: string]: string };
  viewMode: "categories" | "timeline";
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  getCategoryColor,
  onToggleComplete,
  priorityColors,
  viewMode,
}) => {
  if (tasks.length === 0) {
    return <EmptyTaskState />;
  }

  return (
    <div className={viewMode === "timeline" ? "space-y-6" : "space-y-3"}>
      {tasks.map((task) => (
        <div key={task.id} className={viewMode === "timeline" ? "ml-2 pl-4 border-l-2 border-gray-200 pb-6 relative" : ""}>
          {viewMode === "timeline" && (
            <TaskTimelineIndicator color={getCategoryColor(task.category)} />
          )}
          <TaskItem 
            task={task}
            getCategoryColor={getCategoryColor}
            onToggleComplete={onToggleComplete}
            priorityColors={priorityColors}
          />
        </div>
      ))}
    </div>
  );
};

export default TaskList;
