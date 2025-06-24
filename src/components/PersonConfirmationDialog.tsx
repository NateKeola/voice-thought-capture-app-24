
import React, { useState } from 'react';
import { DetectedPerson } from '@/services/PersonDetectionService';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface PersonConfirmationDialogProps {
  open: boolean;
  detectedPeople: DetectedPerson[];
  onConfirm: (confirmedPeople: DetectedPerson[]) => void;
  onSkip: () => void;
  onClose: () => void;
}

const PersonConfirmationDialog: React.FC<PersonConfirmationDialogProps> = ({
  open,
  detectedPeople,
  onConfirm,
  onSkip,
  onClose
}) => {
  const [selectedPeople, setSelectedPeople] = useState<DetectedPerson[]>(
    detectedPeople.filter(p => p.confidence > 0.8)
  );

  const handlePersonToggle = (person: DetectedPerson, checked: boolean) => {
    if (checked) {
      setSelectedPeople(prev => [...prev, person]);
    } else {
      setSelectedPeople(prev => prev.filter(p => p.name !== person.name));
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedPeople);
    onClose();
  };

  const handleSkip = () => {
    onSkip();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>People Mentioned</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            I detected these people in your memo. Select which ones to add to your contacts:
          </p>
          
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {detectedPeople.map((person, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <Checkbox
                  checked={selectedPeople.some(p => p.name === person.name)}
                  onCheckedChange={(checked) => 
                    handlePersonToggle(person, checked as boolean)
                  }
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{person.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(person.confidence * 100)}%
                    </Badge>
                  </div>
                  
                  {person.relationship && (
                    <div className="text-sm text-blue-600 mb-1">
                      {person.relationship}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 line-clamp-2">
                    "{person.context}"
                  </div>
                  
                  <Badge variant="outline" className="text-xs mt-1">
                    {person.mentionType}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              Skip
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              Add {selectedPeople.length} Contact{selectedPeople.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PersonConfirmationDialog;
