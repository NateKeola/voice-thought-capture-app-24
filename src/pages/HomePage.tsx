
import React, { useState } from 'react';
import { getAllMemos } from '@/services/MemoStorage';
import RecordButton from '@/components/RecordButton';
import MemoList from '@/components/MemoList';
import TypeFilter from '@/components/TypeFilter';
import { MemoType } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { UserCircle } from 'lucide-react';
import ProfileMenu from '@/components/ProfileMenu';
import TextMemoInput from '@/components/TextMemoInput';

const HomePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [memos, setMemos] = useState(() => getAllMemos());
  const [activeFilter, setActiveFilter] = useState<MemoType | 'all'>('all');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState('');

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
    <div className="container max-w-md mx-auto py-6 px-4">
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

      <TypeFilter activeType={activeFilter} onChange={setActiveFilter} />

      <div className="my-6">
        <MemoList memos={memos} filter={activeFilter} />
      </div>

      {liveTranscription && (
        <div className="bg-blue-50 p-3 rounded-lg mb-4 text-gray-700 max-h-32 overflow-y-auto">
          <p>{liveTranscription}</p>
        </div>
      )}

      <TextMemoInput onMemoCreated={handleMemoCreated} initialText={liveTranscription} />

      <div className="fixed bottom-8 left-0 right-0 flex justify-center">
        <RecordButton 
          onMemoCreated={handleMemoCreated} 
          onLiveTranscription={handleLiveTranscription} 
        />
      </div>
    </div>
  );
};

export default HomePage;
