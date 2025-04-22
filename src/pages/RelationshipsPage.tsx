import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import BottomNavBar from '@/components/BottomNavBar';

const REL_TYPE_COLORS = {
  work: 'bg-blue-100 text-blue-600',
  client: 'bg-purple-100 text-purple-600',
  personal: 'bg-green-100 text-green-600',
  default: 'bg-gray-100 text-gray-600'
};
const MEMO_TYPE_COLORS = {
  task: 'bg-purple-100 text-purple-600',
  should: 'bg-orange-100 text-orange-500',
  note: 'bg-blue-100 text-blue-600',
};

const RelationshipsPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [relationships, setRelationships] = useState([]);
  const [filteredRelationships, setFilteredRelationships] = useState([]);
  const [selectedRelationship, setSelectedRelationship] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMemoModal, setShowAddMemoModal] = useState(false);
  const [newMemoText, setNewMemoText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingText, setRecordingText] = useState('');
  const [globalTab, setGlobalTab] = useState('relationships');

  useEffect(() => {
    const sampleRelationships = [
      {
        id: 1,
        name: 'Alex Chen',
        type: 'Work',
        lastInteraction: '2 days ago',
        initial: 'A',
        memos: [
          { id: 1, text: 'Mentioned interest in the new market analysis project', date: '2 days ago', type: 'note' },
          { id: 2, text: 'Follow up about the quarterly presentation next week', date: '1 week ago', type: 'task' },
          { id: 3, text: 'Should invite to the company retreat in August', date: '2 weeks ago', type: 'should' }
        ]
      },
      {
        id: 2,
        name: 'Jamie Smith',
        type: 'Client',
        lastInteraction: 'Yesterday',
        initial: 'J',
        memos: [
          { id: 1, text: 'Wants proposal for website redesign by Friday', date: 'Yesterday', type: 'task' },
          { id: 2, text: 'Mentioned their company is expanding to Europe next quarter', date: '3 days ago', type: 'note' }
        ]
      },
      {
        id: 3,
        name: 'Riley Jones',
        type: 'Personal',
        lastInteraction: '5 days ago',
        initial: 'R',
        memos: [
          { id: 1, text: 'Birthday coming up on May 15th', date: '5 days ago', type: 'task' },
          { id: 2, text: 'Should check out the restaurant they recommended downtown', date: '2 weeks ago', type: 'should' }
        ]
      },
      {
        id: 4,
        name: 'Taylor Wilson',
        type: 'Work',
        lastInteraction: '1 week ago',
        initial: 'T',
        memos: [
          { id: 1, text: 'Shared insights on the new product feature', date: '1 week ago', type: 'note' },
          { id: 2, text: 'Should connect on LinkedIn', date: '2 weeks ago', type: 'should' }
        ]
      },
      {
        id: 5,
        name: 'Morgan Lee',
        type: 'Client',
        lastInteraction: '3 days ago',
        initial: 'M',
        memos: [
          { id: 1, text: 'Schedule follow-up call about project timeline', date: '3 days ago', type: 'task' },
          { id: 2, text: 'Mentioned concerns about budget constraints', date: '1 week ago', type: 'note' }
        ]
      }
    ];
    setRelationships(sampleRelationships);
    setFilteredRelationships(sampleRelationships);
  }, []);

  useEffect(() => {
    let filtered = relationships;
    if (searchQuery) {
      filtered = filtered.filter(rel =>
        rel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rel.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeTab !== 'all') {
      filtered = filtered.filter(rel => rel.type.toLowerCase() === activeTab.toLowerCase());
    }
    setFilteredRelationships(filtered);
  }, [searchQuery, activeTab, relationships]);

  const handleAddMemo = () => {
    if (!newMemoText.trim() && !recordingText.trim()) return;
    const memoText = newMemoText || recordingText;
    const updatedRelationships = relationships.map(rel => {
      if (rel.id === selectedRelationship.id) {
        return {
          ...rel,
          lastInteraction: 'Just now',
          memos: [
            {
              id: rel.memos.length + 1,
              text: memoText,
              date: 'Just now',
              type: 'note'
            },
            ...rel.memos
          ]
        };
      }
      return rel;
    });

    setRelationships(updatedRelationships);
    setFilteredRelationships(updatedRelationships);
    setNewMemoText('');
    setRecordingText('');
    setShowAddMemoModal(false);
    toast({
      title: "Memo added",
      description: `Your memo for ${selectedRelationship.name} has been saved.`,
    });
  };

  const toggleRecording = () => {
    if (isRecording) {
      setRecordingText("Met about the new project proposal. They had some concerns about timeline but were excited about the concept overall.");
      setIsRecording(false);
    } else {
      setRecordingText('');
      setIsRecording(true);
    }
  };

  const getTypeColor = (type) => REL_TYPE_COLORS[type.toLowerCase()] || REL_TYPE_COLORS.default;
  const getMemoTypeColor = (type) => MEMO_TYPE_COLORS[type] || MEMO_TYPE_COLORS.note;

  const getMemoTypeIcon = (type) => {
    switch (type) {
      case 'task':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'should':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 110 2h4a1 1 0 01.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        );
      case 'note':
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-orange-500 px-6 pt-12 pb-6 rounded-b-3xl shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-white text-2xl font-bold">Relationships</h1>
            <p className="text-orange-100 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="bg-white bg-opacity-20 p-2 rounded-full">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-orange-600 font-bold text-lg">MJ</span>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-orange-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full bg-orange-400 bg-opacity-50 border border-orange-300 rounded-xl py-2 pl-10 pr-3 text-orange-100 placeholder-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
              placeholder="Search relationships..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div className="px-6 pt-4">
        <div className="flex space-x-2 overflow-x-auto">
          {['all', 'work', 'client', 'personal'].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeTab === tab ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>
      {/* Main content */}
      <div className="flex-1 px-6 py-4 overflow-hidden">
        <div className="flex h-full space-x-4">
          {/* List */}
          <div className="w-1/3 bg-white rounded-2xl shadow-sm overflow-y-auto">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800 text-lg">People</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredRelationships.map(relationship => (
                <div
                  key={relationship.id}
                  className={`p-4 cursor-pointer hover:bg-orange-50 transition-colors ${selectedRelationship?.id === relationship.id ? 'bg-orange-50' : ''}`}
                  onClick={() => setSelectedRelationship(relationship)}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                      <span className="text-orange-600 font-bold text-lg">{relationship.initial}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="text-gray-800 font-medium">{relationship.name}</p>
                        <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(relationship.type)}`}>
                          {relationship.type}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <p className="text-gray-500 text-xs">Last interaction: {relationship.lastInteraction}</p>
                        <p className="text-gray-500 text-xs">{relationship.memos.length} memos</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredRelationships.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No relationships found</p>
                  <Button
                    size="sm"
                    className="mt-4 w-full bg-orange-500 text-white"
                    onClick={() => toast({
                      title: "Feature coming soon",
                      description: "Adding new contacts is not available yet"
                    })}
                  >
                    Add New Contact
                  </Button>
                </div>
              )}
            </div>
          </div>
          {/* Memo detail panel */}
          <div className="w-2/3 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
            {selectedRelationship ? (
              <>
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                      <span className="text-orange-600 font-bold">{selectedRelationship.initial}</span>
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-800 text-lg">{selectedRelationship.name}</h2>
                      <p className="text-gray-500 text-xs">Last interaction: {selectedRelationship.lastInteraction}</p>
                    </div>
                  </div>
                  <Button
                    className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg flex items-center"
                    onClick={() => setShowAddMemoModal(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5a1 1 0 011 1zM15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" clipRule="evenodd" />
                    </svg>
                    Add Memo
                  </Button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {selectedRelationship.memos.map((memo, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${getMemoTypeColor(memo.type)}`}>
                            {getMemoTypeIcon(memo.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-700 text-sm">{memo.text}</p>
                            <div className="flex justify-between mt-2">
                              <p className="text-gray-400 text-xs">{memo.date}</p>
                              <span className={`px-2 py-1 rounded-full text-xs ${getMemoTypeColor(memo.type)}`}>
                                {memo.type}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-orange-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <p className="mt-4 text-gray-500">Select a relationship to view and add memos</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Add Memo Modal */}
      {showAddMemoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-lg">Add Memo for {selectedRelationship.name}</h3>
              <button
                className="text-gray-500"
                onClick={() => {
                  setShowAddMemoModal(false);
                  setNewMemoText('');
                  setRecordingText('');
                  setIsRecording(false);
                }}
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12-12-12zm0 0v-8" />
                </svg>
              </button>
            </div>
            {isRecording ? (
              <div className="mb-4">
                <div className="py-8 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-red-500 animate-pulse flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 animate-pulse">Recording...</p>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Memo Content
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={4}
                  placeholder="Add your memo here..."
                  value={recordingText || newMemoText}
                  onChange={(e) => {
                    if (recordingText) {
                      setRecordingText(e.target.value);
                    } else {
                      setNewMemoText(e.target.value);
                    }
                  }}
                ></textarea>
              </div>
            )}
            <div className="flex flex-col space-y-3">
              <Button
                className={`w-full flex items-center justify-center ${isRecording ? 'bg-red-500' : 'bg-orange-100 text-orange-500'}`}
                onClick={toggleRecording}
                type="button"
                variant={isRecording ? undefined : "outline"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                {isRecording ? 'Stop Recording' : 'Record Voice'}
              </Button>
              <Button
                className="w-full bg-orange-500 text-white"
                onClick={handleAddMemo}
                disabled={(!newMemoText && !recordingText) || isRecording}
              >
                Save Memo
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* SHARED Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={globalTab}
        onTabChange={(tab) => {
          setGlobalTab(tab);
        }}
      />
    </div>
  );
};

export default RelationshipsPage;
