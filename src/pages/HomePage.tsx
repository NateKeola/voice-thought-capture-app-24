
import React, { useState, useEffect } from 'react';
import { getAllMemos } from '@/services/MemoStorage';
import RecordButton from '@/components/RecordButton';
import MemoList from '@/components/MemoList';
import TypeFilter from '@/components/TypeFilter';
import { MemoType } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { UserCircle, WifiOff } from 'lucide-react';
import ProfileMenu from '@/components/ProfileMenu';
import TextMemoInput from '@/components/TextMemoInput';
import { EmptyState } from '@/components/EmptyState';

const HomePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [memos, setMemos] = useState(() => getAllMemos());
  const [activeFilter, setActiveFilter] = useState<MemoType | 'all'>('all');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(false);

  // Refresh memos when component mounts or a new memo is created
  const refreshMemos = () => {
    setLoading(true);
    setTimeout(() => {
      setMemos(getAllMemos());
      setLoading(false);
    }, 500);
  };

  // Check network status on mount
  useEffect(() => {
    // In a real app, we would use network status APIs
    // For demo purposes, we'll just set it to online
    setIsOffline(false);
  }, []);

  const handleMemoCreated = (memoId: string) => {
    refreshMemos();
    navigate(`/memo/${memoId}`);
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleLiveTranscription = (text: string) => {
    setLiveTranscription(text);
  };

  const filteredMemos = activeFilter === 'all' 
    ? memos 
    : memos.filter(memo => memo.type === activeFilter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-orange-500 pt-6 pb-6 px-4 rounded-b-3xl shadow">
        <div className="flex justify-between items-center">
          <div className="w-10"></div> {/* Spacer for centering */}
          <h1 className="text-2xl font-bold text-center text-white">
            MEMO
          </h1>
          <button 
            onClick={toggleProfileMenu} 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-orange-400"
          >
            <UserCircle size={24} />
          </button>
        </div>
      </div>

      {showProfileMenu && <ProfileMenu onClose={() => setShowProfileMenu(false)} />}

      <div className="container max-w-md mx-auto px-4 pb-24">
        {/* Tab Bar */}
        <div className="my-4">
          <TypeFilter activeType={activeFilter} onChange={setActiveFilter} />
        </div>
        
        {/* Offline Banner */}
        {isOffline && (
          <div className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg mb-4 mx-4">
            <WifiOff size={16} />
            <p className="text-xs">You're offline. Memos will sync when connection is restored.</p>
          </div>
        )}

        {/* Memo List or Empty State */}
        <div className="my-4">
          {filteredMemos.length > 0 ? (
            <MemoList 
              memos={filteredMemos} 
              filter={activeFilter} 
            />
          ) : (
            <EmptyState 
              icon="mic"
              title="No memos yet"
              description="Tap the microphone button below to record your first thought"
            />
          )}
        </div>

        {/* Live Transcription */}
        {liveTranscription && (
          <div className="bg-blue-50 p-3 rounded-lg mb-4 text-gray-700 max-h-32 overflow-y-auto">
            <p>{liveTranscription}</p>
          </div>
        )}

        {/* Text Input */}
        <div className="mt-6">
          <TextMemoInput onMemoCreated={handleMemoCreated} initialText={liveTranscription} />
        </div>

        {/* Record Button */}
        <div className="fixed bottom-8 left-0 right-0 flex justify-center">
          <RecordButton 
            onMemoCreated={handleMemoCreated} 
            onLiveTranscription={handleLiveTranscription} 
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
