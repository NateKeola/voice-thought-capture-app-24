
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
  // Clean the text content by removing any tags like [category:appointments]
  const cleanText = (text: string) => {
    return text.replace(/\[[\w\s:]+\]/g, '').trim();
  };

  const [text, setText] = useState(cleanText(initialMemo?.text || ''));
  const [title, setTitle] = useState(initialMemo?.title || '');
  const [isSaving, setIsSaving] = useState(false);
  const [detectedPeople, setDetectedPeople] = useState<DetectedPerson[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<DetectedPerson[]>([]);

  // Detect people when text changes
  useEffect(() => {
    if (text.trim()) {
      const people = PersonDetectionService.detectPeople(text);
      setDetectedPeople(people);
    } else {
      setDetectedPeople([]);
      setSelectedPeople([]);
    }
  }, [text]);

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

  const handleSave = async () => {
    if (!text.trim()) return;
    
    setIsSaving(true);
    try {
      await onSave({ 
        text, 
        type: initialMemo?.type || 'note', 
        title: title.trim() || undefined,
        linkedPeople: selectedPeople
      });
    } finally {
      setIsSaving(false);
    }
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

            {/* People Detection Section */}
            {detectedPeople.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-blue-600" />
                  <Label className="text-sm font-medium text-gray-700">
                    Link People ({detectedPeople.length} detected)
                  </Label>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {detectedPeople.map((person, index) => (
                    <PersonProposalCard
                      key={`${person.name}-${index}`}
                      person={person}
                      isSelected={selectedPeople.some(p => p.name === person.name)}
                      onToggle={handlePersonToggle}
                    />
                  ))}
                </div>
                {selectedPeople.length > 0 && (
                  <p className="text-sm text-blue-600 mt-2">
                    {selectedPeople.length} person{selectedPeople.length !== 1 ? 's' : ''} selected
                  </p>
                )}
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
              className="bg-orange-500 hover:bg-orange-600"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              {isSaving ? 'Processing...' : 'Continue'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default MemoEditScreen;
