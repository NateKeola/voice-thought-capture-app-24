
import React, { useState } from 'react';
import Header from '@/components/home/Header';
import SearchBar from '@/components/home/SearchBar';
import TextMemoInput from '@/components/TextMemoInput';
import BottomNavBar from '@/components/BottomNavBar';
import { getAllMemos } from '@/services/MemoStorage';
import { MemoType } from '@/types';
import ProfileIconButton from '@/components/ProfileIconButton';
import IntroSection from '@/components/home/IntroSection';
import RecordingSection from '@/components/home/RecordingSection';
import MemosSection from '@/components/home/MemosSection';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('record');
  const [liveTranscription, setLiveTranscription] = useState('');
  const [memos, setMemos] = useState(() => getAllMemos());
  const [activeFilter, setActiveFilter] = useState<MemoType | 'all'>('all');

  // Handler to refresh memos after creating new memos/text memos
  const handleMemoCreated = () => {
    setMemos(getAllMemos());
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header + Profile Button */}
      <Header />

      {/* Centerpiece Recording Section */}
      <div className="flex flex-col items-center justify-center py-4 w-full">
        <div className="bg-gradient-to-br from-purple-500 via-pink-400 to-orange-400 rounded-full p-1 shadow-lg mb-2">
          <div className="bg-white rounded-full p-2 flex items-center justify-center">
            <RecordingSection 
              onLiveTranscription={setLiveTranscription}
              onMemoCreated={handleMemoCreated}
              liveTranscription={liveTranscription}
            />
          </div>
        </div>
        <span className="mt-2 font-semibold text-purple-500 text-sm tracking-widest">VOICE MEMO</span>
      </div>

      <SearchBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex-1 flex flex-col items-center px-4 pt-4 pb-20">
        {/* Intro */}
        <IntroSection />
        
        {/* Text Memo Input */}
        <div className="w-full max-w-sm mt-8">
          <TextMemoInput onMemoCreated={handleMemoCreated} />
        </div>

        {/* Memos Section */}
        <MemosSection 
          memos={memos}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </div>

      {/* Bottom Navigation */}
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default HomePage;
