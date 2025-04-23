
import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface AddRelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleNext = () => {
    setStep(2);
  };
  
  const handleBack = () => {
    setStep(1);
  };
  
  const handleSubmit = () => {
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
  };
  
  const relationshipTypes = [
    { id: 'work', label: 'Work', color: '#3B82F6' },
    { id: 'client', label: 'Client', color: '#8B5CF6' },
    { id: 'personal', label: 'Personal', color: '#10B981' }
  ];
  
  const getInitials = () => {
    const first = formData.firstName.charAt(0);
    const last = formData.lastName.charAt(0);
    return (first + last).toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-orange-500 px-6 py-4">
          <h2 className="text-white font-bold text-lg">
            {step === 1 ? 'Create New Relationship' : 'Additional Details'}
          </h2>
        </div>
        
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="p-6">
            <div className="flex justify-center mb-6">
              <div 
                className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-xl font-bold text-orange-500 cursor-pointer"
                onClick={() => document.getElementById('avatar-upload')?.click()}
              >
                {getInitials() || 'Add'}
                <input 
                  id="avatar-upload" 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => e.target.files && setAvatar(e.target.files[0])}
                />
              </div>
            </div>
            
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
              
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Relationship Type*
                </label>
                <div className="flex space-x-2">
                  {relationshipTypes.map(type => (
                    <button
                      key={type.id}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.type === type.label
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setFormData({...formData, type: type.label})}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
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
                  onClick={handleNext}
                  disabled={!formData.firstName || !formData.lastName}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 2: Additional Details */}
        {step === 2 && (
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
                  onClick={handleBack}
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
        
        {/* Step Indicator */}
        <div className="px-6 py-3 bg-gray-50 flex justify-center">
          <div className="flex space-x-2">
            <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
            <div className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddRelationshipModal;
