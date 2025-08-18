import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, Copy, Users, Mail, Phone, Building } from "lucide-react";
import { ImportedContact } from '@/hooks/useContactImport';
import ContactQRGenerator from './ContactQRGenerator';
import { cn } from '@/lib/utils';

interface EnhancedContactPreviewProps {
  contacts: ImportedContact[];
  selectedContacts: string[];
  onToggleSelect: (contactKey: string) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onAddSelected: () => void;
  onCancel: () => void;
}

const EnhancedContactPreview = ({
  contacts,
  selectedContacts,
  onToggleSelect,
  onSelectAll,
  onSelectNone,
  onAddSelected,
  onCancel
}: EnhancedContactPreviewProps) => {
  const validContacts = contacts.filter(c => c.isValid);
  const invalidContacts = contacts.filter(c => !c.isValid);
  const duplicateContacts = contacts.filter(c => c.isDuplicate);
  const selectedCount = selectedContacts.length;

  const getContactKey = (contact: ImportedContact, index: number) => 
    `${contact.firstName}-${contact.lastName}-${contact.email}-${index}`;

  const ContactCard = ({ contact, index }: { contact: ImportedContact; index: number }) => {
    const contactKey = getContactKey(contact, index);
    const isSelected = selectedContacts.includes(contactKey);

    return (
      <Card className={cn(
        "transition-all duration-200",
        contact.isDuplicate && "border-amber-200 bg-amber-50/50",
        !contact.isValid && "border-red-200 bg-red-50/50",
        isSelected && contact.isValid && "border-primary bg-primary/5"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {contact.isValid && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelect(contactKey)}
                />
              )}
              <div className="flex-1">
                <CardTitle className="text-sm flex items-center gap-2">
                  {contact.firstName} {contact.lastName}
                  {contact.isDuplicate && (
                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-600">
                      <Copy className="h-3 w-3 mr-1" />
                      Duplicate
                    </Badge>
                  )}
                  {!contact.isValid && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Invalid
                    </Badge>
                  )}
                  {contact.isValid && !contact.isDuplicate && (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Valid
                    </Badge>
                  )}
                </CardTitle>
              </div>
              {contact.isValid && (
                <ContactQRGenerator contact={contact} />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 gap-2 text-sm">
            {contact.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{contact.email}</span>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{contact.phone}</span>
              </div>
            )}
            {contact.company && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building className="h-4 w-4" />
                <span>{contact.company}</span>
              </div>
            )}
            {contact.notes && (
              <div className="text-muted-foreground text-xs mt-2 p-2 bg-muted rounded">
                {contact.notes}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Contact Preview ({contacts.length})
          </h3>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-green-600 border-green-600">
              {validContacts.length} Valid
            </Badge>
            {duplicateContacts.length > 0 && (
              <Badge variant="outline" className="text-amber-600 border-amber-600">
                {duplicateContacts.length} Duplicate
              </Badge>
            )}
            {invalidContacts.length > 0 && (
              <Badge variant="destructive">
                {invalidContacts.length} Invalid
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSelectAll}
            disabled={validContacts.length === 0}
          >
            Select All Valid
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSelectNone}
            disabled={selectedCount === 0}
          >
            Select None
          </Button>
        </div>
      </div>

      <ScrollArea className="max-h-96 pr-4">
        <div className="space-y-3">
          {/* Valid Contacts */}
          {validContacts.length > 0 && (
            <div className="space-y-2">
              {validContacts.map((contact, index) => (
                <ContactCard key={index} contact={contact} index={index} />
              ))}
            </div>
          )}

          {/* Invalid Contacts */}
          {invalidContacts.length > 0 && (
            <div className="space-y-2">
              <Separator />
              <h4 className="text-sm font-medium text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Invalid Contacts (Cannot be imported)
              </h4>
              {invalidContacts.map((contact, index) => (
                <ContactCard key={`invalid-${index}`} contact={contact} index={index} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex justify-between items-center pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          {selectedCount} of {validContacts.length} contacts selected
        </p>
        <div className="space-x-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={onAddSelected} 
            disabled={selectedCount === 0}
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Add {selectedCount} Selected
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedContactPreview;