
import React, { useState, useEffect } from 'react';
import { useRelationshipSuggestions } from '@/hooks/useRelationshipSuggestions';
import { useProfiles } from '@/hooks/useProfiles';
import { useToast } from '@/hooks/use-toast';
import RelationshipSuggestion from '@/components/relationships/RelationshipSuggestion';
import AddRelationshipModal from '@/components/relationships/AddRelationshipModal';

interface PostMemoSuggestionsProps {
  memoText: string;
  onClose: () => void;
}

const PostMemoSuggestions: React.FC<PostMemoSuggestionsProps> = ({ memoText, onClose }) => {
  const { suggestions, analyzeTextForPeople, dismissSuggestion, acceptSuggestion } = useRelationshipSuggestions();
  const { createProfile } = useProfiles();
  const { toast } = useToast();
  const [showAddRelationshipModal, setShowAddRelationshipModal] = useState(false);
  const [selectedPersonForRelationship, setSelectedPersonForRelationship] = useState(null);

  useEffect(() => {
    if (memoText) {
      analyzeTextForPeople(memoText);
    }
  }, [memoText, analyzeTextForPeople]);

  const handleAcceptRelationshipSuggestion = (detectedPerson) => {
    setSelectedPersonForRelationship(detectedPerson);
    setShowAddRelationshipModal(true);
    acceptSuggestion(detectedPerson.fullName);
  };

  const handleCreateRelationship = async (profileData) => {
    try {
      await createProfile.mutateAsync(profileData);
      setShowAddRelationshipModal(false);
      setSelectedPersonForRelationship(null);
      toast({
        title: "Relationship created",
        description: "New relationship has been added successfully."
      });
    } catch (error) {
      console.error('Error creating relationship:', error);
    }
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-96 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">New Relationships Detected</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3">
            {suggestions.map((person, index) => (
              <RelationshipSuggestion
                key={`${person.fullName}-${index}`}
                detectedPerson={person}
                onAccept={handleAcceptRelationshipSuggestion}
                onDismiss={() => dismissSuggestion(person.fullName)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Add Relationship Modal */}
      {selectedPersonForRelationship && (
        <AddRelationshipModal
          isOpen={showAddRelationshipModal}
          onClose={() => {
            setShowAddRelationshipModal(false);
            setSelectedPersonForRelationship(null);
          }}
          onSubmit={handleCreateRelationship}
          prefilledData={{
            firstName: selectedPersonForRelationship.firstName,
            lastName: selectedPersonForRelationship.lastName,
            type: selectedPersonForRelationship.suggestedCategory,
            relationshipDescription: `Detected from: ${selectedPersonForRelationship.context}`
          }}
        />
      )}
    </>
  );
};

export default PostMemoSuggestions;
