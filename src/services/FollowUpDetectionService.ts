
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
      // Skip if memo doesn't have contact tags
      const contactMatches = memo.text.match(/\[Contact:\s*([^\]]+)\]/g);
      if (!contactMatches) continue;

      // Extract contact IDs
      const contactIds = contactMatches.map((match: string) => {
        const idMatch = match.match(/\[Contact:\s*([^\]]+)\]/);
        return idMatch ? idMatch[1].trim() : null;
      }).filter(Boolean);

      for (const contactId of contactIds) {
        const detectedActions = this.extractActionableItems(memo.text, contactId);
        
        for (const action of detectedActions) {
          followUps.push({
            id: `${memo.id}-${contactId}-${Date.now()}`,
            memoId: memo.id,
            text: action.text,
            action: action.action,
            contactName: action.contactName,
            contactId: contactId,
            priority: this.determinePriority(action.text),
            createdAt: memo.createdAt,
            context: memo.text
          });
        }
      }
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
   * Extract actionable items from memo text
   */
  private static extractActionableItems(text: string, contactId: string): Array<{
    text: string;
    action: string;
    contactName: string;
  }> {
    const actions: Array<{ text: string; action: string; contactName: string }> = [];
    
    // Clean text (remove contact tags for processing)
    const cleanText = text.replace(/\[Contact:\s*[^\]]+\]/g, '').trim();
    
    // Split into sentences
    const sentences = cleanText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    
    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      
      // Check if sentence contains action patterns
      for (const actionPattern of this.actionPatterns) {
        if (lowerSentence.includes(actionPattern)) {
          // Extract potential contact name from the sentence
          const contactName = this.extractContactNameFromSentence(sentence);
          
          if (contactName) {
            actions.push({
              text: sentence.trim(),
              action: actionPattern,
              contactName: contactName
            });
            break; // Only match first action pattern per sentence
          }
        }
      }
    }
    
    return actions;
  }

  /**
   * Extract contact name from sentence
   */
  private static extractContactNameFromSentence(sentence: string): string | null {
    // Look for capitalized names (simple approach)
    const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
    const matches = sentence.match(namePattern);
    
    if (matches) {
      // Filter out common false positives
      const filtered = matches.filter(name => 
        !['I', 'The', 'This', 'That', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(name)
      );
      
      return filtered[0] || null;
    }
    
    return null;
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
