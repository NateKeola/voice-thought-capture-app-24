
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, X, Users } from "lucide-react";
import { Memo, MemoType } from "@/types";
import { PersonDetectionService, DetectedPerson } from "@/services/PersonDetectionService";
import PersonProposalCard from './PersonProposalCard';
import PersonConfirmationDialog from '../PersonConfirmationDialog';
import { RelationshipLinkingService } from '@/services/RelationshipLinkingService';
import { useProfiles } from '@/hooks/useProfiles';
import { useToast } from '@/components/ui/use-toast';
import { extractMemoMetadata } from '@/utils/memoMetadata';

interface MemoEditScreenProps {
  initialMemo?: Partial<Memo>;
  onSave: (memo: { text: string; type: MemoType; title?: string; linkedPeople?: DetectedPerson[] }) => Promise<void>;
  onCancel: () => void;
  isCreating?: boolean;
}

const MemoEditScreen: React.FC<MemoEditScreenProps> = ({
  initialMemo,
  onSave,
  onCancel,
  isCreating = false
}) => {
  // Clean the text content by removing any tags for editing
  const getEditableText = (text: string) => {
    const metadata = extractMemoMetadata(text || '');
    return metadata.cleanText;
  };

  const [text, setText] = useState(getEditableText(initialMemo?.text || ''));
  const [title, setTitle] = useState(initialMemo?.title || '');
  const [isSaving, setIsSaving] = useState(false);
  const [detectedPeople, setDetectedPeople] = useState<DetectedPerson[]>([]);
  const [showPersonConfirmation, setShowPersonConfirmation] = useState(false);
  
  const { createProfile } = useProfiles();
  const { toast } = useToast();

  // Detect people when text changes
  useEffect(() => {
    if (text.trim()) {
      const people = PersonDetectionService.detectPeople(text);
      console.log('Detected people:', people);
      setDetectedPeople(people);
    } else {
      setDetectedPeople([]);
    }
  }, [text]);

  const handleSave = async () => {
    if (!text.trim()) return;
    
    // If people are detected, show confirmation dialog
    if (detectedPeople.length > 0) {
      setShowPersonConfirmation(true);
      return;
    }
    
    // Save without people
    await saveWithPeople([]);
  };

  const saveWithPeople = async (selectedPeople: DetectedPerson[]) => {
    setIsSaving(true);
    try {
      // Create the final memo text with contact tags for selected people
      let finalText = text;
      
      // Add contact tags for selected people
      if (selectedPeople.length > 0) {
        const contactTags = selectedPeople.map(person => `[Contact: ${person.name}]`).join(' ');
        finalText = `${contactTags} ${text}`;
      }
      
      await onSave({ 
        text: finalText, 
        type: initialMemo?.type || 'note', 
        title: title.trim() || undefined,
        linkedPeople: selectedPeople
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePersonConfirmation = (selectedPeople: DetectedPerson[]) => {
    setShowPersonConfirmation(false);
    saveWithPeople(selectedPeople);
  };

  const handleSaveAndAddToRelationships = async (selectedPeople: DetectedPerson[]) => {
    setShowPersonConfirmation(false);
    setIsSaving(true);
    
    try {
      // Create the final memo text with contact tags
      let finalText = text;
      const contactTags = selectedPeople.map(person => `[Contact: ${person.name}]`).join(' ');
      finalText = `${contactTags} ${text}`;

      // First save the memo with contact tags and title
      await onSave({ 
        text: finalText, 
        type: initialMemo?.type || 'note', 
        title: title.trim() || undefined,
        linkedPeople: selectedPeople
      });

      // Then create relationships for selected people
      for (const person of selectedPeople) {
        try {
          const profileData = RelationshipLinkingService.createProfileData(person);
          await createProfile.mutateAsync(profileData);
        } catch (error) {
          console.error('Error creating profile for', person.name, error);
        }
      }

      toast({
        title: "Memo and relationships saved",
        description: `Added ${selectedPeople.length} new relationship${selectedPeople.length !== 1 ? 's' : ''} to your contacts.`
      });

    } catch (error) {
      console.error('Error saving memo and relationships:', error);
      toast({
        title: "Error",
        description: "There was a problem saving your memo and relationships.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipPeopleDetection = () => {
    setShowPersonConfirmation(false);
    saveWithPeople([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {isCreating ? 'Create Memo' : 'Edit Memo'}
            </h1>
          </div>
        </div>

        {/* Edit Form */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="text-lg text-gray-800">
              {isCreating ? 'New Memo' : 'Edit Memo'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter memo title..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="content" className="text-sm font-medium text-gray-700">
                Content
              </Label>
              <Textarea
                id="content"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your memo content..."
                className="mt-1 min-h-[200px] resize-none border-blue-100 focus-visible:ring-orange-500"
              />
            </div>

            {/* People Detection Preview */}
            {detectedPeople.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-blue-600" />
                  <Label className="text-sm font-medium text-gray-700">
                    People Detected ({detectedPeople.length})
                  </Label>
                </div>
                <div className="text-sm text-blue-600">
                  We found {detectedPeople.length} person{detectedPeople.length !== 1 ? 's' : ''} mentioned in your memo. 
                  You'll be able to link them when you save.
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between bg-gray-50 rounded-b-lg">
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            
            <Button 
              onClick={handleSave} 
              disabled={!text.trim() || isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Memo'}
            </Button>
          </CardFooter>
        </Card>

        {/* Person Confirmation Dialog */}
        <PersonConfirmationDialog
          open={showPersonConfirmation}
          detectedPeople={detectedPeople}
          onConfirm={handlePersonConfirmation}
          onSkip={handleSkipPeopleDetection}
          onClose={() => setShowPersonConfirmation(false)}
          onSaveAndAddToRelationships={handleSaveAndAddToRelationships}
        />
      </div>
    </div>
  );
};

export default MemoEditScreen;
