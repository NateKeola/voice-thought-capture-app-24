
import React from "react";
import ProfileIconButton from "@/components/ProfileIconButton";

interface TasksHeaderProps {
  taskCount: number;
}

const TasksHeader: React.FC<TasksHeaderProps> = ({ taskCount }) => (
  <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 pt-12 pb-6 px-6 rounded-b-3xl relative overflow-hidden">
    <div className="absolute top-0 left-0 right-0 bottom-0 opacity-20 pointer-events-none">
      <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full filter blur-3xl"></div>
      <div className="absolute top-5 right-10 w-24 h-24 bg-pink-300 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-purple-300 rounded-full filter blur-3xl"></div>
    </div>
    <div className="flex justify-between items-center relative z-10">
      <div>
        <h1 className="text-2xl font-bold text-white">My Tasks</h1>
        <p className="text-purple-100 text-sm mt-1">
          {taskCount} tasks pending
        </p>
      </div>
      <ProfileIconButton />
    </div>
  </div>
);

export default TasksHeader;
