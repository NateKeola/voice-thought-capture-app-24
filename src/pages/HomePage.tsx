import React, { useState } from 'react';
import { Send } from 'lucide-react';
import Header from '@/components/home/Header';
import SearchBar from '@/components/home/SearchBar';
import RecordButton from '@/components/RecordButton';
import BottomNavBar from '@/components/BottomNavBar';
import TextMemoInput from '@/components/TextMemoInput';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('record');
  const [liveTranscription, setLiveTranscription] = useState('');

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <SearchBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <div className="flex-1 flex flex-col items-center px-4 pt-8 pb-24">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Capture your thoughts</h2>
          <p className="text-gray-500 text-sm max-w-xs">Tap the button below to record a voice memo</p>
        </div>
        
        {/* Record button now handles live transcription */}
        <div className="relative mb-4">
          <RecordButton onLiveTranscription={setLiveTranscription} />
          
          {/* Live transcription display */}
          {liveTranscription && (
            <div className="absolute w-full left-0 top-full mt-4 bg-white rounded-lg shadow-md px-6 py-3 border border-orange-100">
              <p className="text-sm text-gray-500">Transcribing...</p>
              <div className="text-base text-gray-900 font-medium mt-1 min-h-[24px] whitespace-pre-wrap">
                {liveTranscription}
              </div>
            </div>
          )}
        </div>
        
        <div className="w-full max-w-sm mt-8">
          <TextMemoInput />
        </div>
        
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">or browse your memos by category below</p>
          <Send className="h-5 w-5 mx-auto mt-2 text-gray-400 animate-bounce rotate-90" />
        </div>
      </div>
      
      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default HomePage;
