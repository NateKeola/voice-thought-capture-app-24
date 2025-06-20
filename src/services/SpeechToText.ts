// This service provides speech-to-text functionality using the Web Speech API

export interface TranscriptionResult {
  text: string;
  confidence: number;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

// Check browser compatibility
const isSpeechRecognitionSupported = () => {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
};

// Create a speech recognition instance
const createRecognitionInstance = () => {
  // @ts-ignore - TypeScript doesn't have built-in types for the Web Speech API
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    throw new Error('Speech recognition is not supported in this browser');
  }
  return new SpeechRecognition();
};

// Live transcription with continuous results
export const startLiveTranscription = (
  onInterimResult: (text: string) => void,
  onFinalResult: (result: TranscriptionResult) => void,
  onError: (error: Error) => void
) => {
  if (!isSpeechRecognitionSupported()) {
    onError(new Error('Speech recognition is not supported in this browser'));
    return { stop: () => {} };
  }

  try {
    const recognition = createRecognitionInstance();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';
      let highestConfidence = 0;
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          if (confidence > highestConfidence) {
            highestConfidence = confidence;
          }
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Send interim results for live updating
      if (interimTranscript) {
        onInterimResult(interimTranscript);
      }
      
      // Send final results when available
      if (finalTranscript) {
        onFinalResult({
          text: finalTranscript,
          confidence: highestConfidence
        });
      }
    };
    
    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        // This is a common error that doesn't need to be shown to the user
        console.log('No speech detected.');
      } else {
        onError(new Error(`Speech recognition error: ${event.error}`));
      }
    };
    
    recognition.onend = () => {
      // The Web Speech API has a tendency to stop automatically
      // We could auto-restart here if we wanted continuous recognition
      console.log('Speech recognition service disconnected');
    };
    
    recognition.start();
    
    return {
      stop: () => {
        recognition.stop();
      }
    };
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Unknown error in speech recognition'));
    return { stop: () => {} };
  }
};

// For compatibility with existing code
export const transcribeAudio = async (audioUrl: string): Promise<TranscriptionResult> => {
  // This is just a stub for backwards compatibility
  console.log('Legacy transcription called for:', audioUrl);
  return {
    text: "This memo was recorded with the legacy system.",
    confidence: 0.7
  };
};

// Detect memo type from text content
export const detectMemoType = async (text: string): Promise<MemoType> => {
  try {
    // Use Claude API for categorization
    return await categorizeMemoWithClaude(text);
  } catch (error) {
    console.error('Error with Claude categorization, using fallback:', error);
    // Fallback to existing logic
    return detectMemoTypeFallback(text);
  }
};

// Keep the existing fallback logic as a separate function
const detectMemoTypeFallback = (text: string): MemoType => {
  const lowerText = text.toLowerCase();
  
  // Task indicators
  const taskKeywords = [
    'need to', 'have to', 'must', 'should', 'todo', 'to do', 'task',
    'remind me', 'don\'t forget', 'remember to', 'deadline', 'due',
    'schedule', 'appointment', 'meeting', 'call', 'email', 'buy',
    'pick up', 'complete', 'finish', 'submit', 'send'
  ];
  
  // Idea indicators
  const ideaKeywords = [
    'idea', 'concept', 'thought', 'brainstorm', 'what if', 'maybe',
    'could', 'might', 'potential', 'possibility', 'innovation',
    'creative', 'invention', 'solution', 'approach', 'strategy'
  ];
  
  // Check for task indicators
  if (taskKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'task';
  }
  
  // Check for idea indicators
  if (ideaKeywords.some(keyword => lowerText.includes(keyword))) {
    return 'idea';
  }
  
  // Default to note
  return 'note';
};
