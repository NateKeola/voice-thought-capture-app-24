
import React, { useState, useMemo } from "react";
import { useMemos } from "@/contexts/MemoContext";
import TaskFilterTabs from "@/components/tasks/TaskFilterTabs";
import EnhancedTaskItem from "@/components/tasks/EnhancedTaskItem";
import BottomNavBar from "@/components/BottomNavBar";

const TasksPage: React.FC = () => {
  const { memos, deleteMemo, toggleTaskCompletion, isLoading } = useMemos();
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Filter for task-type memos
  const allTasks = useMemo(() => {
    return memos.filter(memo => memo.type === 'task');
  }, [memos]);

  // Filter tasks based on completion status
  const filteredTasks = useMemo(() => {
    switch (activeFilter) {
      case 'pending':
        return allTasks.filter(task => !task.completed);
      case 'completed':
        return allTasks.filter(task => task.completed);
      default:
        return allTasks;
    }
  }, [allTasks, activeFilter]);

  // Calculate counts for filter tabs
  const taskCounts = useMemo(() => ({
    all: allTasks.length,
    pending: allTasks.filter(task => !task.completed).length,
    completed: allTasks.filter(task => task.completed).length,
  }), [allTasks]);

  const handleToggleComplete = async (taskId: string) => {
    await toggleTaskCompletion(taskId);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteMemo(taskId);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <div className="container mx-auto max-w-md px-4 pt-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto max-w-md px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
            <div className="text-sm text-gray-500">
              {taskCounts.pending} pending
            </div>
          </div>
          
          {/* Filter Tabs */}
          <TaskFilterTabs
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={taskCounts}
          />
        </div>
      </div>

      {/* Task List */}
      <div className="container mx-auto max-w-md px-4 py-6 flex-1">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium">
              {activeFilter === 'completed' ? 'No completed tasks yet' :
               activeFilter === 'pending' ? 'No pending tasks' :
               'No tasks yet'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {activeFilter === 'all' ? 'Create a memo with type "task" to get started!' : ''}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <EnhancedTaskItem
                key={task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNavBar activeTab="tasks" onTabChange={() => {}} />
    </div>
  );
};

export default TasksPage;
