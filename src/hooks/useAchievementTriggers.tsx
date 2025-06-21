
import { useCallback } from 'react';
import { achievementService } from '@/services/achievementService';
import { AchievementTriggerType } from '@/types/achievements';
import { useToast } from '@/hooks/use-toast';
import { getAchievementById } from '@/data/achievementDefinitions';

export const useAchievementTriggers = () => {
  const { toast } = useToast();

  const triggerAchievement = useCallback(async (
    triggerType: AchievementTriggerType,
    context?: Record<string, any>
  ) => {
    try {
      const newlyUnlocked = await achievementService.triggerAchievementCheck(triggerType, context);
      
      // Show notifications for newly unlocked achievements
      newlyUnlocked.forEach(achievement => {
        toast({
          title: "🎉 Achievement Unlocked!",
          description: `${achievement.title}: ${achievement.description}`,
          duration: 5000,
        });
      });

      return newlyUnlocked;
    } catch (error) {
      console.error('Error triggering achievement:', error);
      return [];
    }
  }, [toast]);

  // Specific trigger functions
  const triggerMemoCreated = useCallback((memoType?: string, isVoice?: boolean) => {
    const promises = [triggerAchievement('memo_created', { memoType })];
    
    if (isVoice) {
      promises.push(triggerAchievement('voice_memo'));
    }

    // Check time-based achievements
    const now = new Date();
    const hour = now.getHours();
    
    if (hour < 9) {
      promises.push(triggerAchievement('early_morning', { createdAt: now }));
    } else if (hour >= 22) {
      promises.push(triggerAchievement('late_night', { createdAt: now }));
    }

    return Promise.all(promises);
  }, [triggerAchievement]);

  const triggerTaskCompleted = useCallback((task?: any) => {
    const context: Record<string, any> = {};
    
    if (task?.createdAt) {
      context.createdAt = task.createdAt;
      
      // Check if it's a speed completion (within 1 hour)
      const createdAt = new Date(task.createdAt);
      const completedAt = new Date();
      const timeDiff = completedAt.getTime() - createdAt.getTime();
      
      if (timeDiff <= 3600000) { // 1 hour in milliseconds
        triggerAchievement('speed_completion', context);
      }
    }

    // Check if task was overdue
    if (task?.isOverdue) {
      context.isOverdue = true;
      triggerAchievement('overdue_completion', context);
    }

    return triggerAchievement('task_completed', context);
  }, [triggerAchievement]);

  const triggerSearchPerformed = useCallback(() => {
    return triggerAchievement('search_performed');
  }, [triggerAchievement]);

  const triggerTagAdded = useCallback(() => {
    return triggerAchievement('tag_added');
  }, [triggerAchievement]);

  const triggerFollowUpCompleted = useCallback(() => {
    return triggerAchievement('follow_up_completed');
  }, [triggerAchievement]);

  return {
    triggerAchievement,
    triggerMemoCreated,
    triggerTaskCompleted,
    triggerSearchPerformed,
    triggerTagAdded,
    triggerFollowUpCompleted
  };
};
