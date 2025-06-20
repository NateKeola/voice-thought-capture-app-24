import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import StepIndicator from './StepIndicator';
import AvatarSelector from './AvatarSelector';
import RelationshipTypeSelector from './RelationshipTypeSelector';
import ContactSearchInput from './ContactSearchInput';
import ContactSelectionCards from './ContactSelectionCards';

interface AddRelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (profileData: any) => void;
}

const relationshipTypes = [
  { id: 'work', label: 'Work', color: '#3B82F6' },
  { id: 'personal', label: 'Personal', color: '#10B981' }
];

const AddRelationshipModal = ({ isOpen, onClose, onSubmit }: AddRelationshipModalProps) => {
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

  const handleSubmit = () => {
    // Combine notes with relationship description
    const combinedNotes = [formData.relationshipDescription, formData.notes]
      .filter(note => note.trim())
      .join('\n\n---\n\n');

    // Join multiple types with a comma
    const typeString = formData.types.join(', ');

    onSubmit({
      first_name: formData.firstName,
      last_name: formData.lastName,
      type: typeString,
      email: formData.email || null,
      phone: formData.phone || null,
      notes: combinedNotes || null
    });
    onClose();
    setStep(1);
    setFormData({
      firstName: '',
      lastName: '',
      types: [],
      relationshipDescription: '',
      email: '',
      phone: '',
      notes: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="bg-orange-500 px-6 py-4">
          <h2 className="text-white font-bold text-lg">
            {step === 1 ? 'Create New Relationship' : 'Additional Details'}
          </h2>
        </div>
        
        {step === 1 ? (
          <div className="p-6">
            <AvatarSelector 
              initials={getInitials()} 
              onAvatarChange={setAvatar} 
            />
            
            <div className="space-y-4">
              <ContactSearchInput
                searchTerm={searchTerm}
                isSearching={isSearching}
                onSearchChange={setSearchTerm}
              />

              <ContactSelectionCards
                searchResults={searchResults}
                selectedContact={selectedContact}
                onContactSelect={handleContactSelect}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    First Name*
                  </label>
                  <Input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Last Name*
                  </label>
                  <Input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <RelationshipTypeSelector
                types={relationshipTypes}
                selectedTypes={formData.types}
                onTypeSelect={(types) => setFormData({...formData, types})}
              />

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Relationship Description
                </label>
                <Textarea
                  name="relationshipDescription"
                  value={formData.relationshipDescription}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe your relationship and how it connects to your life..."
                  className="resize-none"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Phone
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={() => setStep(2)}
                  disabled={!formData.firstName || !formData.lastName || formData.types.length === 0}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold">
                {getInitials()}
              </div>
              <div>
                <h3 className="font-medium text-gray-800">{formData.firstName} {formData.lastName}</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.types.map(type => (
                    <span key={type} className={`text-xs px-2 py-0.5 rounded-full ${
                      type === 'Work' ? 'bg-blue-100 text-blue-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {formData.relationshipDescription && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Relationship Description
                </label>
                <p className="text-gray-600 text-sm">{formData.relationshipDescription}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
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
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={handleSubmit}
                >
                  Create Relationship
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
