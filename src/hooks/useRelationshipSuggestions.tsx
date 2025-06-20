
import { useState, useCallback } from 'react';
import { DetectedPerson, detectPeopleInText } from '@/utils/personDetection';
import { useProfiles } from '@/hooks/useProfiles';

export const useRelationshipSuggestions = () => {
  const [suggestions, setSuggestions] = useState<DetectedPerson[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  const { profiles } = useProfiles();

  const analyzeTextForPeople = useCallback((text: string) => {
    const detectedPeople = detectPeopleInText(text);
    
    // Filter out people who already exist as relationships
    const existingNames = new Set(
      profiles.map(profile => `${profile.first_name} ${profile.last_name}`.toLowerCase())
    );
    
    const newSuggestions = detectedPeople.filter(person => {
      const fullNameLower = person.fullName.toLowerCase();
      return !existingNames.has(fullNameLower) && !dismissedSuggestions.has(fullNameLower);
    });
    
    setSuggestions(prev => {
      const existingSuggestions = new Set(prev.map(s => s.fullName.toLowerCase()));
      const uniqueNewSuggestions = newSuggestions.filter(
        person => !existingSuggestions.has(person.fullName.toLowerCase())
      );
      return [...prev, ...uniqueNewSuggestions];
    });
  }, [profiles, dismissedSuggestions]);

  const dismissSuggestion = useCallback((personName: string) => {
    setSuggestions(prev => prev.filter(s => s.fullName !== personName));
    setDismissedSuggestions(prev => new Set([...prev, personName.toLowerCase()]));
  }, []);

  const acceptSuggestion = useCallback((personName: string) => {
    setSuggestions(prev => prev.filter(s => s.fullName !== personName));
  }, []);

  const clearAllSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return {
    suggestions,
    analyzeTextForPeople,
    dismissSuggestion,
    acceptSuggestion,
    clearAllSuggestions
  };
};
