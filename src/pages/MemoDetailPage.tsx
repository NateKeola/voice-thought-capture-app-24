
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMemoById, updateMemo, deleteMemo } from '@/services/MemoStorage';
import { Memo, MemoType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Trash2, FileAudio, Save, Play } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const MemoDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [memo, setMemo] = useState<Memo | null>(null);
  const [editedText, setEditedText] = useState('');
  const [editedType, setEditedType] = useState<MemoType>('note');
  const [isEditing, setIsEditing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (id) {
      const fetchMemo = async () => {
        try {
          setIsLoading(true);
          const fetchedMemo = await getMemoById(id);
          if (fetchedMemo) {
            setMemo(fetchedMemo);
            setEditedText(fetchedMemo.text);
            setEditedType(fetchedMemo.type);
          }
        } catch (error) {
          console.error('Error fetching memo:', error);
          toast({
            title: "Error",
            description: "Could not load the memo",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchMemo();
    }
  }, [id, toast]);

  const handleSave = async () => {
    if (!memo || !id) return;
    
    try {
      const updatedMemo = await updateMemo(id, {
        text: editedText,
        type: editedType
      });
      
      if (updatedMemo) {
        setMemo(updatedMemo);
        setIsEditing(false);
        toast({
          title: "Memo updated",
          description: "Your changes have been saved."
        });
      }
    } catch (error) {
      console.error('Error updating memo:', error);
      toast({
        title: "Error",
        description: "Could not update the memo",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteMemo(id);
      toast({
        title: "Memo deleted",
        description: "Your memo has been deleted."
      });
      navigate('/home');
    } catch (error) {
      console.error('Error deleting memo:', error);
      toast({
        title: "Error",
        description: "Could not delete the memo",
        variant: "destructive"
      });
    }
  };

  const handlePlayAudio = () => {
    if (!memo?.audioUrl) {
      toast({
        title: "No audio available",
        description: "This memo doesn't have an audio recording."
      });
      return;
    }

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: "Playback error",
          description: "Could not play the audio recording.",
          variant: "destructive"
        });
      });
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onplay = () => setIsPlaying(true);
      audioRef.current.onpause = () => setIsPlaying(false);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="container max-w-md mx-auto py-8 px-4 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!memo) {
    return (
      <div className="container max-w-md mx-auto py-8 px-4">
        <p>Memo not found</p>
        <Button variant="link" onClick={() => navigate('/home')}>Go back to home</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-6 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/home')} className="p-0">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to home
        </Button>
      </div>

      <Card className="border-orange-200">
        <CardHeader className="bg-orange-50 rounded-t-lg">
          <CardTitle className="text-orange-600">
            {isEditing ? 'Edit Memo' : 'Memo Details'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {isEditing ? (
            <div className="space-y-4">
              <Textarea 
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="min-h-[150px] border-orange-200 focus-visible:ring-blue-300"
              />
              
              <div>
                <label className="text-sm text-muted-foreground block mb-2">Memo Type</label>
                <Select value={editedType} onValueChange={(value) => setEditedType(value as MemoType)}>
                  <SelectTrigger className="border-orange-200">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="idea">Idea</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div>
              <div className="bg-orange-50 p-4 rounded-md mb-4 text-base">
                {memo.text}
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-md capitalize">{memo.type}</span>
                  <span>{formatDistanceToNow(new Date(memo.createdAt), { addSuffix: true })}</span>
                </div>
                {memo.audioUrl && (
                  <>
                    <audio ref={audioRef} src={memo.audioUrl} />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-1 text-blue-500"
                      onClick={handlePlayAudio}
                    >
                      <Play className="h-4 w-4" />
                      <span>{isPlaying ? "Pause" : "Play"}</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between bg-orange-50 rounded-b-lg">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button onClick={() => setIsEditing(true)} className="bg-orange-500 hover:bg-orange-600">Edit</Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default MemoDetailPage;
