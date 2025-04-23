
import React from "react";

interface TaskTimelineIndicatorProps {
  color: string;
}

const TaskTimelineIndicator: React.FC<TaskTimelineIndicatorProps> = ({ color }) => {
  return (
    <div 
      className="absolute top-0 left-0 transform -translate-x-[9px] w-4 h-4 rounded-full border-2 border-white"
      style={{ backgroundColor: color }}
    />
  );
};

export default TaskTimelineIndicator;
