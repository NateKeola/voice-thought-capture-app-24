
import React from 'react';

interface TasksTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  personalTab: string;
  onPersonalTabChange: (tab: string) => void;
}

const TasksTabBar = ({ activeTab, onTabChange, personalTab, onPersonalTabChange }: TasksTabBarProps) => {
  return (
    <div className="px-6 pt-4">
      <div className="flex space-x-2 overflow-x-auto mb-4">
        {['personal', 'work'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              activeTab === tab ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'
            }`}
            onClick={() => onTabChange(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      
      {activeTab === 'personal' && (
        <div className="flex space-x-2 overflow-x-auto">
          {['tasks', 'notes'].map((tab) => (
            <button
              key={tab}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                personalTab === tab ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-600'
              }`}
              onClick={() => onPersonalTabChange(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksTabBar;
