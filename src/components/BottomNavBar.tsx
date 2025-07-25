
import React, { useEffect } from 'react';
import { Mic, Users, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface BottomNavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Set the active tab based on the current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/relationships') {
      onTabChange('relationships');
    } else if (path === '/tasks') {
      onTabChange('personal');
    } else if (path === '/home') {
      onTabChange('record');
    }
  }, [location.pathname, onTabChange]);

  const handleTabClick = (tab: string) => {
    onTabChange(tab);
    
    // Ensure we're not navigating from the current page to the same page
    if (tab === 'relationships' && location.pathname !== '/relationships') {
      navigate('/relationships');
    } else if (tab === 'personal' && location.pathname !== '/tasks') {
      navigate('/tasks');
    } else if (tab === 'record' && location.pathname !== '/home') {
      navigate('/home');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 z-30">
      <div className="container max-w-md mx-auto flex justify-around items-center">
        <button
          onClick={() => handleTabClick('personal')}
          className={`flex flex-col items-center p-2 ${
            activeTab === 'personal' ? 'text-purple-600' : 'text-gray-500'
          }`}
        >
          <User size={24} />
          <span className="text-xs mt-1">Personal</span>
        </button>
        
        {/* Gorgeous gradient "Record" centerpiece button */}
        <button
          onClick={() => handleTabClick('record')}
          className="relative -mt-8 flex flex-col items-center"
          style={{ zIndex: 5 }}
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all
            ${
              activeTab === 'record'
                ? 'bg-gradient-to-br from-purple-500 via-pink-400 to-orange-400 border-4 border-white'
                : 'bg-gradient-to-tr from-orange-200 via-purple-100 to-pink-100 border-4 border-white'
            }
            `}
          >
            <Mic
              size={32}
              className="text-white drop-shadow"
            />
          </div>
          <span className={`text-xs mt-1 font-bold tracking-widest ${
            activeTab === 'record' ? 'text-purple-500' : 'text-gray-500'
          }`}>Record</span>
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
