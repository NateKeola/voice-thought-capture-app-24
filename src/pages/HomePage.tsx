
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
      <div className="relative">
        <Header />
        <div className="absolute top-14 right-6 z-10">
          <ProfileIconButton />
        </div>
      </div>

      <SearchBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex-1 flex flex-col items-center px-4 pt-8 pb-20">
        {/* Intro */}
        <IntroSection />
        
        {/* Voice Recording */}
        <RecordingSection 
          onLiveTranscription={setLiveTranscription}
          onMemoCreated={handleMemoCreated}
          liveTranscription={liveTranscription}
        />
        
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
