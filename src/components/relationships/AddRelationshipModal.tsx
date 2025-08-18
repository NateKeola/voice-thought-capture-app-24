import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import StepIndicator from './StepIndicator';
import AvatarSelector from './AvatarSelector';
import RelationshipTypeSelector from './RelationshipTypeSelector';
import ContactSearchInput from './ContactSearchInput';
import ContactSelectionCards from './ContactSelectionCards';
import ContactImportButton from './ContactImportButton';
import ImportedContactsList from './ImportedContactsList';
import { ImportedContact } from '@/hooks/useContactImport';

interface AddRelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (profileData: any) => void;
  prefilledData?: {
    firstName?: string;
    lastName?: string;
    type?: string;
    relationshipDescription?: string;
    email?: string;
    phone?: string;
  };
  editingProfile?: {
    id: string;
    first_name: string;
    last_name: string;
    type: string;
    email?: string;
    phone?: string;
    notes?: string;
  } | null;
}

const relationshipTypes = [
  { id: 'work', label: 'Work', color: '#3B82F6' },
  { id: 'personal', label: 'Personal', color: '#10B981' }
];

const AddRelationshipModal = ({ isOpen, onClose, onSubmit, prefilledData, editingProfile }: AddRelationshipModalProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    types: [] as string[],
    relationshipDescription: '',
    email: '',
    phone: '',
    notes: ''
  });
  
  const [step, setStep] = useState(1);
  const [avatar, setAvatar] = useState<File | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  // Contact import states
  const [importedContacts, setImportedContacts] = useState<ImportedContact[]>([]);
  const [selectedImportedContacts, setSelectedImportedContacts] = useState<string[]>([]);
  const [showImportedContacts, setShowImportedContacts] = useState(false);

  // Update form data when prefilledData or editingProfile changes
  useEffect(() => {
    if (isOpen) {
      if (editingProfile) {
        // Populate form with existing profile data for editing
        setFormData({
          firstName: editingProfile.first_name || '',
          lastName: editingProfile.last_name || '',
          types: editingProfile.type ? [editingProfile.type] : [],
          relationshipDescription: editingProfile.notes || '',
          email: editingProfile.email || '',
          phone: editingProfile.phone || '',
          notes: ''
        });
      } else if (prefilledData) {
        // Populate form with detected data for new relationships
        setFormData(prev => ({
          ...prev,
          firstName: prefilledData.firstName || '',
          lastName: prefilledData.lastName || '',
          types: prefilledData.type ? [prefilledData.type] : [],
          relationshipDescription: prefilledData.relationshipDescription || '',
          email: prefilledData.email || '',
          phone: prefilledData.phone || ''
        }));
      }
    }
  }, [prefilledData, editingProfile, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        firstName: '',
        lastName: '',
        types: [],
        relationshipDescription: '',
        email: '',
        phone: '',
        notes: ''
      });
      setStep(1);
      setImportedContacts([]);
      setSelectedImportedContacts([]);
      setShowImportedContacts(false);
    }
  }, [isOpen]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const getInitials = () => {
    const first = formData.firstName.charAt(0);
    const last = formData.lastName.charAt(0);
    return (first + last).toUpperCase();
  };

  const handleContactSelect = (contact: any) => {
    setSelectedContact(contact);
    // You can add logic here to populate form fields with selected contact data
  };

  // Contact import handlers
  const handleContactsImported = (contacts: ImportedContact[]) => {
    setImportedContacts(contacts);
    setSelectedImportedContacts(contacts.map((_, index) => `${contacts[index].firstName}-${contacts[index].lastName}-${index}`));
    setShowImportedContacts(true);
  };

  const handleImportedContactToggle = (contactIndex: number) => {
    const contact = importedContacts[contactIndex];
    const contactKey = `${contact.firstName}-${contact.lastName}-${contactIndex}`;
    
    setSelectedImportedContacts(prev => 
      prev.includes(contactKey)
        ? prev.filter(key => key !== contactKey)
        : [...prev, contactKey]
    );
  };

  const handleSelectAllImported = () => {
    const allKeys = importedContacts.map((contact, index) => 
      `${contact.firstName}-${contact.lastName}-${index}`
    );
    setSelectedImportedContacts(allKeys);
  };

  const handleSelectNoneImported = () => {
    setSelectedImportedContacts([]);
  };

  const handleAddSelectedContacts = () => {
    const selectedContactsData = importedContacts.filter((contact, index) => {
      const contactKey = `${contact.firstName}-${contact.lastName}-${index}`;
      return selectedImportedContacts.includes(contactKey);
    });

    // For now, just fill the form with the first selected contact
    // In a full implementation, you might want to create multiple contacts
    if (selectedContactsData.length > 0) {
      const firstContact = selectedContactsData[0];
      setFormData(prev => ({
        ...prev,
        firstName: firstContact.firstName,
        lastName: firstContact.lastName,
        email: firstContact.email || '',
        phone: firstContact.phone || '',
        types: ['personal'] // Default to personal
      }));
    }

    setShowImportedContacts(false);
    setImportedContacts([]);
    setSelectedImportedContacts([]);
  };

  const handleCancelImport = () => {
    setShowImportedContacts(false);
    setImportedContacts([]);
    setSelectedImportedContacts([]);
  };

  const handleSubmit = () => {
    // Combine notes with relationship description
    const combinedNotes = [formData.relationshipDescription, formData.notes]
      .filter(note => note.trim())
      .join('\n\n---\n\n');

    // Join multiple types with a comma
    const typeString = formData.types.join(', ');

    const profileData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      type: typeString,
      email: formData.email || null,
      phone: formData.phone || null,
      notes: combinedNotes || null
    };

    // If editing, include the profile ID
    if (editingProfile) {
      onSubmit({ ...profileData, id: editingProfile.id });
    } else {
      onSubmit(profileData);
    }
  };

  const getModalTitle = () => {
    if (editingProfile) {
      return 'Edit Contact';
    }
    if (prefilledData) {
      return 'Add Detected Contact';
    }
    return step === 1 ? 'Create New Relationship' : 'Additional Details';
  };

  const isEditing = !!editingProfile;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="bg-primary px-6 py-4">
          <h2 className="text-primary-foreground font-bold text-lg">
            {getModalTitle()}
          </h2>
          {prefilledData && !isEditing && (
            <p className="text-primary-foreground/80 text-sm mt-1">
              Detected from your memo
            </p>
          )}
        </div>
        
        {step === 1 ? (
          <div className="p-6">
            {showImportedContacts ? (
              <ImportedContactsList
                contacts={importedContacts}
                selectedContacts={selectedImportedContacts}
                onContactToggle={handleImportedContactToggle}
                onSelectAll={handleSelectAllImported}
                onSelectNone={handleSelectNoneImported}
                onAddSelected={handleAddSelectedContacts}
                onCancel={handleCancelImport}
              />
            ) : (
              <>
                <AvatarSelector 
                  initials={getInitials()} 
                  onAvatarChange={setAvatar} 
                />
                
                <div className="space-y-4">
                  {!prefilledData && !isEditing && (
                    <>
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <ContactSearchInput
                            searchTerm={searchTerm}
                            isSearching={isSearching}
                            onSearchChange={setSearchTerm}
                          />
                        </div>
                        <div className="ml-4">
                          <ContactImportButton
                            onContactsImported={handleContactsImported}
                            disabled={false}
                          />
                        </div>
                      </div>

                      <ContactSelectionCards
                        searchResults={searchResults}
                        selectedContact={selectedContact}
                        onContactSelect={handleContactSelect}
                      />
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-foreground text-sm font-medium mb-1">
                        First Name*
                      </label>
                      <Input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className={(prefilledData || isEditing) ? "bg-accent/50 border-accent" : ""}
                      />
                    </div>
                    <div>
                      <label className="block text-foreground text-sm font-medium mb-1">
                        Last Name*
                      </label>
                      <Input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className={(prefilledData || isEditing) ? "bg-accent/50 border-accent" : ""}
                      />
                    </div>
                  </div>
                  
                  <RelationshipTypeSelector
                    types={relationshipTypes}
                    selectedTypes={formData.types}
                    onTypeSelect={(types) => setFormData({...formData, types})}
                  />

                  <div>
                    <label className="block text-foreground text-sm font-medium mb-1">
                      Relationship Description
                    </label>
                    <Textarea
                      name="relationshipDescription"
                      value={formData.relationshipDescription}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Describe your relationship and how it connects to your life..."
                      className={`resize-none ${(prefilledData || isEditing) ? "bg-accent/50 border-accent" : ""}`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-foreground text-sm font-medium mb-1">
                      Email
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="contact@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-foreground text-sm font-medium mb-1">
                      Phone
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div className="pt-4 flex justify-end">
                    <Button
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => setStep(2)}
                      disabled={!formData.firstName || !formData.lastName || formData.types.length === 0}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold">
                {getInitials()}
              </div>
              <div>
                <h3 className="font-medium text-foreground">{formData.firstName} {formData.lastName}</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.types.map(type => (
                    <span key={type} className={`text-xs px-2 py-0.5 rounded-full ${
                      type === 'work' ? 'bg-accent text-accent-foreground' :
                      'bg-secondary text-secondary-foreground'
                    }`}>
                      {type}
                    </span>
                  ))}
                </div>
                {(formData.email || formData.phone) && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {formData.email && <div>📧 {formData.email}</div>}
                    {formData.phone && <div>📞 {formData.phone}</div>}
                  </div>
                )}
              </div>
            </div>

            {formData.relationshipDescription && (
              <div className="mb-4 p-3 bg-muted rounded-lg">
                <label className="block text-foreground text-sm font-medium mb-1">
                  Relationship Description
                </label>
                <p className="text-muted-foreground text-sm">{formData.relationshipDescription}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-foreground text-sm font-medium mb-1">
                  Additional Notes
                </label>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Add any additional details, context, or notes about this relationship..."
                />
              </div>
              
              <div className="pt-4 flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleSubmit}
                >
                  {isEditing ? 'Update Contact' : 'Create Relationship'}
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <StepIndicator currentStep={step} totalSteps={2} />
      </DialogContent>
    </Dialog>
  );
};

export default AddRelationshipModal;