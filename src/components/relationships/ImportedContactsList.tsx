import React from 'react';
import { ImportedContact } from '@/hooks/useContactImport';
import EnhancedContactPreview from './EnhancedContactPreview';

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

  // Convert index-based toggle to key-based toggle for enhanced preview
  const handleToggleSelect = (contactKey: string) => {
    const index = contacts.findIndex((contact, idx) => getContactKey(contact, idx) === contactKey);
    if (index !== -1) {
      onContactToggle(index);
    }
  };

  return (
    <EnhancedContactPreview
      contacts={contacts}
      selectedContacts={selectedContacts}
      onToggleSelect={handleToggleSelect}
      onSelectAll={onSelectAll}
      onSelectNone={onSelectNone}
      onAddSelected={onAddSelected}
      onCancel={onCancel}
    />
  );
};

export default ImportedContactsList;