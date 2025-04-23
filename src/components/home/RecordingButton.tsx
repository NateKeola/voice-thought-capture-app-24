
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
  isPaused,
}) => {
  const handleClick = () => {
    if (isRecording) {
      onPauseResumeRecording?.();
    } else {
      onStartRecording();
    }
  };

  // Main gradient colors for button
  const centerGradient =
    "bg-gradient-to-br from-purple-500 via-pink-400 to-orange-300";

  // Animated "pulse" ring behind the button
  return (
    <button
      onClick={handleClick}
      className="relative z-10 group focus:outline-none mb-6"
      aria-label={
        !isRecording
          ? "Start recording"
          : isPaused
          ? "Resume recording"
          : "Pause recording"
      }
      type="button"
    >
      {/* Animated ring */}
      <span
        className={
          "absolute inset-0 w-full h-full flex items-center justify-center"
        }
        aria-hidden="true"
      >
        <span
          className={`block rounded-full ${centerGradient} blur-xl opacity-60 animate-pulse`}
          style={{
            width: 120,
            height: 120,
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            zIndex: 1,
          }}
        ></span>
        <span
          className="block rounded-full bg-white/50 blur-md"
          style={{
            width: 84,
            height: 84,
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            zIndex: 2,
            opacity: 0.4,
          }}
        ></span>
      </span>

      {/* Actual button */}
      <span
        className={`
          relative z-20 flex items-center justify-center 
          rounded-full shadow-xl transition-transform duration-150
          border-4 border-white
          ${centerGradient}
          hover:scale-110 active:scale-95
        `}
        style={{
          width: 96,
          height: 96,
        }}
      >
        {/* Icon swap */}
        {!isRecording ? (
          <Mic className="h-12 w-12 text-white drop-shadow-[0_2px_12px_rgba(156,44,255,0.25)]" />
        ) : isPaused ? (
          <Play className="h-12 w-12 text-white drop-shadow-[0_2px_12px_rgba(156,44,255,0.18)]" />
        ) : (
          <Pause className="h-12 w-12 text-white drop-shadow-[0_2px_12px_rgba(255,44,44,0.18)]" />
        )}
        {/* Faint white overlay for tactile impression */}
        <span
          className="absolute rounded-full bg-white/10 pointer-events-none"
          style={{
            width: 84,
            height: 84,
            top: 6,
            left: 6,
          }}
        ></span>
      </span>
    </button>
  );
};

export default RecordingButton;

