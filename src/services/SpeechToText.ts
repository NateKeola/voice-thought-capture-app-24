
// This is a mock service for speech-to-text conversion
// In a real app, you would use a real speech recognition API

export interface TranscriptionResult {
  text: string;
  confidence: number;
}

export const transcribeAudio = async (audioUrl: string): Promise<TranscriptionResult> => {
  console.log('Transcribing audio:', audioUrl);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock different types of transcriptions based on timestamp
  const timestamp = parseInt(audioUrl.split('_')[1]);
  const remainder = timestamp % 3;
  
  let transcription: string;
  
  switch (remainder) {
    case 0:
      transcription = "Remember to pick up groceries tonight after work, especially milk and eggs.";
      break;
    case 1:
      transcription = "I should look into that new JavaScript framework for the project.";
      break;
    case 2:
      transcription = "Need to schedule a dentist appointment for next week.";
      break;
    default:
      transcription = "This is a test memo recording.";
  }
  
  return {
    text: transcription,
    confidence: 0.95
  };
};

// Detect memo type from text content
export const detectMemoType = (text: string): 'note' | 'task' | 'idea' => {
  const lowerText = text.toLowerCase();
  
  // Task detection
  if (
    lowerText.includes('need to') ||
    lowerText.includes('have to') ||
    lowerText.includes('must') ||
    lowerText.includes('don\'t forget') ||
    lowerText.startsWith('remember to')
  ) {
    return 'task';
  }
  
  // Idea detection
  if (
    lowerText.includes('i should') ||
    lowerText.includes('maybe i could') ||
    lowerText.includes('what if') ||
    lowerText.includes('idea') ||
    lowerText.includes('thinking about')
  ) {
    return 'idea';
  }
  
  // Default to note
  return 'note';
};
