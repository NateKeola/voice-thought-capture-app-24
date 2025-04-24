import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import BottomNavBar from '@/components/BottomNavBar';
import AddRelationshipModal from '@/components/relationships/AddRelationshipModal';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useMemos } from '@/contexts/MemoContext';
import { ProfileList } from '@/components/relationships/ProfileList';
import { ProfileSearch } from '@/components/relationships/ProfileSearch';
import { ProfileDetail } from '@/components/relationships/ProfileDetail';

const extractRelationshipMemos = (memos, relationshipId) => {
  return memos.filter(memo => {
    return memo.text.includes(`[Contact: ${relationshipId}]`) ||
           memo.text.toLowerCase().includes(relationshipId.toLowerCase());
  }).map(memo => {
    let type = memo.type;
    if (type === 'idea') type = 'should';
    const text = memo.text.replace(`[Contact: ${relationshipId}]`, '').trim();
    
    return {
      id: memo.id,
      text,
      type,
      createdAt: memo.createdAt
    };
  });
};

const RelationshipsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profiles, isLoading, createProfile } = useProfiles();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMemoModal, setShowAddMemoModal] = useState(false);
  const [newMemoText, setNewMemoText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingText, setRecordingText] = useState('');
  const [globalTab, setGlobalTab] = useState('relationships');
  const { memos, createMemo } = useMemos();

  if (!user) {
    navigate('/signin');
    return null;
  }

  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  const handleCreateProfile = async (profileData) => {
    try {
      await createProfile.mutateAsync(profileData);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = searchQuery.toLowerCase().split(' ').every(term =>
      `${profile.first_name} ${profile.last_name}`.toLowerCase().includes(term) ||
      profile.type.toLowerCase().includes(term)
    );
    
    return activeTab === 'all' ? matchesSearch : 
           matchesSearch && profile.type.toLowerCase() === activeTab.toLowerCase();
  });

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
    
    if (!selectedProfile) return;
    
    try {
      const fullMemoText = `[Contact: ${selectedProfile.id}] ${memoText}`;
      
      await createMemo({
        text: fullMemoText,
        type: 'note',
        audioUrl: null
      });
      
      setNewMemoText('');
      setRecordingText('');
      setShowAddMemoModal(false);
      toast({
        title: "Memo added",
        description: `Your memo for ${selectedProfile.first_name} ${selectedProfile.last_name} has been saved.`,
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
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-orange-500 px-6 pt-12 pb-6 rounded-b-3xl shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-white text-2xl font-bold">Relationships</h1>
            <p className="text-orange-100 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="bg-white bg-opacity-20 p-2 rounded-full">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-600 font-bold text-lg">MJ</span>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <ProfileSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>
      
      <div className="flex-1 px-6 py-4 overflow-hidden">
        <div className="flex h-full space-x-4">
          <ProfileList
            profiles={filteredProfiles}
            isLoading={isLoading}
            selectedProfile={selectedProfile}
            onSelectProfile={setSelectedProfile}
            onAddProfile={() => setShowAddModal(true)}
          />
          <ProfileDetail
            profile={selectedProfile}
            memos={selectedProfile ? extractRelationshipMemos(memos, selectedProfile.id) : []}
            onAddMemo={() => setShowAddMemoModal(true)}
          />
        </div>
      </div>

      {showAddMemoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-lg">Add Memo for {selectedProfile.first_name} {selectedProfile.last_name}</h3>
              <button
                className="text-gray-500"
                onClick={() => {
                  setShowAddMemoModal(false);
                  setNewMemoText('');
                  setRecordingText('');
                  setIsRecording(false);
                }}
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
      )}

      <AddRelationshipModal 
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSubmit={handleCreateProfile}
      />
      
      <BottomNavBar
        activeTab={globalTab}
        onTabChange={setGlobalTab}
      />
    </div>
  );
};

export default RelationshipsPage;
