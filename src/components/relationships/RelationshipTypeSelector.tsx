
import React from 'react';

interface RelationType {
  id: string;
  label: string;
  color: string;
}

interface RelationshipTypeSelectorProps {
  types: RelationType[];
  selectedTypes: string[];
  onTypeSelect: (types: string[]) => void;
}

const RelationshipTypeSelector = ({ types, selectedTypes, onTypeSelect }: RelationshipTypeSelectorProps) => {
  const handleTypeToggle = (typeLabel: string) => {
    if (selectedTypes.includes(typeLabel)) {
      // Remove the type if it's already selected
      onTypeSelect(selectedTypes.filter(type => type !== typeLabel));
    } else {
      // Add the type if it's not selected
      onTypeSelect([...selectedTypes, typeLabel]);
    }
  };

  return (
    <div>
      <label className="block text-gray-700 text-sm font-medium mb-1">
        Relationship Type* (can select multiple)
      </label>
      <div className="flex space-x-2">
        {types.map(type => (
          <button
            key={type.id}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedTypes.includes(type.label)
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => handleTypeToggle(type.label)}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RelationshipTypeSelector;
