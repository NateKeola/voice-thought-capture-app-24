import React, { useState } from 'react';
import ProfileHeader from '@/components/profile/ProfileHeader';
import AchievementBadge from '@/components/profile/AchievementBadge';
import MemoStatsTable from '@/components/profile/MemoStatsTable';
import { ChevronRight, Plus } from 'lucide-react';
import { renderProfileIcon } from '@/utils/iconRenderer';
import type { Badge } from '@/types';
import BottomNavBar from '@/components/BottomNavBar';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useAuth } from '@/hooks/useAuth';
import { useMemos } from '@/contexts/MemoContext';
import ProfileIconButton from '@/components/ProfileIconButton';
import NotificationSettings from '@/components/settings/NotificationSettings';
import ThemeSettings from '@/components/settings/ThemeSettings';
import AccountDetails from '@/components/settings/AccountDetails';
import HelpSupport from '@/components/settings/HelpSupport';
import AddInterestsModal from '@/components/profile/AddInterestsModal';
import InterestsBadges from '@/components/profile/InterestsBadges';

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
  { id: 3, title: 'Theme and Appearance', icon: 'palette' },
  { id: 5, title: 'Account Details', icon: 'user' },
  { id: 6, title: 'Help & Support', icon: 'help-circle' },
  { id: 7, title: 'About Memo', icon: 'info' }
];

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('badges');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showMemoTable, setShowMemoTable] = useState(false);
  const [showAddInterests, setShowAddInterests] = useState(false);
  const { userName } = useUserProfile();
  const { user } = useAuth();
  const { memos } = useMemos();
  
  const initials = userName
    ? userName.split(' ').map(n => n.trim()[0] || '').join('').substring(0, 2).toUpperCase()
    : 'MJ';

  const userEmail = user?.email || 'user@example.com';
  const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'April 2025';

  // Calculate real statistics from memos
  const stats = {
    totalMemos: memos.length,
    completedTasks: memos.filter(memo => memo.completed).length,
    pendingTasks: memos.filter(memo => !memo.completed).length,
  };

  const handleSettingClick = (settingId: number) => {
    switch (settingId) {
      case 1:
        setActiveModal('notifications');
        break;
      case 3:
        setActiveModal('theme');
        break;
      case 5:
        setActiveModal('account');
        break;
      case 6:
        setActiveModal('help');
        break;
      case 7:
        setActiveModal('about');
        break;
    }
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleStatsClick = () => {
    setShowMemoTable(true);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="relative">
        <ProfileHeader title="Profile" />
        <div className="absolute top-14 right-6 z-10">
          <ProfileIconButton />
        </div>
      </div>
      <div className="px-6 -mt-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center">
            <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mr-4">
              <span className="text-orange-600 font-bold text-2xl">{initials}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{userName || 'Your Name'}</h2>
              <p className="text-gray-500 text-sm">{userEmail}</p>
              <p className="text-gray-400 text-xs mt-1">Member since {joinDate}</p>
            </div>
          </div>
          <div 
            className="flex justify-around mt-6 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
            onClick={handleStatsClick}
          >
            <div className="text-center">
              <p className="text-gray-800 font-bold text-xl">{stats.totalMemos}</p>
              <p className="text-gray-500 text-xs">Total Memos</p>
            </div>
            <div className="text-center">
              <p className="text-gray-800 font-bold text-xl">{stats.completedTasks}</p>
              <p className="text-gray-500 text-xs">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-gray-800 font-bold text-xl">{stats.pendingTasks}</p>
              <p className="text-gray-500 text-xs">Pending</p>
            </div>
          </div>
        </div>

        {/* Add Interests Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Your Interests</h3>
            <button
              onClick={() => setShowAddInterests(true)}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
            >
              <Plus className="h-4 w-4" />
              Add Interests
            </button>
          </div>
          <InterestsBadges showRemove={true} />
        </div>
      </div>
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
              <div 
                key={setting.id} 
                className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:bg-gray-50"
                onClick={() => handleSettingClick(setting.id)}
              >
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

      {/* Modals */}
      {activeModal === 'notifications' && (
        <NotificationSettings isOpen={true} onClose={closeModal} />
      )}
      {activeModal === 'theme' && (
        <ThemeSettings isOpen={true} onClose={closeModal} />
      )}
      {activeModal === 'account' && (
        <AccountDetails isOpen={true} onClose={closeModal} />
      )}
      {activeModal === 'help' && (
        <HelpSupport isOpen={true} onClose={closeModal} />
      )}
      
      {/* Add Interests Modal - Updated with mode prop */}
      <AddInterestsModal 
        isOpen={showAddInterests} 
        onClose={() => setShowAddInterests(false)}
        mode="user"
      />
      
      {/* Memo Stats Table */}
      <MemoStatsTable 
        isOpen={showMemoTable} 
        onClose={() => setShowMemoTable(false)} 
      />
    </div>
  );
};

export default ProfilePage;
