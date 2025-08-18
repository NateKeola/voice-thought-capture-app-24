import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Users, UserPlus, Check, X } from 'lucide-react';
import { useCollaborativeGroups } from '@/hooks/useCollaborativeGroups';
import { useToast } from '@/hooks/use-toast';

interface GroupManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GroupManagementModal: React.FC<GroupManagementModalProps> = ({ isOpen, onClose }) => {
  const { toast } = useToast();
  const {
    groups,
    joinRequests,
    createGroup,
    joinGroupByCode,
    requestJoinGroup,
    handleJoinRequest,
    isLoading
  } = useCollaborativeGroups();

  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [joinGroupName, setJoinGroupName] = useState('');
  const [joinMessage, setJoinMessage] = useState('');

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      await createGroup.mutateAsync({
        name: newGroupName,
        description: newGroupDescription.trim() || undefined
      });
      setNewGroupName('');
      setNewGroupDescription('');
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleJoinByCode = async () => {
    if (!inviteCode.trim()) return;

    try {
      await joinGroupByCode.mutateAsync(inviteCode.trim());
      setInviteCode('');
    } catch (error) {
      console.error('Error joining by code:', error);
    }
  };

  const handleRequestJoin = async () => {
    if (!joinGroupName.trim()) return;

    try {
      await requestJoinGroup.mutateAsync({
        groupName: joinGroupName,
        message: joinMessage.trim() || undefined
      });
      setJoinGroupName('');
      setJoinMessage('');
    } catch (error) {
      console.error('Error requesting join:', error);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Invite code copied",
      description: "The invite code has been copied to your clipboard."
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Groups</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="my-groups" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-groups">My Groups</TabsTrigger>
            <TabsTrigger value="join">Join</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="my-groups" className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="group-name">Create New Group</Label>
              <Input
                id="group-name"
                placeholder="Group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <Textarea
                placeholder="Description (optional)"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                rows={3}
              />
              <Button
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim() || createGroup.isPending}
                className="w-full"
              >
                <Users className="h-4 w-4 mr-2" />
                Create Group
              </Button>
            </div>

            <div className="space-y-3">
              <Label>Your Groups</Label>
              {groups.length === 0 ? (
                <p className="text-sm text-muted-foreground">No groups yet</p>
              ) : (
                <div className="space-y-2">
                  {groups.map((group) => (
                    <div key={group.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{group.name}</p>
                        <p className="text-sm text-muted-foreground">{group.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyInviteCode(group.invite_code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="join" className="space-y-4">
            <div className="space-y-3">
              <Label>Join by Invite Code</Label>
              <Input
                placeholder="Enter invite code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
              />
              <Button
                onClick={handleJoinByCode}
                disabled={!inviteCode.trim() || joinGroupByCode.isPending}
                className="w-full"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Join by Code
              </Button>
            </div>

            <div className="border-t pt-4 space-y-3">
              <Label>Request to Join Group</Label>
              <Input
                placeholder="Group name"
                value={joinGroupName}
                onChange={(e) => setJoinGroupName(e.target.value)}
              />
              <Textarea
                placeholder="Message to admins (optional)"
                value={joinMessage}
                onChange={(e) => setJoinMessage(e.target.value)}
                rows={3}
              />
              <Button
                onClick={handleRequestJoin}
                disabled={!joinGroupName.trim() || requestJoinGroup.isPending}
                className="w-full"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Send Request
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <Label>Pending Join Requests</Label>
            {joinRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending requests</p>
            ) : (
              <div className="space-y-3">
                {joinRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">
                        {request.status}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleJoinRequest.mutate({ requestId: request.id, action: 'approve' })}
                          disabled={handleJoinRequest.isPending}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleJoinRequest.mutate({ requestId: request.id, action: 'reject' })}
                          disabled={handleJoinRequest.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {request.message && (
                      <p className="text-sm text-muted-foreground">{request.message}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default GroupManagementModal;