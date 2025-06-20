
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Users, Plus } from 'lucide-react';
import { DetectedPerson } from '@/utils/personDetection';

interface RelationshipSuggestionProps {
  detectedPerson: DetectedPerson;
  onAccept: (person: DetectedPerson) => void;
  onDismiss: () => void;
}

const RelationshipSuggestion: React.FC<RelationshipSuggestionProps> = ({
  detectedPerson,
  onAccept,
  onDismiss
}) => {
  return (
    <Card className="p-4 border-orange-200 bg-orange-50 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">
              Create relationship for {detectedPerson.fullName}?
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              Detected in: "{detectedPerson.context}"
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                Suggested: {detectedPerson.suggestedCategory}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <Button
            size="sm"
            onClick={() => onAccept(detectedPerson)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default RelationshipSuggestion;
