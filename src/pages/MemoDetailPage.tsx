import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Save, Volume2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useMemos } from '@/contexts/MemoContext';
import { TitleGenerationService } from '@/services/titleGeneration';
import { detectMemoType } from '@/services/SpeechToText';
import MemoLoading from '@/components/memo/MemoLoading';
import MemoError from '@/components/memo/MemoError';
import BottomNavBar from '@/components/BottomNavBar';
import { PersonDetectionService, DetectedPerson } from "@/services/PersonDetectionService";
import PersonConfirmationDialog from '@/components/PersonConfirmationDialog';
import { RelationshipLinkingService } from '@/services/RelationshipLinkingService';
import { useProfiles } from '@/hooks/useProfiles';
import { extractMemoMetadata } from '@/utils/memoMetadata';

const MemoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { memos, updateMemo, deleteMemo, isLoading } = useMemos();
  const { createProfile } = useProfiles();
  
  const [editedText, setEditedText] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPersonDialog, setShowPersonDialog] = useState(false);
  const [detectedPeople, setDetectedPeople] = useState<DetectedPerson[]>([]);
  
  const memo = memos.find(m => m.id === id);
  
  useEffect(() => {
    if (memo) {
      // Clean the text for editing by removing contact tags
      const metadata = extractMemoMetadata(memo.text);
      setEditedText(metadata.cleanText);
      
      // Use the actual title from the memo if it exists
      const currentTitle = memo.title || TitleGenerationService.generateTitle(metadata.cleanText, memo.type);
      setEditedTitle(currentTitle);
      setHasUnsavedChanges(false);
    }
  }, [memo]);

  useEffect(() => {
    if (memo) {
      const originalMetadata = extractMemoMetadata(memo.text);
      const hasChanges = editedText !== originalMetadata.cleanText || editedTitle !== (memo.title || '');
      setHasUnsavedChanges(hasChanges);
    }
  }, [editedText, editedTitle, memo]);

  if (isLoading) {
    return <MemoLoading />;
  }

  if (!memo) {
    return <MemoError message="Memo not found" />;
  }

  const handleSave = async () => {
    if (!editedText.trim()) {
      toast({
        title: "Cannot save empty memo",
        description: "Please enter some text for your memo",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      // Only update if there are actual changes
      if (hasUnsavedChanges) {
        await updateMemo(memo.id, {
          text: editedText,
          title: editedTitle.trim() || undefined
        });
        
        // After saving, check for people detection
        const people = PersonDetectionService.detectPeople(editedText);
        console.log('Detected people after save:', people);
        
        if (people.length > 0) {
          setDetectedPeople(people);
          setShowPersonDialog(true);
          setIsSaving(false);
          return; // Don't navigate yet, wait for person confirmation
        }
        
        toast({
          title: "Memo updated!",
          description: "Your changes have been saved successfully."
        });
      }
      
      // Navigate back to home
      navigate('/home');
    } catch (error) {
      console.error('Error updating memo:', error);
      toast({
        title: "Error updating memo",
        description: "There was a problem saving your changes.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePersonConfirmation = async (selectedPeople: DetectedPerson[]) => {
    setShowPersonDialog(false);
    
    try {
      // Add contact tags to the memo text
      let finalText = editedText;
      if (selectedPeople.length > 0) {
        const contactTags = selectedPeople.map(person => `[Contact: ${person.name}]`).join(' ');
        finalText = `${contactTags} ${editedText}`;
      }
      
      // Update memo with contact tags
      await updateMemo(memo.id, {
        text: finalText,
        title: editedTitle.trim() || undefined
      });
      
      toast({
        title: "Memo updated with contacts!",
        description: `Added ${selectedPeople.length} contact${selectedPeople.length !== 1 ? 's' : ''} to your memo.`
      });
      
      // Navigate back to home
      navigate('/home');
    } catch (error) {
      console.error('Error updating memo with contacts:', error);
      toast({
        title: "Error updating memo",
        description: "There was a problem saving your memo with contacts.",
        variant: "destructive"
      });
    }
  };

  const handleSaveAndAddToRelationships = async (selectedPeople: DetectedPerson[]) => {
    setShowPersonDialog(false);
    
    try {
      // Add contact tags to the memo text
      let finalText = editedText;
      if (selectedPeople.length > 0) {
        const contactTags = selectedPeople.map(person => `[Contact: ${person.name}]`).join(' ');
        finalText = `${contactTags} ${editedText}`;
      }
      
      // Update memo with contact tags
      await updateMemo(memo.id, {
        text: finalText,
        title: editedTitle.trim() || undefined
      });

      // Create relationships for selected people
      for (const person of selectedPeople) {
        try {
          const profileData = RelationshipLinkingService.createProfileData(person);
          await createProfile.mutateAsync(profileData);
        } catch (error) {
          console.error('Error creating profile for', person.name, error);
        }
      }

      toast({
        title: "Memo and relationships saved",
        description: `Added ${selectedPeople.length} new relationship${selectedPeople.length !== 1 ? 's' : ''} to your contacts.`
      });

      // Navigate back to home
      navigate('/home');
    } catch (error) {
      console.error('Error saving memo and relationships:', error);
      toast({
        title: "Error",
        description: "There was a problem saving your memo and relationships.",
        variant: "destructive"
      });
    }
  };

  const handleSkipPeopleDetection = () => {
    setShowPersonDialog(false);
    navigate('/home');
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this memo?')) {
      try {
        await deleteMemo(memo.id);
        toast({
          title: "Memo deleted",
          description: "Your memo has been deleted successfully."
        });
        navigate('/home');
      } catch (error) {
        console.error('Error deleting memo:', error);
        toast({
          title: "Error deleting memo",
          description: "There was a problem deleting your memo.",
          variant: "destructive"
        });
      }
    }
  };

  const handlePlayAudio = () => {
    if (memo.audioUrl) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMemoTypeColor = (type: string) => {
    switch (type) {
      case 'task': return 'bg-blue-100 text-blue-800';
      case 'note': return 'bg-green-100 text-green-800';
      case 'idea': return 'bg-purple-100 text-purple-800';
      case 'reminder': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 pt-12 pb-8 px-6 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 bottom-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-10 w-48 h-48 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute top-5 right-10 w-32 h-32 bg-pink-300 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-purple-300 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="flex justify-between items-center relative z-10 mb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="bg-white/20 rounded-full p-1.5 hover:bg-white/30 transition-colors duration-200"
              aria-label="Go back"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Edit Memo
              </h1>
              <p className="text-purple-100 text-sm mt-1">
                {formatDate(memo.createdAt)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMemoTypeColor(memo.type)}`}>
              {memo.type}
            </span>
            {memo.audioUrl && (
              <button
                onClick={handlePlayAudio}
                className="bg-white/20 rounded-full p-2 hover:bg-white/30 transition-colors duration-200"
                aria-label="Play audio"
              >
                <Volume2 size={16} className="text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-2xl px-4 pt-6 flex-1">
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <Input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              placeholder="Enter memo title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <Textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              placeholder="Enter your memo content..."
              className="w-full min-h-[200px] border-gray-300 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleDelete}
              variant="outline"
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
            >
              <Trash2 size={16} />
              Delete
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 rounded-full"
            >
              {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save & Return Home' : 'Return Home'}
            </Button>
          </div>
        </div>
      </div>

      {/* Circular Save Memo FAB */}
      {!isLoading && (
        <div className="fixed bottom-20 right-6 z-20">
          <button
            onClick={() => navigate('/home')}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200"
            aria-label="Go to Home"
          >
            <Save size={24} className="text-white" />
          </button>
          <div className="w-full h-full absolute top-0 left-0 bg-indigo-500 rounded-full blur-xl opacity-30 -z-10 scale-75"></div>
        </div>
      )}

      {/* Person Confirmation Dialog */}
      <PersonConfirmationDialog
        open={showPersonDialog}
        detectedPeople={detectedPeople}
        onConfirm={handlePersonConfirmation}
        onSkip={handleSkipPeopleDetection}
        onClose={() => setShowPersonDialog(false)}
        onSaveAndAddToRelationships={handleSaveAndAddToRelationships}
      />

      <BottomNavBar activeTab="home" onTabChange={() => {}} />
    </div>
  );
};

export default MemoDetailPage;
