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
import { TitleGenerationService } from '@/services/titleGeneration';

const MemoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { memos, updateMemo, deleteMemo, isLoading } = useMemos();
  
  const [editedText, setEditedText] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const memo = memos.find(m => m.id === id);

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
      const cleanedText = memo.text
        .replace(/\[Contact:\s*[^\]]+\]/g, '')
        .replace(/\[category:\s*\w+\]/gi, '')
        .replace(/\[priority:\s*\w+\]/gi, '')
        .replace(/\[due:\s*[\w\s]+\]/gi, '')
        .trim();
      
      setEditedText(cleanedText);
      
      // Show auto-generated title if no valid title exists, otherwise show existing title
      let displayTitle = '';
      if (memo.title && typeof memo.title === 'string' && memo.title.trim() !== '' && !memo.title.includes('_type') && !memo.title.includes('value')) {
        displayTitle = memo.title;
      } else {
        // Generate auto title for display
        displayTitle = TitleGenerationService.generateImmediateTitle(memo.text || '', getMemoTypeForTitle(memo.type));
      }
      
      setEditedTitle(displayTitle);
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

  const handleSave = async () => {
    if (!memo || !hasUnsavedChanges) return;

    setIsSaving(true);
    try {
      console.log('Saving memo with updated title:', editedTitle.trim());
      
      // Ensure we're saving a clean string, not an object
      const titleToSave = editedTitle.trim() || null;
      console.log('Title to save (type:', typeof titleToSave, '):', titleToSave);
      
      const updateData = {
        text: editedText.trim(),
        title: titleToSave
      };
      
      console.log('Update data being sent:', updateData);
      
      const updatedMemo = await updateMemo(memo.id, updateData);
      
      if (updatedMemo) {
        console.log('Memo updated successfully with new title:', updatedMemo.title);
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

            {/* Memo Info */}
            <div className="text-sm text-gray-500 space-y-1">
              <p>Type: <span className="capitalize">{memo.type}</span></p>
              <p>Created: {new Date(memo.createdAt).toLocaleDateString()}</p>
              <p>Current title: <span className="font-medium">{memo.title || 'Auto-generated'}</span></p>
              {hasUnsavedChanges && editedTitle && (
                <p>New title: <span className="font-medium text-blue-600">{editedTitle}</span></p>
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
      <BottomNavBar 
        activeTab="record" 
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default MemoDetailPage;
