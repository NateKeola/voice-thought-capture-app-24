import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X, Users, Save } from "lucide-react";
import { ImportedContact } from '@/hooks/useContactImport';

interface BulkContactEntryProps {
  onContactsAdded: (contacts: ImportedContact[]) => void;
}

interface ContactForm {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
}

const BulkContactEntry = ({ onContactsAdded }: BulkContactEntryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState<ContactForm[]>([
    {
      id: '1',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      notes: ''
    }
  ]);

  const addContactForm = () => {
    const newContact: ContactForm = {
      id: Date.now().toString(),
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      notes: ''
    };
    setContacts([...contacts, newContact]);
  };

  const removeContactForm = (id: string) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter(contact => contact.id !== id));
    }
  };

  const updateContact = (id: string, field: keyof ContactForm, value: string) => {
    setContacts(contacts.map(contact => 
      contact.id === id ? { ...contact, [field]: value } : contact
    ));
  };

  const handleSave = () => {
    const validContacts = contacts
      .filter(contact => contact.firstName.trim() || contact.lastName.trim())
      .map(contact => ({
        firstName: contact.firstName.trim(),
        lastName: contact.lastName.trim(),
        email: contact.email.trim(),
        phone: contact.phone.trim(),
        company: contact.company.trim(),
        notes: contact.notes.trim(),
        isValid: true
      }));

    if (validContacts.length > 0) {
      onContactsAdded(validContacts);
      setIsOpen(false);
      // Reset form
      setContacts([{
        id: Date.now().toString(),
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        notes: ''
      }]);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    // Reset form
    setContacts([{
      id: Date.now().toString(),
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      notes: ''
    }]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Quick Add Multiple
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Add Multiple Contacts
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {contacts.map((contact, index) => (
              <Card key={contact.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Contact {index + 1}</CardTitle>
                    {contacts.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContactForm(contact.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="First Name *"
                      value={contact.firstName}
                      onChange={(e) => updateContact(contact.id, 'firstName', e.target.value)}
                    />
                    <Input
                      placeholder="Last Name"
                      value={contact.lastName}
                      onChange={(e) => updateContact(contact.id, 'lastName', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Email"
                      type="email"
                      value={contact.email}
                      onChange={(e) => updateContact(contact.id, 'email', e.target.value)}
                    />
                    <Input
                      placeholder="Phone"
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => updateContact(contact.id, 'phone', e.target.value)}
                    />
                  </div>
                  <Input
                    placeholder="Company"
                    value={contact.company}
                    onChange={(e) => updateContact(contact.id, 'company', e.target.value)}
                  />
                  <Textarea
                    placeholder="Notes"
                    value={contact.notes}
                    onChange={(e) => updateContact(contact.id, 'notes', e.target.value)}
                    rows={2}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
        
        <div className="flex justify-between items-center pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={addContactForm}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Another Contact
          </Button>
          
          <div className="space-x-2">
            <Button variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Add {contacts.filter(c => c.firstName.trim() || c.lastName.trim()).length} Contact{contacts.filter(c => c.firstName.trim() || c.lastName.trim()).length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkContactEntry;