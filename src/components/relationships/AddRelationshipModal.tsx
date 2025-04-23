
import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import StepIndicator from './StepIndicator';
import AvatarSelector from './AvatarSelector';
import RelationshipTypeSelector from './RelationshipTypeSelector';

interface AddRelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const relationshipTypes = [
  { id: 'work', label: 'Work', color: '#3B82F6' },
  { id: 'client', label: 'Client', color: '#8B5CF6' },
  { id: 'personal', label: 'Personal', color: '#10B981' }
];

const AddRelationshipModal = ({ isOpen, onClose }: AddRelationshipModalProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    type: 'Work',
    email: '',
    phone: '',
    notes: ''
  });
  
  const [step, setStep] = useState(1);
  const [avatar, setAvatar] = useState<File | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const getInitials = () => {
    const first = formData.firstName.charAt(0);
    const last = formData.lastName.charAt(0);
    return (first + last).toUpperCase();
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
                selectedType={formData.type}
                onTypeSelect={(label) => setFormData({...formData, type: label})}
              />
              
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
                  disabled={!formData.firstName || !formData.lastName}
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
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  formData.type === 'Work' ? 'bg-blue-100 text-blue-600' :
                  formData.type === 'Client' ? 'bg-purple-100 text-purple-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {formData.type}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Notes
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
                  onClick={() => {
                    console.log('Submitting form data:', formData);
                    onClose();
                    setStep(1);
                    setFormData({
                      firstName: '',
                      lastName: '',
                      type: 'Work',
                      email: '',
                      phone: '',
                      notes: ''
                    });
                  }}
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

