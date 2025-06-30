import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import BottomNavBar from '@/components/BottomNavBar';
import ProfileHeader from '@/components/profile/ProfileHeader';
import StepIndicator from '@/components/relationships/StepIndicator';
import AvatarSelector from '@/components/relationships/AvatarSelector';
import ContactSearchInput from '@/components/relationships/ContactSearchInput';
import ContactSelectionCards from '@/components/relationships/ContactSelectionCards';
import RelationshipTypeSelector from '@/components/relationships/RelationshipTypeSelector';
import TextMemoInput from '@/components/TextMemoInput';
import { useMemos } from '@/contexts/MemoContext';
import { useAuth } from '@/hooks/useAuth';

const relationTypes = [
  { id: 'family', label: 'Family', color: '#F472B6' },
  { id: 'friend', label: 'Friend', color: '#6366F1' },
  { id: 'romantic', label: 'Romantic', color: '#EC4899' },
  { id: 'professional', label: 'Professional', color: '#3B82F6' },
  { id: 'mentor', label: 'Mentor', color: '#10B981' },
  { id: 'other', label: 'Other', color: '#F59E0B' },
];

const RelationshipsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { createMemo } = useMemos();

  const [step, setStep] = useState(1);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [relationTypesSelected, setRelationTypesSelected] = useState<string[]>([]);
  const [newNote, setNewNote] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    // Mock search results
    if (searchTerm) {
      setIsSearching(true);
      setTimeout(() => {
        setSearchResults([
          { id: '1', name: 'John Doe', email: 'john@example.com' },
          { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
        ]);
        setIsSearching(false);
      }, 500);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchTerm]);

  const handleNext = () => {
    setStep(prevStep => Math.min(prevStep + 1, 5));
  };

  const handleBack = () => {
    setStep(prevStep => Math.max(prevStep - 1, 1));
  };

  const handleAvatarChange = (file: File) => {
    setAvatar(file);
  };

  const handleContactSelect = (contact: any) => {
    setSelectedContact(contact);
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleRelationTypeSelect = (types: string[]) => {
    setRelationTypesSelected(types);
  };

  const handleSubmit = () => {
    if (!selectedContact || relationTypesSelected.length === 0) {
      toast({
        title: "Missing info",
        description: "Please select a contact and at least one relationship type.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Relationship created",
      description: `You've created a new relationship with ${selectedContact.name}.`
    });
    navigate('/profile');
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedProfile) return;
    
    try {
      await createMemo({
        text: `[Contact: ${selectedProfile.id}] ${newNote}`,
        content: `[Contact: ${selectedProfile.id}] ${newNote}`, // Add content property
        category: 'note', // Add category property
        type: 'note',
        audioUrl: null
      });
      
      setNewNote('');
      toast({
        title: "Note added",
        description: "Your note has been added to this relationship."
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note to relationship.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    // Mock profile selection
    setSelectedProfile({ id: '123', name: 'John Doe' });
  }, []);

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ProfileHeader title="New Relationship" />
      <StepIndicator currentStep={step} totalSteps={5} />

      <div className="flex-1 p-6 overflow-y-auto">
        {step === 1 && (
          <div>
            <AvatarSelector 
              initials={selectedContact ? selectedContact.name.substring(0, 2).toUpperCase() : ''}
              onAvatarChange={handleAvatarChange} 
            />
            <ContactSearchInput 
              searchTerm={searchTerm}
              isSearching={isSearching}
              onSearchChange={setSearchTerm}
            />
            <ContactSelectionCards 
              searchResults={searchResults}
              selectedContact={selectedContact}
              onContactSelect={handleContactSelect}
            />
          </div>
        )}

        {step === 2 && (
          <div>
            <RelationshipTypeSelector 
              types={relationTypes}
              selectedTypes={relationTypesSelected}
              onTypeSelect={handleRelationTypeSelect}
            />
          </div>
        )}

        {step === 3 && (
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Add a Note about this Relationship
            </label>
            <TextMemoInput initialText={newNote} onMemoCreated={() => {}} />
          </div>
        )}

        {step === 4 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Review</h3>
            <p>Contact: {selectedContact ? selectedContact.name : 'None'}</p>
            <p>Types: {relationTypesSelected.join(', ') || 'None'}</p>
            <p>Avatar: {avatar ? avatar.name : 'None'}</p>
          </div>
        )}

        {step === 5 && selectedProfile && (
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Add a Note about {selectedProfile.name}
            </label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Type your note here..."
              className="w-full border rounded-md py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={handleAddNote}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
            >
              Add Note
            </button>
          </div>
        )}
      </div>

      <div className="px-6 py-3 bg-gray-50 flex justify-between">
        <button 
          onClick={handleBack} 
          disabled={step === 1}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
        >
          Back
        </button>
        {step < 5 ? (
          <button 
            onClick={handleNext}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
          >
            Next
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Create Relationship
          </button>
        )}
      </div>

      <BottomNavBar activeTab="profile" onTabChange={() => {}} />
    </div>
  );
};

export default RelationshipsPage;
