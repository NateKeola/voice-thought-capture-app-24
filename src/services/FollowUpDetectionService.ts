import { extractMemoMetadata } from '@/utils/memoMetadata';

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
   * Comprehensive action patterns that indicate follow-up tasks
   */
  private static actionPatterns = [
    // Communication actions
    'text', 'message', 'call', 'phone', 'email', 'reach out', 'reach out to', 'contact', 
    'get in touch', 'get in touch with', 'follow up', 'follow up with', 'follow-up', 
    'circle back', 'circle back with', 'touch base', 'touch base with', 'check in', 
    'check in with', 'respond to', 'reply to', 'send message', 'send message to', 
    'drop a line', 'drop a line to', 'ping', 'hit up', 'shoot a message', 'shoot a message to',
    'give a call', 'give a call to', 'ring up', 'buzz', 'dm', 'direct message', 'whatsapp', 
    'slack', 'facetime', 'video call', 'voice message',
    
    // Meeting & Planning actions
    'schedule meeting', 'schedule meeting with', 'plan meeting', 'plan meeting with', 
    'set up meeting', 'set up meeting with', 'book time', 'book time with', 'calendar invite',
    'arrange meeting', 'arrange meeting with', 'organize meeting', 'organize meeting with',
    'plan lunch', 'plan lunch with', 'schedule dinner', 'schedule dinner with', 
    'plan coffee', 'plan coffee with', 'meet up', 'meet up with', 'get together', 
    'get together with', 'schedule call', 'schedule call with', 'book appointment', 
    'book appointment with', 'set up time', 'set up time with', 'coordinate with',
    'plan session', 'plan session with', 'schedule check-in', 'schedule check-in with',
    'book consultation', 'book consultation with', 'arrange call', 'arrange call with',
    'plan', 'schedule', 'arrange', 'set up', 'organize', 'meet with',
    
    // Social & Personal actions
    'invite', 'ask', 'tell', 'update', 'inform', 'let know', 'remind', 'thank', 
    'congratulate', 'wish', 'send', 'share', 'share with', 'show', 'introduce', 
    'introduce to', 'connect', 'connect with', 'recommend', 'recommend to', 'suggest', 
    'suggest to', 'propose', 'propose to', 'offer to help', 'check on',
    
    // Work & Professional actions
    'schedule review', 'schedule review with', 'book 1:1', 'book 1:1 with', 'plan standup',
    'plan standup with', 'coordinate project', 'coordinate project with', 'sync up', 
    'sync up with', 'align with', 'present to', 'demo for', 'train', 'onboard', 
    'brief', 'report to', 'escalate to', 'delegate to', 'assign', 'partner with', 
    'collaborate with', 'review with', 'approve with',
    
    // Request & Ask actions
    'ask for', 'request from', 'get approval', 'get approval from', 'seek input', 
    'seek input from', 'get feedback', 'get feedback from', 'get opinion', 'request help',
    'request help from', 'ask to review', 'get to sign off', 'have look at', 'get thoughts',
    'ask to check', 'request to send', 'get to confirm', 'ask to verify', 'request meeting',
    'ask to join', 'invite to review',
    
    // Follow-Through actions
    'follow up on', 'circle back on', 'check status', 'check status with', 'get update',
    'get update from', 'follow through', 'follow through with', 'continue conversation',
    'continue conversation with', 'resume discussion', 'resume discussion with', 
    'pick up where we left off', 'revisit', 'return to',
    
    // Sending & Sharing actions
    'send', 'share', 'forward', 'forward to', 'copy on', 'include', 'include in', 
    'add to', 'cc on', 'loop into', 'bring into', 'give access', 'send over', 
    'pass along', 'pass along to', 'deliver', 'deliver to', 'submit', 'submit to', 
    'provide with',
    
    // Confirmation & Verification actions
    'confirm', 'confirm with', 'verify', 'verify with', 'double-check', 'double-check with',
    'validate', 'validate with', 'make sure', 'ensure', 'check that', 'make sure knows',
    'ensure has', 'check received', 'confirm can attend', 'verify availability', 
    'make sure aware'
  ];

  /**
   * Detect follow-up actions from memos, excluding completed ones
   */
  static detectFollowUps(memos: any[]): DetectedFollowUp[] {
    const followUps: DetectedFollowUp[] = [];

    // Filter out completed memos first
    const incompleteMemos = memos.filter(memo => !memo.completed);

    for (const memo of incompleteMemos) {
      // Extract metadata to get clean text and contact information
      const metadata = extractMemoMetadata(memo.content);
      const detectedActions = this.extractActionableItems(metadata.cleanText, memo.id, memo.createdAt);
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
    
    // Split into sentences and also consider clauses separated by commas
    const sentences = text.split(/[.!?]+|,(?=\s*[A-Z])/).map(s => s.trim()).filter(s => s.length > 0);
    
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      
      // Check if sentence contains action patterns
      for (const actionPattern of this.actionPatterns) {
        const lowerAction = actionPattern.toLowerCase();
        
        if (lowerSentence.includes(lowerAction)) {
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
                contactId: name.toLowerCase(),
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
      /([A-Z][a-z]+)\s+(?:about|regarding|concerning)/gi,
      // Direct name mentions after actions
      /(?:plan|schedule|meet|call|text|email|contact|ask|tell|invite|share)\s+(?:a\s+)?(?:meeting\s+)?(?:with\s+)?([A-Z][a-z]+)/gi,
      // Names at the end of action phrases
      /(?:meeting|lunch|dinner|coffee|call|session)\s+with\s+([A-Z][a-z]+)/gi
    ];
    
    for (const pattern of namePatterns) {
      let match;
      pattern.lastIndex = 0; // Reset regex
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
    
    // Check for common valid patterns
    const validPatterns = [
      // Direct patterns
      `${lowerAction} ${lowerName}`, // "text Karil"
      `${lowerAction} with ${lowerName}`, // "meet with Kyle"
      `${lowerAction} to ${lowerName}`, // "call to Sarah"
      `${lowerAction} for ${lowerName}`, // "schedule for John"
      
      // Meeting/planning patterns
      `plan meeting with ${lowerName}`, // "plan meeting with Umesh"
      `plan a meeting with ${lowerName}`, // "plan a meeting with Umesh"
      `schedule meeting with ${lowerName}`,
      `${lowerAction} a meeting with ${lowerName}`,
      
      // General patterns with prepositions
      `${lowerAction} lunch with ${lowerName}`,
      `${lowerAction} dinner with ${lowerName}`,
      `${lowerAction} coffee with ${lowerName}`,
      
      // Reversed patterns (less common but valid)
      `${lowerName} about ${lowerAction}`, // "Kyle about planning"
    ];
    
    // Check if any valid pattern exists
    for (const pattern of validPatterns) {
      if (lowerSentence.includes(pattern)) {
        return true;
      }
    }
    
    // Additional contextual checks
    const distance = Math.abs(actionIndex - nameIndex);
    
    // If action comes before name and they're reasonably close
    if (actionIndex < nameIndex && distance <= 30) {
      // Check for connecting words that make it valid
      const betweenText = lowerSentence.substring(actionIndex + lowerAction.length, nameIndex).trim();
      const connectingWords = ['with', 'to', 'for', 'about', 'regarding', 'a meeting with', 'meeting with'];
      
      for (const connector of connectingWords) {
        if (betweenText.includes(connector)) {
          return true;
        }
      }
      
      // If they're very close (within 10 characters) it's likely valid
      if (distance <= 10) {
        return true;
      }
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
      'App', 'Development', 'About', 'Dinner', 'Planning', 'Meeting', 'Plan'
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
   * Get the most recent follow-up from incomplete memos only
   */
  static getMostRecentFollowUp(memos: any[]): DetectedFollowUp | null {
    const followUps = this.detectFollowUps(memos);
    return followUps.length > 0 ? followUps[0] : null;
  }
}
