import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSharedGroups } from '@/hooks/useSharedGroups';

interface JoinGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JoinGroupDialog: React.FC<JoinGroupDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [inviteCode, setInviteCode] = useState('');
  const { joinGroup } = useSharedGroups();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    try {
      await joinGroup.mutateAsync(inviteCode.trim());
      setInviteCode('');
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleClose = () => {
    setInviteCode('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join Shared Group</DialogTitle>
          <DialogDescription>
            Enter the invite code shared by a friend to join their relationship group.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="invite-code">Invite Code</Label>
              <Input
                id="invite-code"
                placeholder="Enter 6-character invite code..."
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="uppercase font-mono"
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={joinGroup.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!inviteCode.trim() || inviteCode.length !== 6 || joinGroup.isPending}
            >
              {joinGroup.isPending ? 'Joining...' : 'Join Group'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinGroupDialog;