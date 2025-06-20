import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import BottomNavBar from '@/components/BottomNavBar';
import AddRelationshipModal from '@/components/relationships/AddRelationshipModal';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useMemos } from '@/contexts/MemoContext';
import ProfileIconButton from '@/components/ProfileIconButton';

const REL_TYPE_COLORS = {
  work: 'bg-blue-100 text-blue-600',
  client: 'bg-purple-100 text-purple-600',
  personal: 'bg-green-100 text-green-600',
  default: 'bg-gray-100 text-gray-600'
};
const MEMO_TYPE_COLORS = {
  task: 'bg-purple-100 text-purple-600',
  should: 'bg-orange-100 text-orange-500',
  note: 'bg-blue-100 text-blue-600',
};

const extractRelationshipMemos = (memos, relationshipId) => {
  return memos.filter(memo => {
    return memo.text.includes(`[Contact: ${relationshipId}]`) ||
           memo.text.toLowerCase().includes(relationshipId.toLowerCase());
  }).map(memo => {
    let type = memo.type;
    if (type === 'idea') type = 'should';
    const date = memo.createdAt ? new Date(memo.createdAt) : new Date();
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let dateStr = 'Just now';
    if (diffDays === 1) dateStr = 'Yesterday';
    else if (diffDays > 1) dateStr = `${diffDays} days ago`;
    
    let text = memo.text.replace(`[Contact: ${relationshipId}]`, '').trim();
    
    return {
      id: memo.id,
      text,
      date: dateStr,
      type
    };
  });
};

const RelationshipsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profiles, isLoading: profilesLoading, createProfile } = useProfiles();
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
  const isLoading = authLoading || profilesLoading;
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isUserAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(isUserAuthenticated);
      
      if (!isUserAuthenticated && !authLoading) {
        navigate('/signin', { state: { from: '/relationships' } });
      }
    };
    
    checkAuth();
  }, [navigate, authLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
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

  const toggleRecording = () => {
    if (isRecording) {
      setRecordingText("Met about the new project proposal. They had some concerns about timeline but were excited about the concept overall.");
      setIsRecording(false);
    } else {
      setRecordingText('');
      setIsRecording(true);
    }
  };

  const getTypeColor = (type) => REL_TYPE_COLORS[type.toLowerCase()] || REL_TYPE_COLORS.default;
  const getMemoTypeColor = (type) => MEMO_TYPE_COLORS[type] || MEMO_TYPE_COLORS.note;

  const getMemoTypeIcon = (type) => {
    switch (type) {
      case 'task':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 110 2h4a1 1 0 01.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'should':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 110 2h4a1 1 0 01.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'note':
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
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
          <ProfileIconButton />
        </div>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-orange-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full bg-orange-400 bg-opacity-50 border border-orange-300 rounded-xl py-2 pl-10 pr-3 text-orange-100 placeholder-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
              placeholder="Search relationships..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="px-6 pt-4">
        <div className="flex space-x-2 overflow-x-auto">
          {['all', 'work', 'personal'].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeTab === tab ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 px-6 py-4 overflow-hidden">
        <div className="flex h-full space-x-4">
          <div className="w-1/3 bg-white rounded-2xl shadow-sm overflow-y-auto">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-gray-800 text-lg">People</h2>
              <Button
                size="sm"
                variant="ghost"
                className="hover:bg-orange-100 hover:text-orange-500"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            <div className="divide-y divide-gray-100">
              {isLoading ? (
                <div className="p-6 text-center text-gray-500">Loading...</div>
              ) : filteredProfiles.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No relationships found</p>
                  <Button
                    size="sm"
                    className="mt-4 w-full bg-orange-500 text-white"
                    onClick={() => setShowAddModal(true)}
                  >
                    Add New Contact
                  </Button>
                </div>
              ) : (
                filteredProfiles.map(profile => (
                  <div
                    key={profile.id}
                    className={`p-4 cursor-pointer hover:bg-orange-50 transition-colors ${
                      selectedProfile?.id === profile.id ? 'bg-orange-50' : ''
                    }`}
                    onClick={() => setSelectedProfile(profile)}
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                        <span className="text-orange-600 font-bold text-lg">
                          {`${profile.first_name[0]}${profile.last_name[0]}`}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className="text-gray-800 font-medium">
                            {`${profile.first_name} ${profile.last_name}`}
                          </p>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            REL_TYPE_COLORS[profile.type.toLowerCase()] || REL_TYPE_COLORS.default
                          }`}>
                            {profile.type}
                          </span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <p className="text-gray-500 text-xs">
                            Added: {new Date(profile.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="w-2/3 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
            {selectedProfile ? (
              <>
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                      <span className="text-orange-600 font-bold">{`${selectedProfile.first_name[0]}${selectedProfile.last_name[0]}`}</span>
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-800 text-lg">{selectedProfile.first_name} {selectedProfile.last_name}</h2>
                      <p className="text-gray-500 text-xs">Added: {new Date(selectedProfile.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button
                    className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg flex items-center"
                    onClick={() => setShowAddMemoModal(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 10-2 0v1a1 1 0 110 2h4a1 1 0 01.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Add Memo
                  </Button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {extractRelationshipMemos(memos, selectedProfile.id).map((memo, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${getMemoTypeColor(memo.type)}`}>
                            {getMemoTypeIcon(memo.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-700 text-sm">{memo.text}</p>
                            <div className="flex justify-between mt-2">
                              <p className="text-gray-400 text-xs">{memo.date}</p>
                              <span className={`px-2 py-1 rounded-full text-xs ${getMemoTypeColor(memo.type)}`}>
                                {memo.type}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {extractRelationshipMemos(memos, selectedProfile.id).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No memos for this relationship yet</p>
                        <p className="text-sm mt-1">Click "Add Memo" to create one</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-orange-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <p className="mt-4 text-gray-500">Select a relationship to view and add memos</p>
                </div>
              </div>
            )}
          </div>
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
