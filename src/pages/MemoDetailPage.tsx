
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Save, Volume2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useMemos } from '@/contexts/MemoContext';
import MemoLoading from '@/components/memo/MemoLoading';
import MemoError from '@/components/memo/MemoError';
import BottomNavBar from '@/components/BottomNavBar';
import RelationshipSelector from '@/components/memo/RelationshipSelector';
import { TitleGenerationService } from '@/services/titleGeneration';

const MemoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { memos, updateMemo, deleteMemo, isLoading } = useMemos();
  
  const [editedText, setEditedText] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<string | null>(null);
  const [selectedRelationshipName, setSelectedRelationshipName] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const memo = memos.find(m => m.id === id);

  // Helper function to extract relationship info from memo text
  const extractRelationshipFromText = (text: string) => {
    const contactMatch = text.match(/\[Contact:\s*([^\]]+)\]/);
    return contactMatch ? contactMatch[1] : null;
  };

  // Helper function to check if a title is valid (not corrupted or auto-generated placeholder)
  const isValidUserTitle = (title: string | undefined) => {
    if (!title || typeof title !== 'string') return false;
    const trimmed = title.trim();
    if (trimmed === '' || trimmed === 'undefined') return false;
    if (trimmed.includes('_type') || trimmed.includes('value')) return false;
    return true;
  };

  // Helper function to map MemoType to title generation type
  const getMemoTypeForTitle = (memoType: string): 'task' | 'note' | 'idea' => {
    switch (memoType) {
      case 'task':
        return 'task';
      case 'note':
        return 'note';
      case 'idea':
        return 'idea';
      default:
        return 'note';
    }
  };

  useEffect(() => {
    if (memo) {
      console.log('MemoDetailPage - memo found:', memo);
      
      // Extract relationship ID from memo text
      const relationshipId = extractRelationshipFromText(memo.text);
      setSelectedRelationshipId(relationshipId);
      
      const cleanedText = memo.text
        .replace(/\[Contact:\s*[^\]]+\]/g, '')
        .replace(/\[category:\s*\w+\]/gi, '')
        .replace(/\[priority:\s*\w+\]/gi, '')
        .replace(/\[due:\s*[\w\s]+\]/gi, '')
        .trim();
      
      setEditedText(cleanedText);
      
      // Use the existing title if it's valid, otherwise generate one for display only
      if (isValidUserTitle(memo.title)) {
        setEditedTitle(memo.title);
        console.log('Using existing valid title:', memo.title);
      } else {
        // Generate title for display but don't save it yet
        const autoTitle = TitleGenerationService.generateImmediateTitle(memo.text || '', getMemoTypeForTitle(memo.type));
        setEditedTitle(autoTitle);
        console.log('Generated title for display:', autoTitle);
      }
      
      setHasUnsavedChanges(false);
    }
  }, [memo]);

  const handlePlayAudio = () => {
    if (memo?.audioUrl) {
      const audio = new Audio(memo.audioUrl);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: "Cannot play audio",
          description: "There was a problem playing the audio.",
          variant: "destructive"
        });
      });
    }
  };

  const handleRelationshipSelect = (relationshipId: string | null, relationshipName?: string) => {
    setSelectedRelationshipId(relationshipId);
    setSelectedRelationshipName(relationshipName || '');
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!memo || !hasUnsavedChanges) return;

    setIsSaving(true);
    try {
      console.log('Saving memo with title:', editedTitle.trim());
      
      // Add relationship tag to memo text if a relationship is selected
      let finalText = editedText.trim();
      if (selectedRelationshipId) {
        finalText = `[Contact: ${selectedRelationshipId}] ${finalText}`;
      }
      
      // Always save the user's title, even if it's empty
      const updateData = {
        text: finalText,
        title: editedTitle.trim() || undefined
      };
      
      console.log('Update data being sent:', updateData);
      
      const updatedMemo = await updateMemo(memo.id, updateData);
      
      if (updatedMemo) {
        console.log('Memo updated successfully with title:', updatedMemo.title);
        setHasUnsavedChanges(false);
        
        toast({
          title: "Memo updated",
          description: "Your changes have been saved successfully."
        });
        
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        throw new Error('Failed to update memo');
      }
    } catch (error) {
      console.error("Error updating memo:", error);
      toast({
        title: "Error updating memo",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!memo) return;

    try {
      const success = await deleteMemo(memo.id);
      if (success) {
        navigate('/');
        toast({
          title: "Memo deleted",
          description: "Memo has been deleted successfully."
        });
      } else {
        throw new Error('Failed to delete memo');
      }
    } catch (error) {
      console.error("Error deleting memo:", error);
      toast({
        title: "Error deleting memo",
        description: "Failed to delete the memo. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTextChange = (value: string) => {
    setEditedText(value);
    setHasUnsavedChanges(true);
  };

  const handleTitleChange = (value: string) => {
    console.log('User editing title to:', value);
    setEditedTitle(value);
    setHasUnsavedChanges(true);
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'record') navigate('/home');
    if (tab === 'relationships') navigate('/relationships');
    if (tab === 'personal') navigate('/tasks');
  };

  if (isLoading) {
    return <MemoLoading />;
  }

  if (!memo) {
    return <MemoError message="Memo not found" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Memo
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {memo?.audioUrl && (
              <button
                onClick={handlePlayAudio}
                className="bg-blue-500 rounded-full p-2 hover:bg-blue-600 transition-colors duration-200"
                aria-label="Play audio"
              >
                <Volume2 size={16} className="text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-4">
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <Input
                id="title"
                value={editedTitle}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter a title for your memo..."
                className="w-full"
                disabled={isSaving}
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be the bold title shown in your memo list
              </p>
            </div>

            {/* Content Textarea */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <Textarea
                id="content"
                value={editedText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Enter memo content..."
                className="w-full min-h-[200px] resize-none"
                disabled={isSaving}
              />
            </div>

            {/* Relationship Selector */}
            <RelationshipSelector
              selectedRelationshipId={selectedRelationshipId}
              onRelationshipSelect={handleRelationshipSelect}
            />

            {selectedRelationshipId && selectedRelationshipName && (
              <div className="text-sm text-blue-600">
                This memo will be linked to {selectedRelationshipName}
              </div>
            )}

            {/* Memo Info */}
            <div className="text-sm text-gray-500 space-y-1">
              <p>Type: <span className="capitalize">{memo.type}</span></p>
              <p>Created: {new Date(memo.createdAt).toLocaleDateString()}</p>
              <p>Current saved title: <span className="font-medium">{memo.title || 'No title saved'}</span></p>
              {hasUnsavedChanges && editedTitle && (
                <p>New title to save: <span className="font-medium text-blue-600">{editedTitle}</span></p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSaving}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoDetailPage;
