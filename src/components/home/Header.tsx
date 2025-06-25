
import React, { useState } from 'react';
import { Settings, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MemoAIChat from '@/components/MemoAIChat';

const Header = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'MJ';
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
  const [showMemoAI, setShowMemoAI] = useState(false);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <>
      <div className="bg-white px-6 pt-10 pb-4 shadow-sm flex flex-col items-center">
        <div className="w-full flex justify-center items-center relative mb-1">
          <Settings className="h-7 w-7 text-orange-500 mr-2 absolute left-0 top-1/2 -translate-y-1/2" />
          <h1 className="text-gray-900 text-3xl font-extrabold tracking-wider text-center w-full" style={{ letterSpacing: '0.1em' }}>
            MEMO
          </h1>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              onClick={() => setShowMemoAI(true)}
              className="bg-orange-100 w-10 h-10 rounded-full flex items-center justify-center hover:bg-orange-200 transition-colors"
              title="Chat with Memo AI"
            >
              <Brain className="h-5 w-5 text-orange-600" />
            </button>
            <button 
              onClick={handleProfileClick}
              className="bg-orange-100 w-10 h-10 rounded-full flex items-center justify-center"
            >
              <span className="text-orange-600 font-bold text-sm">{initials}</span>
            </button>
          </div>
        </div>
        <p className="text-gray-500 text-sm mt-1 text-center">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {showMemoAI && (
        <MemoAIChat onClose={() => setShowMemoAI(false)} />
      )}
    </>
  );
};

export default Header;
