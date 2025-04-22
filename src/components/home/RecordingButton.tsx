
import React from 'react';
import { Mic, Pause, Play } from 'lucide-react';

interface RecordingButtonProps {
  onStartRecording: () => void;
  onPauseResumeRecording?: () => void;
  isRecording: boolean;
  isPaused: boolean;
}

const RecordingButton: React.FC<RecordingButtonProps> = ({ 
  onStartRecording, 
  onPauseResumeRecording, 
  isRecording, 
  isPaused 
}) => {
  
  if (!isRecording) {
    return (
      <button 
        onClick={onStartRecording}
        className="bg-white rounded-full shadow-lg p-6 transform transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-200 mb-6"
        aria-label="Start recording"
      >
        <div className="bg-orange-500 h-24 w-24 rounded-full flex items-center justify-center shadow-inner">
          <Mic className="h-12 w-12 text-white" />
        </div>
      </button>
    );
  }
  
  return (
    <button 
      onClick={onPauseResumeRecording}
      className="bg-white rounded-full shadow-lg p-6 transform transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-200 mb-6"
      aria-label={isPaused ? "Resume recording" : "Pause recording"}
    >
      <div className={`${isPaused ? 'bg-green-500' : 'bg-red-500'} h-24 w-24 rounded-full flex items-center justify-center shadow-inner`}>
        {isPaused ? (
          <Play className="h-12 w-12 text-white" />
        ) : (
          <Pause className="h-12 w-12 text-white" />
        )}
      </div>
    </button>
  );
};

export default RecordingButton;
