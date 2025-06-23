
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Play, Save, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Memo, MemoType } from "@/types";
import { useRef, useState } from "react";

interface MemoContentProps {
  memo: Memo;
  onSave: (text: string, type: MemoType) => Promise<void>;
  onDelete: () => Promise<void>;
  onBack: () => void;
}

const MemoContent = ({ memo, onSave, onDelete, onBack }: MemoContentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(memo.text);
  const [editedType, setEditedType] = useState<MemoType>(memo.type);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Remove contact tags from display text
  const displayText = memo.text.replace(/\[Contact: [^\]]+\]/g, '').trim();

  const handleSave = async () => {
    await onSave(editedText, editedType);
    setIsEditing(false);
  };

  const handlePlayAudio = () => {
    if (!memo?.audioUrl) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else if (audioRef.current) {
      audioRef.current.play();
    }
  };

  return (
    <div className="container max-w-md mx-auto py-6 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="p-0">
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
                {displayText}
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-md capitalize">{memo.type}</span>
                  <span>{formatDistanceToNow(new Date(memo.createdAt), { addSuffix: true })}</span>
                </div>
                {memo.audioUrl && (
                  <>
                    <audio ref={audioRef} src={memo.audioUrl} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} onEnded={() => setIsPlaying(false)} />
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
              <Button variant="destructive" onClick={onDelete}>
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

export default MemoContent;
