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

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [groupName, setGroupName] = useState('');
  const { createGroup } = useSharedGroups();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    try {
      await createGroup.mutateAsync(groupName.trim());
      setGroupName('');
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleClose = () => {
    setGroupName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Shared Group</DialogTitle>
          <DialogDescription>
            Create a new group to share relationship information with friends. 
            You'll get an invite code to share with others.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="Enter group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                maxLength={50}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createGroup.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!groupName.trim() || createGroup.isPending}
            >
              {createGroup.isPending ? 'Creating...' : 'Create Group'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;