import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Link, Edit, Trash2, ArrowLeft, User, Users } from 'lucide-react';
import BottomNavBar from '@/components/BottomNavBar';
import AddRelationshipModal from '@/components/relationships/AddRelationshipModal';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useMemos } from '@/contexts/MemoContext';
import ProfileIconButton from '@/components/ProfileIconButton';
import RecordButton from '@/components/RecordButton';
import ProfileInterestsBadges from '@/components/profile/ProfileInterestsBadges';
import AddProfileInterestsModal from '@/components/profile/AddProfileInterestsModal';
import SharedRelationshipsTab from '@/components/relationships/SharedRelationshipsTab';
import { useIsMobile } from '@/hooks/use-mobile';

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
    // More precise filtering - check for exact contact tag match
    return memo.text.includes(`[Contact: ${relationshipId}]`);
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
    
    // Remove all contact tags for display, not just the current one
    let text = memo.text.replace(/\[Contact: [^\]]+\]/g, '').trim();
    
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
  const { profiles, isLoading: profilesLoading, createProfile, updateProfile, deleteProfile } = useProfiles();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMemoModal, setShowAddMemoModal] = useState(false);
  const [showLinkMemoModal, setShowLinkMemoModal] = useState(false);
  const [newMemoText, setNewMemoText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [globalTab, setGlobalTab] = useState('relationships');
  const [showAddInterestsModal, setShowAddInterestsModal] = useState(false);
  const [mainTab, setMainTab] = useState<'personal' | 'shared'>('personal');
  const { memos, createMemo, updateMemo, refreshMemos } = useMemos();
  const [isRecordingMode, setIsRecordingMode] = useState(false);
  const [prefilledRelationshipData, setPrefilledRelationshipData] = useState(null);
  const [pendingRelationships, setPendingRelationships] = useState([]);
  const isMobile = useIsMobile();
  const [showDetailView, setShowDetailView] = useState(false);
  const isLoading = authLoading || profilesLoading;

  // Check for pending relationships from person detection on component mount
  useEffect(() => {
    const pendingRelationshipsData = sessionStorage.getItem('pendingRelationships');
    if (pendingRelationshipsData) {
      try {
        const relationships = JSON.parse(pendingRelationshipsData);
        if (relationships.length > 0) {
          setPendingRelationships(relationships);
          // Auto-open modal with first detected person
          const firstPerson = relationships[0];
          setPrefilledRelationshipData({
            firstName: firstPerson.firstName,
            lastName: firstPerson.lastName,
            type: firstPerson.type,
            relationshipDescription: firstPerson.relationshipDescription
          });
          setShowAddModal(true);
          
          toast({
            title: "Detected contacts ready",
            description: `Ready to add ${relationships.length} contact${relationships.length !== 1 ? 's' : ''} from your memo.`
          });
        }
      } catch (error) {
        console.error('Error parsing pending relationships:', error);
        sessionStorage.removeItem('pendingRelationships');
      }
    }
  }, [toast]);

  // Get recent memos (last 10) that aren't already linked to the current relationship
  const getRecentMemos = () => {
    if (!selectedProfile) return [];
    
    return memos
      .filter(memo => !memo.text.includes(`[Contact: ${selectedProfile.id}]`))
      .slice(0, 10)
      .map(memo => ({
        id: memo.id,
        text: memo.text.substring(0, 60) + (memo.text.length > 60 ? '...' : ''),
        type: memo.type,
        createdAt: memo.createdAt
      }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const handleCloseModal = () => {
    setShowAddModal(false);
    setPrefilledRelationshipData(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingProfile(null);
  };

  const handleEditProfile = (profile) => {
    setEditingProfile(profile);
    setShowEditModal(true);
  };

  const handleDeleteProfile = async (profile) => {
    if (window.confirm(`Are you sure you want to delete ${profile.first_name} ${profile.last_name}? This action cannot be undone.`)) {
      try {
        await deleteProfile.mutateAsync(profile.id);
        if (selectedProfile?.id === profile.id) {
          setSelectedProfile(null);
        }
        toast({
          title: "Contact deleted",
          description: `${profile.first_name} ${profile.last_name} has been removed from your relationships.`
        });
      } catch (error) {
        console.error('Error deleting profile:', error);
        toast({
          title: "Error deleting contact",
          description: "There was a problem deleting the contact.",
          variant: "destructive"
        });
      }
    }
  };

  const handleCreateProfile = async (profileData) => {
    try {
      await createProfile.mutateAsync(profileData);
      setShowAddModal(false);
      setPrefilledRelationshipData(null);
      
      // Process remaining pending relationships
      if (pendingRelationships.length > 1) {
        const remainingRelationships = pendingRelationships.slice(1);
        setPendingRelationships(remainingRelationships);
        sessionStorage.setItem('pendingRelationships', JSON.stringify(remainingRelationships));
        
        // Set up next relationship
        const nextPerson = remainingRelationships[0];
        setPrefilledRelationshipData({
          firstName: nextPerson.firstName,
          lastName: nextPerson.lastName,
          type: nextPerson.type,
          relationshipDescription: nextPerson.relationshipDescription
        });
        setShowAddModal(true);
      } else {
        // All relationships processed, clear session storage
        setPendingRelationships([]);
        sessionStorage.removeItem('pendingRelationships');
        
        toast({
          title: "All contacts added!",
          description: "Your memo has been saved and all detected contacts have been added to your relationships."
        });
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      const { id, ...updateData } = profileData;
      await updateProfile.mutateAsync({ id, ...updateData });
      setShowEditModal(false);
      setEditingProfile(null);
      
      // Update selected profile if it's the one being edited
      if (selectedProfile?.id === id) {
        setSelectedProfile({ ...selectedProfile, ...updateData });
      }
      
      toast({
        title: "Contact updated",
        description: "The contact has been updated successfully."
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating contact",
        description: "There was a problem updating the contact.",
        variant: "destructive"
      });
    }
  };

  // Sort profiles by last_interaction date (most recent first) and filter
  const filteredProfiles = profiles
    .sort((a, b) => new Date(b.last_interaction).getTime() - new Date(a.last_interaction).getTime())
    .filter(profile => {
      const matchesSearch = searchQuery.toLowerCase().split(' ').every(term =>
        `${profile.first_name} ${profile.last_name}`.toLowerCase().includes(term) ||
        profile.type.toLowerCase().includes(term)
      );
      
      return activeTab === 'all' ? matchesSearch : 
             matchesSearch && profile.type.toLowerCase() === activeTab.toLowerCase();
    });

  // Update last_interaction when a profile is selected
  const handleProfileSelect = async (profile) => {
    setSelectedProfile(profile);
    if (isMobile) {
      setShowDetailView(true);
    }
    
    // Update the last_interaction timestamp
    try {
      await updateProfile.mutateAsync({ 
        id: profile.id, 
        last_interaction: new Date().toISOString() 
      });
    } catch (error) {
      console.error('Error updating last interaction:', error);
    }
  };

  const handleBackToList = () => {
    setShowDetailView(false);
    setSelectedProfile(null);
  };

  const handleAddMemo = async () => {
    if (!newMemoText.trim()) return;
    
    if (!selectedProfile) return;
    
    try {
      // Ensure the contact tag is added correctly
      const fullMemoText = `[Contact: ${selectedProfile.id}] ${newMemoText.trim()}`;
      
      const newMemo = await createMemo({
        text: fullMemoText,
        type: 'note',
        audioUrl: null
      });
      
      if (newMemo) {
        setNewMemoText('');
        setShowAddMemoModal(false);
        setIsRecordingMode(false);
        
        // Force a refresh of memos to show the new one immediately
        await refreshMemos();
        
        toast({
          title: "Memo added",
          description: `Your memo for ${selectedProfile.first_name} ${selectedProfile.last_name} has been saved.`,
        });
      }
    } catch (error) {
      console.error('Error adding relationship memo:', error);
      toast({
        title: "Error adding memo",
        description: "There was a problem saving your memo.",
        variant: "destructive"
      });
    }
  };

  const handleLinkExistingMemo = async (memoId) => {
    if (!selectedProfile) return;
    
    try {
      const memo = memos.find(m => m.id === memoId);
      if (!memo) return;
      
      // Check if this memo is already linked to this relationship
      if (memo.text.includes(`[Contact: ${selectedProfile.id}]`)) {
        toast({
          title: "Already linked",
          description: `This memo is already linked to ${selectedProfile.first_name} ${selectedProfile.last_name}.`,
          variant: "destructive"
        });
        return;
      }
      
      // Append the contact tag instead of replacing the text
      const updatedText = `[Contact: ${selectedProfile.id}] ${memo.text}`;
      
      // Update the memo to link it to the relationship
      const updatedMemo = await updateMemo(memoId, { text: updatedText });
      
      if (updatedMemo) {
        // Refresh memos to get the updated state
        await refreshMemos();
        
        setShowLinkMemoModal(false);
        toast({
          title: "Memo linked",
          description: `Memo linked to ${selectedProfile.first_name} ${selectedProfile.last_name}.`,
        });
      }
    } catch (error) {
      console.error('Error linking memo:', error);
      toast({
        title: "Error linking memo",
        description: "There was a problem linking the memo.",
        variant: "destructive"
      });
    }
  };

  const handleMemoCreated = async (memoId) => {
    if (!selectedProfile) return;
    
    try {
      // Find the newly created memo and add the contact tag
      const memo = memos.find(m => m.id === memoId);
      if (memo && !memo.text.includes(`[Contact: ${selectedProfile.id}]`)) {
        // Update the memo to include the contact tag
        await updateMemo(memoId, {
          text: `[Contact: ${selectedProfile.id}] ${memo.text}`
        });
      }
      
      // Update last_interaction when linking a memo
      await updateProfile.mutateAsync({ 
        id: selectedProfile.id, 
        last_interaction: new Date().toISOString() 
      });
      
      // Refresh memos to show the updated state
      await refreshMemos();
      
      setShowAddMemoModal(false);
      setIsRecordingMode(false);
      toast({
        title: "Voice memo added",
        description: `Your voice memo for ${selectedProfile?.first_name} ${selectedProfile?.last_name} has been saved.`,
      });
    } catch (error) {
      console.error('Error linking voice memo:', error);
      toast({
        title: "Error linking memo",
        description: "There was a problem linking the voice memo.",
        variant: "destructive"
      });
    }
  };

  const getTypeColor = (type) => REL_TYPE_COLORS[type.toLowerCase()] || REL_TYPE_COLORS.default;
  const getMemoTypeColor = (type) => MEMO_TYPE_COLORS[type] || MEMO_TYPE_COLORS.note;

  const getMemoTypeIcon = (type) => {
    switch (type) {
      case 'task':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v1a1 1 0 110 2h4a1 1 0 01.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
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

  // Mobile List View
  const renderMobileListView = () => (
    <>
      <div className="bg-orange-500 px-4 pt-12 pb-6 rounded-b-3xl shadow-md">
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
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zm1-12a1 1 0 10-2 0v1a1 1 0 110 2h4a1 1 0 01.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full bg-orange-400 bg-opacity-50 border border-orange-300 rounded-xl py-3 pl-10 pr-3 text-orange-100 placeholder-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
              placeholder="Search relationships..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Main tabs: Personal vs Shared */}
        <div className="flex space-x-2 mb-4">
          <button
            className={`px-6 py-2 rounded-full text-sm font-medium flex items-center ${mainTab === 'personal' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'}`}
            onClick={() => setMainTab('personal')}
          >
            <User className="h-4 w-4 mr-2" />
            Personal
          </button>
          <button
            className={`px-6 py-2 rounded-full text-sm font-medium flex items-center ${mainTab === 'shared' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'}`}
            onClick={() => setMainTab('shared')}
          >
            <Users className="h-4 w-4 mr-2" />
            Shared
          </button>
        </div>

        {/* Sub-tabs for personal relationships */}
        {mainTab === 'personal' && (
          <div className="flex space-x-2 overflow-x-auto pb-2">
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
        )}
      </div>

      <div className="flex-1 px-4 py-4 overflow-y-auto">
        {mainTab === 'personal' ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-800 text-lg">People ({filteredProfiles.length})</h2>
              <Button
                size="sm"
                className="bg-orange-500 text-white"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="p-6 text-center text-gray-500">Loading...</div>
              ) : filteredProfiles.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl shadow-sm">
                  <User className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 mb-4">No relationships found</p>
                  <Button
                    className="bg-orange-500 text-white"
                    onClick={() => setShowAddModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Contact
                  </Button>
                </div>
              ) : (
                filteredProfiles.map(profile => (
                  <div
                    key={profile.id}
                    className="bg-white rounded-2xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-all active:scale-95"
                    onClick={() => handleProfileSelect(profile)}
                  >
                    <div className="flex items-center">
                      <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center mr-4 flex-shrink-0">
                        <span className="text-orange-600 font-bold text-lg">
                          {`${profile.first_name[0]}${profile.last_name[0]}`}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-gray-800 font-semibold text-lg truncate">
                            {`${profile.first_name} ${profile.last_name}`}
                          </h3>
                          <div className="flex gap-1 ml-2 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProfile(profile);
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit contact"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProfile(profile);
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete contact"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(profile.type)}`}>
                            {profile.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {extractRelationshipMemos(memos, profile.id).length} memo(s)
                          </span>
                        </div>
                        
                        {(profile.email || profile.phone) && (
                          <div className="text-xs text-gray-500 space-y-1">
                            {profile.email && <div className="truncate">📧 {profile.email}</div>}
                            {profile.phone && <div>📞 {profile.phone}</div>}
                          </div>
                        )}
                        
                        <p className="text-gray-400 text-xs mt-2">
                          Last interaction: {new Date(profile.last_interaction).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <SharedRelationshipsTab />
        )}
      </div>
    </>
  );

  // Mobile Detail View
  const renderMobileDetailView = () => (
    <>
      <div className="bg-orange-500 px-4 pt-12 pb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToList}
            className="text-white hover:bg-orange-600 mr-3 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center flex-1">
            <div className="w-12 h-12 rounded-full bg-orange-400 flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">
                {selectedProfile ? `${selectedProfile.first_name[0]}${selectedProfile.last_name[0]}` : ''}
              </span>
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">
                {selectedProfile ? `${selectedProfile.first_name} ${selectedProfile.last_name}` : ''}
              </h1>
              <p className="text-orange-100 text-sm">
                {selectedProfile ? selectedProfile.type : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {selectedProfile && (
        <div className="flex-1 overflow-y-auto">
          {/* Contact Info */}
          <div className="bg-white mx-4 mt-4 rounded-2xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Contact Information</h3>
            <div className="space-y-2">
              {selectedProfile.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📧</span>
                  <span>{selectedProfile.email}</span>
                </div>
              )}
              {selectedProfile.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📞</span>
                  <span>{selectedProfile.phone}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-500">
                <span className="mr-2">📅</span>
                <span>Added: {new Date(selectedProfile.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mx-4 mt-4 space-y-3">
            <Button
              className="w-full bg-orange-500 text-white py-3 text-lg"
              onClick={() => setShowAddMemoModal(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 10-2 0v1a1 1 0 110 2h4a1 1 0 01.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Add Memo
            </Button>
            
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-blue-500 text-white py-3"
                onClick={() => setShowLinkMemoModal(true)}
              >
                <Link className="h-4 w-4 mr-2" />
                Link Memo
              </Button>
              <Button
                className="flex-1 bg-green-500 text-white py-3"
                onClick={() => setShowAddInterestsModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Interests
              </Button>
            </div>
          </div>

          {/* Interests */}
          <div className="mx-4 mt-4 bg-white rounded-2xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Interests</h3>
            <ProfileInterestsBadges 
              profileId={selectedProfile.id} 
              showRemove={true}
            />
          </div>

          {/* Memos */}
          <div className="mx-4 mt-4 mb-4 bg-white rounded-2xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Memos ({extractRelationshipMemos(memos, selectedProfile.id).length})</h3>
            <div className="space-y-3">
              {extractRelationshipMemos(memos, selectedProfile.id).map((memo, idx) => (
                <div key={memo.id || idx} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="flex">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 ${getMemoTypeColor(memo.type)}`}>
                      {getMemoTypeIcon(memo.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 text-sm leading-relaxed">{memo.text}</p>
                      <div className="flex justify-between items-center mt-3">
                        <p className="text-gray-400 text-xs">{memo.date}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMemoTypeColor(memo.type)}`}>
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
                  <p className="text-sm mt-1">Tap "Add Memo" to create one</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Desktop View (keep existing layout)
  const renderDesktopView = () => (
    <>
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
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zm1-12a1 1 0 10-2 0v1a1 1 0 110 2h4a1 1 0 01.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
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
                    onClick={() => handleProfileSelect(profile)}
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                        <span className="text-orange-600 font-bold text-lg">
                          {`${profile.first_name[0]}${profile.last_name[0]}`}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-gray-800 font-medium">
                              {`${profile.first_name} ${profile.last_name}`}
                            </p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${
                              REL_TYPE_COLORS[profile.type.toLowerCase()] || REL_TYPE_COLORS.default
                            }`}>
                              {profile.type}
                            </span>
                            {/* Display contact info in the list */}
                            {(profile.email || profile.phone) && (
                              <div className="text-xs text-gray-500 mt-1">
                                {profile.email && <div>📧 {profile.email}</div>}
                                {profile.phone && <div>📞 {profile.phone}</div>}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1 ml-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProfile(profile);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit contact"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProfile(profile);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete contact"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <p className="text-gray-500 text-xs">
                            Last interaction: {new Date(profile.last_interaction).toLocaleDateString()}
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
                      {/* Display contact info in the detail view */}
                      {(selectedProfile.email || selectedProfile.phone) && (
                        <div className="text-sm text-gray-600 mt-1">
                          {selectedProfile.email && <div>📧 {selectedProfile.email}</div>}
                          {selectedProfile.phone && <div>📞 {selectedProfile.phone}</div>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="px-3 py-2 bg-green-500 text-white text-sm font-medium rounded-lg flex items-center"
                      onClick={() => setShowAddInterestsModal(true)}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Interests
                    </Button>
                    <Button
                      className="px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg flex items-center"
                      onClick={() => setShowLinkMemoModal(true)}
                      size="sm"
                    >
                      <Link className="h-4 w-4 mr-1" />
                      Link Memo
                    </Button>
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
                </div>
                
                {/* Interests section */}
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800 mb-2">Interests</h3>
                  <ProfileInterestsBadges 
                    profileId={selectedProfile.id} 
                    showRemove={true}
                  />
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {extractRelationshipMemos(memos, selectedProfile.id).map((memo, idx) => (
                      <div key={memo.id || idx} className="p-3 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
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
    </>
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {isMobile ? (
        showDetailView && selectedProfile ? 
          renderMobileDetailView() : 
          renderMobileListView()
      ) : (
        renderDesktopView()
      )}

      {/* Enhanced Add Memo Modal with Voice Recording */}
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
                  setIsRecordingMode(false);
                }}
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex gap-3 mb-4">
              <Button
                onClick={() => setIsRecordingMode(false)}
                variant={!isRecordingMode ? "default" : "outline"}
                className="flex-1"
              >
                Text
              </Button>
              <Button
                onClick={() => setIsRecordingMode(true)}
                variant={isRecordingMode ? "default" : "outline"}
                className="flex-1"
              >
                Voice
              </Button>
            </div>

            {isRecordingMode ? (
              <div className="mb-4">
                <div className="py-8 flex flex-col items-center">
                  <RecordButton 
                    onMemoCreated={handleMemoCreated}
                    onLiveTranscription={(text) => setNewMemoText(text)}
                  />
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
                  value={newMemoText}
                  onChange={(e) => setNewMemoText(e.target.value)}
                ></textarea>
              </div>
            )}

            {!isRecordingMode && (
              <Button
                className="w-full bg-orange-500 text-white"
                onClick={handleAddMemo}
                disabled={!newMemoText.trim()}
              >
                Save Memo
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Link Existing Memo Modal */}
      {showLinkMemoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 mx-4 max-h-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-lg">Link Recent Memo</h3>
              <button
                className="text-gray-500"
                onClick={() => setShowLinkMemoModal(false)}
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto max-h-64">
              {getRecentMemos().length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent memos available to link</p>
              ) : (
                <div className="space-y-2">
                  {getRecentMemos().map((memo) => (
                    <div
                      key={memo.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleLinkExistingMemo(memo.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">{memo.text}</p>
                          <div className="flex items-center mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${getMemoTypeColor(memo.type)}`}>
                              {memo.type}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              {new Date(memo.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Link className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Interests Modal */}
      {showAddInterestsModal && selectedProfile && (
        <AddProfileInterestsModal
          isOpen={showAddInterestsModal}
          onClose={() => setShowAddInterestsModal(false)}
          profileId={selectedProfile.id}
          profileName={`${selectedProfile.first_name} ${selectedProfile.last_name}`}
        />
      )}

      <AddRelationshipModal 
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSubmit={handleCreateProfile}
        prefilledData={prefilledRelationshipData}
      />

      <AddRelationshipModal 
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateProfile}
        editingProfile={editingProfile}
      />
      
      <BottomNavBar
        activeTab={globalTab}
        onTabChange={setGlobalTab}
      />
    </div>
  );
};

export default RelationshipsPage;
