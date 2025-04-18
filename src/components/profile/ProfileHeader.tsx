
import React from 'react';
import { Settings } from 'lucide-react';
import { useUserProfile } from '@/contexts/UserProfileContext';

interface ProfileHeaderProps {
  title: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ title }) => {
  const { userName } = useUserProfile();

  return (
    <div className="bg-orange-500 px-6 pt-12 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">{title}</h1>
          <p className="text-orange-100 text-sm mt-1">{userName}</p>
        </div>
        <button className="bg-orange-400 p-2 rounded-full">
          <Settings className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  );
};

export default ProfileHeader;
