
import React from "react";
import { Plus } from "lucide-react";
import { useTaskDialog } from "@/hooks/useTaskDialog";

const TasksFAB: React.FC = () => {
  const { openTaskDialog } = useTaskDialog();
  
  return (
    <div className="fixed bottom-20 right-6 z-20">
      <button
        className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200"
        onClick={() => openTaskDialog()}
        aria-label="Add New Task"
      >
        <Plus size={28} className="text-white" />
      </button>
      <div className="w-full h-full absolute top-0 left-0 bg-indigo-500 rounded-full blur-xl opacity-30 -z-10 scale-75"></div>
    </div>
  );
};

export default TasksFAB;
