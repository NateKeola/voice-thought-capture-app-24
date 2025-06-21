
import React, { useState } from 'react';
import { Achievement, AchievementCategory } from '@/types/achievements';
import { ACHIEVEMENT_DEFINITIONS } from '@/data/achievementDefinitions';
import { useAchievements } from '@/hooks/useAchievements';
import AchievementBadge from './AchievementBadge';

const CATEGORIES: { key: AchievementCategory; label: string; icon: string }[] = [
  { key: 'milestone', label: 'Milestones', icon: 'flag' },
  { key: 'time-based', label: 'Time-based', icon: 'clock' },
  { key: 'productivity', label: 'Productivity', icon: 'check-circle' },
  { key: 'creativity', label: 'Creativity', icon: 'lightbulb' },
  { key: 'social', label: 'Social', icon: 'users' },
  { key: 'engagement', label: 'Engagement', icon: 'zap' }
];

const AchievementsList: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const { progress, loading, getProgressForAchievement, getCompletionPercentage } = useAchievements();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading achievements...</div>
      </div>
    );
  }

  const filteredAchievements = ACHIEVEMENT_DEFINITIONS.filter(achievement => {
    if (selectedCategory !== 'all' && achievement.category !== selectedCategory) {
      return false;
    }
    
    if (showUnlockedOnly) {
      const achievementProgress = getProgressForAchievement(achievement.id);
      return achievementProgress?.unlocked || false;
    }
    
    return true;
  });

  const completionPercentage = getCompletionPercentage();
  const unlockedCount = progress.filter(p => p.unlocked).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {completionPercentage}%
          </div>
          <div className="text-gray-600 mb-4">
            {unlockedCount} of {ACHIEVEMENT_DEFINITIONS.length} achievements unlocked
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            All
          </button>
          {CATEGORIES.map(category => (
            <button
              key={category.key}
              onClick={() => setSelectedCategory(category.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                selectedCategory === category.key
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showUnlockedOnly}
              onChange={(e) => setShowUnlockedOnly(e.target.checked)}
              className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-600">Show unlocked only</span>
          </label>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="space-y-4">
        {filteredAchievements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No achievements found for the selected filters.
          </div>
        ) : (
          filteredAchievements.map(achievement => (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              progress={getProgressForAchievement(achievement.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default AchievementsList;
