
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import BottomNavBar from '@/components/BottomNavBar';
import { User, Search, Phone, MessageSquare, Calendar, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Sample data for stats
const stats = {
  totalRelationships: 15,
  activeContacts: 8,
  pendingFollowUps: 3
};

// Enhanced mock data for relationships
const mockRelationships = [
  { 
    id: '1', 
    name: 'Alex Johnson', 
    lastContact: '2 days ago', 
    notes: 3,
    type: 'Work',
    interactions: 12,
    initial: 'A'
  },
  { 
    id: '2', 
    name: 'Sam Wilson', 
    lastContact: '1 week ago', 
    notes: 5,
    type: 'Client',
    interactions: 8,
    initial: 'S'
  },
  { 
    id: '3', 
    name: 'Taylor Rodriguez', 
    lastContact: 'Yesterday', 
    notes: 1,
    type: 'Work',
    interactions: 5,
    initial: 'T'
  }
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
      {/* Header */}
      <div className="bg-orange-500 -mx-4 px-6 pt-6 pb-6 rounded-b-3xl shadow-md mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-white text-2xl font-bold">Relationships</h1>
            <p className="text-orange-100 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="bg-white/20 p-2 rounded-full">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-600 font-bold text-lg">
                {localStorage.getItem('userInitials') || 'U'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex mt-6 space-x-4">
          <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-gray-500 text-xs">Total</p>
                <p className="text-gray-800 font-bold text-xl">{stats.totalRelationships}</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-gray-500 text-xs">Active</p>
                <p className="text-gray-800 font-bold text-xl">{stats.activeContacts}</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-gray-500 text-xs">Follow-ups</p>
                <p className="text-gray-800 font-bold text-xl">{stats.pendingFollowUps}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input
          className="pl-10 pr-4 py-2 w-full"
          placeholder="Search relationships..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Relationships List */}
      <div className="space-y-4">
        {relationships.map((relationship) => (
          <div 
            key={relationship.id}
            className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            onClick={() => navigate(`/relationship/${relationship.id}`)}
          >
            <div className="flex items-center">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-orange-600 font-bold text-xl">{relationship.initial}</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900">{relationship.name}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs 
                    ${relationship.type === 'Work' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}
                  >
                    {relationship.type}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-gray-500 text-sm">{relationship.interactions} interactions</p>
                  <div className="flex space-x-2">
                    <button className="p-2 bg-gray-100 rounded-full">
                      <Phone className="h-4 w-4 text-gray-500" />
                    </button>
                    <button className="p-2 bg-gray-100 rounded-full">
                      <MessageSquare className="h-4 w-4 text-gray-500" />
                    </button>
                    <button className="p-2 bg-gray-100 rounded-full">
                      <Calendar className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <Button
          className="w-full mt-4 py-6"
          variant="outline"
          onClick={() => toast({ 
            title: "Feature coming soon", 
            description: "Adding new relationships will be available in a future update" 
          })}
        >
          Add New Relationship
        </Button>
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
