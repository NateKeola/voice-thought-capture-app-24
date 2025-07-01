
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Search, User, X } from "lucide-react";
import { useProfiles } from '@/hooks/useProfiles';

interface RelationshipSelectorProps {
  selectedRelationshipId?: string | null;
  onRelationshipSelect: (relationshipId: string | null, relationshipName?: string) => void;
}

const RelationshipSelector: React.FC<RelationshipSelectorProps> = ({
  selectedRelationshipId,
  onRelationshipSelect
}) => {
  const { profiles } = useProfiles();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState<any>(null);

  // Find selected relationship on mount
  useEffect(() => {
    if (selectedRelationshipId && profiles.length > 0) {
      const relationship = profiles.find(p => p.id === selectedRelationshipId);
      if (relationship) {
        setSelectedRelationship(relationship);
      }
    }
  }, [selectedRelationshipId, profiles]);

  const filteredProfiles = profiles.filter(profile => {
    const fullName = `${profile.first_name} ${profile.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const handleRelationshipSelect = (profile: any) => {
    setSelectedRelationship(profile);
    setShowDropdown(false);
    setSearchTerm('');
    onRelationshipSelect(profile.id, `${profile.first_name} ${profile.last_name}`);
  };

  const handleRemoveRelationship = () => {
    setSelectedRelationship(null);
    onRelationshipSelect(null);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">
        Link to Relationship (Optional)
      </Label>
      
      {selectedRelationship ? (
        <Card className="border border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedRelationship.first_name} {selectedRelationship.last_name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {selectedRelationship.type}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveRelationship}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search relationships..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="pl-10"
            />
          </div>
          
          {showDropdown && searchTerm && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredProfiles.length > 0 ? (
                filteredProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => handleRelationshipSelect(profile)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {profile.first_name} {profile.last_name}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {profile.type}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">
                  No relationships found
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RelationshipSelector;
