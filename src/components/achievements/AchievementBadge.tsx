
import React from 'react';
import { Achievement, AchievementProgress } from '@/types/achievements';
import { renderProfileIcon } from '@/utils/iconRenderer';
import { format } from 'date-fns';

interface AchievementBadgeProps {
  achievement: Achievement;
  progress?: AchievementProgress;
  size?: 'small' | 'medium' | 'large';
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  progress,
  size = 'medium'
}) => {
  const isUnlocked = progress?.unlocked || false;
  const currentProgress = progress?.current_progress || 0;
  const progressPercentage = Math.min((currentProgress / achievement.targetProgress) * 100, 100);

  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'w-12 h-12 text-sm';
      case 'large': return 'w-20 h-20 text-2xl';
      default: return 'w-16 h-16 text-lg';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'milestone': return 'bg-orange-100 text-orange-600';
      case 'time-based': return 'bg-blue-100 text-blue-600';
      case 'productivity': return 'bg-green-100 text-green-600';
      case 'creativity': return 'bg-purple-100 text-purple-600';
      case 'social': return 'bg-pink-100 text-pink-600';
      case 'engagement': return 'bg-cyan-100 text-cyan-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-start space-x-4">
        <div className="relative">
          <div className={`${getSizeClasses()} ${
            isUnlocked 
              ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)}` 
              : 'bg-gray-200'
          } rounded-full flex items-center justify-center ${!isUnlocked && 'opacity-50'}`}>
            <div className={`${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
              {renderProfileIcon(achievement.icon)}
            </div>
          </div>
          {isUnlocked && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
              {achievement.title}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(achievement.category)}`}>
              {achievement.category}
            </span>
          </div>
          
          <p className={`text-sm mb-3 ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
            {achievement.description}
          </p>
          
          {!isUnlocked && (
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{currentProgress}/{achievement.targetProgress}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
          
          {isUnlocked && progress?.unlocked_at && (
            <p className="text-xs text-gray-400">
              Unlocked {format(new Date(progress.unlocked_at), 'MMM dd, yyyy')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementBadge;
