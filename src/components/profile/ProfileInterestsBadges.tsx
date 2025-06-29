
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useProfileInterests } from '@/hooks/useProfileInterests';

interface ProfileInterestsBadgesProps {
  profileId: string;
  showRemove?: boolean;
}

const ProfileInterestsBadges: React.FC<ProfileInterestsBadgesProps> = ({ 
  profileId, 
  showRemove = false 
}) => {
  const { profileInterests, removeProfileInterest, loading } = useProfileInterests(profileId);

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
        ))}
      </div>
    );
  }

  if (profileInterests.length === 0) {
    return (
      <p className="text-gray-500 text-sm">No interests added yet</p>
    );
  }

  const handleRemoveInterest = async (profileInterestId: string) => {
    await removeProfileInterest(profileInterestId);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {profileInterests.map(profileInterest => (
        <Badge 
          key={profileInterest.id} 
          variant="secondary" 
          className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1"
        >
          <span>{profileInterest.interest.name}</span>
          {showRemove && (
            <button
              onClick={() => handleRemoveInterest(profileInterest.id)}
              className="ml-1 hover:bg-blue-300 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Badge>
      ))}
    </div>
  );
};

export default ProfileInterestsBadges;
