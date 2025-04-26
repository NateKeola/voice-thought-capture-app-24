
import React, { useState, useEffect } from 'react';
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
import { RelationshipsMemoModal } from '@/components/relationships/RelationshipsMemoModal';

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
  const { user, loading } = useAuth();
  const { profiles, isLoading, createProfile } = useProfiles();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMemoModal, setShowAddMemoModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [globalTab, setGlobalTab] = useState('relationships');
  const { memos } = useMemos();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/signin');
    }
  }, [user, loading, navigate]);

  // Don't render anything until auth check is complete
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // Skip the early return to avoid rendering issues
  if (!user) {
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

      {showAddMemoModal && selectedProfile && (
        <RelationshipsMemoModal 
          isOpen={showAddMemoModal}
          onClose={() => setShowAddMemoModal(false)}
          profile={selectedProfile}
        />
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
