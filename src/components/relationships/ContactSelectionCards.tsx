
import React from 'react';

interface ContactSelectionCardsProps {
  searchResults: any[];
  selectedContact?: any;
  onContactSelect: (contact: any) => void;
}

const ContactSelectionCards = ({ searchResults, selectedContact, onContactSelect }: ContactSelectionCardsProps) => {
  if (searchResults.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h4 className="block text-gray-700 text-sm font-medium mb-1">Search Results</h4>
      <ul>
        {searchResults.map((result) => (
          <li 
            key={result.id} 
            className="py-2 px-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
            onClick={() => onContactSelect(result)}
          >
            {result.name} ({result.email})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContactSelectionCards;
