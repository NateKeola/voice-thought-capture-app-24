
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Check } from 'lucide-react';
import { useUserInterests, Interest } from '@/hooks/useUserInterests';
import { useProfileInterests } from '@/hooks/useProfileInterests';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddInterestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId?: string;
  mode?: 'user' | 'profile';
}

const AddInterestsModal: React.FC<AddInterestsModalProps> = ({ 
  isOpen, 
  onClose, 
  profileId,
  mode = 'user' 
}) => {
  const { allInterests, userInterests, addInterest: addUserInterest, createCustomInterest, loading } = useUserInterests();
  const { profileInterests, addProfileInterest } = useProfileInterests(profileId);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customInterestName, setCustomInterestName] = useState('');
  const [customInterestCategory, setCustomInterestCategory] = useState('');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(allInterests.map(interest => interest.category))];
    return cats.sort();
  }, [allInterests]);

  // Filter interests based on search term and category
  const filteredInterests = useMemo(() => {
    return allInterests.filter(interest => {
      const matchesSearch = interest.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || interest.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allInterests, searchTerm, selectedCategory]);

  // Group filtered interests by category
  const groupedInterests = useMemo(() => {
    const groups: { [key: string]: Interest[] } = {};
    filteredInterests.forEach(interest => {
      if (!groups[interest.category]) {
        groups[interest.category] = [];
      }
      groups[interest.category].push(interest);
    });
    return groups;
  }, [filteredInterests]);

  // Check if interest is already selected based on mode
  const isInterestSelected = (interestId: string) => {
    if (mode === 'profile' && profileId) {
      return profileInterests.some(pi => pi.interest.id === interestId);
    }
    return userInterests.some(ui => ui.interest.id === interestId);
  };

  const handleAddInterest = async (interestId: string) => {
    try {
      if (mode === 'profile' && profileId) {
        await addProfileInterest(interestId);
      } else {
        await addUserInterest(interestId);
      }
    } catch (error) {
      console.error('Error adding interest:', error);
    }
  };

  const handleCreateCustomInterest = async () => {
    if (!customInterestName.trim() || !customInterestCategory.trim()) return;

    setIsCreatingCustom(true);
    try {
      console.log('Creating custom interest:', customInterestName, customInterestCategory);
      const newInterest = await createCustomInterest(customInterestName.trim(), customInterestCategory);
      
      if (newInterest) {
        console.log('Successfully created interest:', newInterest);
        
        // Automatically add the new interest based on mode
        if (mode === 'profile' && profileId) {
          await addProfileInterest(newInterest.id);
        } else {
          await addUserInterest(newInterest.id);
        }
        
        // Reset form
        setCustomInterestName('');
        setCustomInterestCategory('');
        setShowCustomForm(false);
        
        console.log('Custom interest created and added successfully');
      } else {
        console.error('Failed to create custom interest - no data returned');
      }
    } catch (error) {
      console.error('Error creating custom interest:', error);
    } finally {
      setIsCreatingCustom(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading interests...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {mode === 'profile' ? 'Add Profile Interests' : 'Add Your Interests'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Add Custom Interest Button */}
          <div className="flex justify-between items-center">
            <div className="flex-1">
              {/* Search and filter controls */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search interests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === '' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('')}
                  >
                    All Categories
                  </Button>
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowCustomForm(!showCustomForm)}
              variant="outline"
              className="ml-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Special Interest
            </Button>
          </div>

          {/* Custom Interest Form */}
          {showCustomForm && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 className="font-medium text-gray-800">Create Custom Interest</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Interest name..."
                  value={customInterestName}
                  onChange={(e) => setCustomInterestName(e.target.value)}
                />
                <Select value={customInterestCategory} onValueChange={setCustomInterestCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateCustomInterest}
                  disabled={!customInterestName.trim() || !customInterestCategory.trim() || isCreatingCustom}
                  size="sm"
                >
                  {isCreatingCustom ? 'Creating...' : 'Create & Add Interest'}
                </Button>
                <Button
                  onClick={() => {
                    setShowCustomForm(false);
                    setCustomInterestName('');
                    setCustomInterestCategory('');
                  }}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Interests list */}
          <div className="flex-1 overflow-y-auto space-y-6">
            {Object.entries(groupedInterests).map(([category, interests]) => (
              <div key={category}>
                <h3 className="font-semibold text-lg mb-3 text-gray-800">{category}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {interests.map(interest => {
                    const isSelected = isInterestSelected(interest.id);
                    return (
                      <Button
                        key={interest.id}
                        variant={isSelected ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => !isSelected && handleAddInterest(interest.id)}
                        disabled={isSelected}
                        className="justify-start h-auto py-2 px-3"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-sm">{interest.name}</span>
                          {isSelected ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddInterestsModal;
