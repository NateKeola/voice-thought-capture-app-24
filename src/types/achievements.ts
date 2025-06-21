
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  targetProgress: number;
  triggerType: AchievementTriggerType;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementProgress {
  id: string;
  user_id: string;
  achievement_id: string;
  current_progress: number;
  unlocked: boolean;
  unlocked_at: string | null;
  last_updated: string;
  metadata: Record<string, any>;
  created_at: string;
}

export type AchievementCategory = 
  | 'milestone'
  | 'time-based'
  | 'productivity'
  | 'creativity'
  | 'social'
  | 'engagement';

export type AchievementTriggerType =
  | 'memo_created'
  | 'task_completed'
  | 'voice_memo'
  | 'search_performed'
  | 'tag_added'
  | 'follow_up_completed'
  | 'early_morning'
  | 'late_night'
  | 'consecutive_days'
  | 'speed_completion'
  | 'overdue_completion'
  | 'should_acted_upon'
  | 'people_mentioned';

export interface AchievementUnlock {
  achievement: Achievement;
  progress: AchievementProgress;
  isNewUnlock: boolean;
}
