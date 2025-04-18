
import React from 'react';
import { Mic } from 'lucide-react';

interface RecordingButtonProps {
  onStartRecording: () => void;
}

const RecordingButton: React.FC<RecordingButtonProps> = ({ onStartRecording }) => {
  return (
    <button 
      onClick={onStartRecording}
      className="bg-white rounded-full shadow-lg p-6 transform transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-200 mb-6"
    >
      <div className="bg-orange-500 h-24 w-24 rounded-full flex items-center justify-center shadow-inner">
        <Mic className="h-12 w-12 text-white" />
      </div>
    </button>
  );
};

export default RecordingButton;
