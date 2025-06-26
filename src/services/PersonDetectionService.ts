export interface DetectedPerson {
  name: string;
  context: string; // The sentence/phrase where they were mentioned
  relationship?: string; // colleague, friend, family, client, etc.
  confidence: number; // 0-1 confidence score
  mentionType: 'direct' | 'possessive' | 'action' | 'reference';
}

export interface RelationshipContext {
  type: 'meeting' | 'call' | 'email' | 'social' | 'work' | 'family' | 'other';
  activity: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export class PersonDetectionService {
  
  /**
   * Main function to detect people mentioned in memo text
   */
  static detectPeople(text: string): DetectedPerson[] {
    console.log('Detecting people in text:', text); // Debug log
    
    const detectedPeople: DetectedPerson[] = [];
    
    // Clean and prepare text
    const cleanText = this.cleanText(text);
    const sentences = this.splitIntoSentences(cleanText);
    
    console.log('Clean text:', cleanText); // Debug log
    console.log('Sentences:', sentences); // Debug log
    
    for (const sentence of sentences) {
      // Try different detection methods
      const directMentions = this.findDirectMentions(sentence);
      const possessiveMentions = this.findPossessiveMentions(sentence);
      const actionMentions = this.findActionMentions(sentence);
      const contextualMentions = this.findContextualMentions(sentence);
      
      // Combine all mentions
      const allMentions = [
        ...directMentions,
        ...possessiveMentions,
        ...actionMentions,
        ...contextualMentions
      ];
      
      console.log(`Sentence: "${sentence}" - Found ${allMentions.length} mentions:`, allMentions); // Debug log
      
      detectedPeople.push(...allMentions);
    }
    
    // Remove duplicates and merge similar names
    const finalResults = this.deduplicateAndMerge(detectedPeople);
    console.log('Final detected people:', finalResults); // Debug log
    
    return finalResults;
  }
  
  /**
   * Detect direct name mentions (proper nouns)
   */
  private static findDirectMentions(sentence: string): DetectedPerson[] {
    const mentions: DetectedPerson[] = [];
    
    // Enhanced patterns for names
    const namePatterns = [
      // Full names: "John Smith", "Mary Jane Watson"
      /(?:^|\s)([A-Z][a-z]+(?:\s+[A-Z][a-z]*){1,2})(?=\s|[,.!?]|$)/g,
      // Single names in context: "talked to Sarah", "with Mike"
      /(?:talked to|spoke with|met with|called|emailed|texted|saw|visited)\s+([A-Z][a-z]+)/gi,
      // Names with titles: "Dr. Smith", "Mr. Johnson"
      /((?:Dr|Mr|Mrs|Ms|Prof|Professor)\.?\s+[A-Z][a-z]+)/gi,
      // Simple capitalized words that could be names
      /\b([A-Z][a-z]{2,})\b/g
    ];
    
    for (const pattern of namePatterns) {
      let match;
      while ((match = pattern.exec(sentence)) !== null) {
        const name = this.cleanName(match[1]);
        if (this.isValidName(name)) {
          mentions.push({
            name,
            context: sentence.trim(),
            mentionType: 'direct',
            confidence: 0.8
          });
        }
      }
    }
    
    return mentions;
  }
  
  /**
   * Detect possessive mentions: "Sarah's project", "John's idea"
   */
  private static findPossessiveMentions(sentence: string): DetectedPerson[] {
    const mentions: DetectedPerson[] = [];
    
    const possessivePattern = /([A-Z][a-z]+)'s\s+(?:project|idea|meeting|call|email|report|work|task|plan|house|car|job|family)/gi;
    
    let match;
    while ((match = possessivePattern.exec(sentence)) !== null) {
      const name = this.cleanName(match[1]);
      if (this.isValidName(name)) {
        mentions.push({
          name,
          context: sentence.trim(),
          mentionType: 'possessive',
          confidence: 0.9
        });
      }
    }
    
    return mentions;
  }
  
  /**
   * Detect action-based mentions: "Sarah said", "John will handle"
   */
  private static findActionMentions(sentence: string): DetectedPerson[] {
    const mentions: DetectedPerson[] = [];
    
    const actionPatterns = [
      // Person + action verb
      /([A-Z][a-z]+)\s+(?:said|mentioned|told|explained|suggested|recommended|thinks|believes|will|should|can|needs|wants|likes|loves|hates|works|lives|goes|comes)/gi,
      // Action + person
      /(?:told|asked|called|emailed|texted|messaged|visited|saw|met)\s+([A-Z][a-z]+)/gi,
      // Meeting context
      /(?:meeting with|call with|lunch with|dinner with|coffee with)\s+([A-Z][a-z]+)/gi
    ];
    
    for (const pattern of actionPatterns) {
      let match;
      while ((match = pattern.exec(sentence)) !== null) {
        const name = this.cleanName(match[1]);
        if (this.isValidName(name)) {
          mentions.push({
            name,
            context: sentence.trim(),
            mentionType: 'action',
            confidence: 0.85
          });
        }
      }
    }
    
    return mentions;
  }
  
  /**
   * Detect contextual mentions: "my colleague Sarah", "our client John"
   */
  private static findContextualMentions(sentence: string): DetectedPerson[] {
    const mentions: DetectedPerson[] = [];
    
    const contextPatterns = [
      // Relationship + name
      /(?:my|our)\s+(?:colleague|coworker|boss|manager|client|friend|partner|teammate|neighbor|doctor|dentist|teacher|student)\s+([A-Z][a-z]+)/gi,
      // Name + relationship
      /([A-Z][a-z]+)(?:,?\s+(?:my|our)\s+(?:colleague|coworker|boss|manager|client|friend|partner|teammate|neighbor|doctor|dentist|teacher|student))/gi,
      // Family relationships
      /(?:my|our)\s+(?:mom|dad|mother|father|sister|brother|wife|husband|son|daughter|aunt|uncle|cousin|grandmother|grandfather|grandma|grandpa)\s+([A-Z][a-z]+)/gi
    ];
    
    for (const pattern of contextPatterns) {
      let match;
      while ((match = pattern.exec(sentence)) !== null) {
        const name = this.cleanName(match[1]);
        const relationship = this.extractRelationship(sentence);
        
        if (this.isValidName(name)) {
          mentions.push({
            name,
            context: sentence.trim(),
            relationship,
            mentionType: 'reference',
            confidence: 0.95
          });
        }
      }
    }
    
    return mentions;
  }
  
  /**
   * Extract relationship type from context
   */
  private static extractRelationship(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Work relationships
    if (lowerText.includes('colleague') || lowerText.includes('coworker')) return 'colleague';
    if (lowerText.includes('boss') || lowerText.includes('manager')) return 'manager';
    if (lowerText.includes('client') || lowerText.includes('customer')) return 'client';
    if (lowerText.includes('teammate') || lowerText.includes('team member')) return 'teammate';
    
    // Personal relationships
    if (lowerText.includes('friend')) return 'friend';
    if (lowerText.includes('family') || lowerText.includes('relative')) return 'family';
    if (lowerText.includes('partner') || lowerText.includes('spouse')) return 'partner';
    if (lowerText.includes('neighbor')) return 'neighbor';
    
    // Family specific
    if (lowerText.match(/\b(mom|mother|dad|father|parent)\b/)) return 'family';
    if (lowerText.match(/\b(sister|brother|sibling)\b/)) return 'family';
    if (lowerText.match(/\b(son|daughter|child|kid)\b/)) return 'family';
    
    return 'unknown';
  }
  
  /**
   * Get relationship context from the memo
   */
  static getRelationshipContext(text: string, personName: string): RelationshipContext {
    const lowerText = text.toLowerCase();
    const lowerName = personName.toLowerCase();
    
    // Find sentences containing the person
    const sentences = this.splitIntoSentences(text);
    const relevantSentences = sentences.filter(s => 
      s.toLowerCase().includes(lowerName)
    );
    
    const contextText = relevantSentences.join(' ').toLowerCase();
    
    // Determine activity type
    let type: RelationshipContext['type'] = 'other';
    if (contextText.match(/\b(meeting|met|conference|call|zoom|teams)\b/)) type = 'meeting';
    if (contextText.match(/\b(called|phone|called)\b/)) type = 'call';
    if (contextText.match(/\b(email|emailed|message|messaged|text|texted)\b/)) type = 'email';
    if (contextText.match(/\b(lunch|dinner|coffee|drinks|hangout|social)\b/)) type = 'social';
    if (contextText.match(/\b(work|project|task|business|office|job)\b/)) type = 'work';
    if (contextText.match(/\b(family|home|personal|visit|holiday)\b/)) type = 'family';
    
    // Determine sentiment
    let sentiment: RelationshipContext['sentiment'] = 'neutral';
    const positiveWords = ['great', 'good', 'excellent', 'awesome', 'helpful', 'nice', 'wonderful', 'amazing'];
    const negativeWords = ['bad', 'terrible', 'awful', 'problem', 'issue', 'difficult', 'annoying', 'frustrating'];
    
    if (positiveWords.some(word => contextText.includes(word))) sentiment = 'positive';
    if (negativeWords.some(word => contextText.includes(word))) sentiment = 'negative';
    
    // Extract main activity
    const activity = this.extractMainActivity(contextText);
    
    return { type, activity, sentiment };
  }
  
  /**
   * Add contact tags to memo text
   */
  static addContactTags(text: string, people: DetectedPerson[]): string {
    let enhancedText = text;
    
    // Sort by name length (longest first) to avoid partial replacements
    const sortedPeople = [...people].sort((a, b) => b.name.length - a.name.length);
    
    for (const person of sortedPeople) {
      // Add contact tag if not already present
      if (!enhancedText.includes(`[Contact: ${person.name}]`)) {
        // Add contact tag at the beginning to avoid disrupting the original text
        enhancedText = `[Contact: ${person.name}] ${enhancedText}`;
      }
    }
    
    return enhancedText;
  }
  
  /**
   * Helper functions
   */
  private static cleanText(text: string): string {
    // Remove special formatting but keep punctuation for sentence splitting
    return text
      .replace(/\[Contact: [^\]]+\]/g, '') // Remove existing contact tags
      .replace(/\[category:\s*\w+\]/gi, '') // Remove category tags
      .replace(/\[priority:\s*\w+\]/gi, '') // Remove priority tags
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  private static splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }
  
