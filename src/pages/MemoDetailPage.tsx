
import React, { useEffect, useState } from 'react';
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

const MemoDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [memo, setMemo] = useState<Memo | null>(null);
  const [editedText, setEditedText] = useState('');
  const [editedType, setEditedType] = useState<MemoType>('note');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchedMemo = getMemoById(id);
      if (fetchedMemo) {
        setMemo(fetchedMemo);
        setEditedText(fetchedMemo.text);
        setEditedType(fetchedMemo.type);
      }
    }
  }, [id]);

  const handleSave = () => {
    if (!memo || !id) return;
    
    const updatedMemo = updateMemo(id, {
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
  };

  const handleDelete = () => {
    if (!id) return;
    
    const success = deleteMemo(id);
    if (success) {
      toast({
        title: "Memo deleted",
        description: "Your memo has been deleted."
      });
      navigate('/');
    }
  };

  const handlePlayAudio = () => {
    // In a real app, this would play the audio file
    toast({
      title: "Playing audio",
      description: "This would play the audio recording in a real app."
    });
  };

  if (!memo) {
    return (
      <div className="container max-w-md mx-auto py-8 px-4">
        <p>Memo not found</p>
        <Button variant="link" onClick={() => navigate('/')}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-6 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="p-0">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Edit Memo' : 'Memo Details'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <Textarea 
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="min-h-[150px]"
              />
              
              <div>
                <label className="text-sm text-muted-foreground block mb-2">Memo Type</label>
                <Select value={editedType} onValueChange={(value) => setEditedType(value as MemoType)}>
                  <SelectTrigger>
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
              <p className="text-base mb-4">{memo.text}</p>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-muted rounded-md capitalize">{memo.type}</span>
                  <span>{formatDistanceToNow(new Date(memo.createdAt), { addSuffix: true })}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={handlePlayAudio}
                >
                  <Play className="h-4 w-4" />
                  <span>Play</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave}>
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
              <Button onClick={() => setIsEditing(true)}>Edit</Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default MemoDetailPage;
