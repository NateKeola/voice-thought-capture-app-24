import React, { useState } from 'react';
import ProfileHeader from '@/components/profile/ProfileHeader';
import AchievementBadge from '@/components/profile/AchievementBadge';
import { ChevronRight } from 'lucide-react';
import { renderProfileIcon } from '@/utils/iconRenderer';
import type { Badge } from '@/types';
import BottomNavBar from '@/components/BottomNavBar';

const USER_DATA = {
  name: 'Morgan Johnson',
  email: 'morgan.johnson@example.com',
  joinDate: 'March 15, 2025',
  avatar: 'MJ',
  stats: {
    totalMemos: 147,
    completedTasks: 83,
    pendingTasks: 12
  }
};

const BADGES: Badge[] = [
  { 
    id: 1, 
    title: 'Early Bird', 
    description: 'Created 5 memos before 9 AM', 
    icon: 'sun', 
    earned: true, 
    date: 'April 10, 2025',
    progress: 100
  },
  { 
    id: 2, 
    title: 'Task Master', 
    description: 'Completed 50 tasks', 
    icon: 'check-circle', 
    earned: true, 
    date: 'April 5, 2025',
    progress: 100
  },
  { 
    id: 3, 
    title: 'Memory Keeper', 
    description: 'Created 100 memos', 
    icon: 'archive', 
    earned: true, 
    date: 'March 28, 2025',
    progress: 100
  },
  { 
    id: 4, 
    title: 'Idea Generator', 
    description: 'Created 25 "should" memos', 
    icon: 'lightbulb', 
    earned: true, 
    date: 'March 22, 2025',
    progress: 100
  },
  { 
    id: 5, 
    title: 'Well Connected', 
    description: 'Added 10 relationship follow-ups', 
    icon: 'users', 
    earned: false, 
    progress: 70
  },
  { 
    id: 6, 
    title: 'Voice Wizard', 
    description: 'Record 20 memos in a single day', 
    icon: 'mic', 
    earned: false, 
    progress: 45
  },
  { 
    id: 7, 
    title: 'Night Owl', 
    description: 'Create 5 memos after 10 PM', 
    icon: 'moon', 
    earned: false, 
    progress: 20
  }
];

const SETTINGS = [
  { id: 1, title: 'Notification Preferences', icon: 'bell' },
  { id: 2, title: 'Voice Recognition Settings', icon: 'mic' },
  { id: 3, title: 'Theme and Appearance', icon: 'palette' },
  { id: 4, title: 'Privacy Settings', icon: 'lock' },
  { id: 5, title: 'Account Details', icon: 'user' },
  { id: 6, title: 'Help & Support', icon: 'help-circle' },
  { id: 7, title: 'About Memo', icon: 'info' }
];

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('badges');
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ProfileHeader title="Profile" />
      
      {/* Profile Card */}
      <div className="px-6 -mt-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mr-4">
              <span className="text-orange-600 font-bold text-2xl">{USER_DATA.avatar}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{USER_DATA.name}</h2>
              <p className="text-gray-500 text-sm">{USER_DATA.email}</p>
              <p className="text-gray-400 text-xs mt-1">Member since {USER_DATA.joinDate}</p>
            </div>
          </div>
          
          <div className="flex justify-around mt-6">
            <div className="text-center">
              <p className="text-gray-800 font-bold text-xl">{USER_DATA.stats.totalMemos}</p>
              <p className="text-gray-500 text-xs">Total Memos</p>
            </div>
            <div className="text-center">
              <p className="text-gray-800 font-bold text-xl">{USER_DATA.stats.completedTasks}</p>
              <p className="text-gray-500 text-xs">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-gray-800 font-bold text-xl">{USER_DATA.stats.pendingTasks}</p>
              <p className="text-gray-500 text-xs">Pending</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex justify-around px-6 mt-6 border-b border-gray-200">
        <button 
          className={`py-3 px-4 ${activeTab === 'badges' ? 'text-orange-500 border-b-2 border-orange-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('badges')}
        >
          Badges
        </button>
        <button 
          className={`py-3 px-4 ${activeTab === 'settings' ? 'text-orange-500 border-b-2 border-orange-500 font-medium' : 'text-gray-500'}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 px-6 py-6 overflow-auto">
        {activeTab === 'badges' ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Achievement Badges</h3>
            <div className="space-y-4">
              {BADGES.filter(badge => badge.earned).map(badge => (
                <AchievementBadge key={badge.id} badge={badge} />
              ))}
              
              <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-4">In Progress</h3>
              {BADGES.filter(badge => !badge.earned).map(badge => (
                <AchievementBadge key={badge.id} badge={badge} />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {SETTINGS.map(setting => (
              <div key={setting.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-gray-500 mr-3">
                      {renderProfileIcon(setting.icon)}
                    </div>
                    <p className="text-gray-800">{setting.title}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <BottomNavBar activeTab="profile" onTabChange={() => {}} />
    </div>
  );
};

export default ProfilePage;
