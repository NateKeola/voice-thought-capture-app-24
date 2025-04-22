
import React, { useState } from 'react';
import Header from '@/components/home/Header';
import SearchBar from '@/components/home/SearchBar';
import RecordButton from '@/components/RecordButton';
import BottomNavBar from '@/components/BottomNavBar';
import TextMemoInput from '@/components/TextMemoInput';
import MemoList from '@/components/MemoList';
import { getAllMemos } from '@/services/MemoStorage';
import { ScrollArea } from '@/components/ui/scroll-area';
import TypeFilter from '@/components/TypeFilter';
import { MemoType } from '@/types';
import ProfileIconButton from '@/components/ProfileIconButton';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('record');
  const [liveTranscription, setLiveTranscription] = useState('');
  const [memos, setMemos] = useState(() => getAllMemos());
  const [activeFilter, setActiveFilter] = useState<MemoType | 'all'>('all');

  // Filter memos based on activeType
  const filteredMemos = activeFilter === 'all'
    ? memos
    : memos.filter((m) => m.type === activeFilter);

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
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Capture your thoughts</h2>
          <p className="text-gray-500 text-sm max-w-xs">Tap the button below to record a voice memo</p>
        </div>
        
        {/* Voice Recording */}
        <div className="relative mb-4">
          <RecordButton onLiveTranscription={setLiveTranscription} onMemoCreated={handleMemoCreated} />
          {liveTranscription && (
            <div className="absolute w-full left-0 top-full mt-4 bg-white rounded-lg shadow-md px-6 py-3 border border-orange-100">
              <p className="text-sm text-gray-500">Transcribing...</p>
              <div className="text-base text-gray-900 font-medium mt-1 min-h-[24px] whitespace-pre-wrap">
                {liveTranscription}
              </div>
            </div>
          )}
        </div>
        
        {/* Text Memo Input */}
        <div className="w-full max-w-sm mt-8">
          <TextMemoInput onMemoCreated={handleMemoCreated} />
        </div>

        {/* FULL "Memos" Experience, just like /memos tab, fully interactive */}
        <div className="w-full max-w-md mt-10 flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-700 font-semibold text-base">Your Memos</h3>
            <ProfileIconButton />
          </div>
          <TypeFilter activeType={activeFilter} onChange={setActiveFilter} />
          {/* Scrollable MemoList (matches MemosPage functionality!) */}
          <div className="mt-3 flex-1 min-h-40">
            <ScrollArea className="h-64 rounded-lg border bg-white shadow-sm">
              <div className="p-3">
                <MemoList memos={memos} filter={activeFilter} />
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default HomePage;

