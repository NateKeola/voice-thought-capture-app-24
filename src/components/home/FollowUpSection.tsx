
import React from 'react';
import { Memo } from '@/types';
import { FollowUpDetectionService } from '@/services/FollowUpDetectionService';
import FollowUpCard from './FollowUpCard';
import { CheckCircle2, Calendar } from 'lucide-react';

interface FollowUpSectionProps {
  memos: Memo[];
}

const FollowUpSection: React.FC<FollowUpSectionProps> = ({ memos }) => {
  const mostRecentFollowUp = FollowUpDetectionService.getMostRecentFollowUp(memos);

  if (!mostRecentFollowUp) {
    return (
      <section className="w-full max-w-md mb-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-400 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6" />
            <div>
              <h3 className="font-bold text-lg">All Caught Up!</h3>
              <p className="text-sm opacity-90">No pending follow-ups at the moment</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-md mb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-400 rounded-t-2xl p-4 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6" />
          <div>
            <h3 className="font-bold text-lg">Next Follow Up</h3>
            <p className="text-sm opacity-90">Recent actionable item</p>
          </div>
        </div>
      </div>
      
      {/* Follow-up Card */}
      <div className="bg-white rounded-b-2xl shadow-lg overflow-hidden">
        <FollowUpCard followUp={mostRecentFollowUp} />
      </div>
    </section>
  );
};

export default FollowUpSection;
