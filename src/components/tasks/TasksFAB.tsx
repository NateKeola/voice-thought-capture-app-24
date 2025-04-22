
import React from "react";
import { Plus } from "lucide-react";

const TasksFAB: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <div className="fixed bottom-20 right-6 z-20">
    <button
      className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center hover:scale-105 transition-all"
      onClick={onClick}
      aria-label="Add New Task"
    >
      <Plus size={28} className="text-white" />
    </button>
  </div>
);

export default TasksFAB;
