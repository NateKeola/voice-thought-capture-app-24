
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Check } from 'lucide-react';
import { useUserInterests, Interest } from '@/hooks/useUserInterests';

interface AddInterestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddInterestsModal: React.FC<AddInterestsModalProps> = ({ isOpen, onClose }) => {
  const { allInterests, userInterests, addInterest, loading } = useUserInterests();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

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

  // Check if user has already selected an interest
  const isInterestSelected = (interestId: string) => {
    return userInterests.some(ui => ui.interest.id === interestId);
  };

  const handleAddInterest = async (interestId: string) => {
    await addInterest(interestId);
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
          <DialogTitle>Add Your Interests</DialogTitle>
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

export default AddInterestsModal;
