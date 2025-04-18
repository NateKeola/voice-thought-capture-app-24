
import React from 'react';
import { Badge } from '@/types';
import { renderProfileIcon } from '@/utils/iconRenderer';

interface AchievementBadgeProps {
  badge: Badge;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ badge }) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center">
        <div className={`${badge.earned ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'} w-12 h-12 rounded-full flex items-center justify-center mr-4`}>
          {renderProfileIcon(badge.icon)}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">{badge.title}</h4>
              <p className="text-gray-500 text-sm">{badge.description}</p>
            </div>
            {badge.earned && (
              <div className="bg-green-100 py-1 px-2 rounded-lg">
                <span className="text-green-600 text-xs font-medium">Earned</span>
              </div>
            )}
          </div>
          {badge.earned ? (
            <p className="text-gray-400 text-xs mt-1">Achieved on {badge.date}</p>
          ) : (
            <div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-500 text-xs font-medium">{badge.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full" 
                  style={{ width: `${badge.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementBadge;
