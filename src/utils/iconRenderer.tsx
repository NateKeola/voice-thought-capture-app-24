
import React from 'react';
import { 
  Sun, CheckCircle, Archive, Lightbulb, Users, Mic, 
  Moon, Bell, Palette, Lock, User, HelpCircle, Info 
} from 'lucide-react';

export const renderProfileIcon = (iconName: string): React.ReactNode => {
  const iconProps = { className: "h-6 w-6" };
  
  switch(iconName) {
    case 'sun': return <Sun {...iconProps} />;
    case 'check-circle': return <CheckCircle {...iconProps} />;
    case 'archive': return <Archive {...iconProps} />;
    case 'lightbulb': return <Lightbulb {...iconProps} />;
    case 'users': return <Users {...iconProps} />;
    case 'mic': return <Mic {...iconProps} />;
    case 'moon': return <Moon {...iconProps} />;
    case 'bell': return <Bell {...iconProps} />;
    case 'palette': return <Palette {...iconProps} />;
    case 'lock': return <Lock {...iconProps} />;
    case 'user': return <User {...iconProps} />;
    case 'help-circle': return <HelpCircle {...iconProps} />;
    case 'info': return <Info {...iconProps} />;
    default: return null;
  }
};
