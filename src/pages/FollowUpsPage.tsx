
import React, { useState } from 'react';
import { ArrowLeft, Calendar, CheckCircle2, User, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMemos } from '@/contexts/MemoContext';
import { FollowUpDetectionService, DetectedFollowUp } from '@/services/FollowUpDetectionService';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from 'date-fns';
import { extractMemoMetadata } from '@/utils/memoMetadata';

const FollowUpsPage = () => {
  const navigate = useNavigate();
  const { memos } = useMemos();
  const [completedFollowUps, setCompletedFollowUps] = useState<Set<string>>(new Set());

  const allFollowUps = FollowUpDetectionService.detectFollowUps(memos);
  const activeFollowUps = allFollowUps.filter(followUp => !completedFollowUps.has(followUp.id));

  const handleBack = () => {
    navigate('/home');
  };

  const handleCompleteFollowUp = (followUpId: string) => {
    setCompletedFollowUps(prev => new Set([...prev, followUpId]));
  };

  const handleViewMemo = (memoId: string) => {
    navigate(`/memo/${memoId}`);
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBack}
            className="flex items-center text-orange-500 hover:text-orange-600"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center text-gray-800">
            <Calendar className="h-5 w-5 mr-2" />
            <h1 className="text-lg font-semibold">Follow Ups</h1>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="max-w-md mx-auto">
          {/* Summary */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{activeFollowUps.length}</div>
              <div className="text-sm text-gray-600">Pending Follow-ups</div>
            </div>
          </div>

          {/* Follow-ups List */}
          {activeFollowUps.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-800 mb-1">All Caught Up!</h3>
              <p className="text-sm text-gray-600">No pending follow-ups at the moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeFollowUps.map((followUp) => {
                const { cleanText } = extractMemoMetadata(followUp.text);
                
                return (
                  <Card key={followUp.id} className="border-l-4 border-l-orange-400 shadow-sm">
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
                          
                          <p className="text-sm text-gray-700 mb-3">
                            {cleanText}
                          </p>
                          
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs text-gray-500">Action:</span>
                            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                              {followUp.action}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewMemo(followUp.memoId)}
                              className="text-xs"
                            >
                              View Memo
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleCompleteFollowUp(followUp.id)}
                              className="text-xs bg-green-500 hover:bg-green-600"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Complete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowUpsPage;
