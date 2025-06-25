
import { DetectedPerson } from './PersonDetectionService';
import { useProfiles } from '@/hooks/useProfiles';

export interface LinkedRelationship {
  id: string;
  firstName: string;
  lastName: string;
  type: 'work' | 'personal';
  relationshipDescription: string;
  avatar?: string;
}

export class RelationshipLinkingService {
  /**
   * Convert detected people to relationship format
   */
  static convertPeopleToRelationships(people: DetectedPerson[]): LinkedRelationship[] {
    return people.map(person => ({
      id: `linked-${person.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      firstName: person.name.split(' ')[0] || person.name,
      lastName: person.name.split(' ').slice(1).join(' ') || '',
      type: this.determineRelationshipType(person.relationship),
      relationshipDescription: `Mentioned in memo: "${person.context.substring(0, 100)}${person.context.length > 100 ? '...' : ''}"`
    }));
  }

  /**
   * Determine relationship type based on detected relationship
   */
  private static determineRelationshipType(relationship?: string): 'work' | 'personal' {
    const workRelationships = ['colleague', 'manager', 'client', 'teammate', 'coworker', 'boss'];
    
    if (relationship && workRelationships.includes(relationship.toLowerCase())) {
      return 'work';
    }
    
    return 'personal';
  }

  /**
   * Store linked relationships for the relationships page
   */
  static storePendingRelationships(people: DetectedPerson[]): void {
    const relationships = this.convertPeopleToRelationships(people);
    sessionStorage.setItem('pendingRelationships', JSON.stringify(relationships));
  }

  /**
   * Get pending relationships from storage
   */
  static getPendingRelationships(): LinkedRelationship[] {
    const stored = sessionStorage.getItem('pendingRelationships');
    if (!stored) return [];
    
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error parsing pending relationships:', error);
      return [];
    }
  }

  /**
   * Clear pending relationships from storage
   */
  static clearPendingRelationships(): void {
    sessionStorage.removeItem('pendingRelationships');
  }
}
