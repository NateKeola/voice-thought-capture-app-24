
import React, { useState } from 'react';
import Header from '@/components/home/Header';
import SearchBar from '@/components/home/SearchBar';
import SearchResults from '@/components/home/SearchResults';
import TextMemoInput from '@/components/TextMemoInput';
import BottomNavBar from '@/components/BottomNavBar';
import { MemoType, Memo } from '@/types';
import IntroSection from '@/components/home/IntroSection';
import RecordingSection from '@/components/home/RecordingSection';
import MemosSection from '@/components/home/MemosSection';
import FollowUpSection from '@/components/home/FollowUpSection';
import { useMemos } from '@/contexts/MemoContext';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Memo[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [activeTab, setActiveTab] = useState('record');
  const [liveTranscription, setLiveTranscription] = useState('');
  const [activeFilter, setActiveFilter] = useState<MemoType | 'all'>('all');
  const { memos, isLoading, refreshMemos } = useMemos();

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchActive(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header />

      {/* Centerpiece Recording Section - Hide when searching */}
      {!isSearchActive && (
        <div className="flex flex-col items-center justify-center py-4 w-full">
          <div className="bg-gradient-to-br from-purple-500 via-pink-400 to-orange-400 rounded-full p-1 shadow-lg mb-2">
            <div className="bg-white rounded-full p-2 flex items-center justify-center">
              <RecordingSection 
                onLiveTranscription={setLiveTranscription}
                onMemoCreated={refreshMemos}
                liveTranscription={liveTranscription}
              />
            </div>
          </div>
          <span className="mt-2 font-semibold text-purple-500 text-sm tracking-widest">VOICE MEMO</span>
        </div>
      )}

      {/* Search Bar */}
      <SearchBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        memos={memos}
        onSearchResults={setSearchResults}
        isSearchActive={isSearchActive}
        onSearchActiveChange={setIsSearchActive}
      />

      <div className="flex-1 flex flex-col items-center px-4 pt-4 pb-20">
        {isSearchActive ? (
          /* Search Results View */
          <SearchResults 
            searchQuery={searchQuery}
            searchResults={searchResults}
            onClearSearch={handleClearSearch}
          />
        ) : (
          /* Default Home View */
          <>
            {/* Intro */}
            <IntroSection />
            
            {/* Text Memo Input */}
            <div className="w-full max-w-sm mt-8">
              <TextMemoInput onMemoCreated={refreshMemos} />
            </div>

            {/* Follow Up Section */}
            <FollowUpSection memos={memos} />

            {/* Memos Section */}
            <MemosSection 
              memos={memos}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              isLoading={isLoading}
            />
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default HomePage;
