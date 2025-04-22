
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllMemos } from "@/services/MemoStorage";
import MemoList from "@/components/MemoList";
import BottomNavBar from "@/components/BottomNavBar";
import TypeFilter from "@/components/TypeFilter";
import { MemoType } from "@/types";
import ProfileIconButton from "@/components/ProfileIconButton";

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<MemoType | 'all'>('task');
  const [memos, setMemos] = useState(() =>
    getAllMemos().filter((m) => m.type === "task")
  );

  // Refresh tasks if needed
  const refreshMemos = () => {
    setMemos(getAllMemos().filter((m) => m.type === "task"));
  };

  return (
    <div className="container max-w-md mx-auto py-6 px-4 pb-20">
      <div className="flex justify-between mb-6 items-center">
        <h1 className="text-2xl font-bold text-center text-purple-700">Your Tasks</h1>
        <ProfileIconButton />
      </div>
      {/* Provide only task filtering */}
      <TypeFilter
        activeType={activeFilter}
        onChange={(type) => {
          setActiveFilter(type);
          if (type === "all") {
            setMemos(getAllMemos().filter((m) => m.type === "task"));
          } else {
            setMemos(getAllMemos().filter((m) => m.type === type));
          }
        }}
      />
      <div className="my-6">
        <MemoList memos={memos} filter={activeFilter} />
      </div>
      <BottomNavBar
        activeTab="tasks"
        onTabChange={(tab) => {
          if (tab === "memos") navigate("/memos");
          else if (tab === "record") navigate("/home");
          else if (tab === "relationships") navigate("/relationships");
          else if (tab === "profile") navigate("/profile");
          else if (tab === "tasks") navigate("/tasks");
        }}
      />
    </div>
  );
};

export default TasksPage;
