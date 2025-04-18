
import React from 'react';
import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'MJ';
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
  
  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className="bg-white px-6 pt-12 pb-4 shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-gray-900 text-2xl font-bold flex items-center">
            <Settings className="h-7 w-7 text-orange-500 mr-2" />
            Memo
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button 
          onClick={handleProfileClick}
          className="bg-orange-100 w-10 h-10 rounded-full flex items-center justify-center"
        >
          <span className="text-orange-600 font-bold text-sm">{initials}</span>
        </button>
      </div>
    </div>
  );
};

export default Header;
