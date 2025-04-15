
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Memo } from "@/types";
import { formatDistanceToNow } from 'date-fns';
import { FileAudio, CheckCircle, CircleAlert, FileText } from "lucide-react";

interface MemoCardProps {
  memo: Memo;
  onClick?: () => void;
}

const MemoCard: React.FC<MemoCardProps> = ({ memo, onClick }) => {
  const { text, type, createdAt } = memo;
  
  const getTypeIcon = () => {
    switch (type) {
      case 'note':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'task':
        return <CheckCircle className="h-5 w-5 text-purple-600" />;
      case 'idea':
        return <CircleAlert className="h-5 w-5 text-orange-500" />;
      default:
        return <FileText className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeBackground = () => {
    switch (type) {
      case 'note':
        return 'bg-blue-50';
      case 'task':
        return 'bg-purple-50';
      case 'idea':
        return 'bg-orange-50';
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <Card 
      className="mb-4 cursor-pointer hover:shadow-md transition-shadow border border-gray-100"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mt-1 ${getTypeBackground()}`}>
            {getTypeIcon()}
          </div>
          <div className="flex-1">
            <p className="text-base text-gray-800 font-medium">{text}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-3 px-4 flex justify-between text-xs text-gray-500 border-t border-gray-100 mt-2">
        <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
        <div className="flex items-center gap-1">
          <FileAudio className="h-3 w-3 text-orange-500" />
          <span className="text-orange-500 font-medium">Audio</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MemoCard;
