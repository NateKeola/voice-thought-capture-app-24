
import React from 'react';
import { Mic, Pause, Play } from 'lucide-react'; // Remove Stop import

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
  const handleClick = () => {
    if (isRecording) {
      // If already recording, use pause/resume
      onPauseResumeRecording?.();
    } else {
      // If not recording, start recording
      onStartRecording();
    }
  };
  
  return (
    <button 
      onClick={handleClick}
      className="bg-white rounded-full shadow-lg p-6 transform transition-transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-200 mb-6 relative z-10"
      aria-label={!isRecording ? "Start recording" : (isPaused ? "Resume recording" : "Pause recording")}
    >
      <div className={`${!isRecording ? 'bg-orange-500' : (isPaused ? 'bg-green-500' : 'bg-red-500')} h-24 w-24 rounded-full flex items-center justify-center shadow-inner`}>
        {!isRecording ? (
          <Mic className="h-12 w-12 text-white" />
        ) : isPaused ? (
          <Play className="h-12 w-12 text-white" />
        ) : (
          <Pause className="h-12 w-12 text-white" />
        )}
      </div>
    </button>
  );
};

export default RecordingButton;
