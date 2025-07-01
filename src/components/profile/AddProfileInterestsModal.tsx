
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Check } from 'lucide-react';
import { useUserInterests, Interest } from '@/hooks/useUserInterests';
import { useProfileInterests } from '@/hooks/useProfileInterests';
import { useToast } from '@/components/ui/use-toast';

interface AddProfileInterestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  profileName: string;
}

const AddProfileInterestsModal: React.FC<AddProfileInterestsModalProps> = ({ 
  isOpen, 
  onClose, 
  profileId, 
  profileName 
}) => {
  const { toast } = useToast();
  const { allInterests, loading, createCustomInterest } = useUserInterests();
  const { profileInterests, addProfileInterest } = useProfileInterests(profileId);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [newInterestName, setNewInterestName] = useState('');
  const [isCreatingInterest, setIsCreatingInterest] = useState(false);

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

  // Check if profile has already selected an interest
  const isInterestSelected = (interestId: string) => {
    return profileInterests.some(pi => pi.interest.id === interestId);
  };

  const handleAddInterest = async (interestId: string) => {
    const success = await addProfileInterest(interestId);
    if (success) {
      toast({
        title: "Interest added",
        description: "Interest has been added to the profile.",
      });
    }
  };

  const handleCreateCustomInterest = async () => {
    if (!newInterestName.trim()) return;
    
    setIsCreatingInterest(true);
    try {
      const newInterest = await createCustomInterest(newInterestName.trim(), 'Custom');
      if (newInterest) {
        // Add the newly created interest to the profile
        await addProfileInterest(newInterest.id);
        setNewInterestName('');
        toast({
          title: "Custom interest created",
          description: `"${newInterestName}" has been created and added to ${profileName}.`,
        });
      } else {
        toast({
          title: "Error creating interest",
          description: "There was a problem creating the custom interest.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error creating interest",
        description: "There was a problem creating the custom interest.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingInterest(false);
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
          <DialogTitle>Add Interests for {profileName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
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
            
            {/* Add Custom Interest Section */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">Create Custom Interest</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter custom interest name..."
                  value={newInterestName}
                  onChange={(e) => setNewInterestName(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateCustomInterest()}
                />
                <Button
                  onClick={handleCreateCustomInterest}
                  disabled={!newInterestName.trim() || isCreatingInterest}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {isCreatingInterest ? 'Creating...' : 'Create'}
                </Button>
              </div>
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

export default AddProfileInterestsModal;
