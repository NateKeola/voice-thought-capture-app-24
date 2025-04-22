
import React from "react";

interface TasksViewToggleProps {
  viewMode: "categories" | "timeline";
  setViewMode: (mode: "categories" | "timeline") => void;
}

const TasksViewToggle: React.FC<TasksViewToggleProps> = ({ viewMode, setViewMode }) => (
  <div className="mt-6 flex bg-white bg-opacity-20 rounded-xl p-1">
    <button
      className={`py-2 px-4 rounded-lg text-sm font-medium flex-1 transition-all ${
        viewMode === "categories"
          ? "bg-white text-purple-600 shadow-sm"
          : "text-white"
      }`}
      onClick={() => setViewMode("categories")}
    >
      Categories
    </button>
    <button
      className={`py-2 px-4 rounded-lg text-sm font-medium flex-1 transition-all ${
        viewMode === "timeline"
          ? "bg-white text-purple-600 shadow-sm"
          : "text-white"
      }`}
      onClick={() => setViewMode("timeline")}
    >
      Timeline
    </button>
  </div>
);

export default TasksViewToggle;
