
import React from 'react';

interface ProfileSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ProfileSearch({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange
}: ProfileSearchProps) {
  return (
    <>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-orange-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          type="text"
          className="block w-full bg-orange-400 bg-opacity-50 border border-orange-300 rounded-xl py-2 pl-10 pr-3 text-orange-100 placeholder-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
          placeholder="Search relationships..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex space-x-2 overflow-x-auto mt-4">
        {['all', 'work', 'client', 'personal'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeTab === tab ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'}`}
            onClick={() => onTabChange(tab)}
          >
            {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
    </>
  );
}
