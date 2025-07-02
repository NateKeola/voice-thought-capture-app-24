
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useMemos } from '@/contexts/MemoContext';
import { FollowUpDetectionService } from '@/services/FollowUpDetectionService';
import FollowUpCard from '@/components/home/FollowUpCard';

const FollowUpsPage = () => {
  const navigate = useNavigate();
  const { memos } = useMemos();
  
  const allFollowUps = FollowUpDetectionService.detectFollowUps(memos);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/home')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Follow Ups</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {allFollowUps.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No follow-ups found</div>
            <div className="text-gray-400 text-sm">Your actionable items will appear here</div>
          </div>
        ) : (
          <div className="space-y-4">
            {allFollowUps.map((followUp) => (
              <FollowUpCard key={followUp.id} followUp={followUp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowUpsPage;
