import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, User, Edit, Trash2 } from 'lucide-react';
import { SharedContact } from '@/hooks/useSharedGroups';

interface SharedContactCardProps {
  contact: SharedContact;
  onEdit: (contact: SharedContact) => void;
  onDelete: (contactId: string, groupId: string) => void;
  canEdit?: boolean;
}

const SharedContactCard: React.FC<SharedContactCardProps> = ({
  contact,
  onEdit,
  onDelete,
  canEdit = true
}) => {
  const handleDelete = () => {
    if (confirm(`Are you sure you want to remove ${contact.name} from this group?`)) {
      onDelete(contact.id, contact.group_id);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{contact.name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Added {new Date(contact.created_at).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
          
          {canEdit && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(contact)}
                className="h-8 w-8 p-0"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {contact.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span>{contact.email}</span>
          </div>
        )}
        
        {contact.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span>{contact.phone}</span>
          </div>
        )}
        
        {contact.notes && (
          <div className="text-sm text-muted-foreground">
            <p className="line-clamp-2">{contact.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SharedContactCard;