
import React from 'react';

interface RelationType {
  id: string;
  label: string;
  color: string;
}

interface RelationshipTypeSelectorProps {
  types: RelationType[];
  selectedType: string;
  onTypeSelect: (label: string) => void;
}

const RelationshipTypeSelector = ({ types, selectedType, onTypeSelect }: RelationshipTypeSelectorProps) => {
  return (
    <div>
      <label className="block text-gray-700 text-sm font-medium mb-1">
        Relationship Type*
      </label>
      <div className="flex space-x-2">
        {types.map(type => (
          <button
            key={type.id}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedType === type.label
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => onTypeSelect(type.label)}
          >
            {type.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RelationshipTypeSelector;

