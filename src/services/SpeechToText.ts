import { supabase } from '@/integrations/supabase/client';

export interface TranscriptionResult {
  text: string;
  confidence: number;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

// Check browser compatibility for live transcription
const isSpeechRecognitionSupported = () => {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
};

// Create a speech recognition instance for live transcription
const createRecognitionInstance = () => {
  // @ts-ignore - TypeScript doesn't have built-in types for the Web Speech API
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    throw new Error('Speech recognition is not supported in this browser');
  }
  return new SpeechRecognition();
};

// Live transcription with continuous results (using Web Speech API for real-time)
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
        const confidence = event.results[i][0].confidence || 0.5;
        
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
        console.log('No speech detected.');
      } else {
        onError(new Error(`Speech recognition error: ${event.error}`));
      }
    };
    
    recognition.onend = () => {
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

// Enhanced transcribe audio function using OpenAI Whisper API
export const transcribeAudio = async (audioBlob: Blob): Promise<TranscriptionResult> => {
  try {
    console.log('Starting Whisper transcription...');
    
    // Convert blob to base64
    const arrayBuffer = await audioBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to base64 in chunks to handle large files
    let binary = '';
    const chunkSize = 0x8000;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    const base64Audio = btoa(binary);
    
    console.log('Calling Whisper API...');
    
    // Call our Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('whisper-transcription', {
      body: { audio: base64Audio }
    });
    
    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Transcription failed: ${error.message}`);
    }
    
    if (data.error) {
      console.error('Whisper API error:', data.error);
      throw new Error(`Whisper API error: ${data.error}`);
    }
    
    console.log('Transcription successful:', data.text);
    
    return {
      text: data.text || '',
      confidence: data.confidence || 0.95
    };
  } catch (error) {
    console.error('Error in transcribeAudio:', error);
    throw error instanceof Error ? error : new Error('Unknown transcription error');
  }
};

// Improved memo type detection from text content
export const detectMemoType = (text: string): 'note' | 'task' | 'idea' => {
  const lowerText = text.toLowerCase();
  
  // Task detection - improved to catch more patterns
  if (
    // Existing patterns
    lowerText.includes('need to') ||
    lowerText.includes('have to') ||
    lowerText.includes('must') ||
    lowerText.includes('don\'t forget') ||
    lowerText.startsWith('remember to') ||
    // New patterns for planned activities
    lowerText.includes('going to') ||
    lowerText.includes('will go') ||
    lowerText.includes('planning to') ||
    lowerText.includes('scheduled to') ||
    lowerText.match(/\b(tomorrow|today|tonight|this\s+(morning|afternoon|evening|weekend|week|month))\b/) ||
    lowerText.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/) ||
    lowerText.match(/\b(play|meet|visit|call|email|buy|get|pick\s+up|drop\s+off)\b.*\b(with|at|from|to)\b/) ||
    // Activity patterns
    lowerText.match(/\b(im|i'm)\s+(going|gonna)\s+/) ||
    lowerText.match(/\bgoing\s+\w+ing\s+(with|at|to)/) // "going diving with", "going fishing at"
  ) {
    return 'task';
  }
  
  // Idea detection
  if (
    lowerText.includes('i should') ||
    lowerText.includes('maybe i could') ||
    lowerText.includes('what if') ||
    lowerText.includes('idea') ||
    lowerText.includes('thinking about') ||
    lowerText.includes('could be') ||
    lowerText.includes('might want to')
  ) {
    return 'idea';
  }
  
  // Default to note for observations, current situations, past events
  return 'note';
};
