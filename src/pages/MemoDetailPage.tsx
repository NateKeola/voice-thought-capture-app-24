import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModeToggle } from "@/components/ModeToggle";
import { useMemos } from '@/contexts/MemoContext';
import { useProfiles } from '@/contexts/ProfileContext';
import { MemoType } from '@/types';
import { PersonDetectionService } from '@/services/PersonDetectionService';
import { RelationshipLinkingService } from '@/services/RelationshipLinkingService';
import PersonDetectionDialog from '@/components/relationships/PersonDetectionDialog';
import MemoEditScreen from '@/components/memo/MemoEditScreen';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const MemoDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { memos, updateMemo, deleteMemo } = useMemos();
  const { profiles } = useProfiles();
  const [memo, setMemo] = useState<{
    id: string;
    text: string;
    type: MemoType;
    audioUrl: string | null;
    createdAt: string;
    completed: boolean;
    title?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPersonDialog, setShowPersonDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Add state to track if this is a newly created memo
  const [isNewMemo, setIsNewMemo] = useState(false);

  useEffect(() => {
    const fetchMemo = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const getMemo = async (id: string) => {
          const memo = memos.find((memo) => memo.id === id);
          if (memo) {
            return memo;
          } else {
            return null;
          }
        };
        const fetchedMemo = await getMemo(id);
        
        if (fetchedMemo) {
          setMemo(fetchedMemo);
          
          // Check if this memo was just created (within last 30 seconds)
          const memoAge = Date.now() - new Date(fetchedMemo.createdAt).getTime();
          const isRecentlyCreated = memoAge < 30000; // 30 seconds
          setIsNewMemo(isRecentlyCreated);
          
          // Only detect people if this is a newly created memo
          if (isRecentlyCreated) {
            console.log('Detecting people for newly created memo');
            const detectedPeople = PersonDetectionService.detectPeople(fetchedMemo.text);
            console.log('Detected people after save:', detectedPeople);
            
            if (detectedPeople.length > 0) {
              // Filter out people who already exist in contacts
              const existingNames = profiles.map(p => 
                `${p.first_name} ${p.last_name}`.toLowerCase().trim()
              );
              
              const newPeople = detectedPeople.filter(person => {
                const personName = person.name.toLowerCase().trim();
                return !existingNames.includes(personName);
              });
              
              console.log('New people (filtered):', newPeople);
              
              if (newPeople.length > 0) {
                RelationshipLinkingService.storePendingRelationships(newPeople);
                setShowPersonDialog(true);
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching memo:', err);
        setError('Failed to load memo');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemo();
  }, [id, profiles]);

  const handleSave = async (memoData: { text: string; type: MemoType; title?: string }) => {
    if (!memo) return;

    try {
      await updateMemo(memo.id, {
        text: memoData.text,
        type: memoData.type,
        title: memoData.title
      });
      
      // Optimistically update the local state
      setMemo({
        ...memo,
        text: memoData.text,
        type: memoData.type,
        title: memoData.title
      });
      
      setIsEditing(false);
      toast.success("Memo updated successfully");
    } catch (error) {
      console.error("Error updating memo:", error);
      toast.error("Failed to update memo");
    }
  };

  const handleDelete = async () => {
    if (!memo) return;

    try {
      await deleteMemo(memo.id);
      navigate('/');
      toast.success("Memo deleted successfully");
    } catch (error) {
      console.error("Error deleting memo:", error);
      toast.error("Failed to delete memo");
    }
  };

  if (isLoading) {
    return <div>Loading memo...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!memo) {
    return <div>Memo not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header with Back Button and Edit/Delete Options */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Memo Details
            </h1>
          </div>

          <div>
            <ModeToggle />
          </div>
        </div>

        {isEditing ? (
          <MemoEditScreen
            initialMemo={memo}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="text-lg text-gray-800">
                {memo.title || 'Untitled Memo'}
              </CardTitle>
              <CardDescription className="text-gray-600">
                Created on {new Date(memo.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed">
                {memo.text}
              </p>
            </CardContent>

            {/* Edit and Delete Buttons */}
            <div className="flex justify-end space-x-2 p-4">
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                className="bg-yellow-50 hover:bg-yellow-100 text-yellow-600"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                className="bg-red-50 hover:bg-red-100 text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Person Detection Dialog */}
      <PersonDetectionDialog
        isOpen={showPersonDialog}
        onClose={() => setShowPersonDialog(false)}
      />
    </div>
  );
};

export default MemoDetailPage;
