
import { supabase } from '@/integrations/supabase/client';
import { Achievement, AchievementProgress, AchievementTriggerType } from '@/types/achievements';
import { ACHIEVEMENT_DEFINITIONS, getAchievementById } from '@/data/achievementDefinitions';
import { getUserId } from '@/utils/authUtils';

export class AchievementService {
  private static instance: AchievementService;
  private progressCache: Map<string, AchievementProgress[]> = new Map();

  static getInstance(): AchievementService {
    if (!AchievementService.instance) {
      AchievementService.instance = new AchievementService();
    }
    return AchievementService.instance;
  }

  async getUserProgress(userId?: string): Promise<AchievementProgress[]> {
    const currentUserId = userId || await getUserId();
    if (!currentUserId) return [];

    // Check cache first
    if (this.progressCache.has(currentUserId)) {
      return this.progressCache.get(currentUserId)!;
    }

    const { data, error } = await supabase
      .from('achievement_progress')
      .select('*')
      .eq('user_id', currentUserId);

    if (error) {
      console.error('Error fetching achievement progress:', error);
      return [];
    }

    // Cache the result
    this.progressCache.set(currentUserId, data || []);
    return data || [];
  }

  async initializeUserAchievements(userId?: string): Promise<void> {
    const currentUserId = userId || await getUserId();
    if (!currentUserId) return;

    const existingProgress = await this.getUserProgress(currentUserId);
    const existingIds = new Set(existingProgress.map(p => p.achievement_id));

    const newAchievements = ACHIEVEMENT_DEFINITIONS.filter(
      achievement => !existingIds.has(achievement.id)
    );

    if (newAchievements.length === 0) return;

    const inserts = newAchievements.map(achievement => ({
      user_id: currentUserId,
      achievement_id: achievement.id,
      current_progress: 0,
      unlocked: false
    }));

    const { error } = await supabase
      .from('achievement_progress')
      .insert(inserts);

    if (error) {
      console.error('Error initializing achievements:', error);
    } else {
      // Clear cache to force refresh
      this.progressCache.delete(currentUserId);
    }
  }

  async updateProgress(
    achievementId: string,
    incrementBy: number = 1,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    const userId = await getUserId();
    if (!userId) return false;

    const achievement = getAchievementById(achievementId);
    if (!achievement) return false;

    try {
      const { data, error } = await supabase.rpc('update_achievement_progress', {
        p_user_id: userId,
        p_achievement_id: achievementId,
        p_progress_increment: incrementBy,
        p_target_progress: achievement.targetProgress
      });

      if (error) {
        console.error('Error updating achievement progress:', error);
        return false;
      }

      // Clear cache to force refresh
      this.progressCache.delete(userId);

      // Return true if achievement was newly unlocked
      return data === true;
    } catch (error) {
      console.error('Error in updateProgress:', error);
      return false;
    }
  }

  async triggerAchievementCheck(
    triggerType: AchievementTriggerType,
    context?: Record<string, any>
  ): Promise<Achievement[]> {
    const userId = await getUserId();
    if (!userId) return [];

    const relevantAchievements = ACHIEVEMENT_DEFINITIONS.filter(
      achievement => achievement.triggerType === triggerType
    );

    const newlyUnlocked: Achievement[] = [];

    for (const achievement of relevantAchievements) {
      const wasUnlocked = await this.checkAndUpdateAchievement(achievement, context);
      if (wasUnlocked) {
        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  }

  private async checkAndUpdateAchievement(
    achievement: Achievement,
    context?: Record<string, any>
  ): Promise<boolean> {
    switch (achievement.triggerType) {
      case 'memo_created':
        return this.handleMemoCreated(achievement, context);
      case 'task_completed':
        return this.updateProgress(achievement.id);
      case 'voice_memo':
        return this.updateProgress(achievement.id);
      case 'search_performed':
        return this.updateProgress(achievement.id);
      case 'tag_added':
        return this.updateProgress(achievement.id);
      case 'follow_up_completed':
        return this.updateProgress(achievement.id);
      case 'early_morning':
        return this.handleTimeBasedMemo(achievement, context, true);
      case 'late_night':
        return this.handleTimeBasedMemo(achievement, context, false);
      case 'speed_completion':
        return this.handleSpeedCompletion(achievement, context);
      case 'overdue_completion':
        return this.handleOverdueCompletion(achievement, context);
      default:
        return this.updateProgress(achievement.id);
    }
  }

  private async handleMemoCreated(achievement: Achievement, context?: Record<string, any>): Promise<boolean> {
    // Handle specific memo types
    if (achievement.id === 'idea_generator' && context?.memoType !== 'should') {
      return false;
    }
    return this.updateProgress(achievement.id);
  }

  private async handleTimeBasedMemo(achievement: Achievement, context?: Record<string, any>, isEarly: boolean): Promise<boolean> {
    const createdAt = context?.createdAt ? new Date(context.createdAt) : new Date();
    const hour = createdAt.getHours();
    
    if (isEarly && hour < 9) {
      return this.updateProgress(achievement.id);
    } else if (!isEarly && hour >= 22) {
      return this.updateProgress(achievement.id);
    }
    
    return false;
  }

  private async handleSpeedCompletion(achievement: Achievement, context?: Record<string, any>): Promise<boolean> {
    const createdAt = context?.createdAt ? new Date(context.createdAt) : null;
    const completedAt = new Date();
    
    if (createdAt && (completedAt.getTime() - createdAt.getTime()) <= 3600000) { // 1 hour
      return this.updateProgress(achievement.id);
    }
    
    return false;
  }

  private async handleOverdueCompletion(achievement: Achievement, context?: Record<string, any>): Promise<boolean> {
    const isOverdue = context?.isOverdue || false;
    if (isOverdue) {
      return this.updateProgress(achievement.id);
    }
    return false;
  }

  clearCache(): void {
    this.progressCache.clear();
  }
}

export const achievementService = AchievementService.getInstance();
