import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

interface Note {
  id: string;
  text: string;
  date: string;
  type: string;
}

interface NotesTimelineProps {
  notes: Note[];
  onItemClick?: (noteId: string) => void;
}

const NotesTimeline = ({ notes, onItemClick }: NotesTimelineProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleNoteItemClick = (noteId: string) => {
    console.log('Note clicked:', noteId);
    
    if (onItemClick) {
      onItemClick(noteId);
      return;
    }
    
    // Default behavior - navigate to memo detail
    navigate(`/memo/${noteId}`);
  };

  const getMemoTypeColor = (type: string) => {
    const colors = {
      task: 'bg-purple-100 text-purple-600',
      should: 'bg-orange-100 text-orange-500',
      note: 'bg-blue-100 text-blue-600',
    };
    return colors[type] || colors.note;
  };

  const getMemoTypeIcon = (type: string) => {
    switch (type) {
      case 'task':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v1a1 1 0 110 2h4a1 1 0 01.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
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
    <div className="space-y-4">
      {notes.map((note, idx) => (
        <div 
          key={note.id || idx} 
          className="p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow cursor-pointer bg-white"
          onClick={() => handleNoteItemClick(note.id)}
        >
          <div className="flex">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${getMemoTypeColor(note.type)}`}>
              {getMemoTypeIcon(note.type)}
            </div>
            <div className="flex-1">
              <p className="text-gray-800 text-sm leading-relaxed">{note.text}</p>
              <div className="flex justify-between mt-3">
                <p className="text-gray-400 text-xs">{note.date}</p>
                <span className={`px-2 py-1 rounded-full text-xs ${getMemoTypeColor(note.type)}`}>
                  {note.type}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
      {notes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No notes found</p>
          <p className="text-sm mt-1">Record a voice memo to get started</p>
        </div>
      )}
    </div>
  );
};

export default NotesTimeline;
