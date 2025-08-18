import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Users, Edit, Trash2, Copy, DollarSign } from 'lucide-react';
import { useCollaborativeGroups } from '@/hooks/useCollaborativeGroups';
import { useSharedRelationships } from '@/hooks/useSharedRelationships';
import GroupManagementModal from './GroupManagementModal';
import SharedRelationshipModal from './SharedRelationshipModal';
import { useProfiles } from '@/hooks/useProfiles';

const SharedRelationshipsTab: React.FC = () => {
  const { groups, isLoading: groupsLoading } = useCollaborativeGroups();
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showRelationshipModal, setShowRelationshipModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'copy'>('create');
  const [selectedRelationship, setSelectedRelationship] = useState(null);
  const [personalProfile, setPersonalProfile] = useState(null);

  const { profiles } = useProfiles();
  const { 
    sharedRelationships, 
    createSharedRelationship, 
    updateSharedRelationship, 
    deleteSharedRelationship,
    copyToShared,
    isLoading: relationshipsLoading 
  } = useSharedRelationships(selectedGroupId);

  const handleCreateRelationship = () => {
    setModalMode('create');
    setSelectedRelationship(null);
    setPersonalProfile(null);
    setShowRelationshipModal(true);
  };

  const handleEditRelationship = (relationship: any) => {
    setModalMode('edit');
    setSelectedRelationship(relationship);
    setPersonalProfile(null);
    setShowRelationshipModal(true);
  };

  const handleCopyFromPersonal = (profile: any) => {
    setModalMode('copy');
    setSelectedRelationship(null);
    setPersonalProfile(profile);
    setShowRelationshipModal(true);
  };

  const handleDeleteRelationship = async (relationship: any) => {
    if (window.confirm(`Are you sure you want to delete ${relationship.first_name} ${relationship.last_name}? This action cannot be undone.`)) {
      await deleteSharedRelationship.mutateAsync(relationship.id);
    }
  };

  const handleSaveRelationship = async (data: any) => {
    if (modalMode === 'edit') {
      await updateSharedRelationship.mutateAsync(data);
    } else if (modalMode === 'copy') {
      await copyToShared.mutateAsync({
        personalProfile: personalProfile,
        targetGroupId: selectedGroupId,
        dealValue: data.deal_value,
        metrics: data.important_metrics
      });
    } else {
      await createSharedRelationship.mutateAsync(data);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  if (groupsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Group Selection & Management */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Collaborative Groups</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowGroupModal(true)}
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Groups
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No groups yet</p>
              <Button onClick={() => setShowGroupModal(true)}>
                Create Your First Group
              </Button>
            </div>
          ) : (
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Shared Relationships */}
      {selectedGroupId && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Shared Leads</CardTitle>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowRelationshipModal(true)}
                  disabled={!selectedGroupId}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy from Personal
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateRelationship}
                  disabled={!selectedGroupId}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lead
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {relationshipsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
              </div>
            ) : sharedRelationships.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No shared leads yet</p>
                <Button onClick={handleCreateRelationship}>
                  Add Your First Lead
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sharedRelationships.map((relationship) => (
                  <div
                    key={relationship.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-bold text-sm">
                              {`${relationship.first_name[0]}${relationship.last_name[0]}`}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {`${relationship.first_name} ${relationship.last_name}`}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="text-xs">
                                {relationship.type}
                              </Badge>
                              {relationship.deal_value && (
                                <Badge variant="outline" className="text-xs">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  {formatCurrency(relationship.deal_value)}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="text-sm text-muted-foreground space-y-1 mb-2">
                          {relationship.email && (
                            <div>📧 {relationship.email}</div>
                          )}
                          {relationship.phone && (
                            <div>📞 {relationship.phone}</div>
                          )}
                        </div>

                        {/* Important Metrics */}
                        {Object.keys(relationship.important_metrics || {}).length > 0 && (
                          <div className="mb-2">
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(relationship.important_metrics || {}).map(([key, value]) => (
                                <Badge key={key} variant="outline" className="text-xs">
                                  {key}: {value}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Notes Preview */}
                        {relationship.notes && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {relationship.notes}
                          </p>
                        )}

                        <div className="text-xs text-muted-foreground mt-2">
                          Last interaction: {new Date(relationship.last_interaction).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditRelationship(relationship)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteRelationship(relationship)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Personal Relationships for Copying */}
      {selectedGroupId && profiles.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Copy from Personal Relationships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profiles.slice(0, 6).map((profile) => (
                <div
                  key={profile.id}
                  className="border rounded-lg p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold text-xs">
                        {`${profile.first_name[0]}${profile.last_name[0]}`}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {`${profile.first_name} ${profile.last_name}`}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {profile.type}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyFromPersonal(profile)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <GroupManagementModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
      />

      <SharedRelationshipModal
        isOpen={showRelationshipModal}
        onClose={() => setShowRelationshipModal(false)}
        onSave={handleSaveRelationship}
        relationship={selectedRelationship}
        groupId={selectedGroupId}
        mode={modalMode}
        personalProfile={personalProfile}
      />
    </div>
  );
};

export default SharedRelationshipsTab;