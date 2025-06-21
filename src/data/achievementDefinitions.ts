
import { Achievement } from '@/types/achievements';

export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  // Milestone Achievements
  {
    id: 'first_memo',
    title: 'First Steps',
    description: 'Create your first memo',
    icon: 'play-circle',
    category: 'milestone',
    targetProgress: 1,
    triggerType: 'memo_created',
    rarity: 'common'
  },
  {
    id: 'memory_keeper',
    title: 'Memory Keeper',
    description: 'Create 100 memos',
    icon: 'archive',
    category: 'milestone',
    targetProgress: 100,
    triggerType: 'memo_created',
    rarity: 'epic'
  },

  // Time-based Achievements
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Create 5 memos before 9 AM',
    icon: 'sun',
    category: 'time-based',
    targetProgress: 5,
    triggerType: 'early_morning',
    rarity: 'rare'
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Create 10 memos after 10 PM',
    icon: 'moon',
    category: 'time-based',
    targetProgress: 10,
    triggerType: 'late_night',
    rarity: 'rare'
  },
  {
    id: 'daily_chronicler',
    title: 'Daily Chronicler',
    description: 'Create memos for 7 consecutive days',
    icon: 'calendar',
    category: 'time-based',
    targetProgress: 7,
    triggerType: 'consecutive_days',
    rarity: 'epic'
  },

  // Productivity Achievements
  {
    id: 'task_master',
    title: 'Task Master',
    description: 'Complete 50 tasks',
    icon: 'check-circle',
    category: 'productivity',
    targetProgress: 50,
    triggerType: 'task_completed',
    rarity: 'rare'
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Complete a task within 1 hour of creation',
    icon: 'zap',
    category: 'productivity',
    targetProgress: 1,
    triggerType: 'speed_completion',
    rarity: 'epic'
  },
  {
    id: 'procrastination_buster',
    title: 'Procrastination Buster',
    description: 'Complete 10 overdue tasks',
    icon: 'clock',
    category: 'productivity',
    targetProgress: 10,
    triggerType: 'overdue_completion',
    rarity: 'rare'
  },

  // Creativity Achievements
  {
    id: 'idea_generator',
    title: 'Idea Generator',
    description: 'Create 25 "should" memos',
    icon: 'lightbulb',
    category: 'creativity',
    targetProgress: 25,
    triggerType: 'memo_created',
    rarity: 'rare'
  },
  {
    id: 'dream_chaser',
    title: 'Dream Chaser',
    description: 'Act upon 5 "should" items',
    icon: 'target',
    category: 'creativity',
    targetProgress: 5,
    triggerType: 'should_acted_upon',
    rarity: 'epic'
  },

  // Social Achievements
  {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Create memos about 20 different people',
    icon: 'users',
    category: 'social',
    targetProgress: 20,
    triggerType: 'people_mentioned',
    rarity: 'rare'
  },
  {
    id: 'relationship_builder',
    title: 'Relationship Builder',
    description: 'Complete 25 follow-ups',
    icon: 'heart',
    category: 'social',
    targetProgress: 25,
    triggerType: 'follow_up_completed',
    rarity: 'epic'
  },

  // Engagement Achievements
  {
    id: 'voice_master',
    title: 'Voice Master',
    description: 'Record 100 voice memos',
    icon: 'mic',
    category: 'engagement',
    targetProgress: 100,
    triggerType: 'voice_memo',
    rarity: 'epic'
  },
  {
    id: 'organization_guru',
    title: 'Organization Guru',
    description: 'Add tags to 50 memos',
    icon: 'tag',
    category: 'engagement',
    targetProgress: 50,
    triggerType: 'tag_added',
    rarity: 'rare'
  },
  {
    id: 'search_master',
    title: 'Search Master',
    description: 'Perform 100 searches',
    icon: 'search',
    category: 'engagement',
    targetProgress: 100,
    triggerType: 'search_performed',
    rarity: 'rare'
  }
];

export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENT_DEFINITIONS.find(achievement => achievement.id === id);
};

export const getAchievementsByCategory = (category: string): Achievement[] => {
  return ACHIEVEMENT_DEFINITIONS.filter(achievement => achievement.category === category);
};
