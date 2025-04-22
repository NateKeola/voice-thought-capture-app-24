
import React from 'react';
import RecordButton from '@/components/RecordButton';
import LiveTranscription from './LiveTranscription';

interface RecordingSectionProps {
  onLiveTranscription: (text: string) => void;
  onMemoCreated: () => void;
  liveTranscription: string;
}

const RecordingSection: React.FC<RecordingSectionProps> = ({ 
  onLiveTranscription, 
  onMemoCreated, 
  liveTranscription 
}) => {
  return (
    <div className="relative mb-4">
      <RecordButton 
        onLiveTranscription={onLiveTranscription} 
        onMemoCreated={onMemoCreated} 
      />
      <LiveTranscription transcription={liveTranscription} />
    </div>
  );
};

export default RecordingSection;
