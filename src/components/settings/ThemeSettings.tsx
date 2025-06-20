
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun } from 'lucide-react';

interface ThemeSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ isOpen, onClose }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode is already enabled
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
  }, []);

  const toggleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled);
    localStorage.setItem('darkMode', enabled.toString());
    
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Theme and Appearance</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {darkMode ? (
                <Moon className="h-5 w-5 text-gray-600" />
              ) : (
                <Sun className="h-5 w-5 text-yellow-500" />
              )}
              <div>
                <h3 className="text-sm font-medium text-gray-900">Dark Mode</h3>
                <p className="text-xs text-gray-500">Switch between light and dark themes</p>
              </div>
            </div>
            <Switch 
              checked={darkMode} 
              onCheckedChange={toggleDarkMode}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ThemeSettings;
