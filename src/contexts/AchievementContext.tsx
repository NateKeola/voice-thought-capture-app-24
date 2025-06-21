
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Achievement } from '@/types/achievements';
import { useAchievementTriggers } from '@/hooks/useAchievementTriggers';
import { useAuth } from '@/hooks/useAuth';
import { achievementService } from '@/services/achievementService';
import AchievementNotification from '@/components/achievements/AchievementNotification';

interface AchievementContextType {
  triggerMemoCreated: (memoType?: string, isVoice?: boolean) => void;
  triggerTaskCompleted: (task?: any) => void;
  triggerSearchPerformed: () => void;
  triggerTagAdded: () => void;
  triggerFollowUpCompleted: () => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export const AchievementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notificationQueue, setNotificationQueue] = useState<Achievement[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Achievement | null>(null);
  const { user } = useAuth();
  const triggers = useAchievementTriggers();

  // Initialize achievements for new users
  useEffect(() => {
    if (user) {
      achievementService.initializeUserAchievements();
    }
  }, [user]);

  // Process notification queue
  useEffect(() => {
    if (!currentNotification && notificationQueue.length > 0) {
      const [nextNotification, ...rest] = notificationQueue;
      setCurrentNotification(nextNotification);
      setNotificationQueue(rest);
    }
  }, [currentNotification, notificationQueue]);

  const addNotification = (achievements: Achievement[]) => {
    if (achievements.length > 0) {
      setNotificationQueue(prev => [...prev, ...achievements]);
    }
  };

  const triggerMemoCreated = async (memoType?: string, isVoice?: boolean) => {
    const newAchievements = await triggers.triggerMemoCreated(memoType, isVoice);
    addNotification(newAchievements.flat());
  };

  const triggerTaskCompleted = async (task?: any) => {
    const newAchievements = await triggers.triggerTaskCompleted(task);
    addNotification(newAchievements);
  };

  const triggerSearchPerformed = async () => {
    const newAchievements = await triggers.triggerSearchPerformed();
    addNotification(newAchievements);
  };

  const triggerTagAdded = async () => {
    const newAchievements = await triggers.triggerTagAdded();
    addNotification(newAchievements);
  };

  const triggerFollowUpCompleted = async () => {
    const newAchievements = await triggers.triggerFollowUpCompleted();
    addNotification(newAchievements);
  };

  return (
    <AchievementContext.Provider value={{
      triggerMemoCreated,
      triggerTaskCompleted,
      triggerSearchPerformed,
      triggerTagAdded,
      triggerFollowUpCompleted
    }}>
      {children}
      {currentNotification && (
        <AchievementNotification
          achievement={currentNotification}
          isVisible={!!currentNotification}
          onClose={() => setCurrentNotification(null)}
        />
      )}
    </AchievementContext.Provider>
  );
};

export const useAchievementContext = () => {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error('useAchievementContext must be used within an AchievementProvider');
  }
  return context;
};
