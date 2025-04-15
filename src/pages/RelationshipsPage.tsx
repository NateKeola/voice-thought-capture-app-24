
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import BottomNavBar from '@/components/BottomNavBar';
import { User, SearchIcon, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Mock data for relationships
const mockRelationships = [
  { id: '1', name: 'Alex Johnson', lastContact: '2 days ago', notes: 3 },
  { id: '2', name: 'Sam Wilson', lastContact: '1 week ago', notes: 5 },
  { id: '3', name: 'Taylor Rodriguez', lastContact: 'Yesterday', notes: 1 },
  { id: '4', name: 'Morgan Lee', lastContact: '3 days ago', notes: 2 },
];

const RelationshipsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [relationships, setRelationships] = useState(mockRelationships);
  
  // Filter relationships based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = mockRelationships.filter(rel => 
        rel.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setRelationships(filtered);
    } else {
      setRelationships(mockRelationships);
    }
  }, [searchQuery]);

  return (
    <div className="container max-w-md mx-auto py-6 px-4 pb-20">
      <div className="flex justify-center mb-6">
        <h1 className="text-2xl font-bold text-center">
          Relationships
        </h1>
      </div>

      <div className="relative mb-6">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          className="pl-10 pr-4 py-2 w-full"
          placeholder="Search relationships..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {relationships.map((relationship) => (
          <div 
            key={relationship.id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center"
            onClick={() => navigate(`/relationship/${relationship.id}`)}
          >
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
              <User className="text-orange-500" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{relationship.name}</h3>
              <p className="text-sm text-gray-500">Last contact: {relationship.lastContact}</p>
            </div>
            <div className="bg-orange-100 text-orange-500 rounded-full px-2 py-1 text-xs font-medium">
              {relationship.notes} notes
            </div>
          </div>
        ))}

        <button
          className="w-full mt-4 py-3 flex items-center justify-center text-orange-500 rounded-lg border border-orange-200 bg-orange-50"
          onClick={() => toast({ title: "Feature coming soon", description: "Adding new relationships will be available in a future update" })}
        >
          <PlusCircle size={20} className="mr-2" />
          Add Relationship
        </button>
      </div>

      <BottomNavBar activeTab="relationships" onTabChange={(tab) => {
        if (tab === 'record') {
          navigate('/home');
        } else if (tab === 'memos') {
          navigate('/memos');
        }
      }} />
    </div>
  );
};

export default RelationshipsPage;
