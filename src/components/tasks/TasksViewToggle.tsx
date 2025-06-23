
import React from "react";
import { ListTodo, Clock } from "lucide-react";

interface TasksViewToggleProps {
  viewMode: "categories" | "timeline";
  setViewMode: (mode: "categories" | "timeline") => void;
}

const TasksViewToggle: React.FC<TasksViewToggleProps> = ({ viewMode, setViewMode }) => (
  <div className="mt-6 flex bg-white rounded-xl p-1 shadow-sm">
    <button
      className={`py-2 px-4 rounded-lg text-sm font-medium flex-1 flex justify-center items-center space-x-2 transition-all ${
        viewMode === "categories"
          ? "bg-indigo-100 text-indigo-600"
          : "text-gray-500 hover:bg-gray-50"
      }`}
      onClick={() => setViewMode("categories")}
    >
      <ListTodo size={18} />
      <span>Categories</span>
    </button>
    <button
      className={`py-2 px-4 rounded-lg text-sm font-medium flex-1 flex justify-center items-center space-x-2 transition-all ${
        viewMode === "timeline"
          ? "bg-indigo-100 text-indigo-600"
          : "text-gray-500 hover:bg-gray-50"
      }`}
      onClick={() => setViewMode("timeline")}
    >
      <Clock size={18} />
      <span>Recents</span>
    </button>
  </div>
);

export default TasksViewToggle;
