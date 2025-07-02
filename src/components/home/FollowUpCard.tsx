
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, User, ArrowRight } from "lucide-react";
import { DetectedFollowUp } from '@/services/FollowUpDetectionService';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { extractMemoMetadata } from '@/utils/memoMetadata';

interface FollowUpCardProps {
  followUp: DetectedFollowUp;
}

const FollowUpCard: React.FC<FollowUpCardProps> = ({ followUp }) => {
  const navigate = useNavigate();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const handleViewMemo = () => {
    navigate(`/memo/${followUp.memoId}`);
  };

  // Clean the text to remove contact ID tags
  const { cleanText } = extractMemoMetadata(followUp.text);

  return (
    <Card className="w-full border-l-4 border-l-orange-400 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(followUp.priority)}`}>
                {followUp.priority.toUpperCase()}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(followUp.createdAt), { addSuffix: true })}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-orange-500" />
              <span className="font-medium text-gray-800">{followUp.contactName}</span>
            </div>
            
            <p className="text-sm text-gray-700 line-clamp-2 mb-3">
              {cleanText}
            </p>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Action:</span>
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                {followUp.action}
              </span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewMemo}
            className="flex-shrink-0"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FollowUpCard;
