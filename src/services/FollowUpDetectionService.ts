
export interface DetectedFollowUp {
  id: string;
  memoId: string;
  text: string;
  action: string;
  contactName: string;
  contactId: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  context: string;
}

export class FollowUpDetectionService {
  
  /**
   * Action verbs and phrases that indicate follow-up tasks
   */
  private static actionPatterns = [
    // Communication actions
    'text', 'call', 'email', 'message', 'reach out', 'contact', 'get in touch',
    // Meeting/planning actions
    'meet with', 'schedule', 'plan', 'arrange', 'set up', 'organize',
    // Follow-up specific
    'follow up', 'follow-up', 'check in', 'circle back', 'touch base',
    // Task-oriented
    'remind', 'ask', 'tell', 'inform', 'update', 'discuss', 'talk to',
    // Social actions
    'invite', 'visit', 'see', 'hang out', 'catch up'
  ];

  /**
   * Detect follow-up actions from memos
   */
  static detectFollowUps(memos: any[]): DetectedFollowUp[] {
    const followUps: DetectedFollowUp[] = [];

    for (const memo of memos) {
      const detectedActions = this.extractActionableItems(memo.text, memo.id, memo.createdAt);
      followUps.push(...detectedActions);
    }

    // Sort by creation date (most recent first) and priority
    return followUps.sort((a, b) => {
      const dateCompare = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (dateCompare !== 0) return dateCompare;
      
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Extract actionable items from memo text by analyzing sentence structure
   */
  private static extractActionableItems(text: string, memoId: string, createdAt: string): DetectedFollowUp[] {
    const actions: DetectedFollowUp[] = [];
    
    // Split into sentences
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      
      // Check if sentence contains action patterns
      for (const actionPattern of this.actionPatterns) {
        if (lowerSentence.includes(actionPattern)) {
          // Look for names in the same sentence as the action
          const detectedNames = this.extractNamesFromSentence(sentence);
          
          for (const name of detectedNames) {
            // Check if this action + name combination makes sense contextually
            if (this.isValidActionNameCombination(sentence, actionPattern, name)) {
              actions.push({
                id: `${memoId}-${name.toLowerCase()}-${actionPattern.replace(/\s+/g, '-')}-${Date.now()}`,
                memoId: memoId,
                text: sentence.trim(),
                action: actionPattern,
                contactName: name,
                contactId: name.toLowerCase(), // Using name as ID for now
                priority: this.determinePriority(sentence),
                createdAt: createdAt,
                context: text
              });
              break; // Only match first valid name per action pattern
            }
          }
          break; // Only match first action pattern per sentence
        }
      }
    }
    
    return actions;
  }

  /**
   * Extract names from a sentence (including first names)
   */
  private static extractNamesFromSentence(sentence: string): string[] {
    const names: string[] = [];
    
    // Look for capitalized words that could be names
    const capitalizedWords = sentence.match(/\b[A-Z][a-z]+\b/g) || [];
    
    for (const word of capitalizedWords) {
      if (this.isValidName(word)) {
        names.push(word);
      }
    }
    
    // Also look for common name patterns in context
    const namePatterns = [
      // "with [Name]" patterns
      /(?:with|to|from)\s+([A-Z][a-z]+)/gi,
      // "[Name] about" patterns  
      /([A-Z][a-z]+)\s+about/gi,
      // Direct name mentions
      /\b([A-Z][a-z]{2,})\b/g
    ];
    
    for (const pattern of namePatterns) {
      let match;
      while ((match = pattern.exec(sentence)) !== null) {
        const name = match[1];
        if (this.isValidName(name) && !names.includes(name)) {
          names.push(name);
        }
      }
    }
    
    return names;
  }

  /**
   * Check if an action + name combination is contextually valid in the sentence
   */
  private static isValidActionNameCombination(sentence: string, action: string, name: string): boolean {
    const lowerSentence = sentence.toLowerCase();
    const lowerAction = action.toLowerCase();
    const lowerName = name.toLowerCase();
    
    // Check if the action and name appear in logical proximity
    const actionIndex = lowerSentence.indexOf(lowerAction);
    const nameIndex = lowerSentence.indexOf(lowerName);
    
    if (actionIndex === -1 || nameIndex === -1) return false;
    
    // They should be relatively close to each other (within 20 characters)
    const distance = Math.abs(actionIndex - nameIndex);
    if (distance > 20) return false;
    
    // Check for common valid patterns
    const validPatterns = [
      `${lowerAction} ${lowerName}`, // "text Karil"
      `${lowerName} ${lowerAction}`, // "Karil text" (less common but possible)
      `${lowerAction} with ${lowerName}`, // "meet with Kyle"
      `${lowerAction} to ${lowerName}`, // "call to Sarah"
      `${lowerName} about ${lowerAction}`, // "Kyle about planning"
    ];
    
    // Check if any valid pattern exists
    for (const pattern of validPatterns) {
      if (lowerSentence.includes(pattern)) {
        return true;
      }
    }
    
    // Additional contextual checks
    // If action comes before name and they're close, it's likely valid
    if (actionIndex < nameIndex && distance <= 10) {
      return true;
    }
    
    return false;
  }

  /**
   * Check if a word is a valid name
   */
  private static isValidName(name: string): boolean {
    // Filter out common false positives
    const invalidNames = [
      'I', 'Me', 'My', 'You', 'We', 'They', 'The', 'This', 'That', 'There', 'Here', 
      'When', 'Where', 'What', 'How', 'Why', 'Who', 'And', 'But', 'Or', 'For', 'With',
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
      'Today', 'Tomorrow', 'Yesterday', 'Next', 'Last', 'First', 'Second', 'Third',
      'Morning', 'Afternoon', 'Evening', 'Night', 'Day', 'Week', 'Month', 'Year',
      'Home', 'Work', 'Office', 'School', 'House', 'Car', 'Phone', 'Email',
      'Good', 'Bad', 'Great', 'Nice', 'Cool', 'Fun', 'Easy', 'Hard', 'New', 'Old',
      'App', 'Development', 'About', 'Dinner', 'Planning'
    ];
    
    if (invalidNames.includes(name)) return false;
    if (name.length < 2 || name.length > 20) return false;
    if (!/^[A-Z]/.test(name)) return false; // Must start with capital
    
    return true;
  }

  /**
   * Determine priority based on action text
   */
  private static determinePriority(text: string): 'high' | 'medium' | 'low' {
    const lowerText = text.toLowerCase();
    
    // High priority keywords
    if (lowerText.includes('urgent') || lowerText.includes('asap') || lowerText.includes('immediately')) {
      return 'high';
    }
    
    // Medium priority keywords
    if (lowerText.includes('soon') || lowerText.includes('today') || lowerText.includes('tomorrow')) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Get the most recent follow-up
   */
  static getMostRecentFollowUp(memos: any[]): DetectedFollowUp | null {
    const followUps = this.detectFollowUps(memos);
    return followUps.length > 0 ? followUps[0] : null;
  }
}