  private static cleanName(name: string): string {
    return name
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .trim()
      .replace(/\s+/g, ' '); // Normalize whitespace
  }
  
  private static isValidName(name: string): boolean {
    // Filter out common false positives
    const invalidNames = [
      'I', 'Me', 'My', 'You', 'We', 'They', 'The', 'This', 'That', 'There', 'Here', 'When', 'Where', 'What', 'How', 'Why', 'Who',
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
      'Today', 'Tomorrow', 'Yesterday', 'Next', 'Last', 'First', 'Second', 'Third',
      'Morning', 'Afternoon', 'Evening', 'Night', 'Day', 'Week', 'Month', 'Year',
      'Home', 'Work', 'Office', 'School', 'House', 'Car', 'Phone', 'Email',
      'Good', 'Bad', 'Great', 'Nice', 'Cool', 'Fun', 'Easy', 'Hard', 'New', 'Old'
    ];
    
    if (invalidNames.includes(name)) return false;
    if (name.length < 2 || name.length > 30) return false;
    if (!/^[A-Z]/.test(name)) return false; // Must start with capital
    
    return true;
  }
  
  private static deduplicateAndMerge(mentions: DetectedPerson[]): DetectedPerson[] {
    const merged = new Map<string, DetectedPerson>();
    
    for (const mention of mentions) {
      const key = mention.name.toLowerCase();
      
      if (merged.has(key)) {
        const existing = merged.get(key)!;
        // Keep the mention with highest confidence
        if (mention.confidence > existing.confidence) {
          merged.set(key, {
            ...mention,
            context: `${existing.context} | ${mention.context}`
          });
        }
      } else {
        merged.set(key, mention);
      }
    }
    
    return Array.from(merged.values())
      .filter(person => person.confidence > 0.6) // Lowered threshold for better detection
      .sort((a, b) => b.confidence - a.confidence);
  }
  
  private static extractMainActivity(text: string): string {
    // Extract key activity from the context
    const activities = [
      'meeting', 'call', 'email', 'lunch', 'project discussion',
      'brainstorming', 'planning', 'review', 'presentation',
      'coffee chat', 'dinner', 'social event'
    ];
    
    for (const activity of activities) {
      if (text.includes(activity)) {
        return activity;
      }
    }
    
    return 'interaction';
  }
}
