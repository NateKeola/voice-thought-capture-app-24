
export interface DetectedPerson {
  fullName: string;
  firstName: string;
  lastName: string;
  suggestedCategory: 'work' | 'personal';
  context: string;
}

export const detectPeopleInText = (text: string): DetectedPerson[] => {
  const people: DetectedPerson[] = [];
  
  // Common patterns for detecting people
  const patterns = [
    // "met with John Smith", "talked to Sarah Johnson"
    /(?:met with|talked to|spoke with|meeting with|call with|discussed with)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/gi,
    // "John Smith said", "Sarah mentioned"
    /([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(?:said|mentioned|told|asked|suggested)/gi,
    // "from John Smith", "to Sarah Johnson"
    /(?:from|to)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/gi,
    // Direct mentions with context
    /([A-Z][a-z]+\s+[A-Z][a-z]+)/g
  ];
  
  const detectedNames = new Set<string>();
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const fullName = match[1].trim();
      detectedNames.add(fullName);
    }
  });
  
  detectedNames.forEach(fullName => {
    const [firstName, ...lastNameParts] = fullName.split(' ');
    const lastName = lastNameParts.join(' ');
    
    if (firstName && lastName) {
      const suggestedCategory = determineCategoryFromContext(text);
      people.push({
        fullName,
        firstName,
        lastName,
        suggestedCategory,
        context: extractRelevantContext(text, fullName)
      });
    }
  });
  
  return people;
};

const determineCategoryFromContext = (text: string): 'work' | 'personal' => {
  const workKeywords = [
    'project', 'meeting', 'client', 'business', 'office', 'work', 'colleague',
    'proposal', 'deadline', 'presentation', 'conference', 'team', 'manager',
    'contract', 'budget', 'strategy', 'professional'
  ];
  
  const personalKeywords = [
    'family', 'friend', 'dinner', 'lunch', 'coffee', 'weekend', 'vacation',
    'birthday', 'party', 'personal', 'home', 'social', 'casual'
  ];
  
  const lowerText = text.toLowerCase();
  
  const workScore = workKeywords.reduce((score, keyword) => 
    score + (lowerText.includes(keyword) ? 1 : 0), 0);
  
  const personalScore = personalKeywords.reduce((score, keyword) => 
    score + (lowerText.includes(keyword) ? 1 : 0), 0);
  
  return workScore > personalScore ? 'work' : 'personal';
};

const extractRelevantContext = (text: string, personName: string): string => {
  const sentences = text.split(/[.!?]+/);
  const relevantSentence = sentences.find(sentence => 
    sentence.toLowerCase().includes(personName.toLowerCase())
  );
  
  return relevantSentence?.trim() || text.substring(0, 100) + '...';
};
