
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Profile } from '@/hooks/useProfiles';
import { useMemos } from '@/contexts/MemoContext';
import { useToast } from '@/components/ui/use-toast';

interface RelationshipsMemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
}

export function RelationshipsMemoModal({ isOpen, onClose, profile }: RelationshipsMemoModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingText, setRecordingText] = useState('');
  const [newMemoText, setNewMemoText] = useState('');
  const { createMemo } = useMemos();
  const { toast } = useToast();

  if (!isOpen) return null;

  const toggleRecording = () => {
    if (isRecording) {
      setRecordingText("Met about the new project proposal. They had some concerns about timeline but were excited about the concept overall.");
      setIsRecording(false);
    } else {
      setRecordingText('');
      setIsRecording(true);
    }
  };

  const handleAddMemo = async () => {
    if (!newMemoText.trim() && !recordingText.trim()) return;
    const memoText = newMemoText || recordingText;
    
    try {
      const fullMemoText = `[Contact: ${profile.id}] ${memoText}`;
      
      await createMemo({
        text: fullMemoText,
        type: 'note',
        audioUrl: null
      });
      
      setNewMemoText('');
      setRecordingText('');
      onClose();
      toast({
        title: "Memo added",
        description: `Your memo for ${profile.first_name} ${profile.last_name} has been saved.`,
      });
    } catch (error) {
      console.error('Error adding relationship memo:', error);
      toast({
        title: "Error adding memo",
        description: "There was a problem saving your memo.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800 text-lg">Add Memo for {profile.first_name} {profile.last_name}</h3>
          <button
            className="text-gray-500"
            onClick={onClose}
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {isRecording ? (
          <div className="mb-4">
            <div className="py-8 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-red-500 animate-pulse flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <p className="text-gray-600 animate-pulse">Recording...</p>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Memo Content
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows={4}
              placeholder="Add your memo here..."
              value={recordingText || newMemoText}
              onChange={(e) => {
                if (recordingText) {
                  setRecordingText(e.target.value);
                } else {
                  setNewMemoText(e.target.value);
                }
              }}
            ></textarea>
          </div>
        )}
        <div className="flex flex-col space-y-3">
          <Button
            className={`w-full flex items-center justify-center ${isRecording ? 'bg-red-500' : 'bg-orange-100 text-orange-500'}`}
            onClick={toggleRecording}
            type="button"
            variant={isRecording ? undefined : "outline"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            {isRecording ? 'Stop Recording' : 'Record Voice'}
          </Button>
          <Button
            className="w-full bg-orange-500 text-white"
            onClick={handleAddMemo}
            disabled={(!newMemoText && !recordingText) || isRecording}
          >
            Save Memo
          </Button>
        </div>
      </div>
    </div>
  );
}
