
import React, { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearchChange }) => {
  const [isFocused, setIsFocused] = useState(false);
  const recentSearches = ['meeting notes', 'project deadline', 'coffee shop', 'alex'];

  return (
    <div className="px-4 pt-3 pb-2 sticky top-0 bg-gray-50 z-10">
      <div className="relative">
        <div className={`flex items-center bg-white rounded-xl border ${isFocused ? 'border-orange-500 shadow-sm' : 'border-gray-300'}`}>
          <Search className="h-5 w-5 ml-3 text-gray-400" />
          <input
            type="text"
            className="flex-1 py-3 px-2 bg-transparent outline-none text-gray-800"
            placeholder="Search your memos and connections..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <button className="mr-2 p-1 rounded-full hover:bg-gray-100">
            <SlidersHorizontal className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        {isFocused && searchQuery === '' && (
          <div className="absolute w-full mt-1 bg-white rounded-xl shadow-md border border-gray-200 py-2 z-20">
            <p className="px-4 pb-2 text-sm text-gray-500 font-medium">Recent Searches</p>
            {recentSearches.map((search, index) => (
              <div key={index} className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center">
                <Search className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-700">{search}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
