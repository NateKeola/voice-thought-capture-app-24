
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Memo } from "@/types";
import { formatDistanceToNow } from 'date-fns';
import { FileText, CheckCircle, CircleAlert, FileAudio } from "lucide-react";
import { TitleGenerationService } from '@/services/titleGeneration';

interface MemoCardProps {
  memo: Memo;
  onClick?: () => void;
}

const MemoCard: React.FC<MemoCardProps> = ({ memo, onClick }) => {
  const { text, type, createdAt, audioUrl, title } = memo;
  
  // Remove contact tags and metadata from display text
  const displayText = text
    .replace(/\[Contact:\s*[^\]]+\]/g, '')
    .replace(/\[category:\s*\w+\]/gi, '')
    .replace(/\[priority:\s*\w+\]/gi, '')
    .replace(/\[due:\s*[\w\s]+\]/gi, '')
    .trim();
  
  // Use the memo's title if it exists, otherwise generate one from clean text
  const memoTitle = title || TitleGenerationService.generateTitle(displayText, type);
  
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'note':
        return {
          icon: <FileText className="h-5 w-5" />,
          gradient: 'from-purple-500 via-pink-400 to-orange-400',
          bgClass: 'bg-purple-100',
          textClass: 'text-purple-600'
        };
      case 'task':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          gradient: 'from-blue-500 via-indigo-400 to-purple-400',
          bgClass: 'bg-blue-100',
          textClass: 'text-blue-600'
        };
      case 'idea':
        return {
          icon: <CircleAlert className="h-5 w-5" />,
          gradient: 'from-orange-500 via-amber-400 to-yellow-400',
          bgClass: 'bg-orange-100',
          textClass: 'text-orange-600'
        };
      default:
        return {
          icon: <FileText className="h-5 w-5" />,
          gradient: 'from-purple-500 via-pink-400 to-orange-400',
          bgClass: 'bg-purple-100',
          textClass: 'text-purple-600'
        };
    }
  };

  const config = getTypeConfig(type);

  return (
    <Card 
      className="relative overflow-hidden cursor-pointer transition-all hover:shadow-md group"
      onClick={onClick}
    >
      {/* Gradient border effect */}
      <div className={`absolute inset-0 opacity-0 bg-gradient-to-r ${config.gradient} group-hover:opacity-10 transition-opacity`} />
      
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className={`mt-1 p-2 rounded-lg ${config.bgClass} ${config.textClass}`}>
            {config.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 mb-2 text-sm leading-tight">
              {memoTitle}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{displayText}</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 pb-3 px-6 flex justify-between text-xs text-muted-foreground">
        <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
        {audioUrl && (
          <div className="flex items-center gap-1">
            <FileAudio className="h-3 w-3" />
            <span>Audio</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MemoCard;
