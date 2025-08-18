import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Mail, Phone } from "lucide-react";
import { ImportedContact } from '@/hooks/useContactImport';

interface ImportedContactsListProps {
  contacts: ImportedContact[];
  selectedContacts: string[];
  onContactToggle: (contactIndex: number) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onAddSelected: () => void;
  onCancel: () => void;
}

const ImportedContactsList: React.FC<ImportedContactsListProps> = ({
  contacts,
  selectedContacts,
  onContactToggle,
  onSelectAll,
  onSelectNone,
  onAddSelected,
  onCancel
}) => {
  const getContactKey = (contact: ImportedContact, index: number) => 
    `${contact.firstName}-${contact.lastName}-${index}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Select Contacts to Import ({contacts.length} found)
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            className="text-xs"
          >
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectNone}
            className="text-xs"
          >
            Select None
          </Button>
        </div>
      </div>

      <ScrollArea className="h-64 w-full rounded-md border border-border">
        <div className="p-2 space-y-2">
          {contacts.map((contact, index) => {
            const contactKey = getContactKey(contact, index);
            const isSelected = selectedContacts.includes(contactKey);
            
            return (
              <Card key={contactKey} className={`cursor-pointer transition-colors ${
                isSelected ? 'bg-accent/50' : ''
              }`}>
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onContactToggle(index)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-foreground truncate">
                          {contact.firstName} {contact.lastName}
                        </span>
                      </div>
                      
                      {contact.email && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                      )}
                      
                      {contact.phone && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{contact.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      <div className="flex justify-between pt-2">
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          onClick={onAddSelected}
          disabled={selectedContacts.length === 0}
          className="bg-primary hover:bg-primary/90"
        >
          Add {selectedContacts.length} Contact{selectedContacts.length !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
};

export default ImportedContactsList;