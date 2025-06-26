
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Save, Volume2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMemos } from '@/contexts/MemoContext';
import { MemoType } from '@/types';
import MemoEditScreen from '@/components/memo/MemoEditScreen';
import { toast } from 'sonner';

interface MemoState {
  id: string;
  text: string;
  type: string;
  audioUrl?: string;
  createdAt: string;
  completed?: boolean;
  title?: string;
}

const MemoDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { memos, updateMemo, deleteMemo } = useMemos();
  const [memo, setMemo] = useState<{
    id: string;
    text: string;
    type: MemoType;
    audioUrl?: string;
    createdAt: string;
    completed: boolean;
    title?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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
        }
      } catch (err) {
        console.error('Error fetching memo:', err);
        setError('Failed to load memo');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemo();
  }, [id, memos]);

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

  const handlePlayAudio = () => {
    if (memo?.audioUrl) {
      const audio = new Audio(memo.audioUrl);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        toast.error("Cannot play audio - There was a problem playing the audio.");
      });
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

          <div className="flex items-center gap-2">
            {memo?.audioUrl && (
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
                <Save className="h-4 w-4 mr-2" />
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
    </div>
  );
};

export default MemoDetailPage;
