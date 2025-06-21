
import { useState, useEffect } from 'react';
import { Achievement, AchievementProgress } from '@/types/achievements';
import { achievementService } from '@/services/achievementService';
import { ACHIEVEMENT_DEFINITIONS } from '@/data/achievementDefinitions';
import { useAuth } from '@/hooks/useAuth';

export const useAchievements = () => {
  const [progress, setProgress] = useState<AchievementProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadProgress();
      initializeAchievements();
    }
  }, [user]);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const userProgress = await achievementService.getUserProgress();
      setProgress(userProgress);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeAchievements = async () => {
    try {
      await achievementService.initializeUserAchievements();
      await loadProgress(); // Reload to get initialized achievements
    } catch (error) {
      console.error('Error initializing achievements:', error);
    }
  };

  const getProgressForAchievement = (achievementId: string): AchievementProgress | undefined => {
    return progress.find(p => p.achievement_id === achievementId);
  };

  const getUnlockedAchievements = (): Achievement[] => {
    const unlockedIds = progress.filter(p => p.unlocked).map(p => p.achievement_id);
    return ACHIEVEMENT_DEFINITIONS.filter(achievement => unlockedIds.includes(achievement.id));
  };

  const getLockedAchievements = (): Achievement[] => {
    const unlockedIds = progress.filter(p => p.unlocked).map(p => p.achievement_id);
    return ACHIEVEMENT_DEFINITIONS.filter(achievement => !unlockedIds.includes(achievement.id));
  };

  const getCompletionPercentage = (): number => {
    const totalAchievements = ACHIEVEMENT_DEFINITIONS.length;
    const unlockedCount = progress.filter(p => p.unlocked).length;
    return totalAchievements > 0 ? Math.round((unlockedCount / totalAchievements) * 100) : 0;
  };

  return {
    progress,
    loading,
    loadProgress,
    getProgressForAchievement,
    getUnlockedAchievements,
    getLockedAchievements,
    getCompletionPercentage
  };
};
