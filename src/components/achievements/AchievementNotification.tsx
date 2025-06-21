
import React, { useEffect, useState } from 'react';
import { Achievement } from '@/types/achievements';
import { renderProfileIcon } from '@/utils/iconRenderer';

interface AchievementNotificationProps {
  achievement: Achievement;
  isVisible: boolean;
  onClose: () => void;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  isVisible,
  onClose
}) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setAnimate(true);
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className={`fixed top-20 left-4 right-4 z-50 transition-all duration-500 ${
      animate ? 'transform translate-y-0 opacity-100' : 'transform -translate-y-full opacity-0'
    }`}>
      <div className={`bg-gradient-to-r ${getRarityColor(achievement.rarity)} p-1 rounded-xl shadow-2xl`}>
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className={`w-16 h-16 bg-gradient-to-r ${getRarityColor(achievement.rarity)} rounded-full flex items-center justify-center animate-pulse`}>
                <div className="text-white text-2xl">
                  {renderProfileIcon(achievement.icon)}
                </div>
              </div>
              <div className="absolute -top-1 -right-1 text-2xl animate-bounce">
                🎉
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                Achievement Unlocked!
              </h3>
              <h4 className="text-md font-semibold text-gray-700 mb-1">
                {achievement.title}
              </h4>
              <p className="text-sm text-gray-600">
                {achievement.description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementNotification;
