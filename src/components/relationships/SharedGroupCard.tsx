import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Copy, LogOut } from 'lucide-react';
import { SharedGroup } from '@/hooks/useSharedGroups';
import { useToast } from '@/components/ui/use-toast';

interface SharedGroupCardProps {
  group: SharedGroup;
  memberCount: number;
  userRole: 'admin' | 'member';
  onLeaveGroup: (groupId: string) => void;
  onSelectGroup: (groupId: string) => void;
  isSelected?: boolean;
}

const SharedGroupCard: React.FC<SharedGroupCardProps> = ({
  group,
  memberCount,
  userRole,
  onLeaveGroup,
  onSelectGroup,
  isSelected = false
}) => {
  const { toast } = useToast();

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(group.invite_code);
      toast({
        title: "Invite code copied",
        description: "The invite code has been copied to your clipboard."
      });
    } catch (error) {
      toast({
        title: "Error copying invite code",
        description: "Failed to copy the invite code to clipboard.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelectGroup(group.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{group.name}</CardTitle>
          <Badge variant={userRole === 'admin' ? 'default' : 'secondary'}>
            {userRole}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
            {group.invite_code}
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              copyInviteCode();
            }}
            className="h-6 w-6 p-0"
          >
            <Copy className="w-3 h-3" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onLeaveGroup(group.id);
            }}
            className="flex items-center gap-1 text-destructive hover:text-destructive"
          >
            <LogOut className="w-3 h-3" />
            Leave
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SharedGroupCard;