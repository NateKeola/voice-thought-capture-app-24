import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users } from 'lucide-react';
import { useSharedGroups } from '@/hooks/useSharedGroups';
import SharedGroupCard from './SharedGroupCard';
import CreateGroupDialog from './CreateGroupDialog';
import JoinGroupDialog from './JoinGroupDialog';

const SharedRelationshipsView: React.FC = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  
  const { groups, groupsLoading, leaveGroup } = useSharedGroups();

  const handleLeaveGroup = async (groupId: string) => {
    if (confirm('Are you sure you want to leave this group?')) {
      await leaveGroup.mutateAsync(groupId);
      if (selectedGroupId === groupId) {
        setSelectedGroupId(null);
      }
    }
  };

  if (groupsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Shared Groups</h2>
          <p className="text-muted-foreground">
            Collaborate with friends to track mutual relationships
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowJoinDialog(true)}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Join Group
          </Button>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Group
          </Button>
        </div>
      </div>

      {/* Groups List */}
      {groups.length === 0 ? (
        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <CardTitle>No shared groups yet</CardTitle>
            <CardDescription>
              Create your first group or join one using an invite code to start collaborating 
              on relationship tracking with friends.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowJoinDialog(true)}
            >
              Join Group
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              Create Group
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <SharedGroupCard
              key={group.id}
              group={group}
              memberCount={(group as any).group_members?.length || 0}
              userRole="member" // TODO: Get actual user role
              onLeaveGroup={handleLeaveGroup}
              onSelectGroup={setSelectedGroupId}
              isSelected={selectedGroupId === group.id}
            />
          ))}
        </div>
      )}

      {/* Selected Group Details */}
      {selectedGroupId && (
        <Card>
          <CardHeader>
            <CardTitle>Group Details</CardTitle>
            <CardDescription>
              Manage shared contacts and view group activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Group management features will be available in the next phase.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialogs */}
      <CreateGroupDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
      <JoinGroupDialog
        open={showJoinDialog}
        onOpenChange={setShowJoinDialog}
      />
    </div>
  );
};

export default SharedRelationshipsView;