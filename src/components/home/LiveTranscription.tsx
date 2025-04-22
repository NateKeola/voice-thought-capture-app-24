
import React from 'react';

interface LiveTranscriptionProps {
  transcription: string;
}

const LiveTranscription: React.FC<LiveTranscriptionProps> = ({ transcription }) => {
  if (!transcription) return null;
  
  return (
    <div className="absolute w-full left-0 top-full mt-4 bg-white rounded-lg shadow-md px-6 py-3 border border-orange-100">
      <p className="text-sm text-gray-500">Transcribing...</p>
      <div className="text-base text-gray-900 font-medium mt-1 min-h-[24px] whitespace-pre-wrap">
        {transcription}
      </div>
    </div>
  );
};

export default LiveTranscription;
