
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useUserInterests } from '@/hooks/useUserInterests';

interface InterestsBadgesProps {
  showRemove?: boolean;
}

const InterestsBadges: React.FC<InterestsBadgesProps> = ({ showRemove = false }) => {
  const { userInterests, removeInterest, loading } = useUserInterests();

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
        ))}
      </div>
    );
  }

  if (userInterests.length === 0) {
    return (
      <p className="text-gray-500 text-sm">No interests added yet</p>
    );
  }

  const handleRemoveInterest = async (userInterestId: string) => {
    await removeInterest(userInterestId);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {userInterests.map(userInterest => (
        <Badge 
          key={userInterest.id} 
          variant="secondary" 
          className="bg-orange-100 text-orange-800 hover:bg-orange-200 flex items-center gap-1"
        >
          <span>{userInterest.interest.name}</span>
          {showRemove && (
            <button
              onClick={() => handleRemoveInterest(userInterest.id)}
              className="ml-1 hover:bg-orange-300 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Badge>
      ))}
    </div>
  );
};

export default InterestsBadges;
