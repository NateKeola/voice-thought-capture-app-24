
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import Header from '@/components/home/Header';
import SearchBar from '@/components/home/SearchBar';
import RecordingButton from '@/components/home/RecordingButton';
import TextMemoInput from '@/components/TextMemoInput';
import BottomNavBar from '@/components/BottomNavBar';
import { useToast } from '@/hooks/use-toast';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('record');
  const { toast } = useToast();

  const handleStartRecording = () => {
    toast({
      title: "Recording started",
      description: "Speak clearly into your microphone"
    });
  };

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
        
        <RecordingButton onStartRecording={handleStartRecording} />
        
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
