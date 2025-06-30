
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileIconButton from '@/components/ProfileIconButton';

interface TasksPageHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddTask: () => void;
}

const TasksPageHeader = ({ searchQuery, onSearchChange, onAddTask }: TasksPageHeaderProps) => {
  return (
    <div className="bg-orange-500 px-6 pt-12 pb-6 rounded-b-3xl shadow-md">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-white text-2xl font-bold">Notes & Tasks</h1>
          <p className="text-orange-100 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-orange-400"
            onClick={onAddTask}
          >
            <Plus className="h-5 w-5 mr-1" />
            Add Task
          </Button>
          <ProfileIconButton />
        </div>
      </div>
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-orange-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full bg-orange-400 bg-opacity-50 border border-orange-300 rounded-xl py-2 pl-10 pr-3 text-orange-100 placeholder-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
            placeholder="Search notes and tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default TasksPageHeader;
