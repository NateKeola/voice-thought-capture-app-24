
import React, { useState } from 'react';
import { getAllMemos } from '@/services/MemoStorage';
import RecordButton from '@/components/RecordButton';
import { MemoType } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { UserCircle } from 'lucide-react';
import ProfileMenu from '@/components/ProfileMenu';
import TextMemoInput from '@/components/TextMemoInput';
import BottomNavBar from '@/components/BottomNavBar';

const HomePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [memos, setMemos] = useState(() => getAllMemos());
  const [activeFilter, setActiveFilter] = useState<MemoType | 'all'>('all');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState('');
  const [activeTab, setActiveTab] = useState('record');

  // Refresh memos when component mounts or a new memo is created
  const refreshMemos = () => {
    setMemos(getAllMemos());
  };

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

  return (
    <div className="container max-w-md mx-auto py-6 px-4 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="w-10"></div> {/* Spacer for centering */}
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 text-transparent bg-clip-text animate-pulse">
          MEMO
        </h1>
        <button 
          onClick={toggleProfileMenu} 
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100"
        >
          <UserCircle size={24} className="text-orange-500" />
        </button>
      </div>

      {showProfileMenu && <ProfileMenu onClose={() => setShowProfileMenu(false)} />}

      {activeTab === 'record' && (
        <div className="flex-1 flex flex-col items-center">
          <div className="flex-grow flex flex-col justify-center items-center">
            {liveTranscription && (
              <div className="bg-blue-50 p-3 rounded-lg mb-6 text-gray-700 max-h-32 overflow-y-auto w-full max-w-sm">
                <p>{liveTranscription}</p>
              </div>
            )}

            <div className="mb-16">
              <RecordButton 
                onMemoCreated={handleMemoCreated} 
                onLiveTranscription={handleLiveTranscription} 
              />
            </div>

            <div className="w-full max-w-sm mt-8">
              <TextMemoInput onMemoCreated={handleMemoCreated} initialText={liveTranscription} />
            </div>
          </div>
        </div>
      )}

      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default HomePage;
