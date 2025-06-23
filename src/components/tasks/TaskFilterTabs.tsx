
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TaskFilterTabsProps {
  activeFilter: 'all' | 'pending' | 'completed';
  onFilterChange: (filter: 'all' | 'pending' | 'completed') => void;
  counts: {
    all: number;
    pending: number;
    completed: number;
  };
}

const TaskFilterTabs: React.FC<TaskFilterTabsProps> = ({
  activeFilter,
  onFilterChange,
  counts,
}) => {
  return (
    <Tabs value={activeFilter} onValueChange={(value) => onFilterChange(value as 'all' | 'pending' | 'completed')}>
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="all" className="flex items-center gap-2">
          All
          <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
            {counts.all}
          </span>
        </TabsTrigger>
        <TabsTrigger value="pending" className="flex items-center gap-2">
          Pending
          <span className="bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full text-xs">
            {counts.pending}
          </span>
        </TabsTrigger>
        <TabsTrigger value="completed" className="flex items-center gap-2">
          Completed
          <span className="bg-green-200 text-green-700 px-2 py-0.5 rounded-full text-xs">
            {counts.completed}
          </span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default TaskFilterTabs;
