
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ isOpen, onClose }) => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [dailySummaries, setDailySummaries] = useState(false);
  const [followUpReminders, setFollowUpReminders] = useState(true);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notification Preferences</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
              <p className="text-xs text-gray-500">Receive notifications on your device</p>
            </div>
            <Switch 
              checked={pushNotifications} 
              onCheckedChange={setPushNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Daily Summaries</h3>
              <p className="text-xs text-gray-500">Get a daily recap of your memos</p>
            </div>
            <Switch 
              checked={dailySummaries} 
              onCheckedChange={setDailySummaries}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Follow-up Reminders</h3>
              <p className="text-xs text-gray-500">Reminders for pending follow-ups</p>
            </div>
            <Switch 
              checked={followUpReminders} 
              onCheckedChange={setFollowUpReminders}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationSettings;
