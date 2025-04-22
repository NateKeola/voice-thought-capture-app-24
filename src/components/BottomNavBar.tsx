
import React from 'react';
import { Mic, MessageSquare, Users, ListTodo } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BottomNavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();

  const handleTabClick = (tab: string) => {
    if (tab === 'memos') {
      navigate('/memos');
    } else if (tab === 'relationships') {
      navigate('/relationships');
    } else if (tab === 'tasks') {
      navigate('/tasks');
    } else if (tab === 'record') {
      navigate('/home');
    } else {
      onTabChange(tab);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 z-30">
      <div className="container max-w-md mx-auto flex justify-around items-center">
        <button
          onClick={() => handleTabClick('memos')}
          className={`flex flex-col items-center p-2 ${
            activeTab === 'memos' ? 'text-orange-500' : 'text-gray-500'
          }`}
        >
          <MessageSquare size={24} />
          <span className="text-xs mt-1">Memos</span>
        </button>
        
        <button
          onClick={() => handleTabClick('tasks')}
          className={`flex flex-col items-center p-2 ${
            activeTab === 'tasks' ? 'text-purple-600' : 'text-gray-500'
          }`}
        >
          <ListTodo size={24} />
          <span className="text-xs mt-1">Tasks</span>
        </button>
        
        <button
          onClick={() => handleTabClick('record')}
          className={`flex flex-col items-center p-2 ${
            activeTab === 'record' ? 'text-orange-500' : 'text-gray-500'
          }`}
        >
          <Mic size={24} />
          <span className="text-xs mt-1">Record</span>
        </button>
        
        <button
          onClick={() => handleTabClick('relationships')}
          className={`flex flex-col items-center p-2 ${
            activeTab === 'relationships' ? 'text-orange-500' : 'text-gray-500'
          }`}
        >
          <Users size={24} />
          <span className="text-xs mt-1">Relationships</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNavBar;

