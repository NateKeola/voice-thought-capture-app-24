
import React from 'react';
import { Input } from "@/components/ui/input";

interface ContactSearchInputProps {
  searchTerm: string;
  isSearching: boolean;
  onSearchChange: (value: string) => void;
}

const ContactSearchInput = ({ searchTerm, isSearching, onSearchChange }: ContactSearchInputProps) => {
  return (
    <div>
      <label className="block text-gray-700 text-sm font-medium mb-1">
        Search Existing Contacts
      </label>
      <div className="relative">
        <Input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Type to search your contacts..."
          className="w-full"
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactSearchInput;
