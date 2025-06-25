
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DetectedPerson } from '@/services/PersonDetectionService';
import PersonProposalCard from './memo/PersonProposalCard';
import { Users, UserPlus } from 'lucide-react';

interface PersonConfirmationDialogProps {
  open: boolean;
  detectedPeople: DetectedPerson[];
  onConfirm: (selectedPeople: DetectedPerson[]) => void;
  onSkip: () => void;
  onClose: () => void;
  onSaveAndAddToRelationships?: (selectedPeople: DetectedPerson[]) => void;
}

const PersonConfirmationDialog: React.FC<PersonConfirmationDialogProps> = ({
  open,
  detectedPeople,
  onConfirm,
  onSkip,
  onClose,
  onSaveAndAddToRelationships
}) => {
  const [selectedPeople, setSelectedPeople] = useState<DetectedPerson[]>([]);

  const handlePersonToggle = (person: DetectedPerson) => {
    setSelectedPeople(prev => {
      const isSelected = prev.some(p => p.name === person.name);
      if (isSelected) {
        return prev.filter(p => p.name !== person.name);
      } else {
        return [...prev, person];
      }
    });
  };

  const handleConfirm = () => {
    onConfirm(selectedPeople);
    setSelectedPeople([]);
  };

  const handleSkip = () => {
    onSkip();
    setSelectedPeople([]);
  };

  const handleSaveAndAdd = () => {
    if (onSaveAndAddToRelationships) {
      onSaveAndAddToRelationships(selectedPeople);
    }
    setSelectedPeople([]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-blue-600" />
            People Detected in Your Memo
          </DialogTitle>
          <DialogDescription>
            We found {detectedPeople.length} person{detectedPeople.length !== 1 ? 's' : ''} mentioned in your memo. 
            Select which ones you'd like to tag:
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4">
          <div className="space-y-3">
            {detectedPeople.map((person, index) => (
              <PersonProposalCard
                key={`${person.name}-${index}`}
                person={person}
                isSelected={selectedPeople.some(p => p.name === person.name)}
                onToggle={handlePersonToggle}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleSkip}>
            Skip & Save Memo
          </Button>
          
          <Button 
            onClick={handleConfirm}
            disabled={selectedPeople.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save with {selectedPeople.length} Contact{selectedPeople.length !== 1 ? 's' : ''}
          </Button>

          {onSaveAndAddToRelationships && (
            <Button 
              onClick={handleSaveAndAdd}
              disabled={selectedPeople.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add to Relationships
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PersonConfirmationDialog;
