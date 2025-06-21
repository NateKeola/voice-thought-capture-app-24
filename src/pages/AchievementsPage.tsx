
import React from 'react';
import ProfileHeader from '@/components/profile/ProfileHeader';
import AchievementsList from '@/components/achievements/AchievementsList';
import BottomNavBar from '@/components/BottomNavBar';

const AchievementsPage: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ProfileHeader title="Achievements" />
      
      <div className="flex-1 px-6 py-6 overflow-auto">
        <AchievementsList />
      </div>
      
      <BottomNavBar activeTab="profile" onTabChange={() => {}} />
    </div>
  );
};

export default AchievementsPage;
