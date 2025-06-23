
import React from 'react';
import MemoList from '@/components/MemoList';
import { Memo } from '@/types';
import { Search, ArrowLeft } from 'lucide-react';

interface SearchResultsProps {
  searchQuery: string;
  searchResults: Memo[];
  onClearSearch: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  searchQuery, 
  searchResults, 
  onClearSearch 
}) => {
  return (
    <div className="w-full max-w-md mt-4">
      {/* Search Results Header */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={onClearSearch}
            className="flex items-center text-orange-500 hover:text-orange-600"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center text-gray-600">
            <Search className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
            </span>
          </div>
        </div>
        
        {searchResults.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium mb-1">No memos found</p>
            <p className="text-sm">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="space-y-3">
            <MemoList memos={searchResults} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
