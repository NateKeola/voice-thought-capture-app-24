
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
        return <FileText className="h-5 w-5 text-memo-note" />;
      case 'task':
        return <CheckCircle className="h-5 w-5 text-memo-task" />;
      case 'idea':
        return <CircleAlert className="h-5 w-5 text-memo-idea" />;
      default:
        return <FileText className="h-5 w-5 text-memo-note" />;
    }
  };

  return (
    <Card 
      className={`mb-4 cursor-pointer hover:shadow-md transition-shadow memo-card-${type}`}
      onClick={onClick}
    >
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div className="mt-1">{getTypeIcon()}</div>
          <div className="flex-1">
            <p className="text-base text-foreground">{text}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-3 px-6 flex justify-between text-xs text-muted-foreground">
        <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
        <div className="flex items-center gap-1">
          <FileAudio className="h-3 w-3" />
          <span>Audio</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default MemoCard;
