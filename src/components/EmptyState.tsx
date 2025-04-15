
import React from 'react';
import { Mic, FileText, LightbulbIcon } from "lucide-react";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description }) => {
  const renderIcon = () => {
    switch (icon) {
      case 'mic':
        return <Mic className="h-12 w-12 text-orange-500" />;
      case 'file':
        return <FileText className="h-12 w-12 text-orange-500" />;
      case 'lightbulb':
        return <LightbulbIcon className="h-12 w-12 text-orange-500" />;
      default:
        return <Mic className="h-12 w-12 text-orange-500" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="bg-orange-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
        {renderIcon()}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-xs">{description}</p>
    </div>
  );
};
